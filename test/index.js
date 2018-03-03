import { spy } from 'sinon';
import 'undom/register';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import { h, render } from 'preact';
import Provider from 'preact-context-provider';
import preconf from '../src';
chai.use(sinonChai);

/** @jsx h */

/*eslint-env mocha*/

describe('preconf', () => {
	let scratch = document.createElement('div'),
		rndr = jsx => render(jsx, scratch, scratch.lastChild);

	beforeEach( () => rndr(null) );

	describe('preconf()', () => {
		it('should return a function', () => {
			expect(preconf()).to.be.a('function');
		});

		it('should return a function', () => {
			let defaults = {
				a: 'b',
				c: 'd'
			};
			let configure = preconf(null, defaults);
			let deco = configure(['a', 'c']);
			expect(deco).to.be.a('function');
			expect(deco( () => {} )).to.be.a('function');
		});

		describe('selection', () => {
			let defaults = {
				a: 'b',
				c: 'd'
			};

			let Child = spy( () => null );
			let configure = preconf(null, defaults);

			function test(config, selector) {
				Child.reset();
				let Wrapped = configure(selector)(Child);
				rndr(<Provider config={config}><Wrapped /></Provider>);
			}

			describe('array/string', () => {
				it('should pass defaults', () => {
					test(undefined, ['a', 'c']);
					expect(Child).to.have.been.calledWithMatch({ a: 'b', c: 'd' });

					test(undefined, 'a, c');
					expect(Child).to.have.been.calledWithMatch({ a: 'b', c: 'd' });

					test(undefined, 'a, c, f');
					expect(Child).to.have.been.calledWithMatch({ a: 'b', c: 'd', f: undefined });

					test(undefined, ['a']);
					expect(Child).to.have.been.calledWithMatch({ a: 'b' });

					test(undefined, []);
					expect(Child).to.have.been.calledWithMatch({ });
				});

				it('should pass provided config values', () => {
					let config = { c: 'override', e: 'f' };

					test(config, ['a', 'c', 'e']);
					expect(Child).to.have.been.calledWithMatch({ a: 'b', c: 'override', e: 'f' });

					test(config, 'a, c');
					expect(Child).to.have.been.calledWithMatch({ a: 'b', c: 'override' });

					test(config, 'a, c, f');
					expect(Child).to.have.been.calledWithMatch({ a: 'b', c: 'override', f: undefined });

					test(config, ['e']);
					expect(Child).to.have.been.calledWithMatch({ e: 'f' });

					test(config, []);
					expect(Child).to.have.been.calledWithMatch({ });
				});
			});

			describe('object', () => {
				it('should pass defaults', () => {
					test(undefined, { x: 'a', y: 'c' });
					expect(Child).to.have.been.calledWithMatch({ x: 'b', y: 'd' });

					test(undefined, { x: 'a' });
					expect(Child).to.have.been.calledWithMatch({ x: 'b' });

					test(undefined, { y: 'd' });
					expect(Child).to.have.been.calledWithMatch({ y: undefined });

					test(undefined, {});
					expect(Child).to.have.been.calledWithMatch({ });
				});

				it('should pass provided config values', () => {
					let config = { c: 'override', e: 'f' };

					test(config, { x: 'a', y: 'c' });
					expect(Child).to.have.been.calledWithMatch({ x: 'b', y: 'override' });

					test(config, { x: 'e' });
					expect(Child).to.have.been.calledWithMatch({ x: 'f' });

					test(config, { y: 'd' });
					expect(Child).to.have.been.calledWithMatch({ y: undefined });

					test(config, {});
					expect(Child).to.have.been.calledWithMatch({ });
				});
			});
		});

		describe('opts.mergeProps', () => {
			let defaults = {
				a: 'b',
				c: { d: 'e', f: { g: 'h' } }
			};

			let Child = spy( () => null );

			function test(config, selector, opts) {
				Child.reset();
				let Wrapped = preconf(null, defaults, opts)(selector)(Child);
				rndr(<Provider config={config}><Wrapped /></Provider>);
			}

			it('should pass defaults', () => {
				test(undefined, ['a', 'c']);
				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith(defaults);
			});

			it('should pass provided config values', () => {
				let config = { c: 'override', e: 'f' };

				test(config, ['a', 'c', 'e']);
				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ a: 'b', c: 'override', e: 'f' });

			});

			it('should deep merge config values by default', () => {
				let config = { c: { f: { g: 'override' } }, e: 'f' };

				test(config, ['a', 'c', 'e']);
				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ a: 'b', c: { d: 'e', f: { g: 'override' } }, e: 'f' });

				config = { c: { d: 'override' }, e: 'f' };

				test(config, ['a', 'c', 'e']);
				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ a: 'b', c: { d: 'override', f: { g: 'h' } }, e: 'f' });

			});

			it('should not deep merge config values when merge props option set to false', () => {
				let config = { c: { f: { g: 'override' } }, e: 'f' };

				test(config, ['a', 'c', 'e'], { mergeProps: false });
				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ ...defaults, ...config });

				config = { c: { d: 'override' }, e: 'f' };

				test(config, ['a', 'c', 'e'], { mergeProps: false });
				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ ...defaults, ...config });

			});

			it('should merge only select keys when merge props opt is provided Array of keys to merge', () => {
				let config = { a: 'override', c: { f: { g: 'override' } }, e: 'f' };

				test(config, ['a', 'c', 'e'], { mergeProps: ['c'] });
				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ a: 'override', c: { d: 'e', f: { g: 'override' } }, e: 'f' });

				config = { c: { d: 'override' }, e: 'f' };

				test(config, ['a', 'c', 'e'], { mergeProps: [] });
				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ ...defaults, ...config });

			});

		});

		describe('opts.yieldToContext', () => {
			let defaults = {
				a: 'b',
				c: { d: 'e', f: { g: 'h' } }
			};

			let Child = spy( () => null );

			function test(config, selector, opts) {
				Child.reset();
				let Wrapped = preconf(null, defaults, opts)(selector)(Child);
				rndr(<Provider config={config}><Wrapped /></Provider>);
			}

			it('should override config from context when default config given precedence', () => {
				let config = { c: { f: { g: 'override' } }, e: 'f' };

				test(config, ['a', 'c', 'e'], { yieldToContext: false });
				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ a: 'b', c: { d: 'e', f: { g: 'h' } }, e: 'f' });

				config = { a: 'override', c: { d: 'override' }, e: 'f' };

				test(config, ['a', 'c', 'e'], { yieldToContext: false });
				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ a: 'b', c: { d: 'e', f: { g: 'h' } }, e: 'f' });

			});

			it('should not override default configs when merge props option set to false', () => {
				let config = { c: { f: { g: 'override' } }, e: 'f' };

				test(config, ['a', 'c', 'e'], { mergeProps: false, yieldToContext: false });
				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ ...config, ...defaults });

				config = { c: { d: 'override' }, e: 'f' };

				test(config, ['a', 'c', 'e'], { mergeProps: false, yieldToContext: false });
				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ ...config, ...defaults });

			});

			it('should merge only select keys when merge props opt is provided Array of keys to merge', () => {
				let config = { a: 'override', c: { f: { g: 'override' } }, e: 'f' };

				test(config, ['a', 'c', 'e'], { mergeProps: ['c'], yieldToContext: false });
				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ a: 'b', c: { d: 'e', f: { g: 'h' } }, e: 'f' });

				config = { c: { d: 'override' }, e: 'f' };

				test(config, ['a', 'c', 'e'], { mergeProps: [], yieldToContext: false });
				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ ...config, ...defaults });

			});

		});

		describe('namespacing', () => {
			
			it('should pass the correct props when no namespace is provided - prop name specified as string', () => {
				let Child = spy( () => null );
				let configure = preconf(null, { headquarters: { city: 'Hamburg' } });
				let Wrapped = configure('headquarters')(Child);
				
				let config = { headquarters: { country: 'Germany' } };
				rndr(<Provider config={config}><Wrapped /></Provider>);

				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ headquarters: { city: 'Hamburg', country: 'Germany' } });
			});

			it('should pass the correct props when no namespace is provided - prop name specified as object', () => {
				let Child = spy( () => null );
				let configure = preconf(null, { headquarters: { city: 'Hamburg' } });
				let Wrapped = configure({ location: 'headquarters' })(Child);
				
				let config = { headquarters: { country: 'Germany' } };
				rndr(<Provider config={config}><Wrapped /></Provider>);

				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ location: { city: 'Hamburg', country: 'Germany' } });
			});

			it('should pass the correct props for provided namespace', () => {
				let Child = spy( () => null );
				let configure = preconf('hq', { headquarters: { city: 'Hamburg' } });
				let Wrapped = configure({ location: 'hq.headquarters' })(Child);
				
				let config = { headquarters: { country: 'Germany' } };
				rndr(<Provider config={config}><Wrapped /></Provider>);

				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ location: { city: 'Hamburg' } });
			});

			it('should pass the correct props for conflicting namespace - opts === default', () => {
				let Child = spy( () => null );
				let configure = preconf('hq', { headquarters: { city: 'Hamburg' } });
				let Wrapped = configure({ location: 'hq.headquarters' })(Child);
				
				let config = { hq: { headquarters: { country: 'Germany' } } };
				rndr(<Provider config={config}><Wrapped /></Provider>);

				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ location: { city: 'Hamburg', country: 'Germany' } });
			});

			it('should pass the correct props for conflicting namespace - opts === { mergeProps: false }', () => {
				let Child = spy( () => null );
				let configure = preconf('hq', { headquarters: { city: 'Hamburg' } }, { mergeProps: false });
				let Wrapped = configure({ location: 'hq.headquarters' })(Child);
				
				let config = { hq: { headquarters: { country: 'Germany' } } };
				rndr(<Provider config={config}><Wrapped /></Provider>);

				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ location: { country: 'Germany' } });
			});

			it('should pass the correct props for conflicting namespace - opts === { mergeProps: false, yieldToContext: false }', () => {
				let Child = spy( () => null );
				let configure = preconf('hq', { headquarters: { city: 'Hamburg' } }, { mergeProps: false, yieldToContext: false });
				let Wrapped = configure({ location: 'hq.headquarters' })(Child);
				
				let config = { hq: { headquarters: { country: 'Germany' } } };
				rndr(<Provider config={config}><Wrapped /></Provider>);

				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ location: { city: 'Hamburg' } });
			});


		});

	});
});
