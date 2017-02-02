# Seng 299 Group 15 Go Readme
This readme describes how to get started with our project and run the application.

This project requires [Node.js](https://nodejs.org/) v5+ to run.
MongoDB 3.2 can optionally be used for persistence, but is not mandatory.

First download the project then install the dependencies and devDependencies.

```sh
$ npm install -d
```
Then build the clientside files using the bower and gulp tools.
```sh
$ cd Public
$ npm install
$ bower install
$ gulp
$ cd ..
```
The server be run in either development or production mode by using the NODE_ENV environment variable.
```
$ NODE_ENV=production
$ node server.js
```
or
```
$ NODE_ENV=development
$ node server.js
```
Using development mode will enable the live CSS/HTML reload features.

After the server is running you may connect via http://localhost:3000 by default or to a different port by setting the WEB_URL and PORT environment variables respectively.

### Configuration
- NODE_ENV: either 'production' or 'development' to enable live reload
- PORT: specify port for server to listen on
- WEB_URL: specify the url used to configure the oauth callback
- MONGO_PORT: Port used to find the local MngoDB instance
- GOOGLE_CLIENT_ID: Google+ client id for oauth
- GOOGLE_SECRET: Google+ secret for oauth
- GOOGLE_CALLBACK: Callback url used by Google+ oauth. It's auto configured by default
- SESSION_SECRET: Secret key used to hash the session variables