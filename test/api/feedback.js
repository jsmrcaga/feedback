const { expect } = require('chai');
const Sinon = require('sinon');

const gql = require('../utils/gql');

const User = require('../../models/user');
const Feedback = require('../../models/feedback');


describe('Feedback', () => {
	describe('Creation', () => {
		it('Should create a feedback object', done => {
			let saved_value = null;
			const to_user = new User({
				name: 'Jo',
				id: 'jo.colina'
			});

			const from_user = new User({
				name: 'Geralt',
				id: 'geralt',
				token: 'witcher'
			})

			const get_user = Sinon.stub(User, 'get').callsFake(id => {
				if(id === 'geralt') {
					return Promise.resolve(from_user);
				}

				return Promise.resolve(to_user);
			});

			const save_stub = Sinon.stub(Feedback.prototype, 'save').callsFake(function() {
				saved_value = this;
				return Promise.resolve(this);
			});

			const request = gql({
				query: `
					mutation TestCreation($feedback: FeedbackInput!) {
						feedback: create_feedback(feedback: $feedback) {
							id
							from
							to
							content
						}
					}
				`,
				variables: {
					feedback: {
						to: 'jo.colina',
						content: 'Wtf are you doing'
					}
				}
			}, {
				headers: {
					Authorization: `Bearer ${from_user.id}:${from_user.token}`
				}
			});

			request.then(response => {
				expect(response.data.feedback).to.not.be.undefined;
				expect(response.data.feedback).to.not.be.null;

				expect(response.data.feedback.to).to.be.eql('jo.colina');
				expect(response.data.feedback.from).to.be.eql('geralt');
				expect(response.data.feedback.id).to.not.be.null;
				expect(response.data.feedback.id).to.not.be.undefined;
				expect(response.data.feedback.content).to.be.eql('Wtf are you doing');

				get_user.restore();
				save_stub.restore();
				done();
			}).catch(e => {
				get_user.restore();
				save_stub.restore();
				done(e);
			});
		});
	});
});
