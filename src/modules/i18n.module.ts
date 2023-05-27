/* eslint-disable */
import path from 'path';
import { I18nModule, I18nJsonParser } from 'nestjs-i18n';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '@/service/i18n';


@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      parser: I18nJsonParser,
      parserOptions: {
        path: path.join(__dirname, 'src/i18n/')
      }
    })
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ]
})
export class I18n_Module {}
