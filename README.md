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
    description: "Says hello"
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

## Uploading files and images
If you specify that a parameter is a FILE or IMAGE, the parameter object will look something like:

```javascript
{
    path: // Where the file has been saved (usually tmp dir),
    mimetype: // the mimetype of the uploaded filename
    original_filename: // the original filename of the file
}