const theFramework = require("../index");

theFramework.startServer({
    port: 4242,
    apiDirectory: "/test/api",
    userTokenHeader: "x-user-token",
    onRequest: (req) => {
        const url = req.url;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

        console.log(req.method, url, ip);
    }
});