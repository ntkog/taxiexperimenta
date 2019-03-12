FROM node:8-alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN npm install
ENV SESSION_SECRET=hola
ENV PORT=80
ENV NODE_ENV=production
EXPOSE $PORT
CMD [ "node", "app.js" ]
