FROM node:12 AS builder

COPY ./src /web/src
COPY ./public /web/public
COPY ./package.json /web
COPY ./package-lock.json /web
COPY ./vue.config.js /web
COPY ./babel.config.js /web
COPY ./.eslintrc.js /web
COPY ./docker/web_env /web/.env

WORKDIR /web
RUN npm update && npm install
RUN npm run build

FROM node:12

RUN apt-get update && apt-get install -y curl gnupg apt-utils nginx procps

COPY --from=builder /web/dist /web
COPY ./docker/nginx_default /etc/nginx/sites-available/default

COPY ./docker/start.sh /server/start.sh
RUN chmod +x /server/start.sh
                 
EXPOSE 80

STOPSIGNAL SIGTERM

ENTRYPOINT /server/start.sh
