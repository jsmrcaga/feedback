const router = require('../../router/router');

module.exports = (query, extra={}) => {
	const request = new global.Request({
		method: 'POST',
		url: 'http://plep.com/gql',
		body: query,
		...extra
	});

	const { callback, params } = router.route(request);
	return callback(request, params);
};
