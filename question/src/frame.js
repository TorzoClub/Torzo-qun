function fadeIn(ele, cb, time) {
	time = time || 618;

	ele.style.opacity = 0;
	ele.style.transition = 'opacity '+ time +'ms';
	ele.style.webkitTransition = 'opacity '+ time +'ms';

	ele.style.display = '';
	ele.style.display = getComputedStyle(ele, null).getPropertyValue('display');

	setTimeout(function (){
		ele.style.opacity = 1;
		setTimeout(function (){
			cb && cb();
		}, time);
	}, 16.8);
}
function fadeOut(ele, cb, time) {
	time = time || 618;

	ele.style.opacity = 1;
	ele.style.transition = 'opacity '+ time +'ms';
	ele.style.webkitTransition = 'opacity '+ time +'ms';

	setTimeout(function (){
		ele.style.opacity = 0;
		setTimeout(function (){
			ele.style.display = 'none';
			console.warn(cb);
			cb && cb();
		}, time);
	}, 16.8);
}
class Tipper {
	show(name){
		this.setDisplayStyle(name, '');
	}
	setSummaryAlign(alignValue){
		$$('.tipper > .summary').style.textAlign = alignValue;
	}
	setDisplayStyle(name, display){
		$(`.tipper > [class^="tipper-${name}"]`, this.ele).forEach(ele => ele.style.display = display);
	}
	hideAll(){
		this.setDisplayStyle('', 'none');
		$('.tipper > [class^="tipper-"]', this.ele).forEach(ele => ele.style.display = 'none');
	}
	hide(name){
		this.setDisplayStyle(name, 'none');
	}

	setSummary(text){
		$('.summary', this.ele).text(text);
	}
	barColor(color){
		$$('.tipper', this.ele).style.borderColor = color;
	}
	setTopBarColor(status){
		const color = getComputedStyle($$(`.tipper-${status} .label`, this.ele), null).getPropertyValue('color');
		this.barColor(color);
	}
	setStatus(status){
		this.status = status;
	}
	switchStatus(status, cb){
		this.hideAll();
		this.setStatus(status);
		this.show(status);
		this.setTopBarColor(status);
		this.fadeIn(cb);
	}
	error(text){
		this.switchStatus('error');
		this.setSummaryAlign('');
		if (text === undefined) {
			text = '';
		}
		if (text instanceof Error) {
			if (text.tipperMsg === undefined) {
				text.tipperMsg = '';
			}
			this.setSummary(`${text.tipperMsg}\n信息: ${text.message}\n栈: ${text.stack}`);
		} else {
			this.setSummary(text);
		}

	}
	warn(text){
		this.switchStatus('warn');

		if (text === undefined) {
			text = '';
		}
		this.setSummaryAlign('');
		this.setSummary(text);
	}
	success(text){
		this.switchStatus('success');

		if (text === undefined) {
			text = '';
		}
		this.setSummaryAlign('center');
		this.setSummary(text);
	}
	info(str, cb){
		this.hideAll();
		this.setStatus('info');
		this.barColor('#bbb');
		this.setSummaryAlign('');
		this.setSummary(str);
		this.fadeIn(cb);
	}

	fadeIn(cb){
		fadeIn(this.ele, cb);
	}
	fadeOut(cb){
		fadeOut(this.ele, cb);
	}

	click(){
		const status = this.status.toLowerCase();
		if (status === 'error') {
			return false;
		}
		if (status === 'success') {
			return false;
		}

		this.fadeOut();
	}

