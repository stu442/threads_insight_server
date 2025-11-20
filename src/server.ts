import express from 'express';
import dotenv from 'dotenv';
import { InsightController } from './controllers/insightController';
import logger from './utils/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const insightController = new InsightController();

app.use(express.json());

app.post('/collect', insightController.collectInsights);
app.get('/insights', insightController.getInsights);

app.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`);
});
