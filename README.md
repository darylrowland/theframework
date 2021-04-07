# The Framework
The Framework is an extremely light weight API building framework for NodeJS.
It has very few dependencies, doesn't use Express (or any other framework), and is very fast 🔥.

## Installing
``
npm install the-framework --save
``

## Quick Setup
Place the following code in your main app file

```javascript
const theFramework = require("the-framework");
const PORT = process.env.PORT;

theFramework.startServer({
    authenticationMethod: async (req, token) => {
        // Optional method to check user token and return either a user object or null (if you cannot authenticate your user)
        if (token) {
            // Code to check token
        }

        return null;
    },
    apiDirectory: "/api", // Directory you will store your route files in
    userTokenHeader: "x-user-token", // Header you will use for your user tokens
    port: PORT
});
```

And then create .js route files under the /api directory (or whatever you specified above in apiDirectory).

Any route files you create under this directory will be automatically added to the framework.

## Route file structure
Route files are just standard NodeJS files, and look something like:

```javascript
const theFramework = require("the-framework");

theFramework.get("/hello", [
    {id: "name", type: theFramework.STRING, required: true, description: "Your name"}
], {
    description: "Says hello",
    authRequired: false
}, async (params, user) => {
    // Params is an object of processed parameters
    // user is the logged in user, if there is one
    return {message: "Hello " + params.name}
});
```

## Supported Parameter types
| Type | Description |
|-------|---------------------|
| STRING | String |
| INTEGER | Integer, e.g. 4 |
| FLOAT | Floating point number, e.g. 2.5 |
| ENUM | Enum options, e.g. Male, Female - you must also provide a validValues array in the parameter config |
| DATE | Date, defaults to YYYY-MM-DD format, unless you pass a date format to the dateFormat parameter |
| BOOLEAN | Boolean, e.g. true or false |
| IMAGE | Image file upload |
| FILE | File upload |
| OBJECT | JSON Object |
| UUID | Valid UUID String |

## Throwing exceptions
If you throw exceptions in your code, by default a 501 server error will be returned.

Throwing an object with a status and a message will allow you to throw a different error code.

e.g. 

```javascript
{
    status: 123,
    message: "Error message here"
}
```

## Returning non JSON Content Types
It is possible to return non JSON content by specifying content_type and content in your return object, e.g.

```javascript
{
    content_type: "text/csv",
    content: "...csv content..."
}
```

You can also set content_disposition if you want, for example, to force a download of the file.

## Uploading files and images
If you specify that a parameter is a FILE or IMAGE, the parameter object will look something like:

```javascript
{
    path: // Where the file has been saved (usually tmp dir),
    mimetype: // the mimetype of the uploaded filename
    original_filename: // the original filename of the file
}
```

Note: you can optionally specify a file size limit in the main config object.

E.g. for 10MB limit:

```
fileSizeLimit: 10000000
```

## Disable docs and JSON route listing
By default, if you hit `/docs.json` you will get back a json list of all of your route.
To disable this, pass  `disableListing: true` in your server config.

Similarly,by default, if you hit `/docs` you will get back some nicely formatted auto generated API docs.
To disable this, pass  `disableDocs: true` in your server config.
