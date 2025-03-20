FROM node:14-alpine
WORKDIR /usr
COPY ./cart-service ./cart-service/
COPY ./node-common ./node-common/
RUN ls -a

RUN cd node-common && npm install && npm run build && cd ..
WORKDIR /usr/cart-service
RUN npm install && npm run build

RUN npm install pm2 -g
CMD ["pm2-runtime","./dist/app.js"]