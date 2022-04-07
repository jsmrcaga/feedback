const User = require('../../models/user');
const Feedback = require('../../models/feedback');

const UserResolver = (source, args, context={}, info) => {
	const { id } = args;

	const { fieldNodes: [{ selectionSet: { selections }}]} = info;
	
	// If any feedback was selected we can perform a "JOIN"
	const feedback = selections.find(selection => {
		return selection.kind === 'Field' && /^feedback/.test(selection.name.value)
	});

	let user_promise = null;
	if(id === 'me') {
		if(!context.auth?.user) {
			throw new Error('Auth needed for "me"');
		}

		user_promise = Promise.resolve(context?.auth?.user);
	} else {
		user_promise = User.get(id);
	}

	if(!feedback) {
		return user_promise;
	}

	// Select all feedback that goes with the user
	// This is a fake join, IDK how to do this on a KV
	return user_promise.then(user => {
		if(!user) {
			return null;
		}

		const { feedback_target, feedback_source } = user;
		const target = feedback_target.map(id => Feedback.get(id));
		const source = feedback_source.map(id => Feedback.get(id));

		return Promise.all([user, target, source]).then(([user, target, source]) => {
			user.feedback_target = target;
			user.feedback_source = source;

			return user;
		});
	});
};

const get_hash = (id, password) => {
	const encoder = new TextEncoder();
	const decoder = new TextDecoder();

	const salted = `${password}:${id}`;
	return crypto.subtle.digest({ name: 'SHA-256' }, encoder.encode(salted)).then(arrayBuffer => {
		return decoder.decode(arrayBuffer);
	});
};

const UserSignup = (source, args) => {
	const { id, password, name } = args;
	return User.get(id).then(user => {
		if(user) {
			throw new Error('Id already taken');
		}

		return get_hash(id, password);
	}).then(password => {
		const token = crypto.randomUUID();
		const user = new User({ id, password, name, token });
		return user.save();
	}).then(user => {
		return user.token;
	});
};

const UserLogin = (source, args) => {
	const { id, password } = args;
	return get_hash(id, password).then(password => {
		return Promise.all([User.get(id), password]);
	}).then(([user, password]) => {
		if(user.password !== password) {
			throw new Error(`No matching id & password`);
		}

		const token = crypto.randomUUID();
		user.token = token;
		return user.save();
	}).then(user => {
		return user.token;
	});
};

module.exports = { UserResolver, UserSignup, UserLogin, get_hash };
