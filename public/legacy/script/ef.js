function Entro(xf, yf){
	var bg = document.getElementById('bg');
	function square(num){
		return num * num;
	}
	var center = {},
		oval = {},
		ctx = bg.getContext('2d');

	function resize(){
		bg.width = document.body.offsetWidth;
		bg.height = document.body.offsetHeight;

		center.x = bg.width / 2;
		center.y = bg.height / 2;

		oval.a = bg.width /6;
		oval.b = oval.a * 1.5;
		oval.y = 0;
	}
	window.addEventListener('resize', resize);
	resize();

	bg.style.transition = 'opacity .618s';
	function init(){
		ctx.fillStyle = '#fff';
		ctx.fillRect(0, 0, bg.width, bg.height);
		bg.style.opacity = 1;
	}

	var index = (function (){
		var
		y = 0,
		i = oval.b / 1.5,
		barWidth = 32,
		barHeight = 3;

		function p(ctx, xf, yf){
			y = yf ? -i : i;

			var x = Math.sqrt(square(oval.a) - square((oval.a * y) / oval.b));
			x = xf ? -x : x;

			var argX;
			if (xf) {
				argX = (center.x / 2) + x - barWidth;
			} else {
				argX = (bg.width - (center.x / 2)) + x;
			}

			ctx.fillStyle = 'rgba(00, 88, 136, 0.5)';
			ctx.fillRect(argX, center.y + y, barWidth, barHeight);
		}

		function f(){
			ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
			ctx.fillRect(0, 0, bg.width, bg.height);
			if (i < -oval.b / 1.5) {
				var o = setInterval(function (){
					ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
					ctx.fillRect(0, 0, bg.width, bg.height);
				}, 16.7);
				setTimeout(function (){
					clearInterval(o);
					i = oval.b / 1.5;
					bg.style.opacity = 0;
				}, 1000);
			} else {
				p(ctx, 0, 0);
				p(ctx, 1, 1);

				i -= 8;
				window.requestAnimationFrame(f);
			}
		};
		return f;
	}());

	var cursor, cursorMargin;
	function introResize(){
		cursor = bg.height;
		cursorMargin = bg.height * 0.02;
	}
	window.addEventListener('resize', introResize);
	introResize();

	var intro = function (){
		ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
		ctx.fillRect(0, 0, bg.width, bg.height);

		cursor -= cursorMargin;

		if (cursor > 0) {
			ctx.fillStyle = 'rgba(48, 103, 133, 0.2)';
			ctx.fillRect(0, cursor, bg.width, 3);
			window.requestAnimationFrame(intro);
		} else {
			var cl;
			var o = setInterval(function (){
				ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
				ctx.fillRect(0, 0, bg.width, bg.height);
			}, 16.7),
			cl = setTimeout(function (){
				clearInterval(o);
				bg.style.opacity = 0;
				window.cancelAnimationFrame(intro);
			}, 1000);
		}
	};

	this.index = function (){
		init();
		index();
	};
	this.intro = function (){
		init();
		intro();
	};
}

function paintPoint(ctx, x, y){
	ctx.moveTo(x, y);
	ctx.lineTo(x+1, y+1);
	ctx.stroke();
}

function GetLine(x, y, k, ll){
	k = k/360 * Math.PI*2;
	this.duibian = Math.sin(k)*ll;
	this.linbian = Math.cos(k)*ll;
	this.x1 = x;
	this.y1 = y;
	this.x2 = x-this.duibian;
	this.y2 = y-this.linbian;
}
var articleHide = function (callback){
	var canvas = document.getElementById('article-bg');

	canvas.style.transition = "opacity 0.618s";
	fadeIn(canvas);

	var ctx = canvas.getContext('2d');

	var center = {};
	function resize(){
		canvas.width = document.body.offsetWidth;
		canvas.height = document.body.offsetHeight;

		center.x = canvas.width / 2;
		center.y = canvas.height / 2;
	}
	resize();

	var cursor = 0;
	var angle = 10;
	function processLine(cursor, angle){
		var direction = new GetLine(cursor, center.y, angle, center.y*1.2);
		ctx.moveTo(cursor, center.y);
		ctx.lineTo(direction.x2, direction.y2);
		return direction;
	}
	function leftLine(){
		processLine(cursor, angle);
		return processLine(cursor, 180 - angle);
	}
	function rightLine(){
		processLine(canvas.width - cursor, -angle);
		return processLine(canvas.width - cursor, 180 + angle);
	}
	function fetch(){
		cursor += 24;

		ctx.beginPath();

		ctx.strokeStyle = "rgb(48, 103, 133)";
		ctx.lineWidth = 1;

		var left = leftLine();
		var right = rightLine();

		ctx.stroke();

		ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		if (left.x2 > canvas.width && right.x2 < 0) {
			var o = setInterval(function (){
				ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}, 16.7);
			setTimeout(function (){
				clearInterval(o);
				callback && callback(function (okcb){
					fadeOut(canvas, function (){
						ctx.clearRect(0,0, canvas.width, canvas.height);
						ctx.globalAlpha = 0;
						ctx.fillStyle = "transparent";
						ctx.fillRect(0, 0, canvas.width, canvas.height);
						okcb && okcb();
					}, 1);
				});
			}, 382);
			return 0;
		} else {
			window.requestAnimationFrame(fetch);
		}
	}
	fetch();
};
