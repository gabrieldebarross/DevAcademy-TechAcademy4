import cors from 'cors';
import express from 'express';

import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import courseRoutes from './routes/course.routes';
import docsRoutes from './routes/docs.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import instructorRoutes from './routes/instructor.routes';
import userRoutes from './routes/user.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/docs', docsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
