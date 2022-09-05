
var drawListICON = function (eid){
	var c = document.getElementById(eid);
	var cxt = c.getContext("2d");
	var centerCanX = c.width / 2;
	var centerCanY = c.height / 2;
	var paint = function (color){
		cxt.fillStyle = color;
		var
		start = {
			x: centerCanX - 8,
			y: centerCanY - 8,
		},
		dot = {
			width: 3,
			height: 3,
		},
		bar = {
			width: 16 - 5,
			height: dot.height,
		};

		var margin = 6;
		for (var count=0; count<3; ++count) {
			var offsetY = start.y + count * margin;
			var barX = start.x + 5;

			cxt.fillRect(start.x, offsetY, dot.width, dot.height);
			cxt.fillRect(barX, offsetY, bar.width, bar.height);
		}
	};
	this.disableColor = "rgba(200, 200, 200, 0.1)";
	this.enableColor = "rgba(0, 153, 153, 0.1)";

	var interval = function (count, time, func) {
		count = Number(count);
		var inter = setInterval(function () {
			--count;
			func();

			(count > 0) || clearInterval(inter);
		}, time);
	};

	this.colorTransition = function (color){
		color = color || this.enableColor;
		interval(60, 1000/60, function () {
			paint(color);
		});
	};

	var
	_color = "",
	_status = false;
	Object.defineProperties(this, {
		color: {
			get: function () { return _color; },
			set: function (value) {
				_color = value;
				this.colorTransition(_color);
			}
		},

		status: {
			get: function () { return _status; },
			set: function (value) {
				_status = Boolean(value);
				this.color = this[_status ? "enableColor" : "disableColor"];
			},
		}
	});

	this.status = false;
};

var dirIcon = new drawListICON("dir");
