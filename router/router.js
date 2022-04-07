const { Router, Model } = require('@control/cloudflare-workers-router');

const User = require('../models/user');

// Bind KV for all models here
// because this is used for testing
// and is almost the entrypoint anyway
Model.bind_kv(FEEDBACK_DATABASE);

const router = new Router();

const gql = require('../parser');

router.post('/gql', (request) => {
	const auth = request.headers.get('Authorization');

	let user = Promise.resolve(null);
	if(auth) {
		let [id, token] = auth.replace(/Bearer /gi, '').split(':');
		if(!id || !token) {
			throw new Error('Wrong credentials, auth header must be: "Bearer <id>:<token>"');
		}

		id = id.trim();
		token = token.trim();

		user = User.get(id).then(user => {
			if(!user.token === token) {
				throw new Error('Wrong credentials');
			}

			return user;
		});
	}

	return user.then(user => {
		return Promise.all([user, request.json()]);
	}).then(([user, json]) => {
		const { query, variables } = json;
		if(!query) {
			return new Response('Bad Request, include a query', { status: 400 });
		}

		return gql({
			query,
			variables,
			context: {
				auth: {
					user
				}
			}
		});
	});
});

module.exports = router;
