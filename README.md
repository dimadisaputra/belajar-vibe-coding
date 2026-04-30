# Belajar Vibe Coding

This is a backend API project built with [Bun](https://bun.sh/), [ElysiaJS](https://elysiajs.com/), [Drizzle ORM](https://orm.drizzle.team/), and [PostgreSQL](https://www.postgresql.org/).

## Getting Started

1.  **Install dependencies:**
    ```bash
    bun install
    ```

2.  **Environment Variables:**
    Copy the `.env.example` file to `.env` and fill in your database credentials:
    ```bash
    cp .env.example .env
    ```

3.  **Run Migrations:**
    ```bash
    bunx drizzle-kit generate
    bunx drizzle-kit migrate
    ```

4.  **Run the Server:**
    ```bash
    bun run src/index.ts
    ```
