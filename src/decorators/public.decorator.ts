import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

export interface PublicOptions {
  /*
   * True: Guard will decode jwt if token exists event if @Public available
   * False: Guard will return without checking any logic related token
   */
  keepAuthorized?: boolean;
}

export const Public = (options: PublicOptions = { keepAuthorized: false }) =>
  SetMetadata(IS_PUBLIC_KEY, options);
