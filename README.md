# Smart Home Services

Smart Home Services is a React application for discovering, booking, and managing trusted home-service providers. It includes customer, provider, and administrator workflows, request tracking, payments, ratings, in-app chat, invoices, and AI-assisted tools.

View the project: [Smart Home Services](https://smart-home-service-automation.ai.studio/)

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

The app runs at `http://localhost:3000`.

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates a production build.
- `npm run lint` runs the TypeScript type check.
- `npm run preview` previews the production build locally.
