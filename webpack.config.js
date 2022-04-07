const path = require('path');

module.exports = {
	mode: 'production',
	entry: './app.js',
	output: {
		path: path.resolve(__dirname),
		filename: 'index.js'
	}
};
