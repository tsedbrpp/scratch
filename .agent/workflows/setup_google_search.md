---
description: How to obtain Google Search API Key and CX ID
---

# Setting up Google Programmable Search Engine

To enable real web search in the application, you need two keys: an **API Key** and a **Search Engine ID (CX)**.

## 1. Get the API Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create a new project (or select an existing one).
3. Click **"Create Credentials"** > **"API key"**.
4. Copy this key. This is your `GOOGLE_SEARCH_API_KEY`.
5. **Important**: You must enable the "Custom Search API" for your project. Go to "Library" in the side menu, search for "Custom Search API", and click "Enable".

## 2. Get the Search Engine ID (CX)
1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/controlpanel/all).
2. Click **"Add"** to create a new search engine.
3. **Name**: Enter a name (e.g., "Resistance Analysis Search").
4. **What to search**: Select **"Search the entire web"**.
   - *Note*: If this option isn't visible immediately, create it with any specific site (e.g., `eff.org`) first, then edit the settings later to enable "Search the entire web" and remove the specific site.
5. Create the engine.
6. Once created, go to **"Customize"** (or the Overview page).
7. Look for **"Search engine ID"**. It will look like `0123456789:abcdefghijk`.
8. Copy this ID. This is your `GOOGLE_SEARCH_CX`.

## 3. Configure .env.local
Add the keys to your `.env.local` file:

```env
GOOGLE_SEARCH_API_KEY=your_api_key_here
GOOGLE_SEARCH_CX=your_cx_id_here
```

## 4. Restart Server
Restart your development server for the changes to take effect:
```bash
npm run dev
```
