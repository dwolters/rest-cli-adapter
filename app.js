const express = require('express');
const config = require('config');
const jsonfile = require('jsonfile').readFileSync;
const cli = require('./modules/cli');
const openapi = require('./modules/openapi');

const app = express();

const spec = jsonfile(config.get('spec'));
const basePath = spec.basePath || '';

openapi.check(spec);

for(let path in spec.paths) {
    for(let method in spec.paths[path]) {
        let endpoint = spec.paths[path][method];
        app[method](basePath + openapi.expressPath(path), cli(endpoint['x-cli']));
    }
}

module.exports = app;
