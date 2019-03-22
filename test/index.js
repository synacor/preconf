import { spy } from 'sinon';
import 'undom/register';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import { h, render } from 'preact';
import Provider from 'preact-context-provider';
import preconf from '../src';
chai.use(sinonChai);

/*eslint-env mocha*/

describe('preconf', () => {
	let scratch = document.createElement('div'),
		rndr = jsx => render(jsx, scratch, scratch.lastChild);

	beforeEach( () => rndr(null) );

	describe('preconf()', () => {
		it('should return a function for preconf()', () => {
			expect(preconf()).to.be.a('function');
		});

		it('should return a function for preconf()()', () => {
			let defaults = {
				a: 'b',
				c: 'd'
			};
			let configure = preconf(null, defaults);
			let deco = configure(['a', 'c']);
			expect(deco).to.be.a('function');
			expect(deco( () => {} )).to.be.a('function');
		});

		describe('getWrappedComponent()', () => {

			it('should be a function', () => {
				expect(preconf(null, { a: 'b' })(['a'])(spy()).getWrappedComponent).to.be.a('function');
			});

			it('should return the Child component that it is wrapping', () => {
				let Foo = spy();
				let Wrapped = preconf(null, { a: 'b' })(['a'])(Foo);
				expect(Wrapped.getWrappedComponent()).to.equal(Foo);
			});

			it('should recursively call getWrappedComponent() on Child components to return the first non-decorator Child', () => {
				let Foo = spy();
				//Wrap Foo in two layers of configuration to make sure Foo is returned by the top level call to getWrappedComponent
				let Wrapped = preconf(null, { a: 'b' })(['a'])(preconf(null, { c: 'd' })(['c'])(Foo));
				expect(Wrapped.getWrappedComponent()).to.equal(Foo);
			});

		});


		describe('selection', () => {
			let defaults = {
				a: 'b',
				c: 'd'
			};

			let Child = spy( () => null );
			let configure = preconf(null, defaults);

			function test(config, selector) {
				Child.resetHistory();
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
	});
});
