import { Controller, Get, InternalServerErrorException, Logger, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThreadsService, ThreadsProfile } from './threads.service';
import type { Request } from 'express';
import { ThreadsUserService } from './threads-user.service';

interface ThreadsRequest extends Request {
    threadsUserId?: string;
}

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
        private readonly threadsUserService: ThreadsUserService,
    ) { }

    @Get('profile')
    @ApiOperation({ summary: 'Get Threads profile using server-side credentials' })
    @ApiResponse({ status: 200, description: 'Profile fetched successfully' })
    async getProfile(@Req() req: ThreadsRequest): Promise<{ success: boolean; data: ThreadsProfileResponse }> {
        try {
            const { token, userId } = await this.threadsUserService.resolveUserToken(req.threadsUserId);
            const profile: ThreadsProfile = await this.threadsService.getProfile(token, userId);
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
