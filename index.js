const http = require("http");
const https = require("https");
const pathToRegexp = require("path-to-regexp");
const url = require("url");
const qs = require("querystring");
const moment = require("moment");
const Busboy = require("busboy");
const inspect = require('util').inspect;
const os = require("os");
const uuid = require("uuid").v4;
const path = require("path");
const fs = require("fs");

const DEFAULT_PORT = 4242;
const DEFAULT_POWERED_BY = "The Framework";
const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
const DEFAULT_API_DIRECTORY = "/api";

const MAX_BODY_LENGTH = 1e6 * 10;

const GET = "GET";
const POST = "POST";
const PUT = "PUT";
const PATCH = "PATCH";
const DELETE = "DELETE";
const OPTIONS = "OPTIONS";

const STRING = "string";
const INTEGER = "integer";
const OBJECT = "object";
const FLOAT = "float";
const ENUM = "enum";
const DATE = "date";
const BOOLEAN  = "boolean";
const IMAGE = "image";
const FILE = "file";

const ERROR_400_BAD_REQUEST = 400;
const ERROR_401_UNAUTHORIZED = 401;
const ERROR_404_NOT_FOUND = 404;
const ERROR_500_SERVER_ERROR = 500;

const STATUS_CODE_SUCCESS = 200;
const STATUS_CODE_REDIRECT = 301;

const CONTENT_TYPE_JSON = "application/json";

const DOC_MIME_TYPES = {
    "svg": "image/svg+xml",
    "js": "text/javascript",
    "css": "text/css"
};

const RESPONSE_TYPE_REDIRECT = "redirect";

var DOCS_FILES = {};

const createListOfDocsFiles = function(path) {
    const files = fs.readdirSync(`${__dirname}/docs/build${path}`);

    files.forEach((file) => {
        const filePath = `${__dirname}/docs/build${path}/${file}`;
        if (fs.lstatSync(filePath).isDirectory()) {
            createListOfDocsFiles(`${path}/${file}`);
        } else {
            DOCS_FILES[`${path}/${file}`] = true;
        }
    });
};

createListOfDocsFiles("");

const VALIDATOR_METHODS = {
    string: (parameter, value) => {
        return {
            validatedResult: value
        };
    },
    object: (parameter, value) => {
        if (typeof value !== "object") {
            return {
                error: "'" + parameter.id + "' must be an object",
                field: parameter.id
            }
        }

        return {
            validatedResult: value
        }
    },
    integer: (parameter, value) => {
        var error = undefined;
        var validatedResult = undefined;

        try {

            var numberValue = Number(value);

            if (!Number.isInteger(numberValue)) {
                error = {
                    error: "'" + parameter.id + "' must be an integer",
                    field: parameter.id
                };
            } else {
                validatedResult = numberValue;
            }

        } catch (err) {
            error = {
                error: "'" + parameter.id + "' must be an integer",
                field: parameter.id
            };
        }

        return {
            error: error,
            validatedResult: validatedResult
        }
    },
    enum: (parameter, value) => {
        var error = undefined;
        var validatedResult = undefined;

        if (!parameter.validValues || parameter.validValues.length === 0) {
            error = {
                error: "No valid values specified in setup",
                field: parameter.id
            };
        } else {
            // Check if our value is in valid values
            for (var i = 0; i < parameter.validValues.length; i++) {
                if (parameter.validValues[i] === value) {
                    validatedResult = value;
                    break;
                }
            }

            if (!validatedResult) {
                error = {
                    error: "Invalid value '" + value + "', must be one of " + parameter.validValues,
                    field: parameter.id,
                    valid_values: parameter.validValues
                };
            }
        }

        return {
            error: error,
            validatedResult: validatedResult
        };
    },
    date: (parameter, value) => {
        var validatedResult = undefined;
        var error = undefined;

        var dateFormat = DEFAULT_DATE_FORMAT;

        if (parameter.dateFormat) {
            dateFormat = parameter.dateFormat;
        } else if (this.config && config.dateFormat) {
            dateFormat = config.dateFormat;
        }

        try {
            var validDate = moment(value, dateFormat, true);
            if (!validDate.isValid()) {
                error = {
                    error: "Invalid date",
                    field: parameter.id,
                    expected_date_format: dateFormat
                };
            } else {
                validatedResult = validDate.toDate();
            }
        } catch (err) {
            error = {
                error: "Invalid date",
                field: parameter.id,
                expected_date_format: dateFormat
            };
        }

        return {
            error: error,
            validatedResult: validatedResult
        };
    },
    boolean: (parameter, value) => {
        if (value !== undefined) {
            if (typeof(value) === "boolean") {
                return {
                    validatedResult: value
                };
            }
        
            if (value.toLowerCase() === "true" || value.toLowerCase() === "yes" || value === true) {
                return {
                    validatedResult: true
                }
            }

            if (value.toLowerCase() === "false" || value.toLowerCase() === "no" || value === false) {
                return {
                    validatedResult: false
                };
            }
        }

        return {
            error: {
                field: parameter.id,
                error: "Not a valid boolean value"
            }
        };
    }, 
    float: (parameter, value) => {
        var error = undefined;
        var validatedResult = undefined;

        try {
            var numberValue = Number(value);

            if (Number.isNaN(numberValue)) {
                error = {
                    error: "'" + parameter.id + "' must be a number",
                    field: parameter.id
                };
            } else {
                validatedResult = numberValue;
            }

        } catch (err) {
            error = {
                error: "'" + parameter.id + "' must be a number",
                field: parameter.id
            };
        }

        return {
            error: error,
            validatedResult: validatedResult
        }
    },
    image: (parameter, value) => {
        var error = undefined;

        if (!value.mimetype || value.mimetype.toLowerCase().indexOf("image/") < 0) {
            error = {
                error: "Invalid upload file type, was expecting an image, found '" + value.mimetype + "'",
                field: parameter.id
            };
        }

        return {
            validatedResult: value,
            error: error
        };
    },
    file: (parameter, value) => {
        var error = undefined;

        if (parameter.mimetype && !value.mimetype || value.mimetype.toLowerCase().indexOf(parameter.mimetype) < 0) {
            error = {
                error: "Invalid upload file type, was expecting '" + parameter.mimetype + "', found '" + value.mimetype + "'",
                field: parameter.id
            };
        }

        return {
            validatedResult: value,
            error: error
        };
    }
};


