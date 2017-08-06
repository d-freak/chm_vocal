FROM library/node:slim

COPY . /app

RUN cd /app \
  && npm install --production

WORKDIR /app

CMD token=xoxb-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx node chm_vocal.js
