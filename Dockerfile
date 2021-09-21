FROM node:16

VOLUME [ "/etc/h2-proxy" ]

EXPOSE 9000
EXPOSE 80 443

WORKDIR /app

COPY . .
RUN yarn
RUN yarn run build
