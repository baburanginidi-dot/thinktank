import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes';

dotenv.config();

/**
 * Express application instance.
 */
const app = express();

/**
 * Port number for the server to listen on.
 * Defaults to 3000 if not specified in environment variables.
 */
const PORT = process.env.PORT || 3000;

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Mount API routes under /api
app.use('/api', apiRoutes);

/**
 * Health check endpoint.
 * @route GET /health
 * @returns {object} 200 - OK status
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * Starts the server and listens on the specified port.
 */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
