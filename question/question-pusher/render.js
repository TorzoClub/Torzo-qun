/*
	一些要求
	 - 可递归
	 - 100% 测试覆盖率
*/


const is_object = (value) => value !== null && typeof(value) === 'object' && !Array.isArray(value);

class RenderProcessor {
	renderSingle(struct, vqfQuestion){
		struct.question.forEach((choice, vqfcCursor) => {

		});
	}

	renderMulti(struct){

	}

	renderWhy(struct){

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
		this.typeRouter(vqfStruct, {
			/* 如果是单选的情况，那么 vqfQuestionStruct 必须是一个对象，并且要有 "choiced" 属性 */
			single(struct){
				if (!is_object(vqfQuestion)) {
					throw new Error(`这个 single vqfQuestion[${vqfsCursor}] 不是一个对象`);
				} else if (!Number.isInteger(vqfQuestion.choiced) || vqfQuestion.choiced < 0 || vqfQuestion.choiced >= struct.question.length) {
					throw new Error(`这个 single vqfQuestion[${vqfsCursor}] 的 choiced 属性不合法（不是正整数，或者大于最大选项数目）`);
				} else {
					rThis.renderSingle(struct, vqfQuestion);
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
					rThis.renderMulti(struct, vqfQuestion);
				}
			},

			/* 如果是单选的情况，那么 vqfQuestionStruct 必须是一个对象，并且要有 "why" 属性 */
			why(struct){
				if (!is_object(vqfQuestion)) {
					throw new Error(`这个 why vqfQuestion[${vqfsCursor}] 不是一个对象`);
				} else if (typeof(vqfQuestion.why) !== 'string') {
					throw new Error(`这个 why vqfQuestion[${vqfsCursor}] 的 why 属性不合法（不存在，或者不是字符串）`);
				} else {
					rThis.renderWhy(struct, vqfQuestion);
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
				callbackObj.single(struct);
			} else if (is_object(struct.question) && struct.question.type === 'why') {
				callbackObj.why(struct);
			} else {
				throw new Error('struct question 不是一个数组或者对象');
			}
		} else if (struct.questions !== undefined) {
			if (Array.isArray(struct.questions)) {
				callbackObj.multi(struct);
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
	renderQuestion(vqfStruct, questionStruct){

	}
}

module.exports = Render;
