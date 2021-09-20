FROM node:16

VOLUME [ "/etc/h2-proxy" ]
WORKDIR /app

COPY . .
RUN yarn
RUN yarn run build

CMD yarn run client