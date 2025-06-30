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

// imamo maltene sve sto nam treba za users deo, imamo /register za registraciju novih korisnika
// imamo login za logovanje na applikaciju postojecih korisnika
// treba uraditi ono sto chatGPT predlaze trenutno, a to je authMiddleware i roleCheckMiddleware
// a treba da se uradi i /me endpoint koji bi vratio trenutno logovanog korisnika
// probaj da testiras /register i /login ep
// kako da radis management sa stanjima: error, prazan niz, loading, pun niz u Angular 20 ? 

// BE pokreces sa: npm run devStart