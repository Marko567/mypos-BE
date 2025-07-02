const express = require('express');
require('dotenv').config();
const app = express();

const PORT = process.env.PORT || 3000;
const cors = require('cors');



// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:4200'
}))
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/posts', postRouter);


// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// BE pokreces sa: npm run devStart