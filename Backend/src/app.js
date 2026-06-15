import express from 'express'
import helmet from 'helmet';
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import userRouter from './routes/user.route.js';
import assignmentRouter from './routes/assignment.route.js';
import studentRouter from './routes/student.route.js';
import submissionRouter from './routes/submission.route.js';
import adminRouter from './routes/admin.route.js';
import config from './config/config.js';
const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors({origin : `${config.FRONTEND_URL}` ,credentials:true}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/auth',authRouter);
app.use('/user',userRouter);
app.use('/api',assignmentRouter);
app.use('/api', studentRouter);
app.use('/api/submission',submissionRouter);
app.use('/admin', adminRouter);

export default app ;