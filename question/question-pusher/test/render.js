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

describe('render.js TypeRouter', () => {
	it('strcut 不是一个对象', () => {
		let render = new Render;
		(() => {
			render.typeRouter([], {})
		}).should.throw('struct 不是一个对象');
	})
	it('缺少回调句柄', () => {
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

	it('struct question 不是一个对象或者数组', () => {
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

	it('struct questions 不是一个数组', () => {
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

	it('未知的 struct 类型', () => {
		let render = new Render;
		let struct = {};

		(() => {
			ExecuteTypeRouter(render, struct)
		}).should.throw('未知的 struct 类型')
	});

	it('正确路由类型', () => {
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

describe('render.js RenderRouter', () => {
	const vqfStruct = {

	};
	const vqfQuestion = {

	};
	it('vqfQuestion 不是一个对象或者数组', () => {
		let render = new Render;
		let questionArr = [
			242, null, 'STRING', true, false
		];
		for (let question of questionArr) {
			(() => {
				render.renderRouter(vqfStruct, question, 0);
			}).should.throw('vqfQuestion 不是一个对象或者数组');
		}
	});

	it('single vqfQuestion 不是一个对象', () => {
		let render = new Render;
		let cursor = 0;
		(() => {
			render.renderRouter(
				{ question: [{}] },
				[],
				cursor
			);
		}).should.throw(`这个 single vqfQuestion[${cursor}] 不是一个对象`);
	});
	it('single vqfQuestion choiced 属性不合法', () => {
		let render = new Render;
		let choicedArr = [
			-1, 1, 2, 'a', null, undefined, false, true
		];
		for (let choicedKey in choicedArr) {
			let question = {
				choiced: choicedArr[choicedKey],
			};
			(() => {
				render.renderRouter(
					{ question: [{}] },
					question,
					choicedKey
				);
			}).should.throw(`这个 single vqfQuestion[${choicedKey}] 的 choiced 属性不合法（不是正整数，或者大于最大选项数目）`);
		}
	});

	it('multi vqfQuestion 不是一个数组', () => {
		let render = new Render;
		let vqfStruct = {questions: [{}]};
		let questionArr = [
			{}
		];
		for (let questionKey in questionArr) {
			(() => {
				render.renderRouter(vqfStruct, questionArr[questionKey], questionKey);
			}).should.throw(`这个 multi vqfQuestion[${questionKey}] 不是一个数组`);
		}
	});
	it('multi vqfQuestion 项目数大于最大选项数', () => {
		let render = new Render;
		let vqfStruct = {questions: [{}, {}]};
		let questionStruct = [{}, {}, {}];
		(() => {
			render.renderRouter(vqfStruct, questionStruct, 0);
		}).should.throw(`这个 multi vqfQuestion[0] 项目数大于最大选项数`);
	});

	it('why vqfQuestion 不是一个对象', () => {
		let render = new Render;
		let vqfStruct = {question: {type: 'why'}};
		let questionArr = [
			[]
		];

		for (let questionKey in questionArr) {
			(() => {
				render.renderRouter(vqfStruct, questionArr[questionKey], questionKey);
			}).should.throw(`这个 why vqfQuestion[${questionKey}] 不是一个对象`)
		}
	});

	it('why vqfQuestion why 属性不存在或者非法', () => {
		let render = new Render;
		let vqfStruct = {question: {type: 'why'}};
		let whyArr = [
			1, true, false, null, {}, undefined
		];

		for (let whyKey in whyArr) {
			(() => {
				render.renderRouter(vqfStruct, {why: whyArr[whyKey]}, whyKey);
			}).should.throw(`这个 why vqfQuestion[${whyKey}] 的 why 属性不合法（不存在，或者不是字符串）`)
		}
	});

});

describe('render.js Render Processor', () => {

});
