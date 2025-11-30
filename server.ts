import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool, PoolClient } from 'pg';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
async function initializeDatabase() {
  try {
    const schemaPath = path.join(process.cwd(), 'database_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      const client = await pool.connect();
      await client.query(schema);
      client.release();
      console.log('Database schema initialized');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Auth Middleware
interface AuthRequest extends Request {
  user?: { id: string; email: string };
  body?: any;
  params?: any;
  headers: Record<string, any>;
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  const token = authReq.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    authReq.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req: any, res: Response) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const passwordHash = await bcryptjs.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name, is_admin',
      [email, name, passwordHash]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const result = await pool.query(
      'SELECT id, email, name, password_hash, is_admin FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValid = await bcryptjs.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, isAdmin: user.is_admin } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Session Routes (Protected)
// GET /api/sessions - Lightweight history list (excludes heavy sections_data & viewport_data)
app.get('/api/sessions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, problem_text, framework_data, last_modified FROM sessions WHERE user_id = $1 AND deleted_at IS NULL ORDER BY last_modified DESC',
      [req.user?.id]
    );
    res.json(result.rows.map(row => ({
      id: row.id,
      problemText: row.problem_text,
      frameworkData: row.framework_data,
      lastModified: new Date(row.last_modified).getTime()
    })));
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /api/sessions/:id - Full session details (for resuming)
app.get('/api/sessions/:id', authMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, problem_text, framework_data, sections_data, viewport_data, last_modified FROM sessions WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [id, req.user?.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    const row = result.rows[0];
    res.json({
      id: row.id,
      problemText: row.problem_text,
      frameworkData: row.framework_data,
      sectionsData: row.sections_data,
      viewportData: row.viewport_data,
      lastModified: new Date(row.last_modified).getTime()
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

app.post('/api/sessions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id, problemText, frameworkData, sectionsData, viewportData } = req.body;

    if (id) {
      // Update existing session
      const result = await pool.query(
        'UPDATE sessions SET problem_text = $1, framework_data = $2, sections_data = $3, viewport_data = $4, last_modified = CURRENT_TIMESTAMP WHERE id = $5 AND user_id = $6 RETURNING *',
        [problemText, JSON.stringify(frameworkData), JSON.stringify(sectionsData), JSON.stringify(viewportData), id, req.user?.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }
      return res.json(result.rows[0]);
    } else {
      // Create new session
      const result = await pool.query(
        'INSERT INTO sessions (user_id, problem_text, framework_data, sections_data, viewport_data) VALUES ($1, $2, $3, $4, $5) RETURNING id, problem_text, framework_data, sections_data, viewport_data, last_modified',
        [req.user?.id, problemText, JSON.stringify(frameworkData), JSON.stringify(sectionsData), JSON.stringify(viewportData)]
      );
      const row = result.rows[0];
      res.status(201).json({
        id: row.id,
        problemText: row.problem_text,
        frameworkData: row.framework_data,
        sectionsData: row.sections_data,
        viewportData: row.viewport_data,
        lastModified: new Date(row.last_modified).getTime()
      });
    }
  } catch (error) {
    console.error('Save session error:', error);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

app.delete('/api/sessions/:id', authMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE sessions SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user?.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ message: 'Session deleted' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Template Routes (Protected)
app.get('/api/templates', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name, template_data, created_at FROM section_templates WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user?.id]
    );
    res.json(result.rows.map(row => ({
      id: row.id,
      name: row.name,
      createdAt: new Date(row.created_at).getTime(),
      data: row.template_data
    })));
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

app.post('/api/templates', authMiddleware, async (req: any, res: Response) => {
  try {
    const { name, data } = req.body;
    if (!name || !data) {
      return res.status(400).json({ error: 'Missing name or data' });
    }

    const result = await pool.query(
      'INSERT INTO section_templates (user_id, name, template_data) VALUES ($1, $2, $3) RETURNING id, name, template_data, created_at',
      [req.user?.id, name, JSON.stringify(data)]
    );
    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.name,
      createdAt: new Date(row.created_at).getTime(),
      data: row.template_data
    });
  } catch (error) {
    console.error('Save template error:', error);
    res.status(500).json({ error: 'Failed to save template' });
  }
});

app.delete('/api/templates/:id', authMiddleware, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM section_templates WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user?.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ message: 'Template deleted' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Admin Routes (require auth)
app.get('/api/admin/stats', authMiddleware, async (req: any, res: Response) => {
  try {
    // Check if user is admin
    const userResult = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user?.id]);
    if (userResult.rows.length === 0 || !userResult.rows[0].is_admin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users');
    const activeSessions = await pool.query('SELECT COUNT(*) as count FROM sessions WHERE last_modified > NOW() - INTERVAL \'24 hours\' AND deleted_at IS NULL');
    const totalFrameworks = 24; // Static for now

    res.json({
      totalUsers: totalUsers.rows[0].count,
      activeSessions: activeSessions.rows[0].count,
      frameworks: totalFrameworks
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/admin/activity', authMiddleware, async (req: any, res: Response) => {
  try {
    // Check if user is admin
    const userResult = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user?.id]);
    if (userResult.rows.length === 0 || !userResult.rows[0].is_admin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const recentUsers = await pool.query(
      'SELECT email, name, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );
    const recentSessions = await pool.query(
      'SELECT id, problem_text, last_modified FROM sessions WHERE deleted_at IS NULL ORDER BY last_modified DESC LIMIT 5'
    );

    const activity = [];
    for (const user of recentUsers.rows) {
      activity.push({
        type: 'user_registration',
        message: `New user: ${user.email}`,
        timestamp: user.created_at
      });
    }
    for (const session of recentSessions.rows) {
      activity.push({
        type: 'session_created',
        message: `Session: ${session.problem_text || 'Untitled'}`,
        timestamp: session.last_modified || new Date()
      });
    }

    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    res.json(activity.slice(0, 10));
  } catch (error) {
    console.error('Admin activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

app.get('/api/admin/users', authMiddleware, async (req: any, res: Response) => {
  try {
    const userResult = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.user?.id]);
    if (userResult.rows.length === 0 || !userResult.rows[0].is_admin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await pool.query(
      'SELECT id, name, email, is_admin, created_at FROM users ORDER BY created_at DESC LIMIT 50'
    );
    res.json(users.rows);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start server
async function start() {
  await initializeDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch(console.error);