	constructor(ele, cb){
		this.ele = ele;
		this.hideAll();

		this.ele.addEventListener('click', e => {
			this.click.call(this, e);
		});
	}
}
const vqf = new VQF;
const textAreaResize = (a, row) => {
	var agt = navigator.userAgent.toLowerCase();
	var is_op = (agt.indexOf("opera") != -1);
	var is_ie = (agt.indexOf("msie") != -1) && document.all && !is_op;
	if(!a) {
		return ;
	}
	if(!row) {
		row = 5;
	}
	var b = a.value.split("\n");
	var c = is_ie ? 1 : 0;
	c += b.length;
	var d = a.cols;
	if(d <= 20) {
		d = 40;
	}
	for(let e = 0; e < b.length; e++) {
		if(b[e].length >= d) {
			c += Math.ceil(b[e].length / d)
		}
	}
	c = Math.max(c, row);
	if(c != a.rows){
		a.rows = c + 1;
	} else {
		a.rows = c + 2;
	}
};
/* 后面[单/多]选框要用到 */
const setHeightTransition = (ele) => {
	ele.style['transition'] = 'height .618s';
};
const removeHeightTransition = (ele) => {
	ele.style['transition'] = '';
};
const disableTransition = (ele, actionFunc) => {
	setTimeout(() => {
		removeHeightTransition(ele);
		setTimeout(() => actionFunc((callback) => {
			setHeightTransition(ele);
			setTimeout(callback, 32);
		}), 32);
	}, 32);
};
const notChecked = (textareaFrame) => {
	return !$$('[type="radio"]', textareaFrame.parentNode).checked;
};
const notCheckedTextFrame = (textareaFrame) => {
	return notChecked(textareaFrame) && textareaFrame.offsetHeight;
};

const insertAfter = (newEle, targetEle) => {
	const parent = targetEle.parentNode;
	if (parent.lastChild === targetEle) {
		parent.appendChild(newEle);
	} else {
		parent.insertBefore(newEle, targetEle.nextSibling);
	}
};
const FFer = (bindEle) => {
	if (bindEle.sourceHeight === undefined) {
		bindEle.sourceHeight = bindEle.offsetHeight;
		bindEle.style.transition = 'height .618s';
		bindEle.style.height = '0px';
	}
	return {
		show(ele = bindEle){
			disableTransition(ele, resove => {
				ele.style.height = `${ele.sourceHeight}px`;
				resove(() => {
					setTimeout(() => {
						ele.style.height = '';
					}, 618);
				});
			});
		},
		hide(ele = bindEle){
			// throw new Error();
			disableTransition(ele, resove => {
				ele.sourceHeight = ele.offsetHeight;
				ele.style.height = `${ele.sourceHeight}px`;
				resove(() => setTimeout(() => {
					ele.style.height = '0px';
				}, 32));
			});
		},
	};
};

class InputCheckerInit {
	constructor(vqf){
		this.pool = [];
		this.vqf = vqf;
		this.initDone();
		this.initNone();
		this.init();
	}
}
class InputCheckerNone extends InputCheckerInit {
	fetchNone(){
		this.nonePool.forEach((eventFn, eventCursor, evenrPool) => {
			eventFn(this);
		});
	}
	initNone(){
		this.nonePool = [];
	}
}
class InputCheckerDone extends InputCheckerNone {
	fetchDone(){
		this.donePool.forEach((eventFn, eventCursor, evenrPool) => {
			eventFn(this);
		});
	}
	initDone(){
		this.donePool = [];
	}
}
/*
	输入检查器
	 - 应该是可递归的
*/
class InputChecker extends InputCheckerDone {
	fetch(vqf=this.vqf){
		console.debug(vqf);
		return vqf.pool.some(choice => {
			// console.log(choice);
			if (choice.isMulti && choice.type === 'choice') {
				const checkedArr = choice.backChecked();
				if (checkedArr.length) {
					return checkedArr.some(eleObj =>
						eleObj.extends && this.fetch.call(this, eleObj.extends)
					);
				}
			}
			else if (!choice.isMulti && choice.type === 'choice') {
				if (choice.elePool[choice.checkedCursor]) {
					if (choice.elePool[choice.checkedCursor].extends) {
						return this.fetch.call(this, choice.extends);
					}
				} else {
					return true;
				}
			}
		});
	}
	add(inputEle){
		// this.pool.push(inputEle);
		inputEle.addEventListener('click', e => {
			let result = this.fetch(this.vqf);
			if (result) {
				this.fetchNone();
				console.warn('未填项目');
			} else {
				this.fetchDone();
				console.info('全部完成')
			}
		});
	}
	init(){
	}
}
class MyInputChecker extends InputChecker {
	removeLoop(){
		$$('.button-loop .loop').classList.remove('loop-animated');
	}
	setDoneLoop(){
		$$('button').style.boxShadow = 'inset 0px 0px 2px rgba(48, 103, 133, 1)';
		$$('.button-frame').style.boxShadow = 'inset 0px 0px 2px rgba(48, 103, 133, 1)';

		$$('.button-loop .loop').classList.add('loop-animated');
	}
	setNoneLoop(){
		$$('button').style.boxShadow = '';
		$$('.button-frame').style.boxShadow = '';

		this.removeLoop();
	}
	init(){
		this.setNoneLoop();
		this.donePool.push((context) => {
			this.setDoneLoop();
		});
		this.nonePool.push((context) => {
			// this.setNoneLoop();
		});
	}
}
const inputChecker = new MyInputChecker(vqf);

