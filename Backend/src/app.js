import express from 'express'
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import userRouter from './routes/user.route.js';
import assignmentRouter from './routes/assignment.route.js';
import studentRouter from './routes/student.route.js';
import submissionRouter from './routes/submission.route.js';
import adminRouter from './routes/admin.route.js';
const app = express();

app.use(express.json());
app.use(cors({origin : 'http://localhost:5173' ,credentials:true}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/auth',authRouter);
app.use('/user',userRouter);
app.use('/api',assignmentRouter);
app.use('/api', studentRouter);
app.use('/api/submission',submissionRouter);
app.use('/admin', adminRouter);

export default app ;