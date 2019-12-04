FROM node:8.6 as build

WORKDIR /video-chat
COPY package.json /video-chat/
RUN npm install

COPY ./ /video-chat

ARG VUE_APP_SOCKET_HOST=NOT_SET
ARG VUE_APP_SOCKET_PORT=NOT_SET

RUN export VUE_APP_SOCKET_HOST=${VUE_APP_SOCKET_HOST} VUE_APP_SOCKET_PORT=${VUE_APP_SOCKET_PORT} && npm run build

CMD ["npm", "run", "run:server"]
