/*
	vec Question Format
	一个问题的集合称为 结构
	结构是一个有序的数组，每个元素称为题素

	题素由描述(description)和答案集(question)组成

	目前有三种类型的题素，单选题素，多选题素，描述题素

	单选题素和多选题素都是数组类型（区别在于对象属性是'question'和'questions'
	描述题素则由字符串'why'标识

	可选题素中可以有一个或者多个答案元（define)，通常是字符串类型，但是也可以使用数组类型，我们称为复合答案元
	复合答案元由描述字和类型组成，目前只支持 why 类型（也就是描述题素）

	vqfs游标
	vqfc游标
*/
class VQFChoice {
	onChoice(){
		this.choicePool.forEach((f, cursor, choicePool) => {
			f(cursor, choicePool);
		});
	}
	backChecked(){
		if (this.isMulti) {
			return this.elePool.filter(eleObj => {
				return eleObj.choiceEle.checked === true;
			});
		} else {
			return this.elePool.find(eleObj => {
				if (eleObj.choiceEle.checked) {
					return eleObj.choiceEle.checked;
				}
			})
		}
	}
	addChecked(vqfcCursor, element){
		// vqfContent.clearChecked();
		this.checked = true;
		this.checkedCursor = vqfcCursor;
		this.current = element;
	}
	removeChecked(vqfcCursor, element){
		// vqfContent.clearChecked();
		delete this.checked;
		delete this.checkedCursor;
		delete this.current;
	}
	/**
	* @param define 定义元
	* @param parent 父元素（class^="vqfs-")
	* @param name 是vqfs-xxx中的"xxx"
	* @param vqfcCursor
	*/
	add(define, parent, name, vqfcCursor, vqfContent){
		let label = document.createElement('label');
		let choiceEle = document.createElement('input');
		let description = document.createElement('span');

		choiceEle.vqfChoice = this;

		const element = {
			label,
			choiceEle,
			description,
			vqfcCursor
		};

		if (this.isMulti) {
			choiceEle.type = 'checkbox';
		} else {
			choiceEle.type = 'radio';
		}

		choiceEle.addEventListener('click', (e) => {
			if (choiceEle.checked) {
				this.addChecked(vqfcCursor, element);
			} else {
				this.removeChecked(vqfcCursor, element);
			}

			this.onChoice(e);
		});


		choiceEle.name = `vqfc${vqfContent.layerPrefix}-${name}`;

		$(label).append(choiceEle);
		$(label).append(description);

		if (parent) {
			$(parent).append(label);
		}

		if (typeof(define) === 'object') {
			$(description).text(define.description);
			if (define.type === 'why') {
				let why = document.createElement('textarea');
				element.why = why;
				$(label).append(why);
			} else if (define.type === 'choice') {

			} else {
				console.error(define);
				throw new Error(`无效的复合单元(unknown type "${define.type})"`);
			}

			if (define.extends !== undefined) {
				console.warn(define);
				class VQFExtends extends VQF {
					exLoad(defineExtends){
						if (Array.isArray(defineExtends)) {
							this.load(defineExtends);
						} else if (typeof(defineExtends) === 'object') {
							this.load([defineExtends]);
						} else {
							throw new Error('扩展题素既不是数组也不是对象');
						}
					}
				}
				const vqfExtends = new VQFExtends;
				vqfExtends.parentVqf = vqfContent;
				vqfExtends.layerCursor = vqfContent.layerCursor + 1;
				vqfExtends.initLayer();
				const vqfExtendsEle = document.createElement('div');
				vqfExtendsEle.classList.add('extends');
				vqfExtends.bind(vqfExtendsEle);
				vqfExtends.exLoad(define.extends);
				vqfExtends.makeHTML();

				element.extends = vqfExtends;
				this.extends = vqfExtends;

				$(parent).append(vqfExtendsEle);
			}

		} else {
			$(description).text(define);
		}
		this.elePool.push(element);
		return element;
	}
	remove(){

	}
	constructor(isMulti){
		this.type = 'choice';
		this.choicePool = [];
		this.isMulti = isMulti;
		this.elePool = [];
	}
}
class WhyDefine {
	setElementProperty(ele=this.ele){
		Object.defineProperty(this, 'value', {
			get(){ return this.ele.value },
			set(text){ this.ele.value = text},
		});
	}
	constructor(ele=document.createElement('textarea')){
		this.type = 'why';
		this.ele = ele;
		this.setElementProperty();
	}
}
class VQF {
	/**
	* @param layerPrefix 层前缀
	*/
	constructor(layerPrefix){
		this.checkPool = [];
		this.pool = [];
		this.layerCursor = 0;
		this.initLayer();
	}
	initLayer(){
		this.layerPrefix = `-${this.layerCursor}`;
	}

