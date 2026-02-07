# PromptCraft

AI-powered prompt builder for website generation tools (Bolt.new, Lovable, v0).

## Features

- **Visual Wizard**: Step-by-step guided process with visual previews
- **AI Analysis**: Paste your PRD and let AI auto-extract selections
- **Multi-Platform Support**: Generate optimized prompts for Bolt, Lovable, and v0
- **State Persistence**: Your progress is automatically saved

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone or download this repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Add your OpenAI API key to `.env.local`:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand with localStorage persistence
- **AI Integration**: OpenAI GPT-4
- **Form Validation**: Zod

## Project Structure

```
├── app/                      # Next.js app router pages
│   ├── api/                 # API routes
│   ├── wizard/              # Visual wizard page
│   └── ai-analysis/         # AI analysis page
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── mode-selection/      # Mode selection components
│   ├── wizard/              # Wizard step components
│   ├── ai-analysis/         # AI analysis components
│   └── shared/              # Shared components
├── lib/                     # Utilities and core logic
│   ├── types/               # TypeScript type definitions
│   ├── store/               # Zustand state management
│   └── prompts/             # Prompt generation logic
└── constants/               # Static data and configuration
```

## Usage

### Visual Wizard Path

1. Choose "Visual Wizard" on the homepage
2. Step 1: Select your website type
3. Step 2: Choose a visual style
4. Step 3: Pick a layout
5. Step 4: Select components
6. Copy the generated prompt for your chosen platform

### AI Analysis Path

1. Choose "AI Analysis" on the homepage
2. Paste your project description or PRD
3. Click "Analyze with AI"
4. Review the AI-extracted selections
5. Copy the generated prompt

## Building for Production

```bash
npm run build
npm run start
```

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your `OPENAI_API_KEY` environment variable
4. Deploy!

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
