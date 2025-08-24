FROM node:22
ENV RUNTIME=docker
WORKDIR /app
COPY . /app
RUN npm install
CMD ["npm", "run", "dev"]