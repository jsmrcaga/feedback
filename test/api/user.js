const { expect } = require('chai');
const Sinon = require('sinon');

const gql = require('../utils/gql');

const User = require('../../models/user');
const Feedback = require('../../models/feedback');

const { get_hash } = require('../../schema/resolvers/user');

describe('User', () => {
	describe('Retrieval', () => {
		for(const [fields, result] of [
			['id', { id: '5' }],
			[['id', 'name'].join('\n'), { id: '5', name: 'Jo Colina' }]
		]) {
			it(`Should get a user with given fields from a simple graphql query (${fields.replace('\n', ', ')})`, done => {
				const get_stub = Sinon.stub(global.FEEDBACK_DATABASE, 'get').callsFake(() => {
					return Promise.resolve(JSON.stringify(new User({
						id: 5,
						name: 'Jo Colina'
					})))
				});

				const request = gql({
					query: `
						query GetUser($id: ID!) {
							user(id: $id) {
								${fields}
							}
						}
					`,
					variables: {
						id: 5
					}
				});

				request.then(response => {
					expect(get_stub.calledWith('user-5')).to.be.true;
					expect(response).to.have.property('data');
					expect(response.data).to.have.property('user');
					expect(response.data.user).to.be.deep.eql(result);
					get_stub.restore();
					done();
				}).catch(e => {
					get_stub.restore();
					done(e);
				});
			});
		}

		it(`Should get a user with created feedback`, done => {
			const get_user_stub = Sinon.stub(User, 'get').callsFake(() => {
				return Promise.resolve(new User({
					id: 5,
					name: 'Jo Colina',
					feedback_source: [6, 78],
					feedback_target: [12]
				}))
			});

			const get_source_feedback_stub = Sinon.stub(Feedback, 'get').callsFake(() => {
				return Promise.resolve(new Feedback({
					id: 6,
					to: 56,
					from: 5,
					content: 'This is some feedback'
				}))
			});

			const request = gql({
				query: `
					query GetUser($id: ID!) {
						user(id: $id) {
							id
							name
							feedback_source {
								id
								to
							}
						}
					}
				`,
				variables: {
					id: 5
				}
			});

			request.then(response => {
				expect(response).to.have.property('data');
				expect(response.data).to.have.property('user');
				expect(response.data.user.id).to.eql('5');
				expect(response.data.user.feedback_source).to.have.length(2);
				expect(response.data.user.feedback_source[0].id).to.be.eql('6');
				expect(response.data.user.feedback_source[0].to).to.be.eql('56');

				expect(get_user_stub.calledWith('5')).to.be.true;
				expect(get_source_feedback_stub.calledWith(6)).to.be.true;
				expect(get_source_feedback_stub.calledWith(78)).to.be.true;

				get_user_stub.restore();
				get_source_feedback_stub.restore();

				done();
			}).catch(e => {
				get_user_stub.restore();
				get_source_feedback_stub.restore();

				done(e);
			});
		});
	});

	describe('Auth', () => {
		it('Should signup a user successfully', done => {
			let user = null;

			const get_stub = Sinon.stub(User, 'get').callsFake(() => {
				return Promise.resolve(null);
			});

			const save_stub = Sinon.stub(User.prototype, 'save').callsFake(function() {
				expect(this.id).to.be.eql('jo.colina');
				expect(this.name).to.be.eql('Jo Colina');
				expect(this.password).to.not.be.eql('my_password');

				return get_hash(this.id, 'my_password').then(hash => {
					expect(this.password).to.be.eql(hash);
					user = this;
					return this;
				});
			});

			const request = gql({
				query: `
					mutation signup_user($id: String!, $password: String!, $name: String!) {
						token: signup(id: $id, password: $password, name: $name)
					}
				`,
				variables: {
					id: 'jo.colina',
					password: 'my_password',
					name: 'Jo Colina'
				}
			});

			request.then(response => {
				expect(save_stub.calledOnce).to.be.true;
				expect(response.data.token).to.be.eql(user.token);

				get_stub.restore();
				save_stub.restore();
				done();
			}).catch(e => {
				get_stub.restore();
				save_stub.restore();
				done(e);
			});
		});

		it('Should not signup because existing id', done => {
			const get_stub = Sinon.stub(User, 'get').callsFake(() => {
				return Promise.resolve(new User({
					id: 'jo.colina'
				}));
			});

			const save_stub = Sinon.stub(User.prototype, 'save');

			const request = gql({
				query: `
					mutation signup_user($id: String!, $password: String!, $name: String!) {
						token: signup(id: $id, password: $password, name: $name)
					}
				`,
				variables: {
					id: 'jo.colina',
					password: 'my_password',
					name: 'Jo Colina'
				}
			});

			request.then(response => {
				expect(save_stub.callCount).to.be.eql(0);
				expect(response.errors).to.have.length.gt(0);

				get_stub.restore();
				save_stub.restore();
				done();
			}).catch(e => {
				get_stub.restore();
				save_stub.restore();
				done(e);
			});
		});

		it('Should login a user', done => {
			const get_stub = Sinon.stub(User, 'get').callsFake(() => {
				return get_hash('jo.colina', 'my_password').then(hash => {
					return new User({
						id: 'jo.colina',
						token: 'fake_token',
						password: hash
					});
				});
			});

			const save_stub = Sinon.stub(User.prototype, 'save').callsFake(function() { return this; });

			const request = gql({
				query: `
					mutation login_user($id: String!, $password: String!) {
						token: login(id: $id, password: $password)
					}
				`,
				variables: {
					id: 'jo.colina',
					password: 'my_password',
				}
			});

			request.then(response => {
				// we call save to change the token
				expect(save_stub.calledOnce).to.be.true;
				expect(response.data.token).to.not.be.null;
				expect(response.data.token).to.not.be.undefined;
				expect(response.data.token).to.not.be.eql('fake_token');

				get_stub.restore();
				save_stub.restore();
				done();
			}).catch(e => {
				get_stub.restore();
				save_stub.restore();
				done(e);
			});
		});

		it('Should not login a user', done => {
			const get_stub = Sinon.stub(User, 'get').callsFake(() => {
				return get_hash('jo.colina', 'my_password').then(hash => {
					return new User({
						id: 'jo.colina',
						token: 'fake_token',
						password: hash
					});
				});
			});

			const save_stub = Sinon.stub(User.prototype, 'save').callsFake(function() { return this; });

			const request = gql({
				query: `
					mutation login_user($id: String!, $password: String!) {
						token: login(id: $id, password: $password)
					}
				`,
				variables: {
					id: 'jo.colina',
					password: 'my_password_test',
				}
			});

			request.then(response => {
				// we call save to change the token
				expect(save_stub.callCount).to.be.eql(0);
				expect(response.errors).to.have.length.gt(0);
				
				get_stub.restore();
				save_stub.restore();
				done();
			}).catch(e => {
				get_stub.restore();
				save_stub.restore();
				done(e);
			});
		});
	});
});
