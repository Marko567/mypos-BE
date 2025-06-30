// db/pool.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'myBlog',
  password: 'postgresql',
  port: 5432,
});

module.exports = pool;