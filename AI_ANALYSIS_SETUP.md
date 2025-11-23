# AI-Powered PDF Analysis - Setup Instructions

## What's Been Implemented

✅ **Core Infrastructure**:
- OpenAI API integration with DSF lens
- PDF text extraction utility
- API route at `/api/analyze`
- Environment configuration template

## Setup Required

### 1. Get OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### 2. Configure Environment Variables

1. Create a file named `.env.local` in the project root:
   ```bash
   # In c:\Users\mount\.gemini\antigravity\scratch\
   ```

2. Add your API key:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Important**: `.env.local` is already in `.gitignore` and won't be committed

### 3. Restart Dev Server

After adding the API key:
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## How to Use

### Upload & Analyze a PDF:

1. Go to `/data` page
2. Click "Upload PDF" button (to be added to UI)
3. Select a PDF file (EU AI Act, Brazil PL 2338, etc.)
4. System will:
   - Extract text from PDF
   - Send to OpenAI for DSF lens analysis
   - Display results with:
     - Situated Teleology
     - Normative Attractors
     - Colonial/Crip Blind Spots
     - Key Insights

### API Endpoint:

```typescript
POST /api/analyze
Body: {
  "text": "extracted PDF text...",
  "sourceType": "Policy Document"
}

Response: {
  "success": true,
  "analysis": {
    "situated_teleology": "...",
    "normative_attractors": "...",
    "blind_spots": "...",
    "key_insight": "..."
  }
}
```

## Cost Considerations

- GPT-4 API calls cost approximately $0.03 per 1K tokens (input) and $0.06 per 1K tokens (output)
- A typical policy document analysis might cost $0.10-0.50
- Set usage limits in your OpenAI dashboard

## Next Steps

To complete the UI integration, we need to:
1. Add PDF upload button to Data page
2. Create analysis results display component
3. Store analyzed segments with sources
4. Add "Analyze" button for existing sources

Would you like me to complete the UI integration?
