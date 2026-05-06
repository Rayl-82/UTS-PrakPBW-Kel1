# Hariku

> "Your daily companion for tasks, journal, expenses, and focus."

Hariku is a personal daily productivity web app designed to streamline your daily routines. It seamlessly combines task management, daily journaling, expense tracking, and a Pomodoro timer into a single, cohesive, and aesthetically pleasing interface.

## Tech Stack

This project is built using modern web development technologies:

- **Framework**: [Next.js](https://nextjs.org/) (v16.2.4)
- **UI Library**: [React](https://react.dev/) (v19.2.5)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4)
- **Database ORM**: [Prisma](https://www.prisma.io/) (v6.19.3)
- **Database Driver**: [PostgreSQL](https://www.postgresql.org/) (`pg` v8.20.0, `@prisma/adapter-pg`)
- **Authentication**: [NextAuth.js / Auth.js](https://authjs.dev/) (v5.0.0-beta.31)
- **Icons**: [Lucide React](https://lucide.dev/) (v1.9.0)
- **Password Hashing**: `bcryptjs` (v3.0.3)

## Features

- **Tasks**: Add, complete, and delete tasks with priority, category, and due date. Easily navigate through dates using the built-in date navigator.
- **Journal**: Daily journaling with mood tracking, auto-save functionality, and a clean interface to review past entries.
- **Expenses**: Track your expenses with a set budget, view category breakdowns, and analyze your monthly overview.
- **Pomodoro Timer**: Dedicated focus timer with configurable short and long breaks, plus a session counter.
- **Authentication**: Secure user registration and login system supporting both email and username.

## Getting Started

Follow these step-by-step instructions to get the project running locally.

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [PostgreSQL](https://www.postgresql.org/) database running

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd hariku
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root of the project and add the following variables:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/hariku?schema=public"
   AUTH_SECRET="your-super-secret-string"
   AUTH_URL="http://localhost:3000"
   ```

4. **Run Database Migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

6. **Start the Development Server**
   ```bash
   npm run dev
   ```

7. **Open the Application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables Explained

- `DATABASE_URL`: The connection string to your PostgreSQL database. Prisma uses this to manage schemas and query data.
- `AUTH_SECRET`: A secret string used by NextAuth to encrypt session tokens and secure cookies. You can generate a strong secret using `npx auth secret` or `openssl rand -base64 32`.
- `AUTH_URL`: The canonical URL of your application. Set to `http://localhost:3000` for local development.

## Project Structure

Here is an overview of the core project structure:

```text
src/
├── app/                  # Next.js App Router (Pages, Layouts, and API Routes)
│   ├── api/              # Backend API endpoints (auth, budget, expenses, journal, etc.)
│   ├── expenses/         # Expense tracker UI page
│   ├── journal/          # Daily journal UI page
│   ├── login/            # Authentication login page
│   ├── register/         # Authentication registration page
│   ├── tasks/            # Tasks list UI page
│   └── timer/            # Pomodoro timer UI page
├── components/           # Reusable React Components (Modals, Icons, Sidebar, etc.)
├── generated/            # Automatically generated files
│   └── prisma/           # Custom-generated Prisma Client
└── lib/                  # Helper functions and project utilities
```
