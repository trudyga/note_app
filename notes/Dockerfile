FROM node:8.4

ENV REQUEST_LOG_FORMAT="common"
ENV REQUEST_LOG_FILE="access.log"
ENV NOTES_MODEL=MYSQL
ENV SEQUELIZE_CONNECT=models/note/storage/sequelize/sequelize-docker-mysql.yaml
ENV USERS_MODEL=models/users-rest
ENV USER_SERVICE_URL=http://userauth:3333/
ENV DEBUG="note-app:*, messages:*"
ENV NOTES_SESSIONS_DIR="/sessions"


RUN mkdir -p /usr/src/app
COPY . /usr/src/app/
WORKDIR /usr/src/app
RUN apt-get update -y \
    && apt-get -y install curl python build-essential git ca-certificates \
    && npm install --unsafe-perm

VOLUME /sessions
EXPOSE 3000
CMD npm run docker