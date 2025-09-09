# LLM Hooks

Hook Your LLM Calls!

## ✨ Features

- Hooks on:
  - Fetch the model list
  - Before the upstream request
  - The upstream chunks arrived when using stream mode
  - After the upstream responses
- Programatic plugins
- OpenAI, Google Gemini, Antropic upstream supported

## Deploy

```shell
docker run -d --name llm-hooks \
  -p 5126:5126 \
  -e DATABASE_URL=postgres://username:password@hostname:port/database \
  -e AUTH_TOKEN=sk-123456 \
  ghcr.io/llm-hooks/llm-hooks:latest
```

## Development (Docker)

```
cp .env.example .env.docker
```

```shell
npm run dev:frontend # start frontend dev server
npm run dev:docker # start backend server
```
