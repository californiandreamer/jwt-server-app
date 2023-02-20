# jwt-server-app

### Server start up

1. Clone the repo
2. Run `yarn` or `npm i`
3. Run `yarn start`

### Important notes
* Actual default port is `4000`.
* To make the request from the mobile simulator you should refer to the `localhost` domain.
* To make the request from real mobile device you should refer to your machine IP you can find by running `ifconfig | grep inet`

### Available routes

* POST `/api/login`
* POST `/api/logout`
* POST `/api/refresh` - refresh token update  route
* DELETE `/api/users/:userId`
