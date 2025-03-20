FROM node:14-alpine
WORKDIR /usr
COPY ./inventory-service ./inventory-service/
COPY ./node-common ./node-common/
RUN ls -a

# Append auth creds to .npmrc (only if AZURE_NPM_FEED_TOKEN is provided)
#RUN sh ./append-npm-auth.sh
RUN cd node-common && npm install && npm run build && cd ..
RUN cd inventory-service && npm install && npm run build

WORKDIR /usr/inventory-service

RUN npm install pm2 -g
CMD ["pm2-runtime","./dist/app.js"]