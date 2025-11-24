import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
    @Get('ping')
    @ApiOperation({ summary: 'Health check' })
    @ApiResponse({ status: 200, description: 'Returns pong' })
    ping(): string {
        return 'pong';
    }
}
