#!/usr/bin/env bash

docker-compose up --build --force-recreate -d

docker exec -it notesapp-test npm install mocha@2.4.5 chai@3.5.0

docker exec -it notesapp-test npm run test-docker-notes-memory
docker exec -it notesapp-test npm run test-docker-notes-fs
docker exec -it notesapp-test npm run test-docker-notes-sequelize-mysql

docker compose stop

