(() => {

	'use strict';

	const global = 'UI';

	if (!window[global]) {
		window[global] = {};
	}
	const Global = window[global];

	const UA = navigator.userAgent.toLowerCase();
	const deviceInfo = ['android', 'iphone', 'ipod', 'ipad', 'blackberry', 'windows ce', 'windows', 'samsung', 'lg', 'mot', 'sonyericsson', 'nokia', 'opeara mini', 'opera mobi', 'webos', 'iemobile', 'kfapwi', 'rim', 'bb10'];

	Global.page = {};
	Global.data = {};
	Global.exe = {};
	Global.callback = {};
	Global.state = {
		isSystemModal: false,
		device: {
			info: (() => {
				for (let i = 0, len = deviceInfo.length; i < len; i++) {
					if (UA.match(deviceInfo[i]) !== null) {
						return deviceInfo[i];
					}
				}
			})(),
			width: window.innerWidth,
			height: window.innerHeight,
			ios: (/ip(ad|hone|od)/i).test(UA),
			android: (/android/i).test(UA),
			app: UA.indexOf('appname') > -1 ? true : false,
			touch: null,
			mobile: null,
			os: (navigator.appVersion).match(/(mac|win|linux)/i)
		},
		browser: {
			ie: UA.match(/(?:msie ([0-9]+)|rv:([0-9\.]+)\) like gecko)/i),
			local: (/^http:\/\//).test(location.href),
			firefox: (/firefox/i).test(UA),
			webkit: (/applewebkit/i).test(UA),
			chrome: (/chrome/i).test(UA),
			opera: (/opera/i).test(UA),
			safari: (/applewebkit/i).test(UA) && !(/chrome/i).test(UA),
			size: null
		},
		keys: {
			tab: 9,
			enter: 13,
			alt: 18,
			esc: 27,
			space: 32,
			pageup: 33,
			pagedown: 34,
			end: 35,
			home: 36,
			left: 37,
			up: 38,
			right: 39,
			down: 40
		},
		scroll: {
			y: 0,
			direction: 'down',
		},
		breakPoint: [700, 1280],
		col: 12,
	};
	Global.parts = {
		scroll() {
			const el_html = document.querySelector('html');
			let last_know_scroll_position = 0;
			let ticking = false;

			const doSomething = (scroll_pos) => {
				Global.state.scroll.direction =
					Global.state.scroll.y > scroll_pos ? 'up' : Global.state.scroll.y < scroll_pos ? 'down' : '';
				Global.state.scroll.y = scroll_pos;
				el_html.dataset.direction = Global.state.scroll.direction;
				el_html.dataset.top = scroll_pos < 10 ? true : false;
			}
			window.addEventListener('scroll', (e) => {
				last_know_scroll_position = window.scrollY;

				if (!ticking) {
					window.requestAnimationFrame(() => {
						doSomething(last_know_scroll_position);
						ticking = false;
					});

					ticking = true;
				}
			});
		},
		resizeState() {
			const act = () => {
				const el_html = document.querySelector('html');
				const browser = Global.state.browser;
				const device = Global.state.device;

				device.width = window.innerWidth;
				device.height = window.innerHeight;

				device.touch = device.ios || device.android || (document.ontouchstart !== undefined && document.ontouchstart !== null);
				device.mobile = device.touch && (device.ios || device.android);
				device.os = device.os ? device.os[0] : '';
				device.os = device.os.toLowerCase();

				device.breakpoint = device.width >= Global.state.breakPoint[0] ? true : false;
				device.col = device.width >= Global.state.breakPoint[1] ? '12' : device.width > Global.state.breakPoint[0] ? '8' : '4';
				Global.state.col = device.col;

				if (browser.ie) {
					browser.ie = browser.ie = parseInt(browser.ie[1] || browser.ie[2]);
					(11 > browser.ie) ? support.pointerevents = false : '';
					(9 > browser.ie) ? support.svgimage = false : '';
				} else {
					browser.ie = false;
				}

				el_html.dataset.col = device.col;
				el_html.dataset.browser = browser.chrome ? 'chrome' : browser.firefox ? 'firefox' : browser.opera ? 'opera' : browser.safari ? 'safari' : browser.ie ? 'ie' + browser.ie : 'other';
				el_html.dataset.platform = device.ios ? "ios" : device.android ? "android" : 'window';
				el_html.dataset.device = device.mobile ? device.app ? 'app' : 'mobile' : 'desktop';
			}
			window.addEventListener('resize', act);
			act();
		},
		comma(n) {
			let parts = n.toString().split(".");

			return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
		},
		add0(x) {
			return Number(x) < 10 ? '0' + x : x;
		},
		paraGet(paraname) {
			const _tempUrl = window.location.href;
			let _tempArray = _tempUrl.split(paraname + '=');

			if (_tempArray.length > 1) {
				_tempArray = _tempArray[1];
				_tempArray = _tempArray.split('&');
				_tempArray = _tempArray[0];
				_tempArray = _tempArray.split('#');
				_tempArray = _tempArray[0];

				console.log(_tempArray);
			} else {
				_tempArray = null
			}
			return _tempArray;
		},
		paraSet(key, value) {
			const _tempUrl = window.location.href;
			let _tempArray = _tempUrl.split(key + '=');

			if (_tempArray.length > 1) {
				_tempArray = _tempArray[0] + key + '=' + value;
			} else {
				_tempArray = _tempUrl + '?' + key + '=' + value;
			}

			history.pushState(null, null, _tempArray);
		},
		RAF(start, end, startTime, duration) {
			const _start = start;
			const _end = end;
			const _duration = duration ? duration : 300;
			const unit = (_end - _start) / _duration;
			const endTime = startTime + _duration;

			let now = new Date().getTime();
			let passed = now - startTime;

			if (now <= endTime) {
				Global.parts.RAF.time = _start + (unit * passed);
				requestAnimationFrame(scrollTo);
			} else {
				!!callback && callback();
			}
		},
		getIndex(ele) {
			let _i = 0;

			while ((ele = ele.previousSibling) != null) {
				(ele.nodeType === 1) && _i++;
			}

			return _i;
		},
		/**
		 * include
		 * @param {string} opt.id 
		 * @param {string} opt.src 
		 * @param {string} opt.type : 'html' | 'json'
		 * @param {boolean} opt.insert : true[insertAdjacentHTML] | false[innerHTML]
		 * @param {function} opt.callback
		 * 
		 */
		include(opt) {
			let selector = document.querySelector('[data-id="' + opt.dataId + '"]');
			const src = opt.src;
			const type = !opt.type ? 'HTML' : opt.type;
			const insert = !!opt.insert ? opt.insert : false;
			const callback = !!opt.callback ? opt.callback : false;

			!selector ? selector = document.querySelector('body') : '';

			if (!!selector && !!src) {
				switch (type) {
					case 'HTML':
						fetch(src)
							.then(response => response.text())
							.then(result => {
								if (insert) {
									selector.insertAdjacentHTML('afterbegin', result);
								} else {
									selector.innerHTML = result;
								}
							}).then(() => {
								!!callback && callback();
							});
						break;
				}
			}
		},
		resizObserver(opt) {
			let timer = null;
			let w = null;
			let h = null;
			const observer = new ResizeObserver(entries => {
				for (let entry of entries) {
					const { width, height } = entry.contentRect;
					w === null ? w = width : '';
					h === null ? h = height : '';

					!!timer && clearTimeout(timer);
					// timer = setTimeout(() => {
					//     console.log(width, height);
					opt.callback({
						width: width,
						height: height,
						resize: [w === width ? false : true, h === height ? false : true]
					});
					// }, 50);
				}
			});

			observer.observe(opt.el);
		}
	};
	Global.scroll = {
		options: {
			selector: document.querySelector('html, body'),
			focus: false,
			top: 0,
			left: 0,
			add: 0,
			align: 'default',
			effect: 'smooth', //'auto'
			callback: false,
		},
		init() {
			const el_areas = document.querySelectorAll('.ui-scrollmove-btn[data-area]');

			for (let i = 0, len = el_areas.length; i < len; i++) {
				const that = el_areas[i];

				that.removeEventListener('click', this.act);
				that.addEventListener('click', this.act);
			}
		},
		act(e) {
			const el = e.currentTarget;
			const area = el.dataset.area;
			const name = el.dataset.name;
			const add = el.dataset.add === undefined ? 0 : el.dataset.add;
			const align = el.dataset.align === undefined ? 'default' : el.dataset.align;
			const callback = el.dataset.callback === undefined ? false : el.dataset.callback;
			let el_area = document.querySelector('.ui-scrollmove[data-area="' + area + '"]');

			const el_item = el_area.querySelector('.ui-scrollmove-item[data-name="' + name + '"]');

			let top = (el_area.getBoundingClientRect().top - el_item.getBoundingClientRect().top) - el_area.scrollTop;
			let left = (el_area.getBoundingClientRect().left - el_item.getBoundingClientRect().left) - el_area.scrollLeft;

			if (align === 'center') {
				top = top - (el_item.offsetHeight / 2);
				left = left - (el_item.offsetWidth / 2);
			}

			Global.scroll.move({
				top: top,
				left: left,
				add: add,
				selector: el_area,
				align: align,
				focus: el_item,
				callback: callback
			});
		},
		move(option) {
			const opt = Object.assign({}, this.options, option);
			//const opt = {...this.options, ...option};
			const top = opt.top;
			const left = opt.left;
			const callback = opt.callback;
			const align = opt.align;
			const add = opt.add;
			const focus = opt.focus;
			const effect = opt.effect;
			let selector = opt.selector;

			switch (align) {
				case 'center':
					selector.scrollTo({
						top: Math.abs(top) - (selector.offsetHeight / 2) + add,
						left: Math.abs(left) - (selector.offsetWidth / 2) + add,
						behavior: effect
					});
					break;

				case 'default':
				default:
					selector.scrollTo({
						top: Math.abs(top) + add,
						left: Math.abs(left) + add,
						behavior: effect
					});
			}
			this.checkEnd({
				selector: selector,
				nowTop: selector.scrollTop,
				nowLeft: selector.scrollLeft,
				align: align,
				callback: callback,
				focus: focus
			});
		},
		checkEndTimer: {},
		checkEnd(opt) {
			const el_selector = opt.selector;
			const align = opt.align
			const focus = opt.focus
			const callback = opt.callback

			let nowTop = opt.nowTop;
			let nowLeft = opt.nowLeft;

			Global.scroll.checkEndTimer = setTimeout(() => {
				//스크롤 현재 진행 여부 판단
				if (nowTop === el_selector.scrollTop && nowLeft === el_selector.scrollLeft) {
					clearTimeout(Global.scroll.checkEndTimer);
					//포커스가 위치할 엘리먼트를 지정하였다면 실행
					if (!!focus) {
						focus.setAttribute('tabindex', 0);
						focus.focus();
					}
					//스크롤 이동후 콜백함수 실행
					if (!!callback) {
						if (typeof callback === 'string') {
							Global.callback[callback]();
						} else {
							callback();
						}
					}
				} else {
					nowTop = el_selector.scrollTop;
					nowLeft = el_selector.scrollLeft;

					Global.scroll.checkEnd({
						selector: el_selector,
						nowTop: nowTop,
						nowLeft: nowLeft,
						align: align,
						callback: callback,
						focus: focus
					});
				}
			}, 100);
		}
	}
	Global.form = {
		init() {
			const classname = '.inp-base';
			const el_inps = document.querySelectorAll(classname);
			const prefix = (inp) => {
				const wrap = inp.parentElement;

				if (!wrap.querySelector('.prefix')) {
					const preFixTxt = document.createElement('span');
					const theFirstChild = wrap.firstChild;
					const txt = inp.dataset.prefix;

					preFixTxt.classList.add('prefix');
					preFixTxt.textContent = txt;
					wrap.insertBefore(preFixTxt, theFirstChild);

					const w = wrap.querySelector('.prefix').offsetWidth;

					wrap.querySelector(classname).style.paddingLeft = w + 'px';
				}
			}
			const suffix = (inp) => {
				const wrap = inp.parentElement;

				if (!wrap.querySelector('.suffix')) {
					const fixTxt = document.createElement('span');
					const txt = inp.dataset.suffix;

					fixTxt.classList.add('suffix');
					fixTxt.textContent = txt;
					wrap.appendChild(fixTxt);

					const w = wrap.querySelector('.suffix').offsetWidth;

					inp.dataset.suf = w;
					wrap.querySelector(classname).style.paddingRight = w + 'px';
				}
			}

			for (let i = 0, len = el_inps.length; i < len; i++) {
				const inp = el_inps[i];

				inp.addEventListener('focus', this.actClear);
				inp.addEventListener('input', this.actClear);
				inp.addEventListener('blur', this.actClear);

				//prefix, suffix text
				!!inp.dataset.prefix && prefix(inp);
				!!inp.dataset.suffix && suffix(inp);
				!!inp.value && (!!inp.dataset.clear || inp.type === 'search') && (!!inp.dataset.keep || inp.type === 'search') && this.actClear(inp);
			}
		},
		clearTimer: {},
		actClear(event) {
			let inp;
			const isInput = event.type === 'text' || event.type === 'search' || event.type === 'number' || event.type === 'tel' || event.type === 'email' || event.type === 'file' || event.type === 'password' || event.type === 'url' || event.type === 'tel' || event.type === 'date';
			if (isInput) {
				inp = event;
			} else {
				inp = event.currentTarget;
			}

			// const id = inp.id;
			const title = inp.title;
			const wrap = inp.parentElement;
			const suffix = wrap.querySelector('.suffix');
			const isValue = inp.value;
			let eventType = event.type;
			const isClear = inp.dataset.clear || inp.type === 'search' ? true : false;
			let isKeep = inp.dataset.keep;
			const w_suffix = !!suffix ? suffix.offsetWidth : 0;
			const paddingR = Number((inp.style.paddingRight).split('px')[0]);

			if (!isClear) {
				return false;
			}

			if (isInput) {
				eventType = 'input';
			}

			if (inp.type === 'search') {
				isKeep = true;
			}

			const clear = () => {
				clearTimeout(this.clearTimer);
				inp.value = '';
				inp.focus();
			}
			const beforeClear = () => {
				const btn = wrap.querySelector('.ui-clear');
				const btnclear = () => {
					if (!!btn) {
						const w = btn.offsetWidth;
						inp.style.paddingRight = paddingR - w + 'px';
						btn.removeEventListener('click', clear);
						btn.remove();
					}
				}
				(!!isKeep) ? (!inp.value) && btnclear() : btnclear();
			}

			switch (eventType) {
				case 'focus':
				case 'input':
					if (!!isValue) {
						if (!wrap.querySelector('.ui-clear')) {
							const clearbutton = document.createElement('button');
							clearbutton.type = 'button';
							clearbutton.classList.add('btn-clear');
							clearbutton.classList.add('ui-clear');
							clearbutton.setAttribute('aria-label', title + ' 값 삭제');
							// clearbutton.dataset.id = id;

							inp.after(clearbutton);

							const btn = wrap.querySelector('.ui-clear');
							const w = btn.offsetWidth + w_suffix;

							inp.style.paddingRight = w + 'px'
							btn.style.marginRight = w_suffix + 'px';

							btn.addEventListener('focus', () => clearTimeout(this.clearTimer));
							btn.addEventListener('blur', beforeClear);
							btn.removeEventListener('click', clear);
							btn.addEventListener('click', clear);
						}
					} else {
						beforeClear();
					}
					break;

				case 'blur':
					if (!!wrap.querySelector('.ui-clear')) {
						this.clearTimer = setTimeout(() => {
							beforeClear();
						}, 300);
					}
					break;
			}
		},

		fileUpload() {
			const el_files = document.querySelectorAll('.mdl-file-inp');
			const fileTypes = [
				"image/apng",
				"image/bmp",
				"image/gif",
				"image/jpeg",
				"image/pjpeg",
				"image/png",
				"image/svg+xml",
				"image/tiff",
				"image/webp",
				"image/x-icon"
			];

			const fileDelete = (e) => {
				const id = e.currentTarget.dataset.id;

				const list = document.querySelector('.mdl-file-list[data-id="' + id + '"]');
				const list_ul = list.querySelector('ul');
				const list_li = list.querySelectorAll('li');
				const inp = document.querySelector('#' + id);
				const nodes = [...list_ul.children];
				const index = Number(nodes.indexOf(e.currentTarget.closest('li')));

				const dataTransfer = new DataTransfer();
				const _files = inp.files;
				let fileArray = Array.from(_files);

				fileArray.splice(index, 1);
				fileArray.forEach((file) => {
					dataTransfer.items.add(file);
				});
				list_li[index].remove();
				inp.files = dataTransfer.files;
			}
			const validFileType = (file) => {
				return fileTypes.includes(file.type);
			}
			const returnFileSize = (number) => {
				if (number < 1024) {
					return number + 'bytes';
				} else if (number >= 1024 && number < 1048576) {
					return (number / 1024).toFixed(1) + 'KB';
				} else if (number >= 1048576) {
					return (number / 1048576).toFixed(1) + 'MB';
				}
			}

			const updateImageDisplay = (e) => {
				const el_file = e.currentTarget;
				const id = el_file.id;
				const preview = document.querySelector('.mdl-file-list[data-id="' + id + '"]');
				const curFiles = el_file.files;

				while (preview.firstChild) {
					preview.removeChild(preview.firstChild);
				}

				if (curFiles.length === 0) {
					const para = document.createElement('p');
					para.textContent = 'No files currently selected for upload';
					preview.appendChild(para);
				} else {
					const list = document.createElement('ul');
					const title = document.createElement('h4');

					title.textContent = 'File upload list';
					title.classList.add('a11y-hidden');
					preview.classList.add('on');
					preview.appendChild(title);
					preview.appendChild(list);

					for (let i = 0, len = curFiles.length; i < len; i++) {
						const that = curFiles[i];
						const listItem = document.createElement('li');
						const para = document.createElement('p');
						const delbutton = document.createElement('button');

						delbutton.type = 'button';
						delbutton.classList.add('mdl-file-del');
						delbutton.title = '파일 삭제';
						delbutton.dataset.id = id;
						delbutton.dataset.n = i;

						para.textContent = that.name + ', ' + returnFileSize(that.size) + '.';

						if (validFileType(that)) {
							const image = document.createElement('img');
							image.src = URL.createObjectURL(that);

							listItem.appendChild(image);
						}

						listItem.appendChild(para);
						listItem.appendChild(delbutton);
						list.appendChild(listItem);
						delbutton.addEventListener('click', fileDelete);
					}
				}
			}

			for (let i = 0, len = el_files.length; i < len; i++) {
				const that = el_files[i];

				if (!that.dataset.ready) {
					that.addEventListener('change', updateImageDisplay);
					that.dataset.ready = true;
				}
			}
		},
		allCheck(opt) {
			const el_parents = document.querySelectorAll('[data-allcheck-parent]');
			const el_childs = document.querySelectorAll('[data-allcheck-child]');
			const opt_callback = opt.allCheckCallback;

			const allCheckParent = () => {
				isAllChecked({
					name: this.dataset.allcheckParent,
					type: 'parent'
				});
			}

			const allCheckChild = () => {
				isAllChecked({
					name: this.dataset.allcheckChild,
					type: 'child'
				});
			}

			const isAllChecked = (opt) => {
				const isType = opt.type;
				const isName = opt.name;
				const parent = document.querySelector('[data-allcheck-parent="' + isName + '"]');
				const childs = document.querySelectorAll('[data-allcheck-child="' + isName + '"]');
				const allChecked = parent.checked;
				const len = childs.length;
				let n_checked = 0;
				let n_disabled = 0;

				for (let i = 0; i < len; i++) {
					const child = childs[i];

					if (isType === 'parent' && !child.disabled) {
						child.checked = allChecked;
					}

					n_checked = child.checked && !child.disabled ? ++n_checked : n_checked;
					n_disabled = child.disabled ? ++n_disabled : n_disabled;
				}

				parent.checked = (len !== n_checked + n_disabled) ? false : true;

				opt_callback({
					group: isName,
					allChecked: parent.checked
				});
			}

			for (let i = 0; i < el_parents.length; i++) {
				if (!el_parents[i].dataset.apply) {
					el_parents[i].addEventListener('change', allCheckParent);
					isAllChecked({
						name: el_parents[i].dataset.allcheckParent,
						type: 'child'
					});
				}

				el_parents[i].dataset.apply = '1';
			}

			for (let i = 0; i < el_childs.length; i++) {
				if (!el_childs[i].dataset.apply) {
					el_childs[i].addEventListener('change', allCheckChild);
				}

				el_childs[i].dataset.apply = '1';
			}
		}
	}
	Global.loading = {
		timerShow: {},
		timerHide: {},
		options: {
			selector: null,
			message: null,
			styleClass: 'orbit' //time
		},
		show(option) {
			const opt = Object.assign({}, this.options, option);
			const selector = opt.selector;
			const styleClass = opt.styleClass;
			const message = opt.message;
			const el = (selector !== null) ? selector : document.querySelector('body');
			const el_loadingHides = document.querySelectorAll('.mdl-loading:not(.visible)');

			for (let i = 0, len = el_loadingHides.length; i < len; i++) {
				const that = el_loadingHides[i];

				that.remove();
			}

			let htmlLoading = '';

			(selector === null) ?
				htmlLoading += '<div class="mdl-loading ' + styleClass + '">' :
				htmlLoading += '<div class="mdl-loading type-area ' + styleClass + '">';

			htmlLoading += '<div class="mdl-loading-wrap">';

			(message !== null) ?
				htmlLoading += '<strong class="mdl-loading-message"><span>' + message + '</span></strong>' :
				htmlLoading += '';

			htmlLoading += '</div>';
			htmlLoading += '</div>';

			const showLoading = () => {
				const el_child = el.childNodes;
				let is_loading = false;

				for (let i = 0; i < el_child.length; i++) {
					if (el_child[i].nodeName === 'DIV' && el_child[i].classList.contains('mdl-loading')) {
						is_loading = true;
					}
				}

				!is_loading && el.insertAdjacentHTML('beforeend', htmlLoading);
				htmlLoading = null;

				const el_loadings = document.querySelectorAll('.mdl-loading');

				for (let i = 0, len = el_loadings.length; i < len; i++) {
					const that = el_loadings[i];

					that.classList.add('visible');
					that.classList.remove('close');
				}
			}
			clearTimeout(this.timerShow);
			clearTimeout(this.timerHide);
			this.timerShow = setTimeout(showLoading, 300);
		},
		hide() {
			clearTimeout(this.timerShow);
			this.timerHide = setTimeout(() => {
				const el_loadings = document.querySelectorAll('.mdl-loading');

				for (let i = 0, len = el_loadings.length; i < len; i++) {
					const that = el_loadings[i];

					that.classList.add('close');
					setTimeout(() => {
						that.classList.remove('visible')
						that.remove();
					}, 300);
				}
			}, 300);
		}
	}

	//common exe
	Global.parts.resizeState();
	Global.parts.scroll();

	//common callback
	Global.callback.toggle_nav = (result) => {
		const btn = document.querySelector('[data-toggle-object="' + result.name + '"]');

		if (result.state === 'true') {
			btn.dataset.meterial = 'arrow_forward';
		} else {
			btn.dataset.meterial = 'arrow_back';
		}
	}

	Global.radioButton = {
		init(option) {
			console.log(option)
			const opt = option;
			const wrap = document.querySelector(`[data-radio-button="${opt.id}"]`);
			const selected = wrap.querySelector('button[data-state="true"]');
			const btns = wrap.querySelectorAll('button');
			
			wrap.setAttribute('role', 'listbox');
			if (selected) selected.dataset.state = "";
			if (opt.index !== null) btns[opt.index].dataset.state = "true";

			const act = (e) => {
				const _this = e.currentTarget;
				const _wrap = _this.closest('[data-radio-button]');
				const _selected = _wrap.querySelector('button[data-state="true"]');
				console.log(_this);
				if (_selected) _selected.dataset.state = "";

				_this.dataset.state = "true";
				opt.callback && opt.callback({
					target: _this,
					id: opt.id,
					index: Number(_this.dataset.radioIdx)
				});
			}
			btns.forEach((item, index) => {
				item.dataset.radioIdx = index;
				item.addEventListener('click', act);
			})
		}
	}

})();

