const camelcase = require('camelcase');

/**
 * Replaces all parameters in the given args array and returns a new args array which contains the parameter values.
 * @param {Array} args Args array with parameters
 * @param {Object} params Parameters
 * @return {Array} Args array containing parameter values
 */
function mapArgs(args, params) {
    if (!args) {
        return [];
    }
    let unknownParams = [];
    let newArgs = args.map((v) => {
        if (v.indexOf(':') === 0 || v.indexOf('=') === 0) {
            if (!params[v]) {
                unknownParams.push(v);
            }
            return params[v];
        }
        return v;
    });
    if (unknownParams.length > 0) {
        throw new Error(`Unknown parameters: ${unknownParams}`);
    }
    return newArgs;
}

/**
 * Replaces all parameters in the given response headers and returns a new headers object which contains the parameter values.
 * @param {Object} headers Response headers with parameters
 * @param {Object} params Parameters
 * @return {Object} Response headers with parameter values
 */
function mapHeaders(headers, params) {
    let unknownParams = [];
    let newHeaders = {};
    if (headers) {
        for (let key in headers) {
            if (headers.hasOwnProperty(key)) {
                let v = headers[key];
                if (v.indexOf(':') === 0 || v.indexOf('=') === 0) {
                    if (!params[v]) {
                        unknownParams.push(v);
                    } else {
                        newHeaders[key] = params[v];
                    }
                } else {
                    newHeaders[key] = headers[key];
                }
            }
            if (unknownParams.length > 0) {
                throw new Error(`Unknown parameters: ${unknownParams}`);
            }
        }
    }
    return newHeaders;
}

/**
 * Creates a parameters object based on CLI options and a given HTTP request
 * @param {Object} options CLI options
 * @param {Object} request HTTP request
 * @return {Object} Parameters
 */
function mapParams(options, request) {
    let map = options.map || {};
    let inputFile = options.inputFileName || 'in' + Date.now();
    let outputFile = options.outputFileName || 'out' + Date.now();
    let headers = {};
    for (let key in request.headers) {
        headers[camelcase(key)] = request.headers[key];
    }
    let params = {
        inputFile,
        outputFile,
        ':inputFile': inputFile,
        '=inputFile': inputFile,
        ':outputFile': outputFile,
        '=outputFile': outputFile,
        ':body': request.body.toString(),
        '=body': request.body.toString(),
    };
    for (let key in headers) {
        if (headers.hasOwnProperty(key)) {
            params[':' + key] = headers[key];
            params['=' + key] = headers[key];
            if (typeof map[key] === 'object') {
                if (map[key][headers[key]]) {
                    params[':' + key] = map[key][headers[key]];
                }
            } else if (typeof map[key] === 'function') {
                headers[key] = map[key](headers[key]);
            }
        }
    }
    Object.keys(request.query).forEach((key) => {
        params['=' + key] = request.query[key];
        params[':' + key] = request.query[key];
    });
    Object.keys(request.params).forEach((key) => {
        params['=' + key] = request.params[key];
        params[':' + key] = request.params[key];
    });
    return params;
}

module.exports = {
    mapArgs,
    mapHeaders,
    mapParams,
};
