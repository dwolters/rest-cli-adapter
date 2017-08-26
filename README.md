# Adapting CLI to RESTful HTTP API
This adapter allows to easily enrich a command-line tool with a RESTful HTTP API. For this, only an OpenAPI specification with some custom properties is required.

## Configuration

To configure the adapter, an OpenAPI specification has to be provided that describes the HTTP API. For each method of a path, it must be specified which command-line tool shall be executed when the method is invoked. To define this, a custom field called `x-cli` needs to be provided for every method. The following options can be specified:

- `executable` (string): Path to the executable that shall be invoked.

- `args` (string array): String array containing all parameters for the executable. Aside from constant values, the header fields of the HTTP request are available as variables in the form `:name` or `=name`. The former uses the mapped value (see below) while the latter uses the originally value of the field. All HTTP healder fields are written in CamelCase, e.g., `Content-Type` is available as `:contentType` (mapped value) or `=contentType` (original value).

- `inputToFile` (boolean): If `true`, the body of the incoming HTTP request is written into a file. The file's name is represented by the `:inputFile` variable. If `false`, the body of the incoming HTTP request is written to STDIN.

- `inputFileName` (string): Defines a custom name for the input file. If not set, the input file name is automatically generated.

- `outputFromFile` (boolean): If `true`, the body of the outgoing HTTP response is read from the file with the name represented by the `:outputFile` variable. If `false`, the body of the outgoing HTTP response is read to STDOUT.

- `outputFileName` (string): Defines a custom name for the output file. If not set, the output file name is automatically generated.

- `map`: Object or function converting the parameter values to values understood by the command-line tool. For instance, the `Content-Type` of an HTTP request may be `application/msword`, but the command-line tool may only understand `doc`. In this cases, a mapping object can be defined for the parameter `contentType` (all HTTP fields are written in CamelCase): `{"application/msword": "doc"}`. Alternative, a function can be defined, which gets the originally value as an input and must return the mapped value:

```
function(value) {
  if(value == 'application/msword')
    return 'doc';
  return value;
}  
```

- `headers` (object): Defines additional headers for the HTTP response. Variables can be used to define header values as well.


