FROM node:14
WORKDIR /usr
COPY ./customer-web-backend ./customer-web-backend/
COPY ./node-common ./node-common/

RUN cd node-common && npm install && npm run build && cd ..
RUN cd customer-web-backend && npm install

WORKDIR /usr/customer-web-backend

CMD ["npm", "run", "start"]