var $$ = function (sel, ele) {
	ele = ele || document;
	return Array.prototype.slice.call(ele.querySelectorAll(sel));
};
var $ = function (sel, ele){
	ele = ele || document;
	return ele.querySelector(sel);
};

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
function isArray(Arr){
	return Array.isArray(Arr);
}
var ajax = (function(){
	var stringifyRequest = (function(){
		function stringifyArray(key){
			var arr = this[key];
			var str = '' ;
			for ( var i=0; i<arr.length; ++i ){
				str += key + '[]=' + encodeURIComponent(this[key][i]) + '&';
			}
			return str;
		}
		function strSubLast(str){
			return str.substr(0, str.length-1);
		}
		function stringify(obj, keys){
			return isArray(obj[keys[0]]) ?
			stringifyArray.apply(obj, [keys.shift()]) :
			encodeURIComponent(keys[0]) + '=' + encodeURIComponent( obj[keys.shift()] ) + '&';
		}
		function objKeysMap(postObj, objKeys){
			return objKeys.length ? stringify(postObj, objKeys) + arguments.callee(postObj, objKeys) : '';
		}
		return function (requestObj){
			return strSubLast( objKeysMap( requestObj, Object.keys(requestObj) ));
		};
	})();

	return function (URL, method, pgdata, callback, fail){
		method = method.toLowerCase();
		if (window.XMLHttpRequest) {
			var vj = new XMLHttpRequest();
		}

		vj.onreadystatechange = function() {
			if (vj.readyState == 4 && vj.status == 200) {
				if (method === 'get') {
					pgdata(vj.responseText, status);
				} else if (method === 'post') {
					callback && callback(vj.responseText, status);
				}
			} else if ( vj.readyState === 500 && vj.status === 404 && vj.readyState === 403){
				fail && fail(status);
			}
		};

		if ( method.toLowerCase() === 'post' ) {
			vj.open("POST", URL, true);
			vj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");

			if ( typeof pgdata === 'object' ){
				if ( new RegExp(/\?/).test(URL) ){
					vj.send( stringifyRequest(pgdata) );
				}else{
					vj.send( stringifyRequest(pgdata) );
				}
			}else{
				vj.send( pgdata );
			}
		} else if (method.toLowerCase() === 'get') {
			vj.open("GET", URL, true);
			vj.send();
		} else {
			throw new Error('Method is empty!')
		}
	};
})();
