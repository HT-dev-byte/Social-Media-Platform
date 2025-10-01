import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Import routes
import allPostsRouter from './controllers/allposts.js';
import authRouter from './controllers/auth.js';
import postRouter from './controllers/post.js';
import usersRouter from './controllers/users.js';
import manageFollowRouter from './controllers/manageFollow.js';
import likeRouter from './controllers/like.js';
import unlikeRouter from './controllers/unlike.js';
import commentRouter from './controllers/comment.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// Define Routes
app.use('/api/all_posts', allPostsRouter);
app.use('/api/authenticate', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/user', usersRouter);
app.use('/api', manageFollowRouter);
app.use('/api/like', likeRouter);
app.use('/api/unlike', unlikeRouter);
app.use('/api/comment', commentRouter);

// Start server if not imported as module
if (process.argv[1] === new URL(import.meta.url).pathname) {
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
}

export default app;
