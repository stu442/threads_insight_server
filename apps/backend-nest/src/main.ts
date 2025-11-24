import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors();

    // Enable Validation
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // Setup Swagger
    const config = new DocumentBuilder()
        .setTitle('Threads Insights API')
        .setDescription('API for collecting and analyzing Threads insights')
        .setVersion('1.0')
        .addTag('Insights')
        .addTag('Analytics')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger UI available at: http://localhost:${port}/api-docs`);
}
bootstrap();
