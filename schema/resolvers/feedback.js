const User = require('../../models/user');
const Feedback = require('../../models/feedback');

const FeedbackCreator = (parent, args, context={}, info) => {
	const { feedback: { to, content }} = args;

	if(!context.auth?.user) {
		throw new Error('Auth needed');
	}

	return User.get(to).then(user => {
		if(!user) {
			throw new Error(`User with id ${to} does not exist`);
		}

		const feedback = new Feedback({
			to: user.id,
			from: context.auth.user.id,
			content
		});

		return feedback.save();
	});
};

const FeedbackResolver = (parent, args, context={}, info) => {
	const { id } = args;

	const { fieldNodes: [{ selectionSet: { selections }}]} = info;

	const author = selections.find(selection => {
		return selection.kind === 'Field' && /^author/.test(selection.name.value)
	});

	const target = selections.find(selection => {
		return selection.kind === 'Field' && /^target/.test(selection.name.value)
	});

	const promises = [];
	promises.push(Feedback.get(parseInt(id)));

	promises.push(author ? User.get(feedback.from) : null);
	promises.push(target ? User.get(feedback.to) : null);


	Promise.all(promises).then(([feedback, author, target]) => {
		// can be null
		if(author) {
			feedback.author = author;
		}

		if(target) {
			feedback.target = target;
		}
	});
};

module.exports = {
	FeedbackCreator,
	FeedbackResolver
};
