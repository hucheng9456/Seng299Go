#!/bin/bash

CWD=$(pwd)
N_LOC=${CWD}/node_modules/n_working

export N_PREFIX=$N_LOC

export WEB_URL=http://roberts.seng.uvic.ca
export MONGO_PORT=30065
export PORT=30064
export NODE_ENV=production
nohup ./node_modules/n/bin/n use latest server.js --production &