class TreeGroup {
	constructor(opt) {
		this.id = opt.id;
		this.tree = document.querySelector(`.chbook-group--tree[data-id="${this.id}"]`);
		this.btns = this.tree.querySelectorAll('.chbook-group--tree-btn');

		this.init();
	}
	init() {
		this.btns.forEach((item) => {
			item.addEventListener('click', this.toggleAct);
		});
	}
	toggleAct(e) {
		const _this = e.currentTarget;
		const _item = _this.closest('.chbook-group--tree-item');
		
		if (!_item.dataset.treeView) _item.dataset.treeView = 'false';

		_item.dataset.treeView = (_item.dataset.treeView === 'false') ? 'true' : 'false';

	}
}

//PDF e-Book
class PDFeBook {
	constructor(opt) {
		this.id = opt.id;
		this.data = opt.data.page;
		this.title = opt.data.title;
		this.date = opt.data.date;
		this.size = opt.data.size;
		this.name = opt.data.name;

		this.resizeObserver;
		this.autoSpeed = opt.data.autoSpeed ? opt.data.autoSpeed : 4000;
		this.timer_auto = null;
		this.auto_current = 0;
		this.timer_reset = null;
		this.once = true;
		this.viewer = document.querySelector('.dmex-ebook--viewer');
		this.util = document.querySelector('.dmex-ebook--viewer-util');
		this.list();
		this.set();
	}
	zoomReset() {
		const viewer_body = document.querySelector('.dmex-ebook--viewer-body');
		const viewer_book = document.querySelector('.dmex-ebook--viewer-book');	
		viewer_book.style.transform = `translate(0, 0)`;
		viewer_body.dataset.zoomState = 'false';
		viewer_book.dataset.zoomArea = '1';
		viewer_book.style.zoom = 1;
	}
	autoPlayStop(v) {
		const stf__wrapper = document.querySelector('.dmex-ebook--viewer .stf__wrapper');
		const isLandscape = stf__wrapper.classList.contains('--landscape');
		const total = isLandscape ? Math.floor(this.data.length / 2) : this.data.length;
		const _util = document.querySelector('.dmex-ebook--viewer-util');

		if (_util.dataset.auto === 'true') {
			_util.dataset.auto = false;
			clearTimeout(this.timer_auto);

		} else {
			_util.dataset.auto = true;
			const act = () => {
				clearTimeout(this.timer_auto);
				if (this.auto_current < total) {
					this.timer_auto = setTimeout(() => {
						this.auto_current = this.auto_current + 1;
						UI.ebook[this.id].flipNext();
						act();
					}, this.autoSpeed);
				} else {
					_util.dataset.auto = false;
				}
			}
			act();
		}
	}
	pageReset(){
		const viewer = document.querySelector('.dmex-ebook--viewer');
		UI.ebook[this.id].destroy();
	}
	pageLoad(n) {

	}
	list() {
		console.log('list')
		const viewer_body = document.querySelector('.dmex-ebook--viewer-wrap');
		const isList = viewer_body.querySelector('.dmex-ebook--viewer-list');
		if (!isList) {
			let html_list = `<ul class="dmex-ebook--viewer-list">`;
			for (let i = 0, len = this.data.length; i < len; i++) {
				html_list += `<li><button type="button" data-page-num="${i}" class="dmex-ebook--viewer-list-btn">
					<span>${this.data[i].title}</span>
				</button></li>`;
			}
			html_list += `</ul>`;

			viewer_body.insertAdjacentHTML('beforeend', html_list);
		} else {
			viewer_body.dataset.listState = 'false';
		}
	}
	set() {
		const viewer = document.querySelector('.dmex-ebook--viewer');
		const viewer_body = document.querySelector('.dmex-ebook--viewer-body');
		const viewer_main = document.querySelector('.dmex-ebook--viewer-main');

		viewer_main.insertAdjacentHTML('afterbegin', `<div class="dmex-ebook--viewer-book" id="${this.id}"></div>`);

		const viewer_book = viewer.querySelector('.dmex-ebook--viewer-book');

		const viewer_title = viewer.querySelector('.dmex-ebook--viewer-info-title'); 
		const viewer_date = viewer.querySelector('.dmex-ebook--viewer-info-date'); 
		const viewer_size = viewer.querySelector('.dmex-ebook--viewer-info-size'); 
		const viewer_name = viewer.querySelector('.dmex-ebook--viewer-info-name'); 

		//페이지세팅
		viewer_title.textContent = this.title;
		viewer_date.textContent = '최종 등록일시 ' + this.date;
		viewer_size.textContent = this.size + 'KB';
		viewer_name.textContent = '최종 등록자 ' + this.name;
		
		let html_page = ``;
		for (let i = 0, len = this.data.length; i < len; i++) {
			// if (this.auto_current + 3 > i && this.auto_current - 3 < i) {
				html_page += `<div class="dmex-ebook--viewer-page"><img src="${this.data[i].img}" data-src="${this.data[i].img}" alt="${this.data[i].title}"></div>`;
			// } else {
			// 	html_page += `<div class="dmex-ebook--viewer-page"><img src="../resources/images/ebook/page_bg.jpg" data-src="${this.data[i].img}" alt="${this.data[i].title}"></div>`;
			// }
		}
		viewer_book.insertAdjacentHTML('beforeend', html_page);

		this.init();
	}
	init() {
		const viewer = document.querySelector('.dmex-ebook--viewer');
		const viewer_wrap = viewer.querySelector('.dmex-ebook--viewer-wrap');
		const viewer_body = viewer.querySelector('.dmex-ebook--viewer-body');
		const viewer_main = document.querySelector('.dmex-ebook--viewer-main');

		const viewer_book = viewer.querySelector('.dmex-ebook--viewer-book');
		const paging_current = viewer.querySelector('.dmex-ebook--viewer-paging-current');
		const paging_total = viewer.querySelector('.dmex-ebook--viewer-paging-total');
		const control_btn = viewer.querySelectorAll('.dmex-ebook--viewer-control-btn, .dmex-ebook--viewer-paging-btn');

		const zoom_btns = viewer.querySelectorAll('.dmex-ebook--viewer-zoom-btn');
		const zoom_progress = viewer.querySelector('.dmex-ebook--viewer-zoom-progress input');

		const util_btns = viewer.querySelectorAll('.dmex-ebook--viewer-util-btn'); 
		const list_btns = viewer.querySelectorAll('.dmex-ebook--viewer-list-btn');

		const _util = document.querySelector('.dmex-ebook--viewer-util');

		// A4비율 1:1.414
		const rect = viewer_main.getBoundingClientRect();

		//상하여백
		const space = 0 //30 * 2; 

		const calculateWidth = (height) => {
			const ratio = 1.414;
			return (height - space) / ratio;
		}
		const calculateHeight = (width) => {
			const ratio = 1.414;
			return (width - space) * ratio;
		}
		let w = calculateWidth(rect.height);
		let h = rect.height - space;
		let w_min =  w / 2;
		let h_min =  h / 2;
		let w_max =  w;
		let h_max =  h;
		if (w > rect.width / 2) {
			w_min = w;
			h_min = h;
		} 
		if (w > rect.width) {
			w = rect.width - space;
			h = calculateHeight(rect.width);
			w_min = rect.width - space;
			h_min = calculateHeight(rect.width);
			w_max = rect.width - space;
			h_max = calculateHeight(rect.width);
		}

		
		UI.ebook[this.id] = new St.PageFlip(
			document.getElementById(this.id),
			{
				width: w,
				height: h,
				maxWidth: w_max,
				maxHeight: h_max,
				minWidth: w_min,
				minHeight: h_min,
				size: "stretch",
				maxShadowOpacity: .5,
				mobileScrollSupport: false,
				showCover: true,
				autoSize: true,
			}
		);
		UI.ebook[this.id].loadFromHTML(document.querySelectorAll('.dmex-ebook--viewer-page'));
		UI.ebook[this.id].on('flip', () => {
			paging_current.textContent = UI.ebook[this.id].getCurrentPageIndex() + 1;
		});
		paging_current.textContent = UI.ebook[this.id].getCurrentPageIndex() + 1;
		paging_total.textContent = UI.ebook[this.id].getPageCount();
		
		viewer_book.dataset.zoomArea = 1;
		viewer_body.dataset.zoomState = 'false';

		

		//event
		console.log('this.once',this.once)
		// if (this.once) {
			zoom_btns.forEach((item) => {
				item.removeEventListener('click', this.actZoom);
				item.addEventListener('click', this.actZoom);
			});
			zoom_progress.removeEventListener('input', this.actProgress);
			zoom_progress.addEventListener('input', this.actProgress);

			viewer_main.removeEventListener('mousedown', this.actStart);
			viewer_main.removeEventListener('touchstart', this.actStart);

			viewer_main.addEventListener('mousedown', this.actStart);
			viewer_main.addEventListener('touchstart', this.actStart);

			control_btn.forEach((item) => {
				item.removeEventListener('click', this.pageMove);
				item.addEventListener('click', this.pageMove);
			});

			util_btns.forEach((item) => {
				item.removeEventListener('click', this.utilAct);
				item.addEventListener('click', this.utilAct);
			});
			list_btns.forEach((item) => {
				item.removeEventListener('click', this.pageGo);
				item.addEventListener('click', this.pageGo);
			});
		// }
		
		//마지막 선택한 페이지 이동
		if (this.auto_current !== 0) {
			UI.ebook[this.id].turnToPage(this.auto_current); 
		}
		//ebook resize
		if (this.once) {
			this.once = false;
			this.resizeObserver = new ResizeObserver(entries => {
				clearTimeout(this.timer_reset);
				this.timer_reset = setTimeout(() => {
					this.pageReset();
					this.set();
				}, 0);
			});
			this.resizeObserver.observe(viewer_main);
		}
	}
	eventCancle()  {
		console.log('cancel')
		const control_btn = this.viewer.querySelectorAll('.dmex-ebook--viewer-control-btn, .dmex-ebook--viewer-paging-btn');
		const zoom_btns = this.viewer.querySelectorAll('.dmex-ebook--viewer-zoom-btn');
		const zoom_progress = this.viewer.querySelector('.dmex-ebook--viewer-zoom-progress input');
		const util_btns = this.viewer.querySelectorAll('.dmex-ebook--viewer-util-btn'); 
		const list_btns = this.viewer.querySelectorAll('.dmex-ebook--viewer-list-btn');
		const viewer_main = document.querySelector('.dmex-ebook--viewer-main');

		//pageFlip 실행
		zoom_btns.forEach((item) => {
			item.removeEventListener('click', this.actZoom);
		});
		zoom_progress.removeEventListener('input', this.actProgress);
		viewer_main.removeEventListener('mousedown', this.actStart);
		viewer_main.removeEventListener('touchstart', this.actStart);

		control_btn.forEach((item) => {
			item.removeEventListener('click', this.pageMove);
		});

		util_btns.forEach((item) => {
			item.removeEventListener('click', this.utilAct);
		});
		list_btns.forEach((item) => {
			item.removeEventListener('click', this.pageGo);
		});

	}
	//act - 확대축소
	actZoom = (e) => {
		console.log('actZoom', e)
		const _btn = e.currentTarget;
		const state = _btn.dataset.zoomState;
		const viewer_book = document.querySelector('.dmex-ebook--viewer-book');
		const viewer_body = document.querySelector('.dmex-ebook--viewer-body');
		const zoom_progress = document.querySelector('.dmex-ebook--viewer-zoom-progress input');
		switch (state) {
			case 'plus': 
				viewer_book.dataset.zoomArea = Number(viewer_book.dataset.zoomArea) + 0.5;
				viewer_body.dataset.zoomState = 'true';
				break;
			case 'minus':
				viewer_book.dataset.zoomArea = Number(viewer_book.dataset.zoomArea) - 0.5;

				if (viewer_book.dataset.zoomArea === '1') {
					viewer_book.style.transform = `translate(0, 0)`;
					viewer_body.dataset.zoomState = 'false';
				}
				break;
		}
		zoom_progress.value = 100 - ((5 - Number(viewer_book.dataset.zoomArea)) / 4 * 100);
		viewer_book.dataset.zoomArea = Number(viewer_book.dataset.zoomArea) < 1 ? 1 : Number(viewer_book.dataset.zoomArea) > 5 ? 5 : viewer_book.dataset.zoomArea;
		viewer_book.style.zoom = viewer_book.dataset.zoomArea;
	}
	actProgress = (e) => {
		const _this = e.currentTarget;
		const _x = 4; //최대 5배
		const _v = Number(_this.value);
		const _zoom = Math.round((_this.value * _x / 100) + 1); 
		const viewer_book = document.querySelector('.dmex-ebook--viewer-book');
		const viewer_body = document.querySelector('.dmex-ebook--viewer-body');

		if (_v > 0) {
			viewer_body.dataset.zoomState = 'true';
			viewer_book.dataset.zoomArea = _zoom;
			viewer_book.style.zoom = _zoom;
		} else {
			this.zoomReset()
		}
	}
	//act - zoom 확대이동
	actStart = (e) => {
		const viewer_book = document.querySelector('.dmex-ebook--viewer-book');
		const viewer_main = document.querySelector('.dmex-ebook--viewer-main');

		if (viewer_book.dataset.zoomArea === '1') {
			return false;
		}
		
		let start_x = !!e.clientX ? e.clientX : e.targetTouches[0].clientX;
		let start_y = !!e.clientY ? e.clientY : e.targetTouches[0].clientY;
		let move_x = 0;
		let move_y = 0;
		let _matrix = window.getComputedStyle(viewer_book).transform;
		const _matrix_l = Number(_matrix.split(',')[4]);
		const _matrix_t = Number(_matrix.split(',')[5].split(')')[0]);

		viewer_book.style.transform = `translate(${_matrix_l}px, ${_matrix_t}px)`;

		const actMove = (e) => {
			move_x = !!e.clientX ? e.clientX : e.targetTouches[0].clientX;
			move_y = !!e.clientY ? e.clientY : e.targetTouches[0].clientY;

			viewer_book.style.transform = `translate(calc(${_matrix_l + move_x - start_x}px), calc(${_matrix_t + move_y - start_y}px))`;
		}
		const actEnd = () => {
			viewer_main.removeEventListener('mousemove', actMove);
			viewer_main.removeEventListener('mouseup', actEnd);
			viewer_main.removeEventListener('touchmove', actMove);
			viewer_main.removeEventListener('touchend', actEnd);
		}
		viewer_main.addEventListener('mouseup', actEnd);
		viewer_main.addEventListener('touchend', actEnd);
		viewer_main.addEventListener('mousemove', actMove);
		viewer_main.addEventListener('touchmove', actMove);
	}
	//act - page이동
	pageMove = (e) =>  {
		const _this = e.target;
		const _data = _this.dataset.act;
		const _util = document.querySelector('.dmex-ebook--viewer-util');
		const _range = document.querySelector('.dmex-ebook--viewer-zoom-progress input');
		_range.value = 0;

		clearTimeout(this.timer_auto);
		_util.dataset.auto = false;
		switch (_data) {
			case 'prev': 
				UI.ebook[this.id].flipPrev();
				this.auto_current = this.auto_current - 1;
				this.auto_current < 0 ? this.auto_current = 0 : '';

				console.log(this.auto_current)
				break;
			case 'next': 
				UI.ebook[this.id].flipNext(); 
				this.auto_current = this.auto_current + 1;
				this.auto_current > UI.ebook[this.id].getPageCount() - 1 ? this.auto_current = UI.ebook[this.id].getPageCount() - 1 : '';

				console.log(this.auto_current)
				break;
			case 'first': 
				
				setTimeout(() => {
					UI.ebook[this.id].turnToPage(0); 
					this.auto_current = 0;
				},400);
				break;
			case 'last': 
				console.log(UI.ebook[this.id].getPageCount()-1);
				setTimeout(() => {
					UI.ebook[this.id].turnToPage(UI.ebook[this.id].getPageCount() - 1); 
				
				},400);
				break;
		}
		this.zoomReset();
	}
	//act - list page go
	pageGo = (e) => {
		const _this = e.currentTarget;
		const _num = Number(_this.dataset.pageNum);

		clearTimeout(this.timer_auto);
		this.util.dataset.auto = false;
		this.auto_current = _num;
		UI.ebook[this.id].turnToPage(_num); 
		this.zoomReset();
	}
	//act - auto play stop
	utilAct = (e) => {
		const _this = e.target;
		const _data = _this.dataset.act;
		const viewer_wrap = document.querySelector('.dmex-ebook--viewer-wrap');
		console.log(_data)
		switch (_data) {
			case 'auto': 
				this.autoPlayStop(); 
				break;
			case 'list': 
				if (viewer_wrap.dataset.listState === 'true') {
					viewer_wrap.dataset.listState = 'false';
				} else {
					viewer_wrap.dataset.listState = 'true';
				}
				break;
			case 'full': 
				if (UI.state.device.mobile) {
					console.log('모바일 전체')
					if (document.querySelector('body.ebook-full')) {
						document.querySelector('body').classList.remove('ebook-full');
					} else {
						document.querySelector('body').classList.add('ebook-full');
					}
				} else {
					if (!document.fullscreenElement) {
						this.viewer.requestFullscreen(); 
						this.viewer.dataset.full = 'true';
						
						setTimeout(() => {
							this.pageReset();
							this.set();
						},500)
					} else {
						if (document.exitFullscreen) {
							this.viewer.dataset.full = 'false';
							document.exitFullscreen();
							setTimeout(() => {
								this.pageReset();
								this.set();
							},500);
						}
					}
				}
				break;
		}
	}
	destory() {
		this.eventCancle();
		const viewer_main = document.querySelector('.dmex-ebook--viewer-main');
		this.resizeObserver.unobserve(viewer_main);
		UI.ebook[this.id].destroy();
	}
}

