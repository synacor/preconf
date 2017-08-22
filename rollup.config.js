import buble from 'rollup-plugin-buble';

export default {
	useStrict: false,
	external: [
		'preact',
		'dlv',
		'deepmerge'
	],
	globals: {
		preact: 'preact',
		dlv: 'dlv',
		deepmerge: 'deepmerge'
	},
	plugins: [
		buble({
			objectAssign: 'assign',
			jsx: 'h'
		})
	]
};
