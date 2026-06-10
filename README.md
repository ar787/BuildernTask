# BuildernTask

Full-stack project management app with expense and income tracking.

- **Frontend** — React 19, Vite, Apollo Client, MUI
- **Backend** — Node.js, Express, Apollo Server v5, Prisma, MySQL

---

## Project Structure

```
BuildernTask/
  backdend/   ← GraphQL API
  frontend/   ← React SPA
```

---

## Backend

### Installation

**Prerequisites:** Node.js 18+, a running MySQL instance.

```bash
cd backdend
npm install
```

#### Installing MySQL (optional)

**macOS (Homebrew):**

```bash
brew install mysql
brew services start mysql
```

**Ubuntu / Debian:**

```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

**Windows:**  
Download and run the installer from [dev.mysql.com/downloads/mysql](https://dev.mysql.com/downloads/mysql/).

After installation, secure the root account:

```bash
sudo mysql_secure_installation
```

---

### Database Setup

**1. Create the database.**

Connect to MySQL:

```bash
mysql -u root -p
```

Run inside the shell:

```sql
CREATE DATABASE buildern_task_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

**2. Run migrations to create all tables:**

```bash
cd backdend
npx prisma migrate deploy
```

Creates: `User`, `Project`, `ProjectMember`, `Invitation`, `Expense`, `Income`.

**3. (Optional) Regenerate the Prisma client after schema changes:**

```bash
npx prisma generate
```

---

### Environment Variables

Create a `.env` file in the `backdend/` directory:

> **Generating a JWT secret:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```
> Copy the output and use it as your `JWT_SECRET`.

```env
JWT_SECRET=your_jwt_secret_here

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=buildern_task_db

# Equivalent connection URL (for reference):
# DATABASE_URL="mysql://root:your_password@localhost:3306/buildern_task_db"
```

| Variable      | Description                        | Default            |
| ------------- | ---------------------------------- | ------------------ |
| `JWT_SECRET`  | Secret key used to sign JWT tokens | _(required)_       |
| `DB_HOST`     | MySQL host                         | `localhost`        |
| `DB_USER`     | MySQL username                     | `root`             |
| `DB_PASSWORD` | MySQL password                     | _(empty)_          |
| `DB_NAME`     | Database name                      | `buildern_task_db` |

---

### Running the Backend

**Development** (watch mode):

```bash
npm run dev
```

**Production:**

```bash
npm run build
npm start
```

The API is available at `http://localhost:4000/graphql`.

---

### Running Tests

No database connection required — all dependencies are mocked.

```bash
npm test
```

| Test file                     | What it covers                                         |
| ----------------------------- | ------------------------------------------------------ |
| `auth.resolver.test.ts`       | `register`, `login` mutations and `me` query           |
| `context.test.ts`             | JWT extraction from request headers                    |
| `auth.middleware.test.ts`     | `requireAuth` and `requirePermission` guards           |
| `invitation.resolver.test.ts` | Invitation acceptance, rejection, duplicate prevention |
| `budget.resolver.test.ts`     | Budget report aggregation and one-sided name handling  |

---

## Frontend

### Installation

**Prerequisites:** Node.js 18+, backend running at `http://localhost:4000`.

```bash
cd frontend
npm install
```

### Running the Frontend

**Development:**

```bash
npm run dev
```

The app is available at `http://localhost:5173`.

**Production build:**

```bash
npm run build     # outputs to frontend/dist/
npm run preview   # preview the production build locally
```

**Lint:**

```bash
npm run lint
```

---

## Running Both Together

Open two terminals:

```bash
# Terminal 1 — backend
cd backdend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Then open `http://localhost:5173` in your browser.
