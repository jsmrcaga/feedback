const { Model } = require('@control/cloudflare-workers-router');

class Feedback extends Model {
	static PREFIX = 'feedback';

	constructor({ id, from, to, content }) {
		super();
		this.id = id || (Math.random() * 0x10000000).toString(16).slice(-6);
		this.from = from;
		this.to = to;
		this.content = content;
	}

	get metadata() {
		const { from, to } = this;
		return {
			from,
			to
		};
	}
}

module.exports = Feedback;
