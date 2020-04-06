const theFramework = require("../../index");

theFramework.get("/hello", [
    {id: "name", type: theFramework.STRING, required: true, description: "Your name"},
    {id: "age", type: theFramework.INTEGER, required: false, description: "Your age"}
], {
    description: "Says hello",
    authRequired: false
}, async (params, user) => {
    // Params is an object of processed parameters
    // user is the logged in user, if there is one
    return {message: "Hello " + params.name}
});

theFramework.post("/goodbye", [
    {id: "name", type: theFramework.STRING, required: true, description: "Your name"}
], {
    description: "Says goodbye and ends the session",
    authRequired: false
}, async (params, user) => {
    // Params is an object of processed parameters
    // user is the logged in user, if there is one
    return {message: "Goodbye " + params.name}
});

theFramework.get("/load/:id", [
    {id: "id", type: theFramework.UUID, required: true, description: "UUID"}
], {
    description: "Checks UUIDs are loaded correctly",
    authRequired: false
}, async (params, user) => {
    // Params is an object of processed parameters
    // user is the logged in user, if there is one
    return {message: "ID was " + params.id};
});