class ScrollPage {
	constructor() {
		this.el_wrap = document.querySelector('.mdl-scroll');
		if (!this.el_wrap) {
			this.el_wrap = document.querySelector('html');
		}
		this.el_items = this.el_wrap.querySelectorAll('[data-scroll-callback]');
		this.sctop = this.el_wrap.scrollTop;
		this.wraph = this.el_wrap.offsetHeight;
		this.ary_top_s = [];
		this.ary_top_e = [];
		this.init();
	}
	init() {
		for (let item of this.el_items) {
			const rect = item.getBoundingClientRect();
			this.ary_top_s.push(rect.top + this.sctop - this.wraph)
			this.ary_top_e.push(rect.top + this.sctop);
		}

		console.log(this.ary_top_s, this.ary_top_e);

		const act = () => {
			const n = this.el_wrap.scrollTop;
			for (let i = 0, len = this.ary_top_s.length; i < len; i++) {
				const n_s = Number(this.ary_top_s[i]);
				const n_e = Number(this.ary_top_e[i]);
				if (n_s < n && n_e > n) {
					const _n = n_e - n_s;
					const __n = n - n_s;
					let per = Math.round((__n / _n * 100) * 1.2);
					const _name = this.el_items[i].dataset.scrollCallback;

					per > 100 ? per = 100 : '';
					UI.callback[_name] && UI.callback[_name]({
						percent: per,
						element: this.el_items[i],
					});
				}
			}
		}
		act();
		window.addEventListener('scroll', act);
	}
}