	fetchCheck(){
		this.checkPool.forEach((fn, cursor, pool) => {
			fn(cursor, pool);
		});
	}

	makeQuestion(question, parent, vqfsCursor, isMulti){
		let choice = new VQFChoice(isMulti);
		question.forEach((define, vqfcCursor) => {
			// console.warn(define);
			choice.add(define, parent, vqfsCursor, vqfcCursor, this);
		});
		choice.choicePool.push((fnOffset, choicePool) => {
			this.fetchCheck(fnOffset, choicePool);
		});
		this.pool.push(choice);
	}
	makeStructItemHTML(structItem, cursor, struct){
		let structElement = document.createElement('div');
		let question = document.createElement('div');

		question.classList.add('description');

		structElement.id = `vqfs-${cursor}`;
		structElement.setAttribute('layer', this.layerCursor);

		$(question).text(structItem.description);
		$(structElement).append(question);

		if (typeof(structItem) === 'object') {
			let vThis = this;
			this.questionTypeRouter(structItem, {
				single(){
					vThis.makeQuestion.apply(vThis, [structItem['question'], structElement, cursor, false]);
				},
				multi(){
					vThis.makeQuestion.apply(vThis, [structItem['questions'], structElement, cursor, true]);
				},
				why(){
					let why = new WhyDefine();
					$(question).append(why.ele);

					vThis.pool.push(why);
				},
			});
		}

		$(this.ele).append(structElement);
	}
	bind(ele){
		this.ele = ele;
	}
	makeHTML(){
		this.struct.forEach((question, cursor, struct) => {
			this.makeStructItemHTML(question, cursor, struct);
		});
	}
	load(value){
		this.value = value;
		try {
			if (typeof(value) === 'string') {
				this.struct = JSON.parse(this.value);
			} else {
				this.struct = value;
			}
		} catch (e) {
			let err = new Error('vqf数据解析错误');
			console.error(err);
			throw err;
		}
	}

	questionTypeRouter(structItem, cbObj){
		if (Array.isArray(structItem['question'])) {
			return cbObj.single(structItem);
		} else if (Array.isArray(structItem['questions'])) {
			return cbObj.multi(structItem);
		} else if (structItem['question'].type === 'why') {
			return cbObj.why(structItem);
		} else {
			console.error(structItem);
			throw new Error('该题素不能被正确解析');
		}
	}

	collect(){
		let limit = 8;
		const formItem = $('#collect > [id^="vqfs"]');
		var collectData = (currentVqf) => {
			return currentVqf.pool.map((choice, vqfsCursor) => {
				const defineQuestion = {};
				if (choice.isMulti && choice.type === 'choice') {
					return choice.backChecked().map(eleObj => {
						const defineQuestion = {
							choiced: eleObj.vqfcCursor,
						};
						if (eleObj.why) {
							defineQuestion.why = eleObj.why.value;
						}
						if (eleObj.extends) {
							defineQuestion.extends = collectData(eleObj.extends);
						}
						return defineQuestion;
					});
				}
				/* 检查单选项是否存在 */
				else if (!choice.isMulti && choice.type === 'choice') {
					const currentChoice = choice.elePool[choice.checkedCursor];
					if (currentChoice === undefined) {
						console.warn(choice.elePool, choice.checkedCursor, choice.elePool[choice.checkedCursor]);
						throw new Error('存在未填项');
					}
					if (currentChoice.why) {
						defineQuestion.why = currentChoice.why.value;
					}

					if (typeof choice.checkedCursor === "number" &&
						isFinite(choice.checkedCursor) &&
						Math.floor(choice.checkedCursor) === choice.checkedCursor
					){
						defineQuestion.choiced = choice.checkedCursor;
					} else {
						throw new Error('存在未填项');
					}

					/* 是否存在Extends */
					if (currentChoice.extends) {
						defineQuestion.extends = collectData(currentChoice.extends);
					}

					return defineQuestion;

				} else if (choice.type === 'why') {
					return {why: choice.value};
				} else {
					throw new Error(`位置的定义类型(${choice.type})`);
				}
			});
		};
		const collectDataStruct = collectData(this);
		console.warn(collectDataStruct);
		return collectDataStruct;
	}
}
