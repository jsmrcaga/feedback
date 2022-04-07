const crypto = require('crypto');
const { Request, Response, Headers } = require('@control/cloudflare-workers-router/test/utils/http');
const { KV_BINDING } = require('@control/cloudflare-workers-router/test/utils/kv');

global.Request = Request;
global.Response = Response;
global.Headers = Headers;

global.FEEDBACK_DATABASE = KV_BINDING;
global.crypto = crypto;
