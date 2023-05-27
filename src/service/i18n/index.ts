/* eslint-disable */
import { I18nService } from 'nestjs-i18n';
import { GqlExceptionFilter, GqlArgumentsHost } from '@nestjs/graphql';

import { Catch, ArgumentsHost, HttpException, InternalServerErrorException } from '@nestjs/common';
import { isNilOrEmpty } from '@/providers/functionUtils';

@Catch(HttpException)
export class HttpExceptionFilter implements GqlExceptionFilter {
  constructor(private readonly i18n: I18nService) {}
  async catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const getContext = gqlHost.getContext();
    const lang = getContext?.req?.headers['accept-language'] || 'en';
    const message = exception.getResponse();
    let result = message as HttpExceptionResponse;

    if (message) {
      let msgException: I18nException;

      if (typeof message === 'string') {
        msgException = { key: message };
      } else if (typeof message === 'object') {
        if (Object.prototype.hasOwnProperty.call(message, 'message')) {
          const tmp = message as CommonException;

          msgException = { key: Array.isArray(tmp.message) ? tmp.message[0] : tmp.message };
        } else if (Object.prototype.hasOwnProperty.call(message, 'args')) {
          const tmp = message as I18nException;

          msgException = { ...tmp };
        }
      }

      try {
        const tmp = message as CommonException;
        const translatedMsg = await this.translateExceptionMessage(msgException, lang);
        result = new HttpException(translatedMsg, exception.getStatus());
        result.messageCode = tmp.message;
        result.code = exception.getStatus();
      } catch (e) {
        result = new InternalServerErrorException('Internal Server Error!');
      }
    }

    return result;
  }

  async translateExceptionMessage(data: I18nException, lang: string) {
    try {
      if (data?.key?.includes(' ')) {
        return data.key;
      }

      if (isNilOrEmpty(data.args)) {
        return this.i18n.translate(`translate.${data.key}`, {
          lang
        });
      }

      return this.i18n.translate(`translate.SHARE_EVENT.${data.key}`, {
        lang,
        args: data.args
      });
    } catch (e) {
      console.log(`Skip parsing message which is plain text: ${data.key}`);
    }
  }
}

interface I18nException {
  key: string;
  args?: Record<string, unknown>;
}

interface CommonException {
  statusCode: number;
  message: string;
  error?: string;
}

class HttpExceptionResponse extends HttpException {
  messageCode?: string;
  code?: number;
}