class ToggleUI {
	constructor(opt) {
		this.scope = !!opt ? opt.scope : false;
		this.objects = this.scope ? this.scope.querySelectorAll('[data-toggle-object]') : document.querySelectorAll('[data-toggle-object]');
		this.init();
	}
	init() {
		for (let item of this.objects) {
			if (item.dataset.event !== 'on') {
				item.dataset.event = 'on';
				item.removeEventListener('click', this.actClick);
				item.addEventListener('click', this.actClick);
			}
		}
	}
	actClick = (e) => {
		const type = e.type;
		const el_object = e.currentTarget;
		const callbackName = el_object.dataset.callback;
		const is_name = el_object.dataset.toggleObject;
		const el_objects = document.querySelectorAll('[data-toggle-object="' + is_name + '"]');
		const el_target = document.querySelector('[data-toggle-target="' + is_name + '"]');

		let data_state = el_object.dataset.toggleState;
		let is_state = data_state !== 'true' ? 'true' : 'false';

		for (let item of el_objects) {
			item.dataset.toggleState = is_state;
		}

		// el_object.dataset.toggleState = is_state;
		!!el_target ? el_target.dataset.toggleState = is_state : '';

		!!callbackName && UI.callback[callbackName]({
			state: is_state,
			event: type,
			name: is_name
		});
	}
	actHover = (e) => {
		const el_object = e.currentTarget;
		const callbackName = el_object.dataset.callback;
		const is_name = el_object.dataset.toggleObject;
		const el_target = document.querySelector('[data-toggle-target="' + is_name + '"]');

		el_object.dataset.toggleEvent = 'hover';

		!!callbackName && UI.callback[callbackName]({
			state: if_state,
			event: 'hover',
			name: is_name
		});
	}
}

