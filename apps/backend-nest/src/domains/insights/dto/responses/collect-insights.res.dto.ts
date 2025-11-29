import { ApiProperty } from '@nestjs/swagger';

export class CollectInsightsResDto {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ example: 'Collected insights for 10 posts' })
    message: string;
}
