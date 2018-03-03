import { h } from 'preact';
import delve from 'dlv';
import merge from 'deepmerge';

/**	Creates a higher order component that provides values from configuration as props.
 *	@param {String} [namespace]                  If provided, exposes `defaults` under a `namespace`
 *	@param {Object} [defaults]                   An object containing default configuration values
 *	@param {Object} [options]                    An object containing options for resolving configuration values
 *	@param {Boolean|Array} [options.mergeProps]  A boolean indicating whether props should be merged, or an array indicating which keys in props should be merged
 *	@param {Boolean} [options.yieldToContext]    A boolean where false indicates that the default values should override those from context, else values in context take precedence
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
 *	// context.config = { location: { city: 'Hamburg' }}
 *
 *	let configure = preconf(null, { location: { country: 'Germany' } });
 *	export default configure('location')( (props) =>
 *		<span>Location: {`${props.location.city}, ${props.location.country}`}</span>
 *	);
 */
export default function preconf(namespace, defaults, { mergeProps=true, yieldToContext=true }={}) {

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

				let deepMerge = Array.isArray(mergeProps) ? ~mergeProps.indexOf(path) : mergeProps;

				if (deepMerge && inheritedVal && defaultVal && typeof inheritedVal === 'object' && typeof defaultVal === 'object') {
					props[key] = yieldToContext ? merge(defaultVal, inheritedVal) : merge(inheritedVal, defaultVal);
				}

				else if (typeof props[key]==='undefined' || props[key]===null) {
					props[key] = yieldToContext ? inheritedVal || defaultVal : defaultVal || inheritedVal;
				}
			}
			return h(Child, props);
		};
	};
}
