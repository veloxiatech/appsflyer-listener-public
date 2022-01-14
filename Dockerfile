FROM node:14 as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json ./
# enables swagger plugin during build
COPY nest-cli.json ./
COPY src src
# todo: remove debug symbols from build
RUN npm run build
COPY src/space-colony-googleapis.json dist


FROM node:14

WORKDIR /app
RUN chown node:node .
USER node
COPY package*.json ./
RUN npm install --production
COPY --from=builder /app/dist dist/

EXPOSE 8080
# use tini i guess
CMD ["npm", "run", "start:prod"]