class Tab {
	constructor(opt) {
		this.current = opt.current ? opt.current : false;
		this.id = opt.id;
		this.callback = opt.callback;
		this.tab = document.querySelector('.mdl-tab[data-tab-id="' + this.id + '"]');
		this.tab_btns = this.tab.querySelectorAll('.mdl-tab-btn');
		this.pnl = document.querySelector('.mdl-tab-pnl[data-tab-id="' + this.id + '"]');
		this.items = this.pnl.querySelectorAll('.mdl-tab-item');

		this.init();
	}
	init() {
		let para = UI.parts.paraGet('tab');

		console.log(this.id, para);

		if (!!para && typeof para === 'string') {
			this.current = para;
		}

		for (let item of this.tab_btns) {
			item.addEventListener('click', this.act);
		}

		if (this.current === false) {
			!!sessionStorage.getItem(this.id) ? this.selected(sessionStorage.getItem(this.id)) : this.selected(this.tab_btns[0].dataset.tab);
		} else {
			this.selected(this.current);
		}
	}
	ps = (e) => {
		const _this = e;
		const _wrap = _this.closest('.mdl-tab');
		const _rect_wrap = _wrap.getBoundingClientRect();
		const _rect = _this.getBoundingClientRect();

		UI.scroll.move({
			selector: _wrap,
			left: (_rect.left - _rect_wrap.left) + _wrap.scrollLeft + (_rect.width / 2),
			add: 0,
			align: 'center'
		});
	}
	act = (e) => {
		const _this = e.currentTarget;
		const tab = _this.dataset.tab;
		this.selected(tab);
		this.ps(_this);
	}
	selected(tab) {
		const btn = this.tab.querySelector('.mdl-tab-btn[data-tab="' + tab + '"]');
		const _selected = this.tab.querySelector('.mdl-tab-btn[data-selected="true"]');
		const item = this.pnl.querySelector('.mdl-tab-item[data-tab="' + tab + '"]');
		const _selected_pnl = this.pnl.querySelector('.mdl-tab-item[data-selected="true"]');

		sessionStorage.setItem(this.id, tab);

		_selected ? _selected.dataset.selected = false : '';
		_selected_pnl ? _selected_pnl.dataset.selected = false : '';

		this.ps(btn);
		this.callback && this.callback({
			id: this.id,
			current: tab
		});

		btn.dataset.selected = true;
		item.dataset.selected = true;
	}
}

