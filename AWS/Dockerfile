FROM node:8.6 as build

WORKDIR /video-chat
COPY package.json /video-chat/
COPY /AWS/default.conf /etc/nginx/conf.d
RUN npm install

COPY /server /video-chat/server

CMD ["npm", "run", "run:server"]
