import { h } from 'preact';
import delve from 'dlv';
import merge from 'deepmerge';

/**	Creates a higher order component that provides values from configuration as props.
 *	@param {String} [namespace]		If provided, exposes `defaults` under a `namespace`
 *	@param {Object} [defaults]		An object containing default configuration values
 *	@param {Object} [options]			An object containing options for resolving configuration values
 *	@returns {Function} [configure()](#configure)
 *
 *	@example
 *	let configure = preconf();
 *	export default configure({ a: 'a' })(MyComponent);
 *
 *	@example
 *	let configure = preconf(null, { url:'//foo.com' });
 *	export default configure({ url: 'url' })( props =>
 *		<a href={props.url} />
 *	);
 *
 *	@example
 *	let configure = preconf('weather', { url:'//foo.com' });
 *	export default configure({
 *		url: 'weather.url'
 *	})( ({ url }) =>
 *		<a href={props.url} />
 *	);
 *
 *	@example
 *	let configure = preconf('users', { user1: { first: 'john' } }, { deepMerge: true });
 *	export default configure({
 *		user1: { last: 'smith' }
 *	})( ({ user1 }) =>
 *		<span>Full Name: {`${props.user1.first} ${props.user1.last}`}</span>
 *	);
 */
export default function preconf(namespace, defaults, options={}) {
	if (namespace) defaults = { [namespace]: defaults };

	/**	Creates a Higher Order Component that provides configuration as props.
	 *	@param {Object|Array<String>} keys	An object where the keys are prop names to pass down and values are dot-notated keypaths corresponding to values in configuration. If a string or array, prop names are inferred from configuration keys.
	 *	@name configure
	 *	@memberof preconf
	 *	@returns {Function} configureComponent(Component) -> Component
	 */
	return keys => {
		if (typeof keys==='string') keys = keys.split(/\s*,\s*/);
		let isArray = Array.isArray(keys);

		return Child => (originalProps, context) => {
			let props = {};
			for (let i in originalProps) props[i] = originalProps[i];
			for (let key in keys) {
				let path = keys[key];
				if (isArray) key = path.split('.').pop();

				let inheritedVal = delve(context, 'config.'+path);
				let defaultVal = delve(defaults, path);

				if (options.deepMerge && inheritedVal && defaultVal && typeof inheritedVal === 'object' && typeof defaultVal === 'object') {
					props[key] = merge(defaultVal, inheritedVal);
				}

				else if (typeof props[key]==='undefined' || props[key]===null) {
					props[key] = inheritedVal || defaultVal;
				}
			}
			return h(Child, props);
		};
	};
}