class Accordion {
	constructor(opt) {
		this.id = opt.id;
		this.current = opt.current;
		this.callback = opt.callback;
		this.acco = document.querySelector('.mdl-acco[data-id="' + this.id + '"]');
		this.acco_items = document.querySelectorAll('.mdl-acco[data-id="' + this.id + '"] > .mdl-acco-item');
		this.acco_wrap;
		this.acco_body;
		this.acco_item;
		this.h = 0;
		this.init();
	}

	init() {
		for (const item of this.acco_items) {
			const btn = item.querySelector('.mdl-acco-btn');

			btn.addEventListener('click', this.actToggle);
		}

		(typeof this.current === 'number') && this.show(this.current);
	}
	actToggle = (e) => {
		const _this = e.currentTarget;
		this.acco_item = _this.closest('.mdl-acco-item');
		const acco_head = _this.closest('.mdl-acco-head');
		this.acco_body = acco_head.nextElementSibling;

		if (this.acco_body) {
			this.acco_wrap = this.acco_body.children[0];
			this.h = this.acco_wrap.offsetHeight;
			this.acco_item.dataset.expanded !== 'true' ?
				this.actShow() : this.actHide();
		}
	}
	showEnd = (e) => {
		this.acco_body.style.height = 'auto';
	}
	actShow() {
		this.callback && this.callback({
			id: this.id,
			current: UI.parts.getIndex(this.acco_item)
		});
		this.acco_item.dataset.expanded = 'true';
		this.acco_body.style.height = (this.h) + 'px';
		this.acco_body.addEventListener('transitionend', this.showEnd);
	}
	actHide() {
		this.acco_wrap = this.acco_body.children[0];
		this.h = this.acco_wrap.offsetHeight;
		this.acco_body.style.height = (this.h) + 'px';
		this.acco_body.removeEventListener('transitionend', this.showEnd);

		setTimeout(() => {
			this.acco_item.dataset.expanded = 'false';
			this.acco_body.style.height = 0;
		}, 0);
	}

	show(v) {
		this.acco_item = this.acco_items[v];

		for (const item of this.acco_item.children) {
			if (item.classList.contains('mdl-acco-body')) {
				this.acco_body = item;
			}
		}

		this.acco_wrap = this.acco_body.children[0];
		this.h = this.acco_wrap.offsetHeight;
		this.actShow();
	}
	hide(v) {
		this.acco_item = this.acco_items[v];

		for (const item of this.acco_item.children) {
			if (item.classList.contains('mdl-acco-body')) {
				this.acco_body = item;
			}
		}

		this.acco_wrap = this.acco_body.children[0];
		this.h = this.acco_wrap.offsetHeight;
		this.acco_body.style.height = (this.h) + 'px';
		this.acco_body.removeEventListener('transitionend', this.showEnd);

		setTimeout(() => {
			this.acco_item.dataset.expanded = 'false';
			this.acco_body.style.height = 0;
		}, 0);
	}
	allHide() {
		for (const item of this.acco_items) {
			item.dataset.expanded = 'false';
			const _body = item.querySelector('.mdl-acco-body');
			_body ? _body.style.height = 0 : '';
		}
	}
	allShow() {
		for (const item of this.acco_items) {
			item.dataset.expanded = 'true';
			const _body = item.querySelector('.mdl-acco-body');
			_body ? _body.style.height = 'auto' : '';
		}
	}
}

