import { Module } from '@nestjs/common';
import { OpenAIModule } from '../openai/openai.module';
import { PostLabelingController } from './controller/post-labeling.controller';
import { PostLabelingService } from './service/post-labeling.service';

@Module({
    imports: [OpenAIModule],
    controllers: [PostLabelingController],
    providers: [PostLabelingService],
})
export class PostLabelingModule { }
