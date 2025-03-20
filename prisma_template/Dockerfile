FROM node:14
WORKDIR /usr
COPY ./user-service ./user-service/
COPY ./node-common ./node-common/
RUN ls -a

# Append auth creds to .npmrc (only if AZURE_NPM_FEED_TOKEN is provided)
#RUN sh ./append-npm-auth.sh
RUN cd node-common && npm install && npm run build && cd ..
RUN cd user-service && npm install && npm run build

WORKDIR /usr/user-service

RUN npm install pm2 -g
CMD ["pm2-runtime","./dist/app.js"]