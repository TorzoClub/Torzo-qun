const should = require('should');

const Render = require('../render');

const vqfStruct = require('./define');

describe('render.js 参数检查', () => {
	it('checkType vqfStruct 是一个数组', () => {
		let render = new Render;
		(() => {
			render.checkType({});
		}).should.throw('vqfStruct 不是一个数组');
	});
	it('checkType vqfStruct 不能是空数组', () => {
		let render = new Render;
		(() => {
			render.checkType([]);
		}).should.throw('vqfStruct 不能是空数组');
	});

	it('checkType vqfQuestion 是一个数组', () => {
		let render = new Render;
		(() => {
			render.checkType([{}], {});
		}).should.throw('vqfQuestion 不是一个数组');
	});
	it('checkType vqfQuestion 不能是空数组', () => {
		let render = new Render;
		(() => {
			render.checkType([{}], []);
		}).should.throw('vqfQuestion 不能是空数组');
	});

	it('loadStruct 装载 vqfDefine 和 vqfQuestion', () => {
		let render = new Render;
		render.loadStruct([{}], [{}]);

		render.define.should.is.an.Object();
	});
});

describe('render.js 渲染', () => {
	it('类型路由 strcut 不是一个对象', () => {
		let render = new Render;
		(() => {
			render.typeRouter([], {})
		}).should.throw('struct 不是一个对象');
	})
	it('类型路由 缺少回调句柄', () => {
		let render = new Render;
		let errorMessage = '回调对象缺少类型句柄';
		(() => {
			render.typeRouter({}, { multi(){}, why(){}, })
		}).should.throw(errorMessage);

		(() => {
			render.typeRouter({}, { single(){}, why(){}, })
		}).should.throw(errorMessage);

		(() => {
			render.typeRouter({}, { single(){}, multi(){}, });
		}).should.throw(errorMessage);
	});

	let ExecuteTypeRouter = function (render, struct){
		render.typeRouter(struct, {
			single(){},
			multi(){},
			why(){},
		});
	};

	it('类型路由 struct question 不是一个对象或者数组', () => {
		let render = new Render;

		let questionArr = [
			'STRING', 999, null, true, false
		];

		for (let question of questionArr) {
			(() => {
				ExecuteTypeRouter(render, {question})
			}).should.throw('struct question 不是一个数组或者对象');
		}
	});

	it('类型路由 struct questions 不是一个数组', () => {
		let render = new Render;
		let questionsArr = [
			24, 'STRING', true, false, null, {}
		];
		for (let questions of questionsArr) {
			(() => {
				ExecuteTypeRouter(render, {questions});
			}).should.throw('struct questions 不是一个数组')
		}
	});

	it('类型路由 未知的 struct 类型', () => {
		let render = new Render;
		let struct = {};

		(() => {
			ExecuteTypeRouter(render, struct)
		}).should.throw('未知的 struct 类型')
	});

	it('类型路由', () => {
		let render = new Render;

		let defineStruct = [
			{	description: '',
				question: {	type: 'why' }
			},
			{	description: '',
				question: []
			},
			{	description: '',
				questions: []
			}
		];

		let result = {};
		defineStruct.forEach(struct =>
			render.typeRouter(struct, {
				single(){ result.single = 1; },
				multi(){ result.multi = 1; },
				why(){ result.why = 1; }
			})
		);

		result.should.have.property('single');
		result.should.have.property('multi');
		result.should.have.property('why');
	});
});
