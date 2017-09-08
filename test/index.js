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

		describe('opts.deepMerge', () => {
			let defaults = {
				a: 'b',
				c: { d: 'e', f: { g: 'h' } }
			};

			let Child = spy( () => null );
			// let opts = { deepMerge: true };
			// let configure = preconf(null, defaults, opts);

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

			it('should not deep merge config values when deep merge option set to false', () => {
				let config = { c: { f: { g: 'override' } }, e: 'f' };

				test(config, ['a', 'c', 'e'], { deepMerge: false });
				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ ...defaults, ...config });

				config = { c: { d: 'override' }, e: 'f' };

				test(config, ['a', 'c', 'e'], { deepMerge: false });
				delete Child.args[0][0].children;
				expect(Child).to.have.been.calledWith({ ...defaults, ...config });

			});

		});

	});
});
