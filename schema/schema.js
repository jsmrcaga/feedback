const {
	GraphQLSchema: Schema,
	GraphQLObjectType: ObjectType,
	GraphQLString,
	GraphQLID,
	GraphQLInt,
	GraphQLList,
	GraphQLNonNull,
	GraphQLInputObjectType
} = require('graphql');

const { UserResolver, UserSignup, UserLogin } = require('./resolvers/user');
const { FeedbackCreator, FeedbackResolver } = require('./resolvers/feedback');

const Feedback = new ObjectType({
	name: 'Feedback',
	// Functions make lazy types possible
	fields: () => ({
		id: { type: new GraphQLNonNull(GraphQLID) },
		author: { type: new GraphQLNonNull(User) },
		target: { type: new GraphQLNonNull(User) },
		from: { type: new GraphQLNonNull(GraphQLID) },
		to: { type: new GraphQLNonNull(GraphQLID) },
		content: { type: new GraphQLNonNull(GraphQLString) },
	})
});

const User = new ObjectType({
	name: 'User',
	fields: {
		id: { type: new GraphQLNonNull(GraphQLID) },
		name: { type: GraphQLString },
		email: { type: new GraphQLNonNull(GraphQLString) },
		feedback_target: {
			args: {
				limit: { type: GraphQLInt },
				offset: { type: GraphQLInt }
			},
			type: new GraphQLNonNull(
				new GraphQLList(
					new GraphQLNonNull(
						Feedback
					)
				)
			)
		},
		feedback_source: {
			args: {
				limit: { type: GraphQLInt },
				offset: { type: GraphQLInt }
			},
			type: new GraphQLNonNull(
				new GraphQLList(
					new GraphQLNonNull(
						Feedback
					)
				)
			)
		}
	}
})

const FeedbackInput = new GraphQLInputObjectType({
	name: 'FeedbackInput',
	fields: {
		to: {
			type: new GraphQLNonNull(GraphQLID)
		},
		content: {
			type: new GraphQLNonNull(GraphQLString)
		}
	}
});

/*
type Feedback {
	id: ID!
	author: User!
	from: ID!
	to: ID!
}

type User {
	id: ID!
	name: String!
	email: String!
	feedback_target: [Feedback!]!
	feedback_source: [Feedback!]!
}

input FeedbackInput {
	to: ID!
	content: String!
}

type Mutation {
	create_feedback(feedback: FeedbackInput): Feedback
}

type Query {
	user(id: ID!): User
	feedback(id: ID!): Feedback
}
*/

const schema = new Schema({
	mutation: new ObjectType({
		name: 'RootMutation',
		fields: {
			create_feedback: {
				args: {
					feedback: { type: new GraphQLNonNull(FeedbackInput) }
				},
				// Even for mutations this is the _return_ type
				type: Feedback,
				resolve: FeedbackCreator
			},
			// These return tokens
			signup: {
				args: {
					id: { type: new GraphQLNonNull(GraphQLString) },
					password: { type: new GraphQLNonNull(GraphQLString) },
					name: { type: new GraphQLNonNull(GraphQLString) }
				},
				type: new GraphQLNonNull(GraphQLString),
				resolve: UserSignup
			},
			login: {
				args: {
					id: { type: new GraphQLNonNull(GraphQLString) },
					password: { type: new GraphQLNonNull(GraphQLString) }
				},
				type: new GraphQLNonNull(GraphQLString),
				resolve: UserLogin
			}
		}
	}),
	query: new ObjectType({
		name: 'RootQuery',
		fields: {
			user: {
				type: User,
				args: {
					id: {
						type: new GraphQLNonNull(GraphQLID)
					}
				},
				resolve: UserResolver
			},
			feedback: {
				type: Feedback,
				args: {
					id: {
						type: new GraphQLNonNull(GraphQLID)
					}
				},
				resolve: FeedbackResolver
			}
		}
	})
});

module.exports = schema;
