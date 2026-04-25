# Policy Prism — Deployment Guide

## Prerequisites

Ensure the following environment variables are configured:

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Auth Public Key | Yes |
| `CLERK_SECRET_KEY` | Clerk Auth Secret Key | Yes |
| `OPENAI_API_KEY` | OpenAI API Key (GPT-4o, GPT-4o-mini) | Yes |
| `REDIS_URL` | Upstash Redis connection string | Yes |
| `GOOGLE_SEARCH_API_KEY` | Google Custom Search API Key | Yes |
| `GOOGLE_SEARCH_CX` | Google Custom Search Engine ID | Yes |
| `STRIPE_SECRET_KEY` | Stripe Secret for payments | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification | Yes |
| `NEXT_PUBLIC_ENABLE_DEMO_MODE` | Set `true` for read-only demo | No |
| `ADMIN_USER_IDS` | Comma-separated admin user IDs | No |

---

## Option 1: Vercel (Recommended)

Vercel is the creator of Next.js and offers the simplest deployment path.

1. **Push code to Git** (GitHub, GitLab, or Bitbucket).
2. **Sign in to [Vercel](https://vercel.com/)** and click "Add New..." → "Project".
3. **Import** your Git repository.
4. **Environment Variables**: Expand the "Environment Variables" section and add all variables from the table above.
5. **Deploy**: Click "Deploy".

> **Critical**: `REDIS_URL` must point to a cloud Redis instance (e.g., Upstash), **not** `localhost`.

Vercel auto-deploys on every push to the main branch.

### Custom Domain

1. In Vercel project settings → Domains.
2. Add your custom domain (e.g., `yourdomain.io`).
3. Update DNS records as instructed by Vercel.
4. Update Clerk redirect URIs to include the new domain.
5. Update Google OAuth redirect URIs in Google Cloud Console.

---

## Option 2: Self-Hosting (Node.js)

Deploy on any Node.js-capable server (AWS EC2, DigitalOcean, Railway, Render).

```bash
# Build
npm run build

# Start (port 3000 default)
npm start

# Custom port
npm start -- -p 8080
```

Set environment variables in the server's system environment or via `.env.production`.

---

## Option 3: Docker

```bash
# Build image
docker build -t policy-prism .

# Run container
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=sk-... \
  -e CLERK_SECRET_KEY=sk_... \
  -e REDIS_URL=redis://... \
  -e GOOGLE_SEARCH_API_KEY=... \
  -e GOOGLE_SEARCH_CX=... \
  -e STRIPE_SECRET_KEY=sk_... \
  -e STRIPE_WEBHOOK_SECRET=whsec_... \
  policy-prism
```

---

## Local Development with Docker Compose

To run Redis locally:

```bash
docker-compose up -d
```

Set `REDIS_URL=redis://localhost:6379` in `.env.local`.

---

## Post-Deployment Verification

1. **Authentication**: Sign in and verify Clerk authentication works.
2. **Upload**: Upload a test PDF on the `/data` page.
3. **Analysis**: Run an Institutional Logics analysis and confirm results.
4. **Ghost Nodes**: Run GNDP detection and verify the pipeline completes all passes.
5. **Ecosystem**: Navigate to `/ecosystem` and confirm the network graph renders.
6. **Credits**: Verify Stripe integration via a test payment (use Stripe test mode keys).

---

**Last Updated**: 2026-04-22
