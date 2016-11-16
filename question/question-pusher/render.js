/*
	一些要求
	 - 可递归
	 - 100% 测试覆盖率
*/


const is_object = (value) => value !== null && typeof(value) === 'object' && !Array.isArray(value);
const trueChoiced = (choiced, choiceList) => Number.isInteger(choiced) && choiced >= 0 && choiced < choiceList.length;

class RenderStyle {
	backStyle(){
		return this.style;
	}
}
RenderStyle.prototype.style = {
	description: 'description',
	choiceDescription: 'choice-description',
	why: 'why',
	extends: 'extends',
	vqfs: 'question',
	date: 'date',
};

class RenderProcessor extends RenderStyle {
	throwRenderFetchNoQuestion(){
		throw new Error('缺少 question 参数');
	}
	renderFetch(define = this.define, question = this.throwRenderFetchNoQuestion()){
		let style = this.backStyle();
		let html = '';
		define.forEach((defineItem, vqfsCursor) => {
			html += this.renderRouter(defineItem, question[vqfsCursor], vqfsCursor);
		});
		return `<ul class="vqfs">`+ html +`</ul>`;
	}
	renderSingle(struct, vqfQuestion, vqfsCursor){
		let html = '';
		let description = struct.description;
		let choice = struct.question[vqfQuestion.choiced];
		let choiceDescription;
		if (typeof(choice) === 'string') {
			choiceDescription = choice;
		} else {
			choiceDescription = choice.description;
		}

		let why = '';
		if (is_object(choice) && choice.type === 'why') {
			if (typeof(vqfQuestion.why) !== 'string') {
				throw new Error(`这个 vqfQuestion[${vqfsCursor}] choice 的 why 属性不存在或者非法`);
			} else {
				why = vqfQuestion.why;
			}
		}

		let extendsHtml = '';
		if (choice.extends) {
			if (!Array.isArray(vqfQuestion.extends)) {
				throw new Error(`这个 vqfQuestion[${vqfsCursor}] choice 的 extends 属性不存在或者不合法`);
			} else {
				extendsHtml = this.renderFetch(choice.extends, vqfQuestion.extends);
			}
		}

		let style = this.backStyle();

		html = `
		<li>
			<div class="${style.description}">${description}</div>
			<div class="${style.choiceDescription}">${choiceDescription}</div>
			<div class="${style.why}">${why}</div>
			<div class="${style.extends}">${extendsHtml}</div>
		</li>
		`;
		return html;
	}

	renderMulti(struct, vqfQuestion, vqfsCursor){
		let description = struct.description;
		let choiceList = struct.questions;
		let style = this.backStyle();

		let block = '';

		vqfQuestion.forEach((questionStruct, vqfcCursor) => {
			if (!is_object(questionStruct)) {
				throw new Error(`这个 vqfQuestion[${vqfsCursor}] choice 不是一个对象`);
			} else if (!trueChoiced(questionStruct.choiced, choiceList)) {
				throw new Error(`这个 vqfQuestion[${vqfsCursor}] choice 不存在或者不合法`);
			}

			let choice = choiceList[questionStruct.choiced];
			let choiceDescription = '';
			if (typeof(choice) === 'string') {
				choiceDescription = choice;
			} else {
				choiceDescription = choice.description;
			}

			let why = '';
			if (is_object(choice) && choice.type === 'why') {
				if (typeof(questionStruct.why) !== 'string') {
					throw new Error(`这个 vqfQuestion[${vqfsCursor}] choice 的 why 属性不存在或者不合法`);
				} else {
					why = questionStruct.why;
				}
			}

			let extendsHtml = '';
			if (choice.extends) {
				if (!Array.isArray(questionStruct.extends)) {
					throw new Error(`这个 vqfQuestion[${vqfsCursor}] choice 的 extends 属性不存在或者不合法`);
				} else {
					extendsHtml = this.renderFetch(choice.extends, questionStruct.extends);
				}
			}

			block += `
			<li>
				<div class="${style.choiceDescription}">${choiceDescription}</div>
				<div class="${style.why}">${why}</div>
				<div class="${style.extends}">${extendsHtml}</div>
			</li>
			`;
		});

		return `
		<li>
			<div class="${style.description}">${description}</div>
			<ul>
				${block}
			</ul>
		</li>
		`;
	}

	renderWhy(struct, vqfQuestion, vqfsCursor){
		let style = this.backStyle();
		return `
		<li>
			<div class="${style.description}">${struct.description}</div>
			<div class="${style.why}">${vqfQuestion.why}</div>
		</li>`;
	}
}

