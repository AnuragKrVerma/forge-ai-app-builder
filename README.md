# Forge AI - AI-Powered Code Generation Platform

A **Bolt/Lovable.dev clone** that allows you to chat with an AI coding agent to generate, modify, and run code in isolated sandboxes. The AI agent can create files, execute terminal commands, and build full-stack applications through natural conversation.

## ✨ Features

### ✅ Implemented

- 🤖 AI-powered coding agent using Gemini 2.5 Flash
- 💬 Real-time chat interface for project creation
- 📁 Automatic project file generation
- 🔧 Terminal command execution in sandboxes
- 🗄️ PostgreSQL database with Prisma ORM
- 📤 File upload support (images)
- 🔄 Background job processing with Inngest
- 🏗️ E2B sandbox environment for code execution
- 📊 Project and message management

### 🚧 In Progress / Pending

- 🌐 Live preview of generated projects
- 📝 Code editor with Monaco
- 🌲 File explorer/tree view
- 🔍 Code highlighting and syntax support
- 💾 Save and export generated projects
- 🎨 UI polish and responsive design improvements

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Frontend**: React 19, TailwindCSS 4, Shadcn UI
- **Backend**: Elysia.js, Inngest (background jobs)
- **Database**: PostgreSQL (Neon), Prisma ORM
- **AI/Agent**:
  - [@inngest/agent-kit](https://www.inngest.com/docs/agent-kit) - AI agent orchestration
  - Gemini 2.5 Flash - LLM model
- **Sandbox Environment**: [E2B Code Interpreter](https://e2b.dev)
- **File Uploads**: UploadThing
- **Editor**: Monaco Editor (planned)

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 20.x or higher
- **npm**, **yarn**, **pnpm**, or **bun**
- **PostgreSQL database** (Neon recommended)
- API keys for:
  - Neon Database
  - Google Gemini API
  - E2B Sandbox
  - UploadThing

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd forge-ai
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database (Neon PostgreSQL)
# Get from: https://console.neon.tech
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require&channel_binding=require"

# UploadThing (File Uploads)
# Get from: https://uploadthing.com/dashboard
UPLOADTHING_TOKEN="your_uploadthing_token_here"

# Google Gemini API (AI Model)
# Get from: https://ai.google.dev/
GEMINI_API_KEY="your_gemini_api_key_here"

# E2B Sandbox API (Code Execution)
# Get from: https://e2b.dev/docs
E2B_API_KEY="your_e2b_api_key_here"
```

#### 🔑 How to Get API Keys:

**Neon Database:**

1. Sign up at [https://neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. Make sure it includes `?sslmode=require&channel_binding=require`

**UploadThing:**

1. Sign up at [https://uploadthing.com](https://uploadthing.com)
2. Create a new app
3. Copy the token from Settings → API Keys

**Gemini API:**

1. Visit [https://ai.google.dev/](https://ai.google.dev/)
2. Get an API key from Google AI Studio
3. Enable Gemini API in your Google Cloud project

**E2B Sandbox:**

1. Sign up at [https://e2b.dev](https://e2b.dev)
2. Get your API key from the dashboard
3. Note: E2B provides isolated sandbox environments for code execution

### 4. Database Setup

Run Prisma migrations to set up your database schema:

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 5. Create E2B Template

Build and push the custom E2B template for Next.js projects:

```bash
# Install E2B CLI globally
npm install -g @e2b/cli

# Login to E2B
e2b auth login

# Build and push template (from e2b-templates/nextjs directory)
cd e2b-templates/nextjs
e2b template build

# Note the template ID and update it in your code if needed
```

### 6. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

### 7. Set Up Inngest Dev Server (Required for AI Agent)

In a separate terminal, run the Inngest dev server to handle background jobs:

```bash
npx inngest-cli@latest dev
```

This is **required** for the AI coding agent to work. The Inngest dev server will:

- Listen for events
- Execute the AI agent functions
- Provide a local dashboard at http://localhost:8288

## 📁 Project Structure

```
forge-ai/
├── app/
│   ├── api/                    # API routes
│   │   ├── [[...slugs]]/      # Elysia.js API handler
│   │   ├── elysia/            # Elysia route modules
│   │   ├── inngest/           # Inngest webhook endpoint
│   │   └── uploadthing/       # File upload handlers
│   ├── projects/              # Project pages
│   │   └── [id]/             # Individual project view
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page (chat interface)
├── components/
│   ├── ai-chatbox.tsx        # Chat input component
│   ├── project-view.tsx      # Project workspace view
│   ├── messages-container.tsx # Message list
│   └── ui/                   # Shadcn UI components
├── inngest/
│   ├── client.ts             # Inngest client config
│   ├── function.ts           # AI agent function
│   └── prompt.ts             # System prompt for AI
├── lib/
│   ├── db.ts                 # Prisma client
│   ├── sandbox.ts            # E2B sandbox utilities
│   └── generated/            # Generated Prisma types
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Migration files
├── e2b-templates/
│   └── nextjs/               # E2B template for Next.js
└── .env                      # Environment variables
```

## 🔄 How It Works

1. **User sends a message** via the chat interface
2. **Message is saved** to PostgreSQL database
3. **Inngest event is triggered** (`code-agent/codeAgent.run`)
4. **AI Agent (Gemini)** receives the message with tools:
   - `terminal` - Execute shell commands
   - `createOrUpdateFiles` - Create/modify project files
   - `readFiles` - Read file contents
5. **E2B Sandbox** provides isolated environment for code execution
6. **Agent generates code**, creates files, and runs commands
7. **Results are saved** as messages with code fragments
8. **UI updates** to show the generated project

## 📊 Database Schema

```prisma
model Project {
  id        String    @id @default(uuid())
  name      String
  messages  Message[]
  sandboxId String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id           String        @id @default(uuid())
  content      String
  role         MessageRole   # USER | ASSISTANT
  type         MessageType   # RESULT | ERROR
  codeFragment CodeFragment?
  projectId    String
  project      Project
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model CodeFragment {
  id         String   @id @default(uuid())
  messageId  String   @unique
  sandboxUrl String
  sandboxId  String?
  title      String
  files      Json     # Stores generated files
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

## 🎯 Usage

1. Open http://localhost:3000
2. Type a message like: "Create a React todo app with TypeScript"
3. The AI agent will:
   - Create project files
   - Set up dependencies
   - Generate component code
   - Configure build tools
4. View the generated code and files in the project view
5. Continue chatting to modify or add features

## 🐛 Common Issues

**Inngest agent not responding:**

- Make sure Inngest dev server is running (`npx inngest-cli@latest dev`)
- Check that webhook is accessible in Inngest dashboard

**Database connection errors:**

- Verify `DATABASE_URL` in `.env` is correct
- Ensure Neon database is active
- Run `npx prisma migrate dev` to sync schema

**E2B sandbox errors:**

- Verify `E2B_API_KEY` is valid
- Check E2B dashboard for usage limits
- Ensure template is built and deployed

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open database GUI
npx prisma generate  # Generate Prisma client
npx prisma migrate dev # Run migrations
```

## 🚀 Deployment

This project can be deployed on [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

**Important:**

- Set up Inngest production environment
- Configure E2B production API key
- Update database connection for production

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Inngest Agent Kit](https://www.inngest.com/docs/agent-kit)
- [E2B Documentation](https://e2b.dev/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon Documentation](https://neon.tech/docs)

## 🙏 Credits

Following the tutorial: [Build Your Own Bolt.new Clone](https://www.youtube.com/watch?v=aORyA5X43l4)

## 📄 License

This project is for educational purposes.
