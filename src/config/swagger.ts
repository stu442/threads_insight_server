import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Threads Insights API',
            version: '1.0.0',
            description: 'API for collecting and retrieving Threads insights',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
    },
    apis: ['./src/controllers/*.ts'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export default specs;
