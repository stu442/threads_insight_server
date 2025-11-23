import express from 'express';
import dotenv from 'dotenv';
import { InsightController } from './controllers/insightController';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger';
import logger from './utils/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const insightController = new InsightController();

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`Incoming ${req.method} request to ${req.url}`);
    next();
});

// Health check endpoint
app.get('/ping', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is reachable' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.post('/collect', insightController.collectInsights);
app.get('/insights', insightController.getInsights);
app.post('/analyze', insightController.analyzePostsAnalytics);
app.get('/analytics', insightController.getUserAnalytics);

app.listen(Number(port), '0.0.0.0', () => {
    logger.info(`Server is running on http://localhost:${port}`);
});
