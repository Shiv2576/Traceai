# Trace Ai


An AI tool that converts any question into a structured reasoning graph.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:3000
```

## Using with DeepSeek API

1. Get an API key from [platform.deepseek.com](https://platform.deepseek.com)
2. Enter it in the UI (the key field below the question box)
3. Or add it to `.env.local`:
   ```
   DEEPSEEK_API_KEY=sk-your-key-here
   ```

Without an API key, the app falls back to **demo data** so you can still see the UI.

## Project Structure

```
/app
  page.tsx              ← Main UI + state
  layout.tsx            ← Root layout
  globals.css           ← Fonts + base styles
  /components
    Graph.tsx           ← React Flow graph + custom node
    PromptInput.tsx     ← Question + API key form
    NodeDetails.tsx     ← Side panel when node is clicked
  /api/visualize
    route.ts            ← POST endpoint → calls DeepSeek

/lib
  deepseek.ts           ← API fetch + prompt
  parser.ts             ← Steps → React Flow nodes/edges
  schema.ts             ← Zod validation schema
  mockData.ts           ← Fallback demo data
```

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Flow** — interactive graph
- **Zod** — JSON schema validation
# Traceai
