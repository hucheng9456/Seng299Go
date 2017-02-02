#!/bin/bash


# configure node
npm install n

CWD=$(pwd)
N_LOC=${CWD}/node_modules/n_working

export N_PREFIX=$N_LOC

mkdir $N_LOC

./node_modules/n/bin/n latest

# install server

npm install
cd public
npm install
npm install bower gulp
bower install
gulp
cd ..