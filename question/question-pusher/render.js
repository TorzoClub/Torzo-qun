
const is_object = (value) => value !== null && typeof(value) === 'object' && !Array.isArray(value);


class Render {
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
				callbackObj.single();
			} else if (is_object(struct.question) && struct.question.type === 'why') {
				callbackObj.why();
			} else {
				throw new Error('struct question 不是一个数组或者对象');
			}
		} else if (struct.questions !== undefined) {
			if (Array.isArray(struct.questions)) {
				callbackObj.multi();
			} else {
				throw new Error('struct questions 不是一个数组')
			}
		} else {
			throw new Error('未知的 struct 类型');
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
