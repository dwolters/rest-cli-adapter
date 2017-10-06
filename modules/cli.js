const spawn = require('child_process').spawn;
const fs = require('fs-promise');
const rawBody = require('raw-body');
const parameter = require('./parameter');

/**
 * Executes a given executable with given parameters.
 *
 * @param {string} executable Executable to be executed
 * @param {string[]} args Argument for the executable
 * @param {Buffer} [stdin] Buffer to be written to stdin
 * @return {Promise} Resolves to stdout or rejects to error emitted during process creation or written to stderr
 */
function execute(executable, args, stdin) {
    return new Promise((resolve, reject) => {
        let p = spawn(executable, args, {shell: true, env: process.env});

        let stderr = '';
        let stdout = '';

        p.on('error', (err) => reject(err));

        p.stderr.on('data', (data) => stderr += data);
        p.stdout.on('data', (data) => stdout += data);

        if (Buffer.isBuffer(stdin)) {
            p.stdin.write(stdin);
        }

        p.on('close', (code) => {
            console.log('Finished with exit code:', code);
            if (code === 0) {
                resolve(stdout);
            } else {
                reject(stderr);
            }
        });
    });
}

/**
 * Creates a request handler for a certain command-line tool.
 * @param {Object} options CLI options
 * @return {Function} Request handler for the command-line tool
 */
function createRequestHandler(options) {
    return function(req, res) {
        let params = parameter.mapParams(options, req);
        let headers = parameter.mapHeaders(options.headers, params);
        let args = parameter.mapArgs(options.args, params);
        rawBody(req)
            .then((buffer) => {
                if (options.inputToFile) {
                    fs.writeFile(params.inputFile, buffer);
                    return null;
                }
                return buffer;
            })
            .then((stdin) => execute(options.executable, args, stdin))
            .then((stdout) => {
                if (options.outputFromFile) {
                    return fs.readFile(params.outputFile);
                }
                return stdout;
            })
            .then((result) => {
                for (let key in headers) {
                    res.setHeader(key, headers[key]);
                }
                res.end(result);
            })
            .catch((err) => {
                res.statusCode = 500;
                res.statusMessage = 'Internal Server Error';
                res.end(res.statusMessage);
                console.error('Error during execution: ', err);
            })
            .then(() => {
                if (options.inputToFile) {
                    fs.unlink(params.inputFile);
                }
                if (options.outputFromFile) {
                    fs.unlink(params.outputFile);
                }
            });
    };
}

module.exports = createRequestHandler;
