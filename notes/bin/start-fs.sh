#!/bin/bash

export REQUEST_LOG_FORMAT=common
export REQUEST_LOG_FILE=access.log
export NOTES_MODEL=models/notes-fs
export DEBUG=note-app:*

node www.js