import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import type { ApiRootResponse } from './app.service';

@ApiTags('Root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOkResponse({
    description: 'API metadata and operational entry points.',
  })
  getApiRoot(): ApiRootResponse {
    return this.appService.getApiRoot();
  }
}