/*
	textarea自动变长
	tanks http://www.aa25.cn/code/515.shtml
*/
const textareaAutoHeight = textarea => {
	let tThis = this;
	let resize = function (e) {
		textAreaResize(textarea, 4);
	};
	['keypress', 'keydown', 'focus', 'click'].forEach(
		eventName => textarea.addEventListener(eventName, resize, true)
	);
	resize();
};
const setTorzoTextarea = (sourceEle) => {
	var textareaFrame = document.createElement('div');
	textareaFrame.className = 'why-frame';

	let textarea = document.createElement('textarea');
	textareaFrame.appendChild(textarea);

	insertAfter(textareaFrame, sourceEle);
	sourceEle.parentNode.removeChild(sourceEle);

	textareaAutoHeight(textarea);

	const slideLineDivTop = document.createElement('div');
	slideLineDivTop.className = 'side-line-top';
	textareaFrame.appendChild(slideLineDivTop);

	const slideLineBottom = document.createElement('div');
	slideLineBottom.className = 'side-line-bottom';
	textareaFrame.appendChild(slideLineBottom);

	return {
		whyFrame: textareaFrame,
		textarea,
	};
};
var initInput = (currentVqf = vqf) => {
	currentVqf.pool.forEach((input, vqfsCursor) => {
		if (input.type === 'why') {
			const whyEleObj = setTorzoTextarea(input.ele);
			input.ele = whyEleObj.textarea;
		}
		Array.isArray(input.elePool) && input.elePool.forEach((eleObject, vqfcCursor, eleTotal) => {
			/* why文本框特技 */
			if (eleObject.why) {
				const whyEleObj = setTorzoTextarea(eleObject.why);
				var textareaFrame = whyEleObj.whyFrame;
				eleObject.whyFrame = whyEleObj.whyFrame;
				eleObject.why = whyEleObj.textarea;
			}

			/* 单选框特技 */
			if (eleObject.choiceEle.type === 'radio') {
				inputChecker.add(eleObject.choiceEle);
				let effEle = document.createElement('div');
				effEle.className = 'radio-effect';

				let loop = document.createElement('div');
				loop.className = 'radio-loop';
				effEle.appendChild(loop);

				insertAfter(effEle, eleObject.choiceEle);

				if (textareaFrame) {
					var textFFer = FFer(textareaFrame);
				}
				if (eleObject.extends && eleObject.choiceEle) {
					var extendsFFer = FFer(eleObject.extends.ele);
				}

				eleObject.choiceEle.addEventListener('click', e => {
					eleTotal.forEach(eleObj => {
						if (eleObj.choiceEle.checked) {
							if (eleObj.whyFrame) {
								FFer(eleObj.whyFrame).show();
							}
							if (eleObject.extends) {
								extendsFFer.show();
							} else {
								const extendsFrames = eleTotal.filter(eleObj => eleObj.extends).map(eleObj => eleObj.extends.ele);
								extendsFrames.forEach(extendsFrame => {
									extendsFrame.offsetHeight && FFer(extendsFrame).hide();
								});
							}
						} else if (eleObj.whyFrame) {
							eleObj.whyFrame.offsetHeight && FFer(eleObj.whyFrame).hide();
						}
					});
				});
			}
			/* 多选框特技 */
			else if (eleObject.choiceEle.type === 'checkbox') {
				inputChecker.add(eleObject.choiceEle);
				let effEle = document.createElement('div');
				effEle.className = 'checkbox-effect';

				const border = {
					top: document.createElement('div'),
					right: document.createElement('div'),
					bottom: document.createElement('div'),
					left: document.createElement('div'),
				};

				Object.keys(border).forEach(prop => {
					border[prop].className = `loop-${prop}`;
					effEle.appendChild(border[prop]);
				})

				insertAfter(effEle, eleObject.choiceEle);

				const choiceEle = eleObject.choiceEle;
				setTimeout(() => {
					if (textareaFrame) {
						var textFFer = FFer(textareaFrame);
					}
					if (eleObject.extends) {
						var extendsFFer = FFer(eleObject.extends.ele);
					}
					choiceEle.addEventListener('click', e => {
						if (choiceEle.checked) {
							textareaFrame && textFFer.show();

							if (eleObject.extends && eleObject.choiceEle) {
								extendsFFer.show();
							}
						} else {
							textareaFrame && textFFer.hide();
							console.warn(eleObject);
							if (eleObject.extends && eleObject.choiceEle) {
								extendsFFer.hide();
							}
						}
					});
				}, 100);
			}

			if (eleObject.extends) {
				initInput(eleObject.extends);
			}
		});
	});
};

