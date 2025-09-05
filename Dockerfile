FROM node:22-alpine AS frontend-builder

WORKDIR /app
COPY package*.json ./
COPY frontend ./frontend
COPY common ./common
RUN npm ci
RUN cd frontend && npm ci
RUN npm run build:frontend

# --- --- --- --- --- ---

FROM node:22-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
COPY src ./src
COPY scripts ./scripts
COPY common ./common
RUN npm ci
RUN npm run build:backend

# --- --- --- --- --- ---

FROM node:22-slim AS runtime
ENV RUNTIME=docker
ENV PORT=5126

WORKDIR /app
COPY package*.json ./
COPY drizzle ./drizzle
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=frontend-builder /app/dist-frontend /app/dist-frontend
COPY --from=backend-builder /app/dist-src /app/dist-src

EXPOSE 5126
CMD ["npm", "start"]