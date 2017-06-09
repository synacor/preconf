import buble from 'rollup-plugin-buble';

export default {
	useStrict: false,
	external: [
		'preact',
		'dlv'
	],
	globals: {
		preact: 'preact',
		dlv: 'dlv'
	},
	plugins: [
		buble({
			objectAssign: 'assign',
			jsx: 'h'
		})
	]
};
