import { Controller, Get, InternalServerErrorException, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ThreadsService, ThreadsProfile } from './threads.service';

interface ThreadsProfileResponse {
    id: string;
    username: string;
    name?: string;
    avatar?: string;
}

@ApiTags('Threads')
@Controller('threads')
export class ThreadsController {
    private readonly logger = new Logger(ThreadsController.name);

    constructor(
        private readonly threadsService: ThreadsService,
        private readonly configService: ConfigService,
    ) { }

    @Get('profile')
    @ApiOperation({ summary: 'Get Threads profile using server-side credentials' })
    @ApiResponse({ status: 200, description: 'Profile fetched successfully' })
    async getProfile(): Promise<{ success: boolean; data: ThreadsProfileResponse }> {
        const accessToken = this.configService.get<string>('THREADS_ACCESS_TOKEN');
        const userId = this.configService.get<string>('THREADS_USER_ID');

        if (!accessToken || !userId) {
            this.logger.error('THREADS_ACCESS_TOKEN or THREADS_USER_ID is not configured');
            throw new InternalServerErrorException({
                success: false,
                error: 'Threads credentials are not configured',
            });
        }

        try {
            const profile: ThreadsProfile = await this.threadsService.getProfile(accessToken, userId);
            return {
                success: true,
                data: {
                    id: profile.id,
                    username: profile.username,
                    name: profile.name,
                    // Prefer the current field name; fall back for older responses
                    avatar: profile.threads_profile_picture_url ?? profile.profile_picture_url,
                },
            };
        } catch (error) {
            this.logger.error('Failed to fetch Threads profile', error);
            throw new InternalServerErrorException({
                success: false,
                error: 'Failed to fetch Threads profile',
            });
        }
    }
}
