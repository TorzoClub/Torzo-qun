var tipper = new Tipper();
var entro = new Entro;
var envir = {
	page: 1,
};

function coverFadeOut(callback){
	setTimeout(function () {
		callback && callback();
	}, 382);

	$('#cover').style.opacity = 0;
	setTimeout(function (){
		$('#cover').style.display = 'none';
	}, 618);
	tipper.fadeOut();
}

function initIndex(){
	$$('#index .item-title').forEach(function (ele, i){
		var slaveEle = $$('.item-hide')[i];
		var storeHeight = slaveEle.offsetHeight;
		slaveEle.style.transition = 'height 1s, opacity .618s';
		slaveEle.style.webkitTransition = 'height 1s, opacity .618s';
		slaveEle.style.height = '0px';
		ele.onclick = function (e){
			this.blur();
			if ($$('.item-hide')[i].style.height !== '0px') {
				/*storeHeight = slaveEle.offsetHeight;*/
				$$('.item-hide')[i].style.height = storeHeight + 'px';

				slaveEle.style.transition = 'height .618s, opacity .618s';
				slaveEle.style.webkitTransition = 'height .618s, opacity .618s';
				$$('.item-hide')[i].style.height = '0px';
				$$('.item-hide')[i].style.opacity = 0;

				ele.classList.remove('clicked');

			} else {
				slaveEle.style.transition = 'height 1s, opacity .618s';
				slaveEle.style.webkitTransition = 'height 1s, opacity .618s';

				$$('.item-hide')[i].style.height = $$('.item-hide')[i].scrollHeight + 'px';
				$$('.item-hide')[i].style.opacity = 1;

				ele.classList.add('clicked');
			}

		};
	});
}
function clearHidden(){
	$$('.hidden').forEach(function (ele){
		ele.classList.remove('hidden');
	})
}

document.body.appendChild(tipper.ele);

function indexFadeIn(cb){
	fadeIn($('#index'), cb);
}
function indexFadeOut(cb){
	fadeOut($('#index'), cb);
}

function checkLoadState() {
	if (window.imgLoaded && window.loaded && window.commentLoaded){
		var tip = setTimeout(function (){
			document.body.addEventListener('click', enter);
			tipper.fadeIn('点击任意区域继续', function (ele){
				ele.classList.add('shine-animated');
			});
		}, 2000);
		setTimeout(function (){
			$('#cover').style.opacity = 1;
		}, 1000);

		var enter = function (e) {
			clearTimeout(tip);
			clearHidden();

			coverFadeOut(function (){
				indexFadeIn(function (){
					fadeIn($('#comment'));
				})
			});
			$('#index').style.overflow = '';
			$('#index').style.height = '';


			document.body.removeEventListener('click', enter);
		};
		initIndex();
		$('#comment').style.display = 'none';
		$('#index').style.display = 'none';

		$('#index').style.overflow = 'hidden';
		$('#index').style.height = '100vh';
		entro.intro();
	}
}

$('#logo').src = "img/torzo-logo-512.png";
$('#logo').onload = function (){
	window.imgLoaded = true;
	checkLoadState();
};

window.onload = function (){
	window.loaded = true;
	checkLoadState();
};

function backScrollTop(){
	if (document.body.scrollTop) {
		return document.body.scrollTop;
	} else if (document.documentElement.scrollTop) {	//FireFox
		return document.documentElement.scrollTop;
	} else {
		return null;
	}
}

window.addEventListener('scroll', function (e){
	//console.log(backScrollTop());
});

