# Deployment Guide

This project is built with [Next.js](https://nextjs.org/). Below are the instructions for deploying it to various platforms.

## Prerequisites

Before deploying, ensure you have the following environment variables ready, as they are required for the application to function correctly (see `env.example`):

- `OPENAI_API_KEY`: Your OpenAI API key.
- `GOOGLE_SEARCH_API_KEY`: Your Google Custom Search API key.
- `GOOGLE_SEARCH_CX`: Your Google Custom Search Engine ID.

## Option 1: Vercel (Recommended)

Vercel is the creators of Next.js and offers the easiest deployment experience.

1.  **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket).
2.  **Sign up/Log in to [Vercel](https://vercel.com/)**.
3.  **Add a New Project**:
    *   Click "Add New..." -> "Project".
    *   Import your Git repository.
4.  **Configure Project**:
    *   Vercel will automatically detect that it's a Next.js project.
    *   **Environment Variables**: Expand the "Environment Variables" section and add the keys listed in the Prerequisites section.
5.  **Deploy**: Click "Deploy".

Vercel will build and deploy your application. Any changes pushed to your repository will automatically trigger a new deployment.

## Option 2: Netlify

1.  **Push your code to a Git repository**.
2.  **Sign up/Log in to [Netlify](https://www.netlify.com/)**.
3.  **Add New Site**:
    *   Click "Add new site" -> "Import from Git".
    *   Connect your Git provider and select your repository.
4.  **Build Settings**:
    *   Netlify should auto-detect Next.js.
    *   Build command: `npm run build`
    *   Publish directory: `.next`
5.  **Environment Variables**:
    *   Click "Show advanced" or go to "Site settings" -> "Build & deploy" -> "Environment" after the site is created.
    *   Add the required environment variables.
6.  **Deploy**: Click "Deploy site".

## Option 3: Self-Hosting (Node.js)

You can host the application on any server that supports Node.js (e.g., AWS EC2, DigitalOcean, Heroku, Railway).

1.  **Build the application**:
    Run the build command locally or in your CI/CD pipeline:
    ```bash
    npm run build
    ```

2.  **Start the server**:
    ```bash
    npm start
    ```

    The application will start on port 3000 by default. You can specify a port using the `-p` flag (e.g., `npm start -- -p 8080`).

3.  **Environment Variables**:
    Ensure the environment variables are set in your server's environment or in a `.env.production` file (though setting them in the system environment is more secure).

## Option 4: Docker

If you prefer containerization, you can use the official Next.js Docker example.

1.  Create a `Dockerfile` in the root of your project (refer to [Next.js Docker documentation](https://github.com/vercel/next.js/tree/canary/examples/with-docker)).
2.  Build the image:
    ```bash
    docker build -t my-next-app .
    ```
3.  Run the container:
    ```bash
    docker run -p 3000:3000 -e OPENAI_API_KEY=... -e GOOGLE_SEARCH_API_KEY=... -e GOOGLE_SEARCH_CX=... my-next-app
    ```

## Static Export (Optional)

If you need to deploy to a static host (like GitHub Pages or AWS S3) and **do not** need server-side features (like API routes or SSR), you can configure a static export.

1.  Update `next.config.ts`:
    ```typescript
    const nextConfig: NextConfig = {
      output: 'export',
      // ... other config
    };
    ```
2.  Run `npm run build`.
3.  The static assets will be generated in the `out` directory.

**Note**: This project likely uses API routes for AI and search functionality, so **Static Export might not be suitable** unless you refactor those to client-side calls to external services or use Edge Functions.
