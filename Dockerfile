FROM docker.io/library/node:18

LABEL org.opencontainers.image.source="https://github.com/markhuang1212/simple-h2-proxy"

VOLUME [ "/etc/h2-proxy" ]

EXPOSE 9000
EXPOSE 80 443

WORKDIR /app

COPY . .
# RUN yarn
RUN yarn run build