var comment = new (function (){
	function getComment(page, ok, fail){
		ajax('comment.php?page=' + page, 'get', function (r){
			try {
				var info = JSON.parse(r);
				if (info.code !== 0) {
					throw new Error(info.msg);
				}
			} catch (e) {
				if (fail) {
					fail(e);
				} else {
					console.error(e);
				}
				return;
			}
			ok(info);
		});
	}

	function processDate(commentData){
		if (typeof(commentData.time) === 'string'){
			var timeString = commentData.time.split(' ')[0].replace(timeString, '-', '/');
			var date = new Date(timeString);
		} else {
			var date = new Date(commentData.time);
		}

		return {
			year: date.getFullYear(),
			month: date.getMonth() + 1,
			day: date.getDate()
		};
	}

	function checkPost(author, article){
		var err = new Error();
		var articleLimit = 20;
		var authorLimit = 8;
		try {
			if ( article.replace('\n', '').replace(' ', '').length < articleLimit ){
				err.message = '不到' + articleLimit + '个字还想装逼？';
				err.code = 1;
				throw err;
			} else if (!author.length) {
				err.message = '你忘记输入名字了……看看那个「君の名は？」';
				err.code = 1;
				throw err;
			} else if (author.length > authorLimit){
				err.message = '呃……你的名字输入的有点长，要' + authorLimit + '字以内...';
				err.code = 1;
				throw err;
			}
		} catch (e) {
			if (err.code === undefined) {
				throw new Error('checkPost出现意料之外的错误！请检查参数是否齐全');
			} else {
				throw e;
			}
		}
		return false;
	}
	function backEditorElement(){
		var date = processDate({time: new Date});
		var html =
		"\
		<div class=\"time-area\">\
			<hr class=\"time-hr\">\
			<time>\
				<span class=\"day\"></span>.<span class=\"month\"></span>.<span class=\"year\"></span>\
			</time>\
			<button id=\"post\">同装</button>\
		</div>\
		<article><textarea placeholder=\"同装，轮到你了\"></textarea></article>\
		<div class=\"author-frame\">\
			<img class=\"eidtor-from\" src=\"img/from-512w.png\" />\
			<span class=\"author\"><input class=\"comment-author-input\" placeholder=\"君の名は？\" /></span>\
		</div>\
		";
		var li = document.createElement('li');
		li.innerHTML = html;

		$('.day', li).innerText = date.day;
		$('.month', li).innerText = date.month;
		$('.year', li).innerText = date.year;

		function fail(e){
			console.error(e);
			throw new Error('啊偶，发射留言出现了点问题……');
		}
		$('#post', li).onclick = function (){
			var data = {
				author: $('input', li).value,
				article: $('textarea', li).value,
			};

			try {
				checkPost(data.author, data.article);
				comment.postComment(data, function (r){
					try {
						var info = JSON.parse(r);
						if (info.code !== 0) {
							throw new Error('发射似乎出现了点问题');
						}
						envir.lastInsertId = info.lastInsertId;
						comment.reload();
					} catch (e) {
						fail(e);
					}
				}, fail)
			} catch (e) {
				alert(e.message);
			}
			console.log();
		};

		return li;
	}
	function backCommentElement(commentData){
		var date = processDate(commentData);
		var html =
		"\
		<div class=\"time-area\">\
			<hr class=\"time-hr\">\
			<time>\
				<span class=\"day\"></span>.<span class=\"month\"></span>.<span class=\"year\"></span>\
			</time>\
		</div>\
		<article></article>\
		<div class=\"author-frame\">\
			<img src=\"img/from-512w.png\" />\
			<span class=\"author\"></span>\
		</div>\
		";

		var li = document.createElement('li');
		li.innerHTML = html;

		$('.day', li).innerText = date.day;
		$('.month', li).innerText = date.month;
		$('.year', li).innerText = date.year;

		$('article', li).innerText = commentData['article'];
		$('.author', li).innerText = commentData['author'];

		return li;
	}
	this.appendLoad = function (finish){
		++envir.page;
		envir.fetchFinish || this.renderList(function (info){
			if (!info.msg.length) {
				envir.fetchFinish = true;
			}
			finish && finish(info);
		});
	};
	this.renderList = function (finish){
		getComment(envir.page, function (info){
			info.msg.forEach(function (commentData){
				var ele = backCommentElement(commentData);
				$('#comment-list').appendChild(ele);
			});
			envir.info = info;
			finish && finish(info);
		});

	};
	this.editorElement = null;
	this.setEditor = function (){
		this.eidtorElement = backEditorElement();

		$('#comment-list').insertBefore(backEditorElement(), $('#comment-list > *'));
	};

	this.postComment = function (commentData, ok, fail){
		ajax('comment.php', 'post', commentData, ok, fail);
	};

	this.reload = function (ok){
		$('#comment-list').innerHTML = '';

		envir.page = 1;
		this.renderList(function (){
			this.setEditor();
			ok && ok();
		}.bind(this));
	};
});
comment.reload(function (){
	window.commentLoaded = true;
	checkLoadState();
});

function isBottom(ele){
	ele = ele || document.body;
	return (ele.scrollTop + ele.clientHeight) === (ele.scrollHeight);
}

$('#continue-load').onclick = function (){
	var button = this;

	if (envir.fetchFinish) {
		button.innerHTML = '——';
	} else {
		button.innerHTML = '···';
		comment.appendLoad(function (){
			if (envir.fetchFinish) {
				button.innerHTML = '——';
			} else {
				button.innerHTML = '﹀';
			}
		});
	}

};
