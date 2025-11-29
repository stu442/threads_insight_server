import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
    private readonly logger = new Logger(OpenAIService.name);
    private openai: OpenAI;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (apiKey) {
            this.openai = new OpenAI({ apiKey });
        } else {
            this.logger.warn('OPENAI_API_KEY not found in environment variables. GPT analysis will be disabled.');
        }
    }

    async generateInsights(text: string): Promise<{ category: string | null; tags: string[] }> {
        if (!this.openai) {
            return { category: null, tags: [] };
        }

        if (!text || text.trim().length === 0) {
            return { category: null, tags: [] };
        }

        const categories = [
            'Technology',
            'Lifestyle',
            'Career',
            'Education',
            'Entertainment',
            'Business',
            'Health',
            'Finance',
            'Travel',
            'Food',
            'Other'
        ];

        const allowedTags = [
            'SOFTWARE_DEVELOPMENT',
            'TECHNOLOGY_AI',
            'PRODUCTIVITY',
            'LEARNING_GROWTH',
            'CAREER_PROFESSIONAL',
            'PERSONAL_WELLBEING',
            'DIGITAL_LIFE',
            'TOOLS_INFRASTRUCTURE',
            'SIDE_PROJECTS',
            'READING_BOOKS',
            'LIFESTYLE_HOBBIES',
            'COMPUTER_SCIENCE',
            'FINANCE_INVESTMENT',
            'COMMUNITY_NETWORKING',
            'ENTREPRENEURSHIP',
            'CREATIVITY_WRITING',
            'OTHER'
        ];

        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-5-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are a social media analyst. Analyze the following post caption and provide a main category from the following list: ${categories.join(', ')}. 
                        Also provide a list of relevant tags (max 5) strictly from the following list: ${allowedTags.join(', ')}.
                        If the content is ambiguous or doesn't fit well with specific tags, use "OTHER".
                        Return strictly valid JSON in the following format:
                        {
                            "category": "Category Name",
                            "tags": ["TAG_NAME", "TAG_NAME"]
                        }
                        If the text is too short or meaningless to categorize, return null for category and empty array for tags.`
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 1,
            });

            const content = completion.choices[0].message.content;
            if (!content) {
                return { category: null, tags: [] };
            }

            const result = JSON.parse(content);

            // Validate category
            let category = result.category;
            if (category && !categories.includes(category)) {
                category = 'Other';
            }

            // Validate tags
            let tags = Array.isArray(result.tags) ? result.tags : [];
            tags = tags.filter(tag => allowedTags.includes(tag));
            if (tags.length === 0 && result.tags && result.tags.length > 0) {
                // If original tags existed but were filtered out (invalid), maybe default to OTHER? 
                // Or just leave empty. The prompt says "use OTHER", so hopefully the model does it.
                // If the model returned invalid tags, we just drop them.
            }
            // Ensure max 5 just in case
            tags = tags.slice(0, 5);

            return {
                category: category || null,
                tags: tags
            };

        } catch (error) {
            this.logger.error(`Failed to generate insights: ${error.message}`, error.stack);
            return { category: null, tags: [] };
        }
    }
}
