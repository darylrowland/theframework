const theFramework = require("../index");

theFramework.startServer({
    port: 4242,
    apiDirectory: "/test/api",
    userTokenHeader: "x-user-token"
});