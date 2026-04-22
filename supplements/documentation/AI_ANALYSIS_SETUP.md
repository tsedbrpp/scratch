# Policy Prism — AI Analysis Setup

## Prerequisites

- Node.js 18+ installed
- An OpenAI API key with access to GPT-4o and GPT-4o-mini
- A Google Custom Search API key and Search Engine ID (for empirical traces)

## Setup

### 1. Configure Environment Variables

Create `.env.local` in the project root:

```bash
# Required — AI Analysis
OPENAI_API_KEY=sk-your-openai-key-here

# Required — Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Required — Data Persistence
REDIS_URL=redis://your-upstash-url

# Required — Web Search (Empirical Traces)
GOOGLE_SEARCH_API_KEY=your-google-api-key
GOOGLE_SEARCH_CX=your-search-engine-id

# Required — Payments
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional
NEXT_PUBLIC_ENABLE_DEMO_MODE=false
ADMIN_USER_IDS=user_id_1,user_id_2
```

> **Important**: `.env.local` is in `.gitignore` and will not be committed.

### 2. Start the Development Server

```bash
npm install
npm run dev
```

### 3. Verify Setup

Navigate to `/data`, upload a PDF, and run an analysis. If you see results, the API connection is working.

## LLM Ensemble

Policy Prism uses a coordinated multi-model architecture:

| Model | Usage | Rationale |
|---|---|---|
| **GPT-4o** | Deep analysis, GNDP Pass 2/3, TST extraction | Reliable structured JSON output; avoids Length Refusal Paradox |
| **GPT-4o-mini** | GNDP Pass 1A/1B, parsing, lightweight extraction | Cost-effective for high-throughput extraction passes |
| **Gemini 1.5 Flash** | Web search result processing | Fast processing of search results for empirical traces |

## Prompt Registry

All 30+ analysis prompts are versioned and managed in `src/lib/prompts/registry.ts`. Categories:

- **Analysis** (18 prompts): Institutional Logics, Cultural Framing, Legitimacy, Resistance, Ecosystem, Ghost Nodes, Controversy Mapping, etc.
- **Extraction** (6 prompts): ANT Tracing, Assemblage, Ontology, Theme Extraction, Key Terms, Subject Identification.
- **Simulation** (1 prompt): Trajectory Simulation.
- **Critique** (2 prompts): Critique Panel, Stress Test.

Admin users can override any prompt via the `/settings/prompts` UI. Overrides persist per-user in Redis.

## Cost Considerations

| Operation | Approximate Cost |
|---|---|
| Single analysis (GPT-4o) | $0.05–0.20 |
| GNDP full pipeline (4 passes) | $0.30–0.80 |
| TST meta-synthesis (dual track) | $0.15–0.40 |
| Web search + trace processing | $0.01–0.05 |

Set usage limits in your OpenAI dashboard to control costs.

## API Endpoint

All analyses are routed through a single endpoint:

```
POST /api/analyze
Content-Type: application/json

{
  "text": "extracted document text...",
  "sourceType": "Policy Document",
  "analysisMode": "institutional_logics"
}
```

Available `analysisMode` values correspond to prompt registry IDs. See `src/lib/prompts/registry.ts` for the full list.
