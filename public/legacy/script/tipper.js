(function (){
	function Tipper(ele) {
		if (!ele){
			ele = document.createElement("div");
			ele.classList.add("tipper");
		}
		this.ele = ele;
		this.fadeInit();
	}

	Tipper.prototype.fadeInit = function () {
		this.ele.style.transition = "opacity .618s";
		this.ele.style.opacity = "0";
	};

	Tipper.prototype.fadeIn = function (str, cb){
		this.ele.textContent = str;

		this.ele.style.display = "flex";

		setTimeout(function () {
			this.ele.style.opacity = "1";
			setTimeout(function () {
				cb && cb(this.ele);
			}.bind(this), 618);
		}.bind(this), 16.7);
	};

	Tipper.prototype.fadeOut = function (cb){
		this.ele.style.opacity = "0";

		setTimeout(function () {
			this.ele.style.display = "none";
			cb && cb(this.ele);
		}.bind(this), 618);
	};

	window.Tipper = Tipper;
})();