module.exports = {
    
    STRING: STRING,
    INTEGER: INTEGER,
    OBJECT: OBJECT,
    FLOAT: FLOAT,
    ENUM: ENUM,
    BOOLEAN: BOOLEAN,
    DATE: DATE,
    IMAGE: IMAGE,
    FILE: FILE,

    ERROR_400_BAD_REQUEST: ERROR_400_BAD_REQUEST,
    ERROR_404_NOT_FOUND: ERROR_404_NOT_FOUND,
    ERROR_500_SERVER_ERROR: ERROR_500_SERVER_ERROR,
    STATUS_CODE_SUCCESS: STATUS_CODE_SUCCESS,

    methods: {
        POST: {},
        GET: {},
        PUT: {},
        PATCH: {},
        DELETE: {}
    },

    dynamicPaths: {
        POST: [],
        GET: [],
        PUT: [],
        PATCH: [],
        DELETE: []
    }, //regexp paths with parameters in them, e.g. /user/:id

    get(url, parameters, options, handler) {
        this.addMethod(url, GET, parameters, options, handler);
    },

    post(url, parameters, options, handler) {
        this.addMethod(url, POST, parameters, options, handler);
    },

    put(url, parameters, options, handler) {
        this.addMethod(url, PUT, parameters, options, handler);
    },

    patch(url, parameters, options, handler) {
        this.addMethod(url, PATCH, parameters, options, handler);
    },

    delete(url, parameters, options, handler) {
        this.addMethod(url, DELETE, parameters, options, handler);
    },

    addMethod(url, httpMethod, parameters, options, method) {
        var authRequired = false;

        if (options && options.authRequired) {
            authRequired = true;
        }

        var regExp = null;
        var dynamicKeys = [];

        if (url.indexOf(":") >= 0) {
            // We have parameters to look out for and convert to regexp
            regExp = pathToRegexp(url, dynamicKeys);
            this.dynamicPaths[httpMethod.toUpperCase()].push(url);
            
        }

        this.methods[httpMethod.toUpperCase()][url] = {
            url: url,
            method: method,
            parameters: parameters,
            options: options,
            authRequired: authRequired,
            regExp: regExp,
            dynamicKeys: dynamicKeys
        };
    },

    writeHeaders(res, status, contentType) {
        res.writeHead(status, {
            "Content-Type": contentType,
            "Access-Control-Allow-Origin": "*",
            "X-Powered-By": this.config.poweredBy || DEFAULT_POWERED_BY
        });
    },

    handleException(err, res) {
        if (typeof err == "object") {
            if (err.status) {
                this.writeHeaders(res, err.status, CONTENT_TYPE_JSON); 
            } else {
                this.writeHeaders(res, ERROR_500_SERVER_ERROR, CONTENT_TYPE_JSON);
            }

            if (err.message) {
                res.write(JSON.stringify({error: err.message}));
            } 
        } else {
            this.writeHeaders(res, ERROR_500_SERVER_ERROR, CONTENT_TYPE_JSON);
            
            if (typeof err == "string") {
                res.write(JSON.stringify({error: err}));
            } else {
                res.write(JSON.stringify({error: "An unexpected error ocurred"}));
            }
        }
        
        res.end();
    },

    validateParams(req, method, requestParams) {
        if (!method.parameters || method.parameters.length === 0) {
            return {
                ok: true,
                params: []
            };
        }

        var errors = [];
        var validatedParams = {};

        method.parameters.forEach((parameter) => {
            // First check if missing required field
            if (parameter.required && !requestParams[parameter.id]) {
                errors.push({
                    error: "'" + parameter.id + "' is required",
                    field: parameter.id
                });
            } else if (requestParams[parameter.id]) {
                // Parameter exists
                if (VALIDATOR_METHODS[parameter.type]) {
                    var validationResult = VALIDATOR_METHODS[parameter.type](parameter, requestParams[parameter.id]);
                    
                    if (validationResult.error) {
                        errors.push(validationResult.error);
                    } else {
                        validatedParams[parameter.id] = validationResult.validatedResult;
                    }
                } else {
                    console.error("Unrecognized parameter type", parameter.type);
                    errors.push({error: "Unrecognized parameter type in setup"});
                }

            }
        });

        return {
            ok: !(errors.length > 0),
            errors: errors,
            params: validatedParams
        };
    },

    getHeader(req, header) {
        if (req.headers && req.headers[header]) {
            return req.headers[header];
        }
        
        return null;
    },

    async getAuthUser(req, method) {
        if (!this.authenticationMethod && method.authRequired) {
            console.error("Your server has authRequired=true on some methods but you have not set an authenticator method");
        }

        try {
            var token = null;

            if (this.config.userTokenHeader) {
                token = this.getHeader(req, this.config.userTokenHeader);
            }

            return await this.authenticationMethod(req, token);
        } catch (e) {
            // User is not logged in
            return null;
        }
    },

    getParamsFromMatchedUrl(regExp, url) {
        var matches = regExp.regExp.exec(url);

        var params = {};

        if (matches) {
            for (var i = 1; i < matches.length; i++) {
                params[regExp.dynamicKeys[i - 1].name] = matches[i];
            }
        }

        return params;
    },

    findMethod(httpMethod, url) {
        if (!this.methods[httpMethod]) {
            console.error("Unknown HTTP method", httpMethod);
            return null;
        }

        var found = this.methods[httpMethod][url];
        var params = {};

        if (!found) {
            // Need to try pattern matching
            var allRegExpMethods = this.dynamicPaths[httpMethod];

            if (!allRegExpMethods || allRegExpMethods.length === 0) {
                return null;
            }

            for (var i = 0; i < allRegExpMethods.length; i++) {
                var regExp = this.methods[httpMethod][allRegExpMethods[i]];
                
                if (regExp.regExp.test(url)) {
                    params = this.getParamsFromMatchedUrl(regExp, url);

                    return {
                        found: this.methods[httpMethod][allRegExpMethods[i]],
                        params: params
                    };
                }
            }
            
        }

        return {
            found: found,
            params: params
        };
    },

    checkRequestedFileIsInDocs(filename) {
        if (DOCS_FILES[`/${filename}`]) {
            return true;
        }

        console.log("404: " + filename);

        return false;

    },

    async loadFile(filename) {
        if  (!this.checkRequestedFileIsInDocs(filename)) {
            throw Error("Invalid filename");
        }

        return new Promise((resolve, reject) => {
            fs.readFile(`${__dirname}/docs/build/${filename}`, function (err, data) {
                if (err) {
                  reject(err); 
                } else {
                    resolve(data);
                }
            });
        });
        
    },

    async loadDocsFile(filename, res) {
        try {
            const fileContents = await this.loadFile(filename);

            if (filename.indexOf(".") >= 0) {
                var fileEnding = filename.substr(filename.lastIndexOf(".") + 1);

                if (DOC_MIME_TYPES[fileEnding]) {
                    this.writeHeaders(res, STATUS_CODE_SUCCESS, DOC_MIME_TYPES[fileEnding]);
                }
            }

            res.write(fileContents);
            res.end();
        } catch (e) {
            this.writeHeaders(res, ERROR_404_NOT_FOUND, CONTENT_TYPE_JSON);
            res.write(JSON.stringify({error: "URL " + filename + " not found"}));
            res.end();
        }
        
    },

    generateApiDefinition(res) {
        var apiMethods = [];

        Object.keys(this.methods).forEach((httpMethod) => {
            Object.keys(this.methods[httpMethod]).forEach((endpoint) => {
                var endpointObj = this.methods[httpMethod][endpoint];
                var description = undefined;

                if (endpointObj.options) {
                    description = endpointObj.options.description;
                }

                apiMethods.push({
                    url: endpointObj.url,
                    description: description,
                    method: httpMethod,
                    parameters: endpointObj.parameters,
                    auth_required: endpointObj.authRequired,
                    options: endpointObj.options
                });
            });
        });
        
        // Sort the methods
        apiMethods.sort((a, b) => {
            if (a.url < b.url) {
                return -1;
            } else if (b.url > a.url) {
                return 1;
            } else {
                return 0;
            }
        });

        this.writeHeaders(res, STATUS_CODE_SUCCESS, CONTENT_TYPE_JSON);
        res.write(JSON.stringify({
            method: apiMethods
        }));
        res.end();
    },

    async handleRequest(req, res, params) {
        var allowAccessControlHeaders = "Origin, X-Requested-With, Content-Type, Accept";

        if (this.config && this.config.userTokenHeader) {
            allowAccessControlHeaders += ", " + this.config.userTokenHeader;
        }

        if (req.method.toUpperCase() === OPTIONS || !(this.methods[req.method.toUpperCase()])) {
            // Likely CORS options request
            res.writeHead(STATUS_CODE_SUCCESS, {
                "Access-Control-Allow-Methods": "OPTIONS, GET, HEAD, POST, PUT, PATCH, DELETE",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": allowAccessControlHeaders
            });

            res.end();
        } else {
            var url = req.url;
            var authUser = null;

            if (url.indexOf("?") >= 0) {
                url = url.substr(0, url.indexOf("?"));
            }

            if ((url === "docs.json" || url === "/docs.json") && !this.config.disableListing) {
                // Root URL, return the JSON config/API definition
                this.generateApiDefinition(res);
            } else if (url.indexOf("/docs") === 0 && !this.config.disableDocs) {
                if (url === "/docs/") {
                    // Redirect to /docs without trailing / so as to not mess up create react app
                    res.writeHead(STATUS_CODE_REDIRECT, {
                        Location: "/docs"
                    });
                    res.end();
                } else if (url === "/docs") {
                    this.loadDocsFile("index.html", res);
                } else {
                    var docsUrl = url.substr("/docs".length + 1);
                    this.loadDocsFile(docsUrl, res);
                }
            } else {
                // Potentiall a method in the API
                var foundMethodObj = this.findMethod(req.method.toUpperCase(), url);
                var foundMethod = null;

                if (foundMethodObj) {
                    foundMethod = foundMethodObj.found;

                    if (foundMethodObj.params) {
                        Object.keys(foundMethodObj.params).forEach((key) => {
                            params[key] = foundMethodObj.params[key];
                        });
                    }
                }

                if (!foundMethod) {
                    // Not found
                    this.writeHeaders(res, ERROR_404_NOT_FOUND, CONTENT_TYPE_JSON);
                    res.write(JSON.stringify({error: "URL " + url + " not found"}));
                    res.end();
                } else {
                    var userIsAuthedIfRequiredOrAnonymous = true;
                    authUser = await this.getAuthUser(req, foundMethod);

                    if (foundMethod.authRequired && !authUser) {
                        // We need auth as this method requires it
                        userIsAuthedIfRequiredOrAnonymous = false;
                    }

                    // We've loaded user if available, now continue or show unauthorised error
                    if (userIsAuthedIfRequiredOrAnonymous) {
                        var validatedParams = this.validateParams(req, foundMethod, params);

                        if (validatedParams.ok) {
                            // Params have been validated
                            try {
                                const response = await foundMethod.method(validatedParams.params, authUser, req);
                                
                                if (response && response.type === RESPONSE_TYPE_REDIRECT && response.redirect_to) {
                                    // If this is a redirect, redirect to the url
                                    res.writeHead(STATUS_CODE_REDIRECT, {
                                        Location: response.redirect_to
                                    });
                                    
                                    res.end();

                                } else {
                                    this.writeHeaders(res, STATUS_CODE_SUCCESS, CONTENT_TYPE_JSON);
                                    res.write(JSON.stringify(response));
                                    res.end();
                                }
                            } catch (err) {
                                this.handleException(err, res);
                            }
                        } else {
                            // Invalid/missing params
                            this.writeHeaders(res, ERROR_400_BAD_REQUEST, CONTENT_TYPE_JSON);
                            res.write(JSON.stringify(validatedParams.errors));
                            res.end();
                        }
                    } else {
                        this.writeHeaders(res, ERROR_401_UNAUTHORIZED, CONTENT_TYPE_JSON);
                        res.write(JSON.stringify({error: "You must be logged in to access this"}));
                        res.end();
                    }
                }
            }

            
        }
    },

    handleMultipartRequest(req, res) {
        var fields = {};

        var busboy = new Busboy({ headers: req.headers });

        busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
            var fileId = uuid();
            var saveTo = path.join(os.tmpdir(), fileId);
            
            try {
                file.pipe(fs.createWriteStream(saveTo));
            } catch (e) {
                console.error(e);
                this.handleException(e, res);
            }

            fields[fieldname] = {
                path: saveTo,
                mimetype: mimetype,
                original_filename: filename
            };

        });

        busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
            fields[fieldname] = inspect(val);
        });
        
        busboy.on('finish', () => {
            this.handleRequest(req, res, fields);
        });

        req.pipe(busboy);
    },

    onServerRequest(req, res) {
        try {
            var body = "";

            if (req.method === GET) {
                var queryParams = url.parse(req.url, true).query;
                req.queryParams = queryParams;
                this.handleRequest(req, res, queryParams);
            } else {
                if (this.config.test) {
                    // This is a test mode request, body is already parsed
                    this.handleRequest(req, res, req.body);
                } else {
                    if (req.headers && req.headers["content-type"] && req.headers["content-type"].indexOf("multipart/form-data") >= 0) {
                        this.handleMultipartRequest(req, res);
                    } else {
                        req.on("data", (data) => {
                            body += data;
                            
                            if (body.length > MAX_BODY_LENGTH) { 
                                req.connection.destroy();
                            }
                        });
        
                        req.on("end", () => {
                            var parsedBody = null;
        
                            try {
                                parsedBody = JSON.parse(body);
                            } catch (err) {
                                parsedBody = qs.parse(body);
                            }
        
                            req.body = parsedBody;
                            this.handleRequest(req, res, parsedBody);
                        });
                    }   
                }
            }
        } catch (e) {
            console.error(e);
            this.handleException(e, res);
        }
    },

    addRouteFiles() {
        var startingDirectory = DEFAULT_API_DIRECTORY;
        
        if (this.config && this.config.apiDirectory) {
            startingDirectory = this.config.apiDirectory;
        }

        this.routeFiles = [];

        var dir = path.join(process.cwd(), startingDirectory);
        this.addRouteFilesNow(dir);
    },

    addRouteFilesNow(directory) {
        var files = fs.readdirSync(directory);

        files.forEach((file) => {
            if (fs.lstatSync(directory + "/" + file).isDirectory()) {
                this.addRouteFilesNow(directory + "/" + file)
            } else {
                if (file.toLowerCase().lastIndexOf(".js") === (file.length - (".js").length)) {
                    console.log("Adding routes from", directory + "/" + file)
                    this.routeFiles.push(require(directory + "/" + file));
                }
            }
        });
    },

    startServer(config) {
        var port = DEFAULT_PORT;

        if (config) {
            this.config = config;

            if (config.port) {
                port = config.port;
            }

            if (config.securePort) {
                securePort = config.securePort;
            }

            if (config.authenticationMethod) {
                this.authenticationMethod = config.authenticationMethod;
            }

        } else {
            this.config = {};
        }

        if (!port) {
            port = process.env.PORT;
        }

        console.log("\n🏗 About to start The Framework on port", port, "\n");

        this.addRouteFiles();

        if (this.config.test) {
            // We are in test mode
            console.log("\n🏗 We are in TEST mode\n");
            return {
                runRequest: (req, res) => this.onServerRequest(req, res)
            };
        } else if (process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
            if (fs.existsSync(process.env.SSL_KEY_PATH) && fs.existsSync(process.env.SSL_CERT_PATH)) {
                const sslOptions = {
                    key: fs.readFileSync(process.env.SSL_KEY_PATH),
                    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
                };

                // Create the SSL server
                this._server = https.createServer(sslOptions, (req, res) => {
                    this.onServerRequest(req, res);
                }).listen(port);

            } else {
                console.error("😡 Couldn't start server as SSL paths don't exist");
            }
        } else {
            console.log("\n✅ The server is running over http on port", port);
            this._server = http.createServer((req, res) => {
                this.onServerRequest(req, res);
            }).listen(port);
        }

        return this._server;
    }
};