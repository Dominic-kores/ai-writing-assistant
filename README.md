# WriteFlow AI – AI Writing Assistant

A full-stack AI-powered writing assistant that enables users
to transform, improve and generate written content using
Anthropic Claude and OpenAI GPT.

## Project Overview

This project was developed as part of my Week 13 Full-Stack
Software and AI Engineering Bootcamp.

It demonstrates my understanding of LLM API integration,
prompt engineering, structured output parsing, real-time
streaming and provider-agnostic application architecture.

## Objectives

- Integrate Anthropic and OpenAI through a unified wrapper.
- Implement reusable system prompt templates.
- Stream AI-generated responses in real time.
- Validate AI-generated structured output.
- Persist writing history using localStorage.
- Build a responsive and secure full-stack application.

## Features

- Text summarization with three length options
- Content expansion
- Tone transformation
- English, Swahili and French translation
- Grammar and spelling correction
- Social media content generation
- Text paraphrasing
- Claude and GPT provider switching
- Real-time streaming responses
- Token usage and response time tracking
- Side-by-side provider comparison
- Custom system prompts
- History of the last 20 operations
- Copy to clipboard
- TXT and Markdown export
- Responsive user interface

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Lucide React
- React Markdown

### Backend

- Node.js
- Express.js
- Anthropic SDK
- OpenAI SDK
- Zod
- Helmet
- Express Rate Limit

### Storage

- Browser localStorage

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Server and provider configuration |
| POST | /api/transform | Transform source text |
| POST | /api/transform/stream | Stream AI responses |
| POST | /api/prompts | Retrieve default system prompt |

## Getting Started

Clone the repository:

```bash
git clone https://github.com/Dominic-kores/ai-writing-assistant
cd ai-writing-assistant
```

### Backend Setup

```bash
cd server
npm install
npm run dev
```

Create a `.env` file using `.env.example` and configure
your OpenAI and Anthropic API credentials.

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Set the frontend environment variable:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Automated Testing

```bash
cd server
npm test
```

## Live Application

- Frontend: https://ai-writing-assistant-omega-sandy.vercel.app
- Backend: https://ai-writing-assistant-production-5bbc1087.up.railway.app


## Key Learning Outcomes

Through this project, I developed practical experience in
building AI-powered applications, integrating multiple LLM
providers, designing reusable prompts, processing structured
responses and implementing real-time streaming.

I also strengthened my understanding of React state
management, REST API development, security, automated
testing and full-stack deployment.

## Future Improvements

- User authentication and authorization
- Database-backed writing history
- Shareable output links
- AI usage and cost analytics
- Additional language support
- Document uploads



## Author

Dominic Kores Kisioya

Full-Stack Software & AI Engineer
