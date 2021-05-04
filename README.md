<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/c0a5ea545c544bcaa3c35ffe06c28e37)](https://app.codacy.com/gh/Benedict-Scrumberbatch/peer-recognition-backend?utm_source=github.com&utm_medium=referral&utm_content=Benedict-Scrumberbatch/peer-recognition-backend&utm_campaign=Badge_Grade_Settings)
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Backend code for CS320 Peer Recognition Software Prototype (Spring 2021) using the [Nest](https://github.com/nestjs/nest) framework.

## Installation
From the root directory of the project

### Docker setup
#### stop current database
```bash
$ docker-compose down; docker rm -fr (docker ps | grep postgres | cut -c1-12);\
docker volume rm peer-recognition-backend_database-data
```

#### build the new database
```bash
$ docker-compose up
```

## install the dependencies
```bash
$ npm install
```

## Initialize submodules
```bash
$ git submodule update --init --recursive
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Automated Documentation
Live docs can be found at https://benedict-scrumberbatch.github.io/peer-recognition-backend  
The sources for the docs are contained in the [`gh-pages`](https://github.com/Benedict-Scrumberbatch/peer-recognition-backend/tree/gh-pages) branch.
### compodoc
More detailed information on using compodoc can be found [here](https://compodoc.app/guides/getting-started.html).
```bash
# generate documentation
$ npx @compodoc/compodoc -p tsconfig.json -d docs --includes swagger-docs -a swagger-assets -s
``` 
Documentation will be generated at http://localhost:8080  
### Swagger
Nestjs specific docs can be found [here](https://docs.nestjs.com/openapi/introduction).  
Swagger docs auto generate at http://localhost:4200/api/ or in the compodoc documentation.
#### Useful swagger related links:
* https://stackoverflow.com/questions/54802832/is-it-possible-to-add-authentication-to-access-to-nestjs-swagger-explorer
* https://codeburst.io/integrating-swagger-with-nestjs-9650594ab728

## Docker Notes
### Persistence
The database has persistence of information between sessions.  It however does *not* currently have any form of **environmental** persistence, nor does it have direct file support in the repo, instead it has a volume holding the information.

### Connection
The database is currently used by connecting to localhost:5432.

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).
## License

Nest is [MIT licensed](LICENSE).
