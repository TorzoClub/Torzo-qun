const fs = require('fs');

const throwCompareTimeArgumentError = () => {
	throw new Error('需要两个参数');
};

Object.assign(exports, {
	/** 比较是否同时同分
	* @param Date first 比较的日期 如果不存在则抛出一个错误
	* @param Date second 比较的日期 如果不存在则抛出一个错误
	* @return boolean 是否同日同时同分
	*/
	compareTime(first = throwCompareTimeArgumentError(), second = throwCompareTimeArgumentError()){
		return (
			(first.getDate() === second.getDate()) &&
			(first.getHours() === second.getHours()) &&
			(first.getMinutes() === second.getMinutes())
		);
	},

	_fetchPool: [],
	/*
		这个 taskObj 有 time 属性和 task 属性
		time 是定时用的，一旦到这个时间就执行 task （作为函数），不过需要注意的是，time 的定时精度是 分钟级 的
	*/
	addTask(...taskObjs){
		taskObjs.forEach((taskObj) => {
			if (typeof taskObj !== 'object') {
				throw new Error('参数不是对象类型', 1);
			} else if (!(taskObj.time instanceof Date)) {
				throw new Error('任务对象中的 time 元素不是 Date 的实例');
			} else if (typeof taskObj.task !== 'function') {
				throw new Error('任务对象中的 task 元素不是函数');
			} else {
				this._fetchPool.push(taskObj);
			}
		});
	},
	poll(current = new Date){
		this._fetchPool.forEach((taskObj) => {
			if (this.compareTime(current, taskObj.time)) {
				if (!taskObj.fetched) {
					taskObj.fetched = true;
					taskObj.task(current);
				}
			} else {
				delete taskObj.fetched;
			}
		});
	},
	stop(){
		clearInterval(this.intervalNumber);
	},
	start(intervalValue){
		this.intervalNumber = setInterval(() => {
			this.poll();
		}, intervalValue);
		return this.intervalNumber;
	},
});
