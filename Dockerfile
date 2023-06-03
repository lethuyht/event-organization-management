FROM node:16.17.0-alpine3.16

WORKDIR /opt/app
RUN yarn global add pm2
EXPOSE 3000

WORKDIR /EVENT-ORGANIZATION-MANAGEMENT

COPY ./package.json .
COPY ./yarn.lock .

RUN yarn

COPY . .

RUN yarn build



CMD ["pm2-runtime", "start", "yarn", "--name", "EVENT-ORGANIZATION-MANAGEMENT", "--interpreter", "sh", "--", "start"]