class RenderRouter extends RenderProcessor {
	fetchRouter(){

	}

	renderRouter(vqfStruct, vqfQuestion, vqfsCursor){
		if (vqfQuestion === null || typeof(vqfQuestion) !== 'object') {
			throw new Error('vqfQuestion 不是一个对象或者数组');
		}
		const rThis = this;
		return this.typeRouter(vqfStruct, {
			/* 如果是单选的情况，那么 vqfQuestionStruct 必须是一个对象，并且要有 "choiced" 属性 */
			single(struct){
				if (!is_object(vqfQuestion)) {
					throw new Error(`这个 single vqfQuestion[${vqfsCursor}] 不是一个对象`);
				} else if (!trueChoiced(vqfQuestion.choiced, struct.question)) {
					throw new Error(`这个 single vqfQuestion[${vqfsCursor}] 的 choiced 属性不合法（不是正整数，或者大于最大选项数目）`);
				} else {
					return rThis.renderSingle(struct, vqfQuestion, vqfsCursor);
				}
			},

			/** 如果是单选的情况，那么 vqfQuestionStruct 必须是一个数组，
			*	并且数组元素必须是一个对象，这个对象要有 "choiced" 属性
			*/
			multi(struct){
				if (!Array.isArray(vqfQuestion)) {
					throw new Error(`这个 multi vqfQuestion[${vqfsCursor}] 不是一个数组`);
				} else if (vqfQuestion.length > struct.questions.length) {
					throw new Error(`这个 multi vqfQuestion[${vqfsCursor}] 项目数大于最大选项数`)
				} else {
					return rThis.renderMulti(struct, vqfQuestion, vqfsCursor);
				}
			},

			/* 如果是单选的情况，那么 vqfQuestionStruct 必须是一个对象，并且要有 "why" 属性 */
			why(struct){
				if (!is_object(vqfQuestion)) {
					throw new Error(`这个 why vqfQuestion[${vqfsCursor}] 不是一个对象`);
				} else if (typeof(vqfQuestion.why) !== 'string') {
					throw new Error(`这个 why vqfQuestion[${vqfsCursor}] 的 why 属性不合法（不存在，或者不是字符串）`);
				} else {
					return rThis.renderWhy(struct, vqfQuestion, vqfsCursor);
				}
			},
		});
	}

	/* define项的路由 */
	typeRouter(struct, callbackObj){
		if (!is_object(struct)) {
			throw new Error('struct 不是一个对象');
		}

		if (
			(typeof(callbackObj.single) !== 'function') ||
			(typeof(callbackObj.multi) !== 'function') ||
			(typeof(callbackObj.why) !== 'function')
		) {
			throw new Error('回调对象缺少类型句柄');
		}

		if (struct.question !== undefined) {
			if (Array.isArray(struct.question)) {
				return callbackObj.single(struct);
			} else if (is_object(struct.question) && struct.question.type === 'why') {
				return callbackObj.why(struct);
			} else {
				throw new Error('struct question 不是一个数组或者对象');
			}
		} else if (struct.questions !== undefined) {
			if (Array.isArray(struct.questions)) {
				return callbackObj.multi(struct);
			} else {
				throw new Error('struct questions 不是一个数组')
			}
		} else {
			throw new Error('未知的 struct 类型');
		}
	}
}

class Render extends RenderRouter {
	checkType(vqfStruct, questionStruct) {
		if (!Array.isArray(vqfStruct)) {
			throw new Error('vqfStruct 不是一个数组');
		} else if (!vqfStruct.length) {
			throw new Error('vqfStruct 不能是空数组');
		} else if (!Array.isArray(questionStruct)) {
			throw new Error('vqfQuestion 不是一个数组');
		} else if (!questionStruct.length) {
			throw new Error('vqfQuestion 不能是空数组');
		}
	}

	loadStruct(vqfStruct, questionStruct){
		this.checkType(...arguments);
		this.define = vqfStruct;
		this.question = questionStruct;
	}

	/* 渲染答案 */
	renderQuestion(vqfQuestion = this.question, vqfDefine = this.define){
		let style = this.backStyle();
		let html = ``;

		vqfQuestion.forEach((questionItem) => {
			try {
				var structDate = new Date(questionItem.time);
			} catch (e) {
				var structDate = '错误的日期'
			}
			html += `<hr><div class="${style.date}"><span>日期：</span><time>${structDate}</time></div>`;
			html += this.renderFetch(vqfDefine, questionItem.struct);
		});
		return html;
	}
}

module.exports = Render;
