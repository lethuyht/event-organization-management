import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CodeVerifyDto,
  RefreshTokenDto,
  SignInDto,
  SignOutDto,
  SignUpDto,
} from './dto';
import { messageKey } from '@/i18n';
import { PasswordUtil } from '@/providers/password';
import { EXPIRATION_TIME, ROLE } from '@/common/constant';
import { GetRoleQuery } from '@/main/admin/role/query/getRole.query';
import { SendCodeVerifyInput } from './interface';
import dayjs from 'dayjs';
import {
  UserVerificationRequest,
  UserVerificationRequestType,
} from '@/db/entities/UserVerificationRequest';
import { EntityManager, getManager } from 'typeorm';
import { randomCode } from '@/providers/functionUtils';
import { emailService } from '@/service/smtp/service';
import { GetUserVerificationRequestQuery } from '@/main/shared/userVerificationRequest/query/getUserVerificationRequest.query';
import { GetUserQuery } from '@/main/shared/user/query/getUser.query';
import { User } from '@/db/entities/User';
import { pick } from 'lodash';
import { Jwt } from '@/service/jwt/jwt';
import { Token } from '@/db/entities/Token';

@Injectable()
export class AuthClientService {
  private SELECT_USER = ['firstName', 'lastName', 'email', 'id', 'role'];

  async signUp(input: SignUpDto) {
    const { email, password } = input;
    const user = await GetUserQuery.getOneByEmail(email, false);

    if (user) {
      throw new BadRequestException(messageKey.BASE.EMAIL_EXIST);
    }

    const hashPassword = await PasswordUtil.generateHash(password);
    const role = await GetRoleQuery.GetOneByName(ROLE.User);

    return this.sendCodeVerify(
      {
        ...input,
        password: hashPassword,
        roleId: role.id,
      },
      UserVerificationRequestType.EMAIL_VERIFICATION,
    );
  }

  async sendCodeVerify(
    input: SendCodeVerifyInput,
    verificationType?: UserVerificationRequestType,
    transaction?: EntityManager,
  ) {
    const trx = transaction ?? getManager();
    const { email } = input;

    const data = input as unknown as JSON;

    const code = randomCode().slice(-6, -1);
    const expirationTime = dayjs(new Date())
      .add(EXPIRATION_TIME.VerificationRequest, 'minute')
      .toDate();

    const newUserVerificationRequest = UserVerificationRequest.merge(
      (await UserVerificationRequest.findOne({ where: { email } })) ??
        UserVerificationRequest.create(),
      {
        email,
        code,
        data,
        expirationTime,
        type:
          verificationType ?? UserVerificationRequestType.EMAIL_VERIFICATION,
      },
    );

    await trx
      .getRepository(UserVerificationRequest)
      .save(newUserVerificationRequest);

    await emailService.sendEmailVerificationCode({
      receiverEmail: email,
      customerName: `${input.firstName} ${input.lastName}`,
      verifyCode: code,
    });

    return {
      success: true,
      message: messageKey.BASE.SUCCESSFULLY,
    };
  }

  async verifyCode(input: CodeVerifyDto) {
    const { code, email } = input;

    const verificationRequest = await GetUserVerificationRequestQuery.verify(
      email,
      code,
    );

    const data = verificationRequest.data as unknown as SendCodeVerifyInput;

    let user = await GetUserQuery.getOneByEmail(email, false, ['role']);

    if (user) {
      return user;
    }

    user = User.create({ ...data, password: data.password });

    await User.save(user);
    user = await GetUserQuery.getOneByEmail(email, true, ['role']);
    return await this.generateUserWithAccessToken(user);
  }

  async generateUserWithAccessToken(user: User, transaction?: EntityManager) {
    const trx = transaction ?? getManager();

    const data = pick(user, this.SELECT_USER);

    const token = await this.createAccessToken(data, trx);

    return {
      ...data,
      token: token.accessToken,
      refreshToken: token.refreshToken,
    };
  }

  async createAccessToken(user: Partial<User>, transaction?: EntityManager) {
    const trx = transaction ?? getManager();
    const tokenizedData = {
      ...user,
    };
    const accessToken = await Jwt.issue(tokenizedData);
    const refreshToken = await Jwt.issueRefreshToken(tokenizedData);

    const newToken = trx.getRepository(Token).create();
    newToken.userId = user.id;
    newToken.email = user.email;
    newToken.refreshToken = refreshToken;
    newToken.accessToken = accessToken;
    newToken.lastUsed = new Date();

    await trx.getRepository(Token).save(newToken);

    return newToken;
  }

  async signIn(payload: SignInDto) {
    const { email, password } = payload;

    const where: { email: string } = {
      email,
    };

    const user = <User>await User.findOneOrFail({
      where,
      relations: ['role'],
    }).catch(() => {
      throw new BadRequestException(
        messageKey.BASE.INCORRECT_EMAIL_OR_PASSWORD,
      );
    });

    await PasswordUtil.validateHash(password, user.password, true);

    return await getManager().transaction(
      async (transaction) =>
        await this.generateUserWithAccessToken(user, transaction),
    );
  }

  async signOut(input: SignOutDto) {
    const { refreshToken } = input;

    await Token.createQueryBuilder().delete().where({ refreshToken }).execute();

    return {
      success: true,
      message: messageKey.BASE.DELETED_SUCCESSFULLY,
    };
  }

  static getRefreshTokenExpireTime() {
    const REFRESH_TOKEN_EXPIRE_TIME = 7 * 24 * 60 * 60 * 60;

    return REFRESH_TOKEN_EXPIRE_TIME;
  }

  async refreshToken(input: RefreshTokenDto) {
    const { refreshToken } = input;

    const token = await Token.findOne({ where: { refreshToken } });

    if (!token || !token.userId) {
      throw new BadRequestException(messageKey.BASE.INVALID_REFRESH_TOKEN);
    }

    const refreshTokenExpire = AuthClientService.getRefreshTokenExpireTime();

    if (Date.now() - new Date(token.lastUsed).getTime() > refreshTokenExpire) {
      throw new BadRequestException(messageKey.BASE.REFRESH_TOKEN_EXPIRE);
    }

    const user = await User.createQueryBuilder()
      .where({ id: token.userId })
      .leftJoinAndSelect('User.role', 'Role')
      .getOne();

    if (!user) {
      throw new BadRequestException(messageKey.BASE.INVALID_REFRESH_TOKEN);
    }

    const tokenIssueData = pick(user, this.SELECT_USER);

    const tokenizedData = {
      ...User.create(tokenIssueData).toPublic(),
    };
    const accessToken = await Jwt.issue(tokenizedData);

    token.lastUsed = new Date();
    token.accessToken = accessToken;

    await token.save();

    return {
      accessToken,
    };
  }
}
