#!/usr/bin/env bash
export PORT=3333;
export SEQUELIZE_CONNECT=sequelize-mysql.yaml;
export API_CONFIG=config/api-config.yaml;
export DEBUG=users:*;
node user-server.js;