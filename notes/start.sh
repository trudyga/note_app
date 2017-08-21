#!/usr/bin/env bash
export REQUEST_LOG_FORMAT=common;
export REQUEST_LOG_FILE=access.log;
export NOTES_MODEL=MYSQL;
export SEQUELIZE_CONNECT=models/note/storage/sequelize/sequelize-mysql.yaml;
export USERS_MODEL=models/users-rest;
export USER_SERVICE_URL=http://localhost:3333/;
export DEBUG=note-app:*;

node ./app.js;