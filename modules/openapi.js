/**
 * Converts an OpenAPI path to an express path.
 * @param {string} path OpenAPI path object
 * @return {string} Path with express parameters
 */
function expressPath(path) {
    return path.replace(/\{[A-Za-z0-9_]+\}/g, (param) => ':' + param.substr(1, param.length - 2));
}

/**
 * Checks whether the given OpenAPI specification contains the necessary information for the CLI adapter.
 * @param {Object} spec OpenAPI specification
 */
function check(spec) {
    const methods = ['delete', 'get', 'post', 'put', 'options'];
    if (!spec.paths) {
        throw new Error('No paths defined in OpenAPI specification.');
    }
    for(let path in spec.paths) {
        for(let method in spec.paths[path]) {
            let endpoint = spec.paths[path][method];
            if(!methods.includes(method)) {
                throw new Error(`Unknown method ${method} in path ${path}`);
            }
            let options = endpoint['x-cli'];
            if(!options) {
                throw new Error(`No CLI options defined for method ${method} in path ${path}`);
            }
            if(!options.executable && !options.outputFileName) {
                throw new Error(`No executable or outputFileName defined for method ${method} in path ${path}`);
            }
        }
    }
}

module.exports = {
    expressPath,
    check,
};
