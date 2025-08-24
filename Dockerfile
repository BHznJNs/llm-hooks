FROM node:22
ENV RUNTIME=docker
ENV PORT=5126

WORKDIR /app
COPY . /app
RUN npm install

EXPOSE 5126
CMD ["npm", "run", "dev"]