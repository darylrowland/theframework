const theFramework = require("../../index");

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