const timer = require('../timer');
const should = require('should');

describe('timer.js', () => {
	it('compareTime 同时同分', () => {
		timer.compareTime(new Date(2016, 11, 11, 11, 11), new Date(2016, 11, 11, 11, 11)).should.equal(true);
		timer.compareTime(new Date(2016, 11, 11, 11, 11), new Date(2016, 11, 11, 11, 10)).should.equal(false);
		timer.compareTime(new Date(2016, 11, 11, 11, 11), new Date(2016, 11, 11, 10, 11)).should.equal(false);
	});

	it('compareTime 不到两个参数', () => {
		(() => {
			timer.compareTime();
		}).should.throw('需要两个参数');
		(() => {
			timer.compareTime(new Date);
		}).should.throw('需要两个参数');
	});

	it('addTask 传入参数必须是对象', () => {
		(() => timer.addTask(999)).should.throw('参数不是对象类型');
	});

	it('addTask 传入的参数对象中的 time 元素必须是 Date 的实例', () => {
		let taskObj = {
			time: 999,
			task(){},
		};
		(() => {
			timer.addTask(taskObj)
		}).should.throw('任务对象中的 time 元素不是 Date 的实例');
	});

	it('addTask 传入的参数对象中的 task 元素必须是函数', () => {
		let taskObj = {
			time: new Date,
			task: 9,
		};
		(() => {
			timer.addTask(taskObj);
		}).should.throw('任务对象中的 task 元素不是函数');
	});

	it('addTask 添加复数任务', () => {
		timer._fetchPool = [];
		let tasks = [
			{	time: new Date,
				task(){},
			},
			{	time: new Date,
				task(){},
			}
		];
		timer.addTask(...tasks);
		(() => {
			return timer._fetchPool.length;
		})().should.equal(2);
	});

	it('fetched 机制，只执行一次任务', () => {
		timer._fetchPool = [];
		let tasks = [
			{	time: new Date(1997, 9, 9, 9, 9, 9),
				task(){},
				fetched: true,
			},
			{	time: new Date(1997, 9, 9, 9, 9, 9),
				task(){},
				fetched: true,
			}
		];
		timer.addTask(...tasks);
		timer.poll(new Date(2036, 9, 9, 10, 10, 10));

		(() => {
			return tasks.findIndex(task => {
				return task.fetched === true;
			});
		})().should.lessThan(0);
	});

	it('start 轮询一遍任务并且只执行一次', (done) => {
		timer._fetchPool = [];
		let number = 10;
		let tasks = [
			{	time: new Date,
				task(){
					number += 1;
				},
			},
			{	time: new Date,
				task(){
					number += 1;
				},
			}
		];
		timer.addTask(...tasks);
		timer.start(1);

		setTimeout(() => {
			timer.stop();
			(() => {
				return number;
			})().should.equal(12);
			done();
		}, 5);
	});

	
});
