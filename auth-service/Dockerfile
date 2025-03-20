FROM node:14-alpine
WORKDIR /usr
COPY ./auth-service ./auth-service/
COPY ./node-common ./node-common/
RUN ls -a

RUN cd node-common && npm install && npm run build && cd ..
WORKDIR /usr/auth-service
RUN npm install && npm run build

RUN npm install pm2 -g
CMD ["pm2-runtime","./dist/app.js"]