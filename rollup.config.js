import buble from 'rollup-plugin-buble';

module.exports = {
	external: [
		'preact',
		'dlv'
	],
	output: {
		globals: {
			preact: 'preact',
			dlv: 'dlv'
		}
	},
	plugins: [
		buble()
	]
};
