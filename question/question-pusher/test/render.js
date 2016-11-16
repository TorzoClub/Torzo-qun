const fs = require('fs');
const Render = require('../render');
const vqfStruct = require('./define');

const should = require('should');

const striptags = require('striptags');

const OUTPUT_DIR = `${__dirname}/render_output`;

if (!fs.existsSync(OUTPUT_DIR)) {
	fs.mkdirSync(OUTPUT_DIR);
}

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
	it('single 项渲染（有 why 选项）', () => {
		let render = new Render;
		let vqfStruct = {
			description: '这是问题描述',
			question: [ {
				description: '这是问题选项',
				type: 'why',
			} ],
		};
		let questionStruct = {
			choiced: 0,
			why: '这是问题补充回答'
		};
		let style = render.backStyle();
		let html = render.renderSingle(vqfStruct, questionStruct);
		let testHtml = html.replace(/\n|\t/g, '');
		testHtml.should.equal(
			`<li>` +
			`<div class="${style.description}">${vqfStruct.description}</div>` +
			`<div class="${style.choiceDescription}">${vqfStruct.question[questionStruct.choiced].description}</div>` +
			`<div class="${style.why}">${striptags(questionStruct.why).replace(/\n/g, '<br>')}</div>` +
			`<div class="${style.extends}"></div>` +
			`</li>`
		);
	});

	it('single 项渲染（非 why 选项）', () => {
		let render = new Render;
		let vqfStruct = {
			description: '这是问题描述',
			question: [
				'这是问题选项',
			 ],
		};
		let questionStruct = {
			choiced: 0,
		};
		let style = render.backStyle();
		let html = render.renderSingle(vqfStruct, questionStruct);

		testHtml = html.replace(/\n|\t/g, '');
		testHtml.should.equal(
			`<li>` +
			`<div class="${style.description}">${vqfStruct.description}</div>` +
			`<div class="${style.choiceDescription}">这是问题选项</div>` +
			`<div class="${striptags(style.why).replace(/\n/g, '<br>')}"></div>` +
			`<div class="${style.extends}"></div>` +
			`</li>`
		);
	});

	it('single 项渲染 vqfQuestion 缺乏 why 属性', () => {
		let render = new Render;
		let vqfStruct = {
			description: '这是问题描述',
			question: [ {
				description: '这是问题选项',
				type: 'why',
			} ],
		};
		let questionStruct = {
			choiced: 0,
		};

		let questionWhyArr = [
			2, undefined, null, {}, [], true, false
		];

		for (let questionWhyKey in questionWhyArr) {
			(() => {
				render.renderSingle(vqfStruct, {
					choiced: 0,
					why: questionWhyArr[questionWhyKey],
				}, questionWhyKey);
			}).should.throw(`这个 vqfQuestion[${questionWhyKey}] choice 的 why 属性不存在或者非法`)
		}
	});

	it('multi 项渲染 不合法的 vqfQuestion choice', () => {
		let render = new Render;
		let vqfStruct = {
			description: '这是个多选项问题描述',
			questions: [
				'选项一',
				{	description: '选项二',
					type: 'why',
				}
			],
		};
		let choicedArr = [
			null, [], undefined, true, false
		];

		for (let choicedKey in choicedArr) {
			(() => {
				render.renderMulti(vqfStruct, [choicedArr[choicedKey]], choicedKey);
			}).should.throw(`这个 vqfQuestion[${choicedKey}] choice 不是一个对象`);
		}

		choicedArr = [ 2, -1, 'a', null, undefined, true, false ];
		for (let choicedKey in choicedArr) {
			(() => {
				render.renderMulti(
					vqfStruct,
					[{
						choiced: choicedArr[choicedKey]
					}],
					choicedKey
				);
			}).should.throw(`这个 vqfQuestion[${choicedKey}] choice 不存在或者不合法`);
		}

		(() => {
			render.renderMulti(
				vqfStruct,
				[{
					choiced: 1,
				}],
				0
			)
		}).should.throw(`这个 vqfQuestion[0] choice 的 why 属性不存在或者不合法`)
	});

	it('multi 项渲染 （有 why 项，无 why 项目）', () => {
		let render = new Render;
		let choiceDescription = '选项二';
		let vqfStruct = {
			description: '这是个多选项问题描述',
			questions: [
				'选项一',
				{	description: choiceDescription,
					type: 'why',
				}
			],
		};
		let vqfQuestion = [
			{	choiced: 0,},
			{	choiced: 1, why: '这是一个说明项'}
		];
		let style = render.backStyle();
		let result = render.renderMulti(vqfStruct, vqfQuestion, 0);

		let testHtml = result.replace(/\n|\t/g, '');

		testHtml.should.equal(
			(`
			<li>
				<div class="${style.description}">${vqfStruct.description}</div>
				<ul>
					<li>
						<div class="${style.choiceDescription}">选项一</div>
						<div class="${style.why}"></div>
						<div class="${style.extends}"></div>
					</li>
					<li>
						<div class="${style.choiceDescription}">${choiceDescription}</div>
						<div class="${style.why}">${striptags(vqfQuestion[1].why).replace(/\n/g, '<br>')}</div>
						<div class="${style.extends}"></div>
					</li>
				</ul>
			</li>
			`).replace(/\n|\t/g, '')
		);
	});

	it('why 项渲染', () => {
		let render = new Render;
		let style = render.backStyle();
		let result = render.renderWhy({description: '这是问题描述'}, {why: '这是问题回答'}, 0);

		testHtml = result.replace(/\n|\t/g, '');
		testHtml.should.equal(
			(`
			<li>
				<div class="${style.description}">这是问题描述</div>
				<div class="${style.why}">${striptags('这是问题回答').replace(/\n/g, '<br>')}</div>
			</li>
			`).replace(/\n|\t/g, '')
		);
	});

	it('single 项的继承机制', () => {
		let render = new Render;
		let vqfStruct = {
			description: '这是问题描述',
			question: [
				'这是问题回答1',
				'这是问题回答2',
				{	description: '这是问题回答3',
					type: 'why',
					extends: [
						{	description: '这是继承的问题描述',
							question: ['这是继承的问题回答'],
						}
					]
				}
			]
		};
		let questionStruct = {
			choiced: 2,
			why: '这是问题补充回答',
			extends: [
				{	choiced: 0, }
			]
		};
		let style = render.backStyle();
		let result = render.renderSingle(vqfStruct, questionStruct, 0);
		let testHtml = result.replace(/\n|\t/g, '');

		testHtml.should.equal(
			(`
				<li>
					<div class="${style.description}">这是问题描述</div>
					<div class="${style.choiceDescription}">这是问题回答3</div>
					<div class="${style.why}">${striptags('这是问题补充回答').replace(/\n/g, '<br>')}</div>
					<div class="${style.extends}">
						<ul class="${style.vqfs}">
							<li>
								<div class="${style.description}">这是继承的问题描述</div>
								<div class="${style.choiceDescription}">这是继承的问题回答</div>
								<div class="${style.why}"></div>
								<div class="${style.extends}"></div>
							</li>
						</ul>
					</div>
				</li>
			`).replace(/\n|\t/g, '')
		);
	});

	it('multi 项的继承机制', () => {
		let render = new Render;

		let vqfStruct = {
			description: '这是问题项的描述',
			questions: [
				'多选项1',
				{	description: '多选项2',
					type: 'why',
					extends: [
						{	description: '这是继承项的描述',
							questions: [
								'继承的选项1',
								'继承的选项2'
							]
						}
					]
				}
			]
		};
		let questionStruct = [
			{	choiced: 1,
				why: '多选项2的补充描述',
				extends: [
					[{choiced: 1}]
				],
			}
		];
		let style = render.backStyle();
		let result = render.renderMulti(vqfStruct, questionStruct, 0);
		let testHtml = result.replace(/\n|\t/g, '');

		testHtml.should.equal(
			(`
				<li>
					<div class="${style.description}">这是问题项的描述</div>
					<ul>
						<li>
							<div class="${style.choiceDescription}">多选项2</div>
							<div class="${style.why}">${striptags('多选项2的补充描述').replace(/\n/g, '<br>')}</div>
							<div class="${style.extends}">
								<ul class="${style.vqfs}">
									<li>
										<div class="${style.description}">这是继承项的描述</div>
										<ul>
											<li>
												<div class="${style.choiceDescription}">继承的选项2</div>
												<div class="${style.why}"></div>
												<div class="${style.extends}"></div>
											</li>
										</ul>
									</li>
								</ul>
							</div>
						</li>
					</ul>
				</li>
			`).replace(/\n|\t/g, '')
		);

		fs.writeFileSync(`${OUTPUT_DIR}/multi.html`, result);

	});

	it('renderFetch 缺少 question', () => {
		let render = new Render;
		let vqfStruct = {
			description: '这是问题项的描述',
			questions: [
				'多选项1',
				{	description: '多选项2',
					type: 'why',
					extends: [
						{	description: '这是继承项的描述',
							questions: [
								'继承的选项1',
								'继承的选项2'
							]
						}
					]
				}
			]
		};

		(() => {
			render.renderFetch(vqfStruct);
		}).should.throw('缺少 question 参数');
	});
});
