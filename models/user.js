const { Model } = require('@control/cloudflare-workers-router');

class User extends Model {
	static PREFIX = 'user';

	constructor({ id, name, password, token, feedback_target=[], feedback_source=[] }) {
		super();
		this.id = id || (Math.random() * 0x10000000).toString(16).slice(-6);
		this.name = name;
		this.password = password;
		this.token = token;
		this.feedback_target = feedback_target;
		this.feedback_source = feedback_source;
	}
}

module.exports = User;
