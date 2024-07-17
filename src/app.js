import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors(
    {
        origin: process.env.CLIENT_URL,
        credentials: true,
    }
));

app.use(express.json({ limit: "16kb" })); // our app now accepts JSON data in the body of the request - body-parser is now included in express (Middleware function)
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // our app now handles URL encoded data - body-parser is now included in express (Middleware function)

app.use(express.static('public')); // our app now serves static files from the public folder

app.use(cookieParser()); // our app now uses cookie-parser to parse cookies in the request headers

// import routes
import userRouter from './routes/user.routes.js';

// routes declaration
app.use('/api/v1/users', userRouter); // why app.use and not app.get? Because we are using a router object that has multiple routes (Middleware)
// http://localhost:5000/api/v1/users/register

export {app};
