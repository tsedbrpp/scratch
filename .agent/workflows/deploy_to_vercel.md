---
description: How to deploy the application to Vercel
---

# Deploy to Vercel

1.  **Push to Git:** Ensure your code is pushed to a remote repository.
2.  **Vercel Dashboard:** Go to [vercel.com/new](https://vercel.com/new).
3.  **Import:** Select your repository.
4.  **Environment Variables:** Add all variables listed in `.env.local` (see `DEPLOYMENT.md` for the full list).
    - **Critical:** Ensure `REDIS_URL` points to a cloud Redis instance (like Upstash), NOT `localhost`.
5.  **Deploy:** Click Deploy.
