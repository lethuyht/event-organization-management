import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import express from 'express';

import { configuration } from '../config';

import { APP_ENV } from '../common/constant';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const { port, domain } = configuration;
    const isDevelopment = configuration.api.nodeEnv === APP_ENV.LOCAL;
    const app = await NestFactory.create(AppModule);

    // NOTE: adapter for e2e testing
    app.getHttpAdapter();

    // NOTE: parse raw body
    app.use('/stripe-webhooks', express.raw({ type: '*/*' }));

    // NOTE: body parser
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(
      bodyParser.urlencoded({
        limit: '50mb',
        extended: true,
        parameterLimit: 50000,
      }),
    );

    // NOTE: global nest setup
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    app.enableShutdownHooks();

    await app.listen(port);

    if (module.hot) {
      module.hot.accept();
      module.hot.dispose(() => app.close());
    }

    isDevelopment
      ? (Logger.log(
          `🤬  Application is running on: ${await app.getUrl()}`,
          'NestJS',
          false,
        ),
        Logger.log(
          `🚀  Server ready at http://${domain}:${port}`,
          'Bootstrap',
          false,
        ),
        Logger.log(
          `##########################################################`,
          'Bootstrap',
          false,
        ),
        Logger.warn(
          `🚀  Admin Server http://${domain}:${port}/admin`,
          'Bootstrap',
          false,
        ),
        Logger.warn(
          `🚀  Client Server http://${domain}:${port}/client`,
          'Bootstrap',
          false,
        ),
        // Logger.warn(
        //   `🚀  Public Server http://${domain}:${port}/public`,
        //   'Bootstrap',
        //   false,
        // ),
        // Logger.warn(
        //   `🚀  Stripe Account Webhook http://${domain}:${port}/stripe-webhooks/connected-account`,
        //   'Bootstrap',
        //   false,
        // ),
        // Logger.warn(
        //   `🚀  Stripe Checkout Session Webhook http://${domain}:${port}/stripe-webhooks/edluma-account`,
        //   'Bootstrap',
        //   false,
        // ),
        Logger.log(
          `##########################################################`,
          'Bootstrap',
          false,
        ))
      : Logger.log(
          `🚀  Server is listening on port ${port}`,
          'Bootstrap',
          false,
        );
  } catch (error) {
    Logger.error(`❌  Error starting server, ${error}`, '', 'Bootstrap', false);
    process.exit();
  }
}

bootstrap();
