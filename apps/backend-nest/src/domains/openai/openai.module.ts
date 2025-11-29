import { Module } from '@nestjs/common';
import { OpenAIService } from './service/openai.service';

@Module({
    providers: [OpenAIService],
    exports: [OpenAIService],
})
export class OpenAIModule { }
