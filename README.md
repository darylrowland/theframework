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
    userTokenHeader: "x-user-token", // Header you will use for your user toens
    port: PORT
});
```