const setQuestion = (loaded) => {
	$.rjax('getquestion.php', { method: 'GET', success(res){
		vqf.bind($('#collect')[0]);
		try {
			vqf.load(res);
			$('#question').html(vqf.makeHTML());

			/* 初始化各种控件 */
			setTimeout(initInput, 300);
			loaded(res);
		} catch (e) {
			tipper.error(e);
			console.error(res);
			throw e;
		}
	}});
};
/* 提交按钮的初始化 */
const bindSubmit = (callback) => {
	$$('button').onclick = function (e){
		try {
			var vqfCollection = vqf.collect();
			var data = JSON.stringify(vqfCollection);
		} catch (e) {
			tipper.warn(e);
			throw e;
		} finally {
			console.info(vqfCollection);
		}

		try {
			$.rjax('vqfprocessor.php', {
				method: 'POST',
				data: { json: data, },
				success(res){
					console.warn(res);
					callback(res);
				},
			});
		} catch (e) {
			inputChecker.removeLoop();
			e.tipperMsg = '发送数据时出现错误';
			tipper.error(e);
			throw e;
		}
	};
};

let postHandle = (res) => {
	try {
		var info = JSON.parse(res);
	} catch (e) {
		inputChecker.removeLoop();
		e.tipperMsg = '回馈数据无法正确解析';
		tipper.error(e);
		throw e;
	}
	if (info.code === 0) {
		tipper.success('成功！');
		inputChecker.removeLoop();
	} else {
		tipper.warn(info.msg + '（点击屏幕任意区域继续）');
	}
};

let start = (dataLoaded) => {
	setQuestion(res => {
		bindSubmit(postHandle);
		dataLoaded && dataLoaded(res);
	});
};

window.onload = function (){
	window.tipper = new Tipper($$('.tipper-frame'), () => {});
	tipper.info('读取中……', () => {
		start(res => {
			fadeIn($$('main'));
			tipper.fadeOut();
		});
	});
};
