# 🧠 Mypos Backend

This is an **Express.js backend project** for the **Mypos application**.

## 📦 Project Structure

- `db/init/init-db.sql` — database initialization script, exported from pgAdmin
- `db/pool.js` — PostgreSQL connection pool setup
- `routes/`, `middleware/`, `controllers/` — standard Express MVC structure
- `.env.example` — environment variable template

## 🛢️ Database

The database currently contains two main entities:

- `Post`
- `User`

Supporting tables include:

- `Roles`
- `Likes`

The schema and initial data are stored in `db/init/init-db.sql`.

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`

## 🚀 Getting Started

Follow these steps to get the backend up and running locally.

### 1. Install Dependencies

Run the following inside the backend project folder:

```bash
npm install
```

### 2. Create Environment Configuration

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

### 3. Initialize the Database

You can execute the SQL script manually via pgAdmin or using psql:

```bash
psql -U your_user -d your_db -f db/init/init-db.sql
```
Alternatively, integrate this into a setup script or Docker if preferred.

### 4. Start the Development Server

Run the project in development mode using nodemon:

```bash
npm run devStart
```
The server will start on the port defined in your .env file (default: 3000).