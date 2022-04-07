const { graphql } = require('graphql');

const schema = require('./schema/schema');

module.exports = function parse({ query, variables, context={}, ...rest }) {
	return graphql({
		schema,
		source: query,
		variableValues: variables,
		contextValue: context,
		...rest
	});
};
