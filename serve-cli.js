#!/usr/bin/env node

const program = require('commander');
const spawn = require('child_process').spawn;
const path = require('path');

program
    .version('0.1.0')
    .description('Makes a CLI tool available as a RESTful web service using the provided OpenAPI 2.0 (fka Swagger) service description.')
    .arguments('<path-to-service-description>')
    .option('-i, --ip <ip>', 'specify host IP address (defaults to 0.0.0.0)', '0.0.0.0')
    .option('-p, --port <port>', 'specify port (defaults to 80)', 80)
    .parse(process.argv);

let config = {
    host: program.ip,
    port: program.port,
    spec: program.args[0],
};

console.log(`Starting adapter with config: ${JSON.stringify(config)}`);

let server = spawn('node', [path.join(__dirname, 'server.js')], {env: {NODE_CONFIG: JSON.stringify(config)}, shell: true});

server.stdout.pipe(process.stdout);
server.stderr.pipe(process.stderr);

server.on('close', (code) => {
    console.log(`-> server process exited with code ${code}`);
});
