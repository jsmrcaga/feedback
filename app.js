const { App } = require('@control/cloudflare-workers-router');

const router = require('./router/router');

const app = new App(router);

app.listen();
