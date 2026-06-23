import { Injectable } from '@nestjs/common';
import packageJson from '../package.json';
import { API_PREFIX, SWAGGER_PATH } from './common/constants/api.constants';

export interface ApiRootResponse {
  name: string;
  version: string;
  status: 'ok';
  docs: string;
  health: string;
}

@Injectable()
export class AppService {
  getApiRoot(): ApiRootResponse {
    return {
      name: 'EstateMint API',
      version: packageJson.version,
      status: 'ok',
      docs: `/${SWAGGER_PATH}`,
      health: `/${API_PREFIX}/health`,
    };
  }
}
