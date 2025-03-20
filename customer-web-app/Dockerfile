FROM node:14-alpine AS builder
WORKDIR /app
COPY customer-web-app/package.json ./
COPY customer-web-app/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY ./customer-web-app .
RUN yarn build

FROM nginx:1.19-alpine AS server
COPY ./customer-web-app/etc/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder ./app/build /usr/share/nginx/html
