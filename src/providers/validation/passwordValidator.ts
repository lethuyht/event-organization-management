import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const PASSWORD_REGEX =
  /^(?=.*?[A-Z])(?=.*?[a-z])((?=.*?[0-9])|(?=.*?[#?!@$%^&*-])).{6,}$/;

@ValidatorConstraint({ name: 'passwordValidator', async: false })
export class PasswordValidator implements ValidatorConstraintInterface {
  validate(password: string) {
    console.log('password');
    return password && password.match(PASSWORD_REGEX) !== null;
  }

  defaultMessage() {
    return 'Password must be at least 6 characters including capital character and number/special characters (@#$..)!';
  }
}
