/**
引入本文件的代码
 (function() {
      var s = document.getElementsByTagName("script")[0];
      var js = document.createElement("script");
      js.src = 'http://static.xlgp.me/xlgp/xlgp.util.js';
      s.parentNode.insertBefore(js, s);
      js.onload = function(){
      		//xlgp.util.loadAsync().js() 内部调用promise.all(), 返回一个新的promise
          xlgp.util.loadAsync().js('需要引入的js路径[可使用数组批量引入]').then(onSuccess).catch(onFailed);
      }
    })();
 */
(function (root, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    ( root.xlgp = root.xlgp || {},
		root.xlgp.util = root.xlgp.util || factory());
})(this, function () {

	// 'use strict';
	let o = {};

	/**
	 * 路径数组化
	 * @param {stirng} path 
	 */
	function parsePath(path) {
		return path = typeof path == 'string' && [path] || path;
	}

	function getBaseName(path) {
		return path.substr(path.lastIndexOf("/") + 1);
	}
	/**
	 * 加载js
	 * @param {string} path 
	 * flag :是否强制加载
	 */
	function loadJs(path, flag) {
		let js = document.getElementById(getBaseName(path));

		function create() {
			var s = document.getElementsByTagName("script")[0];
			var js = document.createElement("script");
			js.type = "text/javascript";
			js.id = getBaseName(path);
			document.body.appendChild(js);
			return js;
		}
		if (js && flag) {
			js.parentNode.removeChild(js);
		} else if (js) {
			return Promise.resolve(path);
		}
		return new Promise((resolve, reject) => {
			let js = create();
			js.src = path + (path.includes('?') ? '&_=' : '?') + Date.parse(Date());
			js.onload = function () {
				resolve(path);
			}
			js.onerror = function (e) {
				reject(e);
			}
		});
	}
	/**
	 * 加载css
	 * @param {string} path 
	 */
	function loadCss(path, flag) {
		let css = document.getElementById(getBaseName(path));

		function create() {
			var css = document.createElement("link");
			css.type = "text/css";
			css.rel = "stylesheet";
			css.id = getBaseName(path);
			document.head.appendChild(css);
			return css;
		}
		if (css && flag) {
			css.parentNode.removeChild(css);
		} else if (css) {
			return Promise.resolve(path);
		}
		return new Promise((resolve, reject) => {
			let css = create();
			css.href = path + '?' + Date.parse(Date());;
			css.onload = function () {
				resolve(path);
			}
			css.onerror = function (e) {
				reject(e);
			}
		});
	}
	o.parseUrl = function (obj) {
		let str = '';
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				const element = obj[key];
				str += '&' + key + '=' + element;
			}
		}
		return str && str.slice(0) || '';
	}
	o.loadAsync = {
		js: function (path, flag) {
			return Promise.all(parsePath(path).map(p => loadJs(p, flag)));
		},
		css: function (path, flag) {
			return Promise.all(parsePath(path).map(p => loadCss(p, flag)));
		},
	}
	/**
	 * 判断图片路径是否正确
	 * @param  {[string]} url [description]
	 * @return {[Promise]}     [description]
	 */
	o.checkImgPath = function (url) {
		return new Promise(function (resolve, reject) {
			var ImgObj = new Image();
			if (!url) reject(false);
			ImgObj.src = url;
			ImgObj.onload = function () {
				ImgObj.width > 0 ? resolve(true) : reject(false);
			}
			ImgObj.onerror = function () {
				reject(false);
			}
		});
	}

	o.isFunction = function (func) {
		return typeof func === 'function';
	}

	/**
	 * 创建或获取元素
	 * @param  {[type]} id [description]
	 * @param {string} pnId 父级元素id
	 * @return {[type]}    [description]
	 */
	o.el = function (id, pnId) {
		//创建app容器
		let ele = document.getElementById(id);
		if (ele) return ele;
		ele = document.createElement('div');
		ele.id = id;
		let pnode = pnId && document.getElementById(pnId) || document.body;
		if (pnode.firstElementChild) {
			pnode.insertBefore(ele, pnode.firstElementChild);
		} else {
			pnode.appendChild(ele);
		}
		return ele;
	}

	function jsonpCallback(callback){
		let jsonpcb = '_jsonp' + o.strRandom(26);
		window[jsonpcb] = function (data) {
			o.isFunction(callback) && callback(data);
			delete window[jsonpcb];
		}
		return jsonpcb;
	}

	o.loadJsonp = function (src, callback) {
		let script = document.createElement('script');
		
		if(src.includes('#callback#')){
			src = src.replace('#callback#', jsonpCallback(callback));
		}
		
		script.src = src;

		return new Promise((resolve, reject) => {
			document.body.appendChild(script);
			script.onload = function () {
				this.parentNode.removeChild(this);
				resolve(src);
			}
			script.onerror = function (e) {
				this.parentNode.removeChild(this);
				reject(e);
			}
		});
	}
	o.loadJsonpPromise = function (src) {
		return new Promise(function (resolve, reject) {
			o.loadJsonp(src, function (data) {
				resolve(data);
			});
		});
	}
	//随机字符串
	o.strRandom = function (len = 32) {
		let strBase = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwsyx';
		let strResult = strBase[Math.floor(Math.random() * (strBase.length - 10)) + 10];
		for (let index = 1; index < len; index++) {
			strResult += strBase[Math.floor(Math.random() * strBase.length)];
		}
		return strResult;
	}

	return o;
})