class Layer {
	constructor(opt) {
		const defaults = {
			type: 'modal', // 
			classname: '',

			//system
			ps: 'BL',

			//toast
			delay: 'short', // short[2s] | long[3.5s]
			status: 'off',  //assertive[중요도 높은 경우] | polite[중요도가 낮은 경우] | off[default]
			auto: true,
		};

		this.opt = Object.assign({}, defaults, opt);
		this.el = {
			html: document.querySelector('html'),
			body: document.querySelector('body'),
			pageScroll: document.querySelector('[data-pagescroll]') ?? document.querySelector('html'),
			modal: null,
			modal_wrap: null,
			btn_close: null,
			last_layer: null,
		}

		this.id = opt.id;
		this.src = opt.src;
		this.type = !opt.type ? 'modal' : opt.type;
		this.classname = opt.classname ? opt.classname : '',
			this.callback = opt.callback;
		this.callback_close = opt.callback_close;

		//system 
		this.ps = opt.ps ?? 'BL';
		this.title = opt.title;
		this.btn = opt.button;

		//toast
		this.delay = opt.delay ? opt.delay : 'short',
			this.delaytime = this.delay === 'short' ? 2000 : 3500; //short[2s] | long[3.5s]
		this.status = opt.status ? opt.status : 'off',
			//assertive[중요도 높은 경우] | polite[중요도가 낮은 경우] | off[default]
			this.auto = opt.auto ? opt.auto : true,

			//system & toast
			this.content = opt.content;

		this.html = document.querySelector('html');
		this.el_body = document.querySelector('body');
		this.modal;
		this.btn_close;
		this.modal_wrap;
		this.ok;
		this.cancel;
		this.last;
		this.focus;
		this.pageScroll = document.querySelector('[data-pagescroll]') ?? document.querySelector('html');
		this.select;
		this.select_btn;

		//tooltip
		this.el_tooltip_btns;

		this.isFocus = false;
		this.timer;

		switch (this.opt.type) {
			case 'system':
				this.madeSystem();
				break;

			case 'toast':
				this.madeToast();
				break;

			case 'select':
				if (!!document.querySelector('[data-id="' + this.id + '"]')) {
					this.resetSelect();
					this.madeSelect();
				}
				break;

			case 'tooltip':
				this.tooltip();
				break;

			default: // modal, bottom, dropdown
				if (this.opt.src) {
					this.setFetch();
				}
				else {
					this.el.modal = document.querySelector('.mdl-layer[data-id="' + this.opt.id + '"]');

					this.modal = document.querySelector('.mdl-layer[data-id="' + this.opt.id + '"]');
					this.btn_close = this.modal.querySelector('.mdl-layer-close');
					this.modal_wrap = this.modal.querySelector('.mdl-layer-wrap');

					switch (this.opt.type) {
						case 'modal':
							this.modal.dataset.type = 'modal';
							break;
						case 'bottom':
							this.modal.dataset.type = 'bottom';
							break;
						case 'dropdown':
							this.modal.dataset.type = 'dropdown';
							break;
					}

					this.init();
				}
				break;
		}
	}
	resetSelect() {
		this.selectBtn = document.querySelector('.mdl-select-btn[data-select-id="' + this.id + '"]');
		this.selectLayer = document.querySelector('.mdl-layer[data-type="select"][data-select-id="' + this.id + '"]');

		this.selectBtn && this.selectBtn.remove();
		this.selectLayer && this.selectLayer.remove();
	}
	madeSelect() {
		this.select = document.querySelector('.mdl-select[data-id="' + this.id + '"]');
		const select = this.select.querySelector('select');
		const options = select.querySelectorAll('option');

		let html = '<button type="button" class="mdl-select-btn" data-select-id="' + this.id + '_select" value="' + select.value + '" tabindex="-1" role="combobox" aria-haspopup="listbox" aria-expanded="false"><span>' + select.querySelector('[selected]').text + '</span></button>';
		this.select.insertAdjacentHTML('beforeend', html);

		html = '';
		html += '<section class="mdl-layer" data-id="' + this.id + '_select" data-type="select" role="listbox">';
		html += '<div class="mdl-layer-wrap">';
		html += '   <div class="mdl-layer-header">';
		html += '       <h2>' + select.title + '</h2>';
		html += '       <button type="button" class="mdl-layer-close" data-material="close"  aria-label="닫기"></button>';
		html += '   </div>';
		html += '    <div class="mdl-layer-body">';
		html += '       <ul class="mdl-select-wrap">';

		for (let i = 0, len = options.length; i < len; i++) {
			html += '<li>';
			html += '<input type="radio" id="' + this.id + '_r' + i + '" value="' + options[i].value + '"  name="' + this.id + '_r" ' + ((options[i].selected) && 'checked') + '>';
			html += '<label for="' + this.id + '_r' + i + '" class="mdl-select-option" data-type="radio" data-value="' + options[i].value + '" role="option"><span>' + options[i].text + '</span></label></li>';
		}

		html += '       </ul>';
		html += '   </div>';
		html += '</div>';
		html += '<div class="mdl-layer-dim"></div>';
		html += '</section>';

		document.querySelector('body').insertAdjacentHTML('beforeend', html);

		html = '';
		this.modal = document.querySelector('.mdl-layer[data-id="' + this.id + '_select"]');
		this.modal_wrap = this.modal.querySelector('.mdl-layer-wrap');
		this.btn_close = this.modal.querySelector('.mdl-layer-close');
		this.select_btn = this.select.querySelector('.mdl-select-btn');

		select.addEventListener('change', (e) => {
			let _this = e.currentTarget;
			this.select_btn.querySelector('span').textContent = _this.querySelector('option:checked').textContent;
			this.select_btn.value = _this.value;
		});

		this.select_btn.addEventListener('click', this.show);
		this.init();
	}
	madeToast() {
		let html = '';
		html = '<div class="mdl-layer ' + this.classname + '" data-id="' + this.id + '" data-type="toast" aria-live="' + this.status + '">';
		html += '   <div class="mdl-layer-wrap">';
		html += '       <div class="mdl-layer-body">' + this.content + '</div>';
		!this.auto ?
			html += '       <button type="button" class="mdl-layer-close" data-material="close" aria-label="닫기"></button>' : '';
		html += '   </div>';
		html += '</div>';

		this.el_body.insertAdjacentHTML('beforeend', html);
		this.modal = document.querySelector('.mdl-layer[data-id="' + this.id + '"]');
		this.modal_wrap = this.modal.querySelector('.mdl-layer-wrap');

		this.init();
	}
	madeSystem() {
		//alert & confirm
		let html = '';
		html += '<section class="mdl-layer" data-id="' + this.id + '" data-type="alert">';
		html += '<div class="mdl-layer-wrap">';
		html += '    <div class="mdl-layer-body">';
		if (!!this.title) {
			html += '        <h1 class="mdl-layer-tit">' + this.title + '</h1>';
		}
		html += '        <div>' + this.content + '</div>';
		html += '        <div class="mdl-btn-wrap">';
		if (this.btn.length === 2) {
			html += '            <button type="button" class="mdl-btn" data-state="cancel" data-style="primary-gray">';
			html += '                <span>' + this.btn[1].text + '</span>';
			html += '            </button>';
		}
		html += '            <button type="button" class="mdl-btn" data-state="ok" data-style="primary">';
		html += '                <span>' + this.btn[0].text + '</span>';
		html += '            </button>';
		html += '        </div>';
		html += '    </div>';
		html += '</div>';
		html += '<div class="mdl-layer-dim"></div>';
		html += '</section>';

		document.querySelector('body').insertAdjacentHTML('beforeend', html);

		html = null;
		this.modal = document.querySelector('.mdl-layer[data-id="' + this.id + '"]');
		this.modal_wrap = this.modal.querySelector('.mdl-layer-wrap');
		this.ok = this.modal.querySelector('.mdl-btn[data-state="ok"]');
		this.cancel = this.modal.querySelector('.mdl-btn[data-state="cancel"]');

		this.ok && this.ok.addEventListener('click', this.btn[0].callback);
		this.cancel && this.cancel.addEventListener('click', this.btn[1].callback);

		this.init();
	}
	setFetch() {
		UI.parts.include({
			id: 'body',
			src: this.opt.src,
			type: 'HTML',
			insert: true,
			callback: () => {
				let _btn = document.createElement('button');
				_btn.type = 'button';
				_btn.setAttribute('aria-lable', '마지막 구간입니다. 클릭하시면 닫힙니다.');
				_btn.classList.add('mdl-layer-last');

				this.el.modal = document.querySelector('.mdl-layer[data-id="' + this.id + '"]');
				this.el.btn_close = this.el.modal.querySelector('.mdl-layer-close');
				this.el.modal_wrap = this.el.modal.querySelector('.mdl-layer-wrap');
				// this.el.modal_wrap.appendChild(_btn);
				this.el.last_layer = this.el.modal.querySelector('.mdl-layer-last');

				this.modal = document.querySelector('.mdl-layer[data-id="' + this.id + '"]');
				this.btn_close = this.modal.querySelector('.mdl-layer-close');
				this.modal_wrap = this.modal.querySelector('.mdl-layer-wrap');

				this.modal_wrap.appendChild(_btn);
				this.last = this.modal.querySelector('.mdl-layer-last');

				switch (this.type) {
					case 'modal':
						this.modal.dataset.type = 'modal';
						break;

					case 'dropdown':
						this.modal.dataset.type = 'dropdown';
						break;

					case 'tooltip':
						this.modal.dataset.type = 'tooltip';
						break;

					case 'select':
						this.modal.dataset.type = 'select';
						break;

					case 'toast':
						this.modal.dataset.type = 'toast';
						break;
				}

				this.init();
			}
		});
	}
	tooltip() {
		this.el_tooltip_btns = document.querySelectorAll('[data-tooltip]');

		for (let item of this.el_tooltip_btns) {
			item.addEventListener('mouseover', this.actTooltipShow);
			item.addEventListener('mouseleave', this.actTooltipHide);
		}
	}
	init() {
		//focus loop
		const keyStart = (e) => {
			if (e.shiftKey && e.keyCode == 9) {
				e.preventDefault();
				this.last.focus();
			}
		}
		const keyEnd = (e) => {
			if (!e.shiftKey && e.keyCode == 9) {
				e.preventDefault();
				this.btn_close.focus();
			}
		}

		this.btn_close && this.btn_close.removeEventListener('click', this.hide);
		this.btn_close && this.btn_close.addEventListener('click', this.hide);
		this.last && this.last.removeEventListener('click', this.hide);
		this.last && this.last.addEventListener('click', this.hide);
		this.btn_close && this.btn_close.addEventListener('keydown', keyStart);
		this.last && this.last.addEventListener('keydown', keyEnd);

		this.type === 'tooltip' && this.show();
	}
	actToastShow = (e) => {
		this.madeToast();
	}
	actTooltipShow = (e) => {
		const _this = e.currentTarget;
		this.src = _this.dataset.tooltip;
		this.id = _this.getAttribute('aria-describedby');
		this.setFetch();
	}
	actTooltipHide = (e) => {
		const _this = e.currentTarget;
		const _id = _this.getAttribute('aria-describedby');
		const _files = document.querySelectorAll('[data-usage="' + _id + '"]');
		const _tooltip = document.querySelector('#' + _id);

		for (let item of _files) {
			item.remove();
		}
		_tooltip.remove();
	}
	actSelected = (e) => {
		let _this = e.currentTarget;

		if (_this.type === 'radio') {
			_this = this.modal.querySelector('.mdl-select-option[for="' + _this.id + '"]');
		}
		this.select.querySelector('.mdl-select-btn span').textContent = _this.textContent;
		this.select.querySelector('.mdl-select-btn').value = _this.dataset.value;
		this.select.querySelector('select option[value="' + _this.dataset.value + '"]').selected = true;

		e.type !== 'keyup' && this.hide();

		this.callback && this.callback({
			text: _this.textContent,
			value: _this.dataset.value
		});
	}
	show = (e) => {
		if (this.type === 'toast') {
			if (this.modal.dataset.state === 'show') {
				console.log('열려있음');
				return false;
			}
			console.log('toast show: ', this.modal);
		}

		const _zindex = 100;
		const _prev = document.querySelector('[data-layer-current="true"]');
		let btn = false;

		(this.type === 'select') ? btn = document.querySelector('.mdl-select-btn[data-select-id="' + this.id + '_select"]') : '';
		(this.type === 'dropdown') ? btn = document.querySelector('[data-dropdown="' + this.id + '"]') : '';
		(this.type === 'tooltip') ? btn = document.querySelector('.mdl-tooltip[aria-describedby="' + this.id + '"]') : '';

		//object position : dropdown & select & tooltip
		if (this.type === 'dropdown' || this.type === 'select' || this.type === 'tooltip') {
			const ps_info = {
				m_width: this.modal.offsetWidth,
				m_height: this.modal.offsetHeight,
				height: btn.offsetHeight,
				width: btn.offsetWidth,
				top: btn.getBoundingClientRect().top,
				left: btn.getBoundingClientRect().left,
				sc_top: this.pageScroll.scrollTop,
				sc_left: this.pageScroll.scrollLeft,
			}
			let _top, _left;

			!this.ps ? this.ps = 'BL' : '';

			switch (this.ps) {
				case 'TL':
					_top = ((ps_info.top + ps_info.sc_top) + ps_info.height) + 'px';
					_left = ((ps_info.left - ps_info.sc_left)) + 'px';
					break;
				case 'TC':
					break;
				case 'TR':
					break;
				case 'BL':
					_top = ((ps_info.top + ps_info.sc_top) + ps_info.height) + 'px';
					_left = ((ps_info.left - ps_info.sc_left)) + 'px';
					break;
				case 'BC':
					_top = ((ps_info.top + ps_info.sc_top) + ps_info.height) + 'px';
					_left = ((ps_info.left - ps_info.sc_left) + (ps_info.width / 2) - (ps_info.m_width / 2)) + 'px';
					break;
				case 'BR':
					_top = ((ps_info.top + ps_info.sc_top) + ps_info.height) + 'px';
					_left = ((ps_info.left - ps_info.sc_left) - (ps_info.m_width - ps_info.width)) + 'px';
					break;

				case 'LT':
					break;
				case 'LC':
					break;
				case 'LB':
					break;
				case 'RT':
					break;
				case 'RC':
					break;
				case 'RB':
					break;
			}

			this.modal.style.top = _top;
			this.modal.style.left = _left;
		}
		else {
			this.html.dataset.modal = 'show';
		}

		if (this.type !== 'toast' && this.type !== 'tooltip' && this.type !== 'select') {
			_prev ? _prev.dataset.layerCurrent = 'false' : '';
			this.modal.dataset.layerCurrent = 'true';
		}

		console.log(this.modal);


		this.modal || this.src && this.setFetch();
		this.modal.dataset.state = 'show';
		this.focus = document.activeElement;

		// toast, tooltip 자동 생성 자동 hidden 제외
		if (this.type !== 'toast' && this.type !== 'tooltip' && this.type !== 'select') {
			this.html.dataset.layerN = !this.html.dataset.layerN ? 1 : Number(this.html.dataset.layerN) + 1;
			this.modal.style.zIndex = Number(_zindex) + Number(this.html.dataset.layerN);
			this.modal.dataset.layerN = this.html.dataset.layerN;
		}

		this.btn_close && this.btn_close.focus();

		// select layer
		if (this.type === 'select') {
			console.log(this.select_btn.offsetWidth, this.select_btn.dataset.selectId);
			document.querySelector('.mdl-layer[data-id="' + this.select_btn.dataset.selectId + '"]').style.width = (this.select_btn.offsetWidth / 10) + 'rem';

			const el_options = this.modal.querySelectorAll('.mdl-select-option');
			const el_inputs = this.modal.querySelectorAll('input');
			const el_options_checked = this.modal.querySelector('input:checked');

			this.select_btn.setAttribute('aria-expanded', true);
			this.select_btn.removeEventListener('click', this.show);

			el_options_checked && el_options_checked.focus();

			for (let i = 0, len = el_options.length; i < len; i++) {
				el_options[i].addEventListener('click', this.actSelected);
				el_inputs[i].addEventListener('keydown', this.keyCheck);
				el_inputs[i].addEventListener('keyup', this.keyCheck);
				el_options[i].addEventListener('focusout', this.keyCheck);
				el_inputs[i].addEventListener('focusin', this.foucsOutCheck);
			}

			setTimeout(() => {
				this.html.addEventListener('click', this.backClick);
			}, 0);
		}
		else if (this.type === 'toast' && this.auto) {
			this.timer = setTimeout(() => {
				this.hide();
			}, this.delaytime);
		}

		this.callback && this.callback();

	}
	backClick = (e) => {
		//mouse click, touch 인 경우만 실행. ''값은 방향키로 이동 시
		if (e.pointerType !== '') {
			e.srcElement.querySelector('.mdl-layer[role="listbox"]') ?? this.hide();
		}

	}
	foucsOutCheck = () => {
		clearTimeout(this.timer);
	}
	keyCheck = (e) => {
		switch (e.keyCode) {
			case 13: e.type === 'keydown' && this.actSelected(e);
				break;
			case 38:
			case 40: e.type === 'keyup' && this.actSelected(e);
				break;
			default: e.type === 'keydown' ? this.timer = setTimeout(this.hide, 300) : '';
				break;
		}
	}
	hidden = () => {
		const _prev = document.querySelector('[data-layer-current="true"]');
		if (this.type !== 'toast' && this.type !== 'tooltip' && this.type !== 'select') {
			_prev.dataset.layerCurrent = 'false';
		}
		// this.modal.dataset.layerCurrent = 'true';

		this.modal_wrap.removeEventListener('animationend', this.hidden);
		this.modal.dataset.state = 'hidden';
		this.html.dataset.modal = 'hidden';

		this.select_btn && this.select_btn.setAttribute('aria-expanded', false);
		this.focus.focus();

		if (this.type !== 'toast' && this.type !== 'tooltip' && this.type !== 'select') {
			console.log(Number(this.html.dataset.layerN));
			if (Number(this.html.dataset.layerN) !== 0) {
				document.querySelector('.mdl-layer[data-layer-n="' + this.html.dataset.layerN + '"]').dataset.layerCurrent = 'true';
			}
		}

		if (this.type === 'tooltip') {
			console.log('tooltip', this.modal);
			this.modal.remove();
		}
	}
	hideAct = () => {
		clearTimeout(this.timer);
		if (this.type !== 'toast' && this.type !== 'tooltip' && this.type !== 'select') {

			console.log('hide', Number(this.html.dataset.layerN));
			this.html.dataset.layerN = Number(this.html.dataset.layerN) - 1;
		}



		this.select_btn && this.select_btn.addEventListener('click', this.show);
		this.html.removeEventListener('click', this.backClick);
		this.modal.dataset.state = 'hide';
		this.modal_wrap.addEventListener('animationend', this.hidden);
	}
	hide = () => {
		if (this.callback_close) {
			this.callback_close && this.callback_close();
		} else {
			this.hideAct();
		}
	}
}

UI.exe.autoSelect = () => {
	const select = document.querySelectorAll('.mdl-select');
	let n = 0;

	for (let item of select) {
		if (!!item.dataset.id) {
			const _id = item.dataset.id;
			if (!UI.exe[_id]) {
				UI.exe[_id] = new Layer({
					id: _id,
					type: 'select'
				});
			}

		} else {
			const _id = 'select_' + Date.now() + n;
			n = n + 1;
			item.dataset.id = _id;
			if (!UI.exe[_id]) {
				UI.exe[_id] = new Layer({
					id: _id,
					type: 'select'
				});
			}
		}
	}
}
UI.exe.autoSelect();

UI.exe.infiniteMotion = () => {
	const el_motion = document.querySelector('[data-scroll-play="off"]');
	let onoff = 'on';
	const infiniteMotion = () => {
		setTimeout(() => {
			el_motion.dataset.scrollPlay = onoff;
			onoff = onoff === 'off' ? 'on' : 'off';
		}, 1000);
		setTimeout(() => {
			infiniteMotion();
		}, 6000);
	}
	infiniteMotion();
}