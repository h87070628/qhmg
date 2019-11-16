class ComMgr {
	//常量定义
	public CONST: any = {
		DEBUG: {				//调试选项
			SHOW_NET_MSG: false,
		},
		REMOTE: 0,				//是否启用远程加载(0.否, 1.是), 开发阶段暂不使用远程资源加载
		CHANNEL: 0,				//渠道(0.web, 1.微信, 2.百度, 3.抖音, 4.华为, 5.oppo, 6.vivo)
		SERVER_URL: "https://ydmg.jys-club.com:7298/BQBServer?jData=",
		BASE_KEY: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
		THIRD_URL: "https://ydmg.jys-club.com:7298/Game/WeGames/Bqbs/pay.php",
		GUIDE_MAX: 99999,
		EVENT: {
			OPEN_DLG: "open_dlg",
			NETWORK_MSG: "network_msg",
			PASSIVE_MSG: "passive_msg",
			UPDATE_UI_MSG: "update_ui_msg",
			TRIGGER_GUIDE: "trigger_guide",
			MAP_MSG: "map_msg",
		},
		BUILD_BTN_TEXT: {
			BTN_100: "竞选",
			BTN_101: "投票",
			BTN_102: "排行",
			BTN_103: "升级",
			BTN_104: "捐赠",
			BTN_105: "信息",
			BTN_106: "租赁",
			BTN_107: "商铺",
			BTN_108: "挑战",

			//基地建筑
			BTN_300: "建造",
			BTN_301: "拆除",
			BTN_302: "升级",
			BTN_303: "生产",
			BTN_304: "收获",
			BTN_305: "仓库",
			BTN_306: "探索",
			BTN_307: "采集",
		},
		BUFF_TYPE: {
			TYPE_1: "气血",
			TYPE_2: "行动点",
			TYPE_3: "攻击",
			TYPE_4: "防御",
			TYPE_5: "行动点恢复时间",
			TYPE_6: "行动点上限",
		},
		ITEM_ICON_BG_COLOR: {
			COLOR_1: 0xFFFFFF,  // 白色
			COLOR_2: 0x61FAAB,  // 绿色
			COLOR_3: 0x709EFA,  // 蓝色
			COLOR_4: 0x8D68E8,  // 紫色
		},

		SOCKET: {
			TIME_OUT: 5000,					//心跳间隔
			MAX_MSG_LEN: 2 * 1024 * 1024,	//消息缓存上限
		},
	}

	public GLOBAL: any = {
		deviation: 0,						//客户端与服务端的误差值
	}

	private stage_: egret.Stage;
	private recv_buff: egret.ByteArray;

	//初始化全局变量
	private init_global() {
		this.GLOBAL = {
			req_array: [],					//请求队列

			be_send_msg: false,				//是否正在发送消息
			again_count: 0,					//重试次数
			last_req: {},					//最后的请求参数以及回调
			request: egret.HttpRequest,		//http请求

			wss_connect_callback: null,		//websocket连接回调

			mask_count: 0,					//遮罩打开数量

			//第三方平台登陆支付接口
			third_party: egret.HttpRequest,	//第三方服务接口
			tp_callback: Function,			//第三方服务回调


			wss_send_ing: Number(0),		//当前是否正在发送消息
			wss_send_cmd: Number,			//当前正在处理消息的id
			wss_send_callback: Function,	//当前消息的回调
			connect: {						//ws连接的各种状态
				unreadcount: 0,				//未读取的字节数量
				heartbeat: 0,				//心跳计时,大于等于TIME_OUT时,发送心跳协议
			},
		};

		this.recv_buff = new egret.ByteArray()
		this.recv_buff.endian = egret.Endian.LITTLE_ENDIAN
	}
	private websocket: egret.WebSocket = null		//websocket套接字
	public constructor(stage: egret.Stage) {
		console.log("new ComMgr")
		this.stage_ = stage;

		this.init_global()
		this.websocket = new egret.WebSocket()
		this.websocket.type = egret.WebSocket.TYPE_BINARY
		this.websocket.addEventListener(egret.Event.CONNECT, this.on_wss_connect, this)
		this.websocket.addEventListener(egret.ProgressEvent.SOCKET_DATA, this.on_wss_data, this)
		this.websocket.addEventListener(egret.Event.CLOSE, this.on_wss_close, this)
		this.websocket.addEventListener(egret.IOErrorEvent.IO_ERROR, this.on_wss_error, this)

		this.GLOBAL.third_party = new egret.HttpRequest()
		this.GLOBAL.third_party.responseType = egret.HttpResponseType.TEXT;
		this.GLOBAL.third_party.addEventListener(egret.Event.COMPLETE, this.onThirdComplete, this)
		this.GLOBAL.third_party.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onThirdError, this)
		this.GLOBAL.third_party.addEventListener(egret.ProgressEvent.PROGRESS, this.onThirdProgress, this)
		this.GLOBAL.tp_callback = null

		this.stage_.addEventListener(egret.Event.ENTER_FRAME, this.update, this);
	}

	public destroy() {

		this.websocket.removeEventListener(egret.Event.CONNECT, this.on_wss_connect, this)
		this.websocket.removeEventListener(egret.ProgressEvent.SOCKET_DATA, this.on_wss_data, this)
		this.websocket.removeEventListener(egret.Event.CLOSE, this.on_wss_close, this)
		this.websocket.removeEventListener(egret.IOErrorEvent.IO_ERROR, this.on_wss_error, this)
		//先删除事件监听,在关闭连接,防止正常关闭广播网络异常关闭事件
		this.wss_close()

		this.GLOBAL.third_party.removeEventListener(egret.Event.COMPLETE, this.onThirdComplete, this);
		this.GLOBAL.third_party.removeEventListener(egret.IOErrorEvent.IO_ERROR, this.onThirdError, this);
		this.GLOBAL.third_party.removeEventListener(egret.ProgressEvent.PROGRESS, this.onThirdProgress, this);

		this.stage_.removeEventListener(egret.Event.ENTER_FRAME, this.update, this);

		this.stage_ = null;
	}

	public gCNT() {
		return this.CONST
	}

	public gGBL() {
		return this.GLOBAL;
	}

	//各类简化语法糖
	//与具体游戏无关******************************************
	/**
    * 产生随机整数，包含下限值，但不包括上限值
    * @param {Number} lower 下限
    * @param {Number} upper 上限
    * @return {Number} 返回在下限到上限之间的一个随机整数
    */
	public random(lower: number, upper: number): number {
		return Math.floor(Math.random() * (upper - lower) + lower)
	}

	/**
     * 通过字符串,查找子控件
     * @param {cc.Node} node 父节点
     * @param {String} str 节点路径,如:{"xxx;yyy;zzz"}
     * @return {cc.Node}, 异常返回null,否则返回查找的节点
    */
	public get_node(node: fairygui.GComponent, str: string) {
		let layers = str.split(";")
		if (layers.length > 0) {
			let node_ = null
			for (let i = 0; i < layers.length; i++) {
				node_ = node.getChild(layers[i])
				if (node_) {
					node = node_
				} else {
					return null
				}
			}
			return node_
		} else {
			return null
		}
	}
	//记录客户端与服务器的时间误差
	public set_svr_deviation(dev: Number) {
		this.GLOBAL.deviation = dev
	}

	//获取当前服务器时间, 使用当前时间减去首次记录的误差时间
	//玩家修改客户端时间将导致时间异常,服务端在关键功能上需要严格验证时间误差,超过一定阈值应视为非法
	public get_s_time() {
		return ((Math.floor(Date.now() / 1000)) - this.GLOBAL.deviation)
	}

    /**
    * 获取当天的零点时间
    */
	public get_z_time() {
		let timestamp = Math.floor(Date.now() / 1000)
		let zero = timestamp - (timestamp % (24 * 60 * 60)) + (((new Date().getTimezoneOffset()) / 60) * 3600)
		return zero;
	}

	/**
	* 将秒时间转换为时分秒字符串格式
	* @param {Number} time 秒
	* @return {String} 返回时分秒格式,天转换为小时数
	*/
	public get_sfm_time(leftTime: number): string {
		let d, h, m, s;
		if (leftTime < 24 * 60 * 60) {
			if (leftTime >= 0) {
				d = Math.floor(leftTime / 60 / 60 / 24);
				h = Math.floor(leftTime / 60 / 60 % 24);
				m = Math.floor(leftTime / 60 % 60);
				s = Math.floor(leftTime % 60);
			}
			h = d * 24 + h
			if (h < 10) { h = "0" + h }
			if (m < 10) { m = "0" + m }
			if (s < 10) { s = "0" + s }
			return h + ":" + m + ":" + s
		} else {
			return "大于一天"
		}

	}
    /**
	 * 格式秒时间
	 * @param second 秒（距离1970-01-01）
	 * @param format 格式 
	 */
	public formatTime(millisecond: number, format: string = "YYYY-MM-DD hh:mm:ss"): string {

		millisecond = millisecond * 1000
		return this.formatDate(new Date(millisecond), format)
	}

	/**
   * 时间转字符串
   * @param time 时间
   * @param format 格式 
   */
	public formatDate(time: Date, format: string = "YYYY-MM-DD hh:mm:ss"): string {
		if (format.indexOf('YYYY') != -1) {
			let year = time.getFullYear()
			format = format.replace("YYYY", year.toString())
		}
		if (format.indexOf('MM') != -1) {
			let month = time.getMonth() + 1
			let _month = month > 9 ? `${month}` : `0${month}`
			format = format.replace("MM", _month)
		}
		if (format.indexOf('DD') != -1) {
			let day = time.getDate()
			let _day = day > 9 ? `${day}` : `0${day}`
			format = format.replace("DD", _day)
		}
		if (format.indexOf('hh') != -1) {
			let hour = time.getHours()
			let _hour = hour > 9 ? `${hour}` : `0${hour}`
			format = format.replace("hh", _hour)
		}
		if (format.indexOf('mm') != -1) {
			let minute = time.getMinutes()
			let _minute = minute > 9 ? `${minute}` : `0${minute}`
			format = format.replace("mm", _minute)
		}
		if (format.indexOf('ss') != -1) {
			let second = time.getSeconds()
			let _second = second > 9 ? `${second}` : `0${second}`
			format = format.replace("ss", _second)
		}
		return format
	}

	//
    /*
        var str = gMgrs["ComMgr"].B64encode("羊羊羊:admin");  
        cc.log("base64 encode:" + str);  
        //解密
        str = gMgrs["ComMgr"].B64decode(str);  
        cc.log("base64 decode:" + str);
    */
	// private method for UTF-8 encoding
	private _utf8_encode(str: string): string {
		let utftext: string = "";
		str = str.replace(/\r\n/g, "\n");
		for (let n = 0; n < str.length; n++) {
			let c = str.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}
		return utftext;
	}
	private _utf8_decode(utftext: string): string {
		let str: string = "";
		let i = 0;
		let c = 0;
		let c1 = 0;
		let c2 = 0;
		let c3 = 0;
		while (i < utftext.length) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				str += String.fromCharCode(c);
				i++;
			} else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				str += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				str += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return str;
	}

	public B64encode(input: string): string {
		let output = "";
		let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		let i = 0;
		input = this._utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output +
				this.CONST.BASE_KEY.charAt(enc1) + this.CONST.BASE_KEY.charAt(enc2) +
				this.CONST.BASE_KEY.charAt(enc3) + this.CONST.BASE_KEY.charAt(enc4);
		}
		return output;
	}

	public B64decode(input: string): string {
		let output = "";
		let chr1, chr2, chr3;
		let enc1, enc2, enc3, enc4;
		let i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = this.CONST.BASE_KEY.indexOf(input.charAt(i++));
			enc2 = this.CONST.BASE_KEY.indexOf(input.charAt(i++));
			enc3 = this.CONST.BASE_KEY.indexOf(input.charAt(i++));
			enc4 = this.CONST.BASE_KEY.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = this._utf8_decode(output);
		return output;
	}

	//下一帧运行,默认50毫秒后运行,默认只运行1次.
	public run_once(callback: Function, delay: number = 50, count: number = 1): Function {
		let timer: egret.Timer = new egret.Timer(delay, count);
		let timerComFunc = function () {
			if (count === 1) {
				timer.removeEventListener(egret.TimerEvent.TIMER_COMPLETE, timerComFunc, this);
				timer.stop();
				timer = null;
			}

			callback()
		}.bind(this)
		timer.addEventListener(egret.TimerEvent.TIMER_COMPLETE, timerComFunc, this);
		timer.start();

		//中断计时
		let stop = function () {
			timer.removeEventListener(egret.TimerEvent.TIMER_COMPLETE, timerComFunc, this);
			timer.stop();
			timer = null;
		}
		return stop
	}

	//循环执行
	public run_loop(callback: Function, delay: number = 50): Function {
		let timer: egret.Timer = new egret.Timer(delay, 0);
		let timerComFunc = function () {
			callback()
		}.bind(this)
		timer.addEventListener(egret.TimerEvent.TIMER, timerComFunc, this);
		timer.start();

		//中断计时
		let stop = function () {
			timer.removeEventListener(egret.TimerEvent.TIMER, timerComFunc, this);
			timer.stop();
			timer = null;
		}
		return stop
	}

	//被动回调
	private passive_cb(event: egret.Event): void {
		if (this.GLOBAL.passive !== null) {
			let rsp = <egret.HttpRequest>event.currentTarget;
			let jdata = this.B64decode(rsp.response);
			let msg = JSON.parse(jdata)

			//分发被动消息
			gMgrs["DataMgr"].passive_msg(msg)

			this.GLOBAL.passive.removeEventListener(egret.Event.COMPLETE, this.passive_cb, this);
			this.GLOBAL.passive = null
		}
	}
	//
	//允许失败的http消息(定时拉取主城变动,红点提示的消息,相当于服务器主动推送消息).
	//不需要遮罩
	//发送被动消息
	public send_passive(param) {
		if (this.GLOBAL.passive) {
			this.GLOBAL.passive.removeEventListener(egret.Event.COMPLETE, this.passive_cb, this);
			this.GLOBAL.passive = null
		}

		//对数据进行BASE64加密
		let str = this.B64encode(JSON.stringify(param));
		let url_ = this.CONST.SERVER_URL + str
		this.GLOBAL.passive = new egret.HttpRequest()
		this.GLOBAL.passive.responseType = egret.HttpResponseType.TEXT;
		this.GLOBAL.passive.open(url_, egret.HttpMethod.GET);
		this.GLOBAL.passive.addEventListener(egret.Event.COMPLETE, this.passive_cb, this);
		this.GLOBAL.passive.send();
	}

	//重新发送网络请求
	public send_timeout() {
		this.GLOBAL.again_count += 1

		//关闭遮罩层
		this.close_mask()

		gMgrs["ComMgr"].run_once(function () {
			if (this.GLOBAL.again_count > 2) {
				this.GLOBAL.again_count = 0
				//gMgrs["ComMgr"].open_ntf({title:"提示", content:"网络请求失败,请检查网络.", btn_title: "返回", callback: function(){this.print_()}.bind(this)})
			} else {
				//重发网络请求
				this.GLOBAL.be_send_msg = false
				this.send_https(this.GLOBAL.last_req.param_, this.GLOBAL.last_req.callback_)
			}
		}.bind(this))
	}

	/*
	不允许失败的http消息
	自动重发3次,3次重发失败后弹出确认框,点击回到加载界面.
	*/
	public send_https(param, callback) {
		if (this.GLOBAL.be_send_msg) {
			gMgrs["ComMgr"].open_float("请求中,请稍后重试.")
		} else {
			let str = this.B64encode(JSON.stringify(param));
			let url_ = this.CONST.SERVER_URL + str

			//保存参数以备重发
			this.GLOBAL.be_send_msg = true
			this.GLOBAL.last_req = { param_: param, callback_: callback }

			this.GLOBAL.request = new egret.HttpRequest()
			this.GLOBAL.request.responseType = egret.HttpResponseType.TEXT;
			this.GLOBAL.request.open(url_, egret.HttpMethod.GET);

			let onComplete: Function;
			let stop: Function = this.run_once(function () {
				if (this.GLOBAL.request === null) {
					//6秒后正常通信
					console.log("正常通信")
				} else {
					this.GLOBAL.request.abort()
					this.GLOBAL.request.removeEventListener(egret.Event.COMPLETE, onComplete, this);
					this.GLOBAL.request = null

					//重发
					this.send_timeout()
					console.log("重新请求")
				}
			}.bind(this), 6000)

			onComplete = function (event: egret.Event): void {
				stop();

				this.GLOBAL.be_send_msg = false
				this.GLOBAL.again_count = 0

				let rsp = <egret.HttpRequest>event.currentTarget;
				let jdata = this.B64decode(rsp.response);
				if (this.CONST.DEBUG.SHOW_NET_MSG) {
					console.log("recv: " + jdata)
				}
				let msg = JSON.parse(jdata)

				//数据优先交给DataMgr处理, 然后是各个mgr, 最后才是dlg(消息通知的方式)
				msg.mID = param.cmd
				gMgrs["DataMgr"].process_msg(msg)

				this.GLOBAL.request.removeEventListener(egret.Event.COMPLETE, onComplete, this);
				this.GLOBAL.request = null

				//关闭遮罩层
				this.close_mask()

				//交给回调处理
				callback(msg)
			}.bind(this)
			this.GLOBAL.request.addEventListener(egret.Event.COMPLETE, onComplete, this);
			this.GLOBAL.request.send();

			//开启遮罩层
			this.open_mask()
		}
	}

	//发送网络请求
	public sends(_param, _callback) {
		this.GLOBAL.req_array.push({ param: _param, callback: _callback })
	}

	//每帧检测是否存在消息需要发送
	public update(dt) {
		let global_ = this.GLOBAL

		//当前 没有正在发送的消息 且 不处于消息重发状态
		if (global_.be_send_msg === false && global_.again_count === 0) {
			let req_arr = global_.req_array
			let req = null
			if (req_arr.length > 0) {
				req = req_arr.shift()
				//if(typeof(req) === "object")
				if (this.CONST.DEBUG.SHOW_NET_MSG) {
					console.log("send: " + JSON.stringify(req.param))
				}
				this.send_https(req.param, req.callback)
			}
		}

		this.onProcess(dt)
	}

	//连接
	public wss_connect(url: string, callback: Function) {
		if (this.websocket.connected === false && !this.GLOBAL.wss_connect_callback) {
			this.websocket.connectByUrl(url)
			this.GLOBAL.wss_connect_callback = callback
		} else {
			console.log("wss instance was connect...");
		}
	}

	//发送
	//let jmsg = { cmd: 10000, ["unique"]: 1, ["a"]: 1 }
	/*
	public wss_send(jmsg: any, callback: Function) {
		if (this.websocket.connected === true || !this.GLOBAL.wss_send_callback) {
			gMgrs["ComMgr"].open_mask()
			if (this.CONST.DEBUG.SHOW_NET_MSG) {
				console.log("send: " + jmsg)
			}
			let msg = gMgrs["ComMgr"].B64encode(JSON.stringify(jmsg));
			let bytes: egret.ByteArray = new egret.ByteArray()
			bytes.writeUTF(msg)
			this.websocket.writeBytes(bytes)

			//设置回调
			this.GLOBAL.wss_send_cmd = jmsg.cmd
			this.GLOBAL.wss_send_callback = callback
		} else {
			console.log("wss instance wasn't connect...");
		}
	}
	*/

	//发送二进制
	public wss_send_binary(id: Number, data: any, callback: Function): Boolean {
		if (this.CONST.DEBUG.SHOW_NET_MSG) {
			console.log("send: " + id)
		}
		if (this.websocket.connected === true && (this.GLOBAL.wss_send_ing === 0)) {
			if (id === 2) {
				//心跳消息不加遮罩
			} else {
				gMgrs["ComMgr"].open_mask()
				this.GLOBAL.wss_send_ing = 1
			}

			let bytes: egret.ByteArray = gMgrs["PackageMgr"].gen_package(id, data)
			//console.log(bytes.toString())
			this.websocket.writeBytes(bytes)

			//设置回调
			this.GLOBAL.wss_send_cmd = id
			this.GLOBAL.wss_send_callback = callback
		} else {
			console.log("Error: wss instance wasn't send...");
		}
		return true
	}

	//关闭
	public wss_close() {
		if (this.websocket.connected === true) {
			this.websocket.close()
		} else {
			console.log("wss instance wasn't opening...");
		}
	}

	public on_wss_connect() {
		console.log("wss connect succ")
		this.GLOBAL.wss_connect_callback()
		this.GLOBAL.wss_connect_callback = null
	}

	public onProcess(dt) {
		//处理心跳
		if (this.websocket.connected === true) {
			if (this.GLOBAL.connect.heartbeat === 0) {
				this.GLOBAL.connect.heartbeat = egret.getTimer()
			}
			if (egret.getTimer() - this.GLOBAL.connect.heartbeat >= this.CONST.SOCKET.TIME_OUT) {
				this.GLOBAL.connect.heartbeat = 0

				let data = {}
				data["Time"] = "201908031432"
				gMgrs["ComMgr"].wss_send_binary(2, data, function (data) {
					//console.log("net return ...")
					//console.log(data)
				}.bind(this))
			}
		}

		//解析消息
		this.GLOBAL.connect.unreadcount = this.recv_buff.length - this.recv_buff.position
		if (this.GLOBAL.connect.unreadcount >= 4) {
			let length = this.recv_buff.readShort()
			if (this.recv_buff.length >= (length - 2)) {
				let index = this.recv_buff.readShort()

				if (this.CONST.DEBUG.SHOW_NET_MSG) {
					console.log("recv: " + index)
				}

				let data = { "mID": 0 }
				data["mID"] = index
				gMgrs["PackageMgr"].ana_package(index, this.recv_buff, data)

				let mType = gMgrs["PackageMgr"].get_message_type(index)
				if (mType === -1) {
					//被动消息(心跳消息)
					gMgrs["DataMgr"].passive_msg(data)
				} else {
					//主动消息
					gMgrs["DataMgr"].process_msg(data)
					if (this.GLOBAL.wss_send_cmd === mType) {
						if (typeof (this.GLOBAL.wss_send_callback) === "function") {
							this.GLOBAL.wss_send_ing = 0
							this.GLOBAL.wss_send_callback(data)
							//this.GLOBAL.wss_send_callback = null		//函数调用时,会重新设置wss_send_callback, 这里重置会导致重新设置的回调被清空
						}
						gMgrs["ComMgr"].close_mask()
					}
				}

				//处理完一条消息后维护消息缓存(删除已处理的字节,保留未处理的字节)
				if (this.recv_buff.length > this.CONST.SOCKET.MAX_MSG_LEN) {
					let bytes_: egret.ByteArray = new egret.ByteArray()
					bytes_.endian = egret.Endian.LITTLE_ENDIAN

					this.recv_buff.readBytes(bytes_)
					this.recv_buff.clear()

					bytes_.readBytes(this.recv_buff)
					console.log("clear cache ... ")
				}
			}
		}
	}

	public on_wss_data(e: egret.Event) {
		let length = this.recv_buff.length;
		this.websocket.readBytes(this.recv_buff, length)

		/*
		let buff = new egret.ByteArray()
		this.websocket.readBytes(buff)
		let json = buff.readUTF()
		let jret = gMgrs["ComMgr"].B64decode(json);
		let msg = JSON.parse(jret)
		if (this.CONST.DEBUG.SHOW_NET_MSG) {
			console.log("recv: " + msg)
		}
		msg.mID = msg.data.param_.cmd
		if (msg.data.param_.cmd >= 50000) {
			//被动消息
			gMgrs["DataMgr"].passive_msg(msg)

		} else {
			gMgrs["DataMgr"].process_msg(msg)

			if (this.GLOBAL.wss_send_cmd === msg.mID) {
				if (typeof (this.GLOBAL.wss_send_callback) === "function") {
					this.GLOBAL.wss_send_callback(msg)
					this.GLOBAL.wss_send_callback = null
				}
				gMgrs["ComMgr"].close_mask()
			}
		}
		*/
	}

	public on_wss_close() {
		gMgrs["ComMgr"].close_mask()
		console.log("wss has closed")

		//广播网络发生关闭
		gMgrs["ComMgr"].open_ntf({
			callback: function () {
				gMgrs["EventMgr"].sendEvent("RESTART", { TYPE: 0 })
			}.bind(this), title: "提示框", content: "网络连接已断开,请重新登陆", btn_title: "确定"
		})
	}

	public on_wss_error() {
		gMgrs["ComMgr"].close_mask()
		console.log("wss happen error")

		//广播网络出现错误
		gMgrs["ComMgr"].open_ntf({
			callback: function () {
				gMgrs["EventMgr"].sendEvent("RESTART", { TYPE: 0 })
			}.bind(this), title: "提示框", content: "网络发生错误,请重新登陆", btn_title: "确定"
		})
	}

	public send_third_request(params: String, callback: Function) {
		gMgrs["ComMgr"].open_mask()
		this.GLOBAL.tp_callback = callback
		this.GLOBAL.third_party.open(this.CONST.THIRD_URL, egret.HttpMethod.POST);
		this.GLOBAL.third_party.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		this.GLOBAL.third_party.send(params);
	}

	public onThirdComplete(event: egret.Event) {
		if (typeof (this.GLOBAL.tp_callback) === "function") {
			var request = <egret.HttpRequest>event.currentTarget;
			console.log("get third data : ", request.response);
			this.GLOBAL.tp_callback(JSON.parse(request.response))
			gMgrs["ComMgr"].close_mask()
		}
	}

	public onThirdError(event: egret.IOErrorEvent) {
		gMgrs["ComMgr"].close_mask()
		gMgrs["ComMgr"].open_ntf({
			callback: function () {
				gMgrs["EventMgr"].sendEvent("RESTART", { TYPE: 0 })
			}.bind(this), title: "提示框", content: "网络发生错误,请重新登陆", btn_title: "确定"
		})
	}

	public onThirdProgress() {
	}

	//监听点击事件
	public touch_btn(btn: fairygui.GButton, callback: Function, obj: any) {
		btn.addEventListener(egret.TouchEvent.TOUCH_TAP, callback, obj);
	}

	//反监听点击事件
	public untouch_btn(btn: fairygui.GButton, callback: Function, obj: any) {
		btn.removeEventListener(egret.TouchEvent.TOUCH_TAP, callback, obj);
	}

	//打开遮罩
	public open_mask() {
		if (this.GLOBAL.mask_count === 0) {
			gMgrs["DialogMgr"].open_dlg({ Type: 4, Name: "Mask", Blank: false, Elastic: false })
		}
		this.GLOBAL.mask_count += 1
	}

	//关闭遮罩
	public close_mask() {
		this.GLOBAL.mask_count -= 1
		if (this.GLOBAL.mask_count <= 0) {
			gMgrs["DialogMgr"].close_dlg({ Type: 4, Name: "Mask" })
			this.GLOBAL.mask_count = 0
		}
	}

	//飘字
	public open_fly(text_) {
		gMgrs["DialogMgr"].close_dlg({ Type: 3, Name: "Flyword" })

		gMgrs["ComMgr"].run_once(function () {
			gMgrs["DialogMgr"].open_dlg({ Type: 3, Name: "Flyword", Blank: false, Elastic: false, Pierce: true, Data: { text: text_ } })
		})
	}
	//飘字
	public open_float(text_) {
		gMgrs["DialogMgr"].close_dlg({ Type: 3, Name: "FloatingWorld" })

		gMgrs["ComMgr"].run_once(function () {
			gMgrs["DialogMgr"].open_dlg({ Type: 3, Name: "FloatingWorld", Blank: false, Elastic: false, Pierce: true, Data: { text: text_ } })
		})
	}

	//通知框
	public open_ntf(param: any) {
		gMgrs["DialogMgr"].open_dlg({ Type: 3, Name: "Notify", Blank: false, Data: param })
	}

	//选择框
	public open_cho(param: any) {
		gMgrs["DialogMgr"].open_dlg({ Type: 3, Name: "Choice", Blank: false, Data: param })
	}
	/**
	 * 填充类型 
	 * 颜色 
	 * 透明度 
	 * 颜色偏移量 
	 * 填充宽度
	 * 填充高度
	 * 矩阵x轴偏移
	 * 矩阵y轴偏移
	 */
	public creatShape(type: any, color: number[], alphaAr: number[], rotios: number[], width: number = 720, height: number = 1280, matixTranslateX: number = 0, matixTranslateY: number = 0) {
		let _shape: egret.Shape = new egret.Shape()
		let _matix: egret.Matrix = new egret.Matrix()
		_matix.translate(matixTranslateX, matixTranslateY)
		_shape.graphics.beginGradientFill(type, color, alphaAr, rotios, _matix)
		_shape.graphics.drawRect(0, 0, width, height);
		return _shape;
	}

	//解析json数组
	public decompose_array(jstr: string) {
		let rets = new Array()
		let item = null;
		let items = jstr.split(";")
		for (let i = 0; i < items.length; i++) {
			item = items[i].split("_")
			rets.push({ "key": Number(item[0]), "value": Number(item[1]) })
		}
		return rets;
	}

	//计算字符串的md5码
	public get_md5(str_: string): string {
        /*
        * Add integers, wrapping at 2^32. This uses 16-bit operations internally
        * to work around bugs in some JS interpreters.
        */
		function safeAdd(x, y) {
			var lsw = (x & 0xffff) + (y & 0xffff)
			var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
			return (msw << 16) | (lsw & 0xffff)
		}

        /*
        * Bitwise rotate a 32-bit number to the left.
        */
		function bitRotateLeft(num, cnt) {
			return (num << cnt) | (num >>> (32 - cnt))
		}

        /*
        * These functions implement the four basic operations the algorithm uses.
        */
		function md5cmn(q, a, b, x, s, t) {
			return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
		}
		function md5ff(a, b, c, d, x, s, t) {
			return md5cmn((b & c) | (~b & d), a, b, x, s, t)
		}
		function md5gg(a, b, c, d, x, s, t) {
			return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
		}
		function md5hh(a, b, c, d, x, s, t) {
			return md5cmn(b ^ c ^ d, a, b, x, s, t)
		}
		function md5ii(a, b, c, d, x, s, t) {
			return md5cmn(c ^ (b | ~d), a, b, x, s, t)
		}

        /*
        * Calculate the MD5 of an array of little-endian words, and a bit length.
        */
		function binlMD5(x, len) {
			/* append padding */
			x[len >> 5] |= 0x80 << (len % 32)
			x[((len + 64) >>> 9 << 4) + 14] = len

			var i
			var olda
			var oldb
			var oldc
			var oldd
			var a = 1732584193
			var b = -271733879
			var c = -1732584194
			var d = 271733878

			for (i = 0; i < x.length; i += 16) {
				olda = a
				oldb = b
				oldc = c
				oldd = d

				a = md5ff(a, b, c, d, x[i], 7, -680876936)
				d = md5ff(d, a, b, c, x[i + 1], 12, -389564586)
				c = md5ff(c, d, a, b, x[i + 2], 17, 606105819)
				b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330)
				a = md5ff(a, b, c, d, x[i + 4], 7, -176418897)
				d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426)
				c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341)
				b = md5ff(b, c, d, a, x[i + 7], 22, -45705983)
				a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416)
				d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417)
				c = md5ff(c, d, a, b, x[i + 10], 17, -42063)
				b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162)
				a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682)
				d = md5ff(d, a, b, c, x[i + 13], 12, -40341101)
				c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290)
				b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329)

				a = md5gg(a, b, c, d, x[i + 1], 5, -165796510)
				d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632)
				c = md5gg(c, d, a, b, x[i + 11], 14, 643717713)
				b = md5gg(b, c, d, a, x[i], 20, -373897302)
				a = md5gg(a, b, c, d, x[i + 5], 5, -701558691)
				d = md5gg(d, a, b, c, x[i + 10], 9, 38016083)
				c = md5gg(c, d, a, b, x[i + 15], 14, -660478335)
				b = md5gg(b, c, d, a, x[i + 4], 20, -405537848)
				a = md5gg(a, b, c, d, x[i + 9], 5, 568446438)
				d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690)
				c = md5gg(c, d, a, b, x[i + 3], 14, -187363961)
				b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501)
				a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467)
				d = md5gg(d, a, b, c, x[i + 2], 9, -51403784)
				c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473)
				b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734)

				a = md5hh(a, b, c, d, x[i + 5], 4, -378558)
				d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463)
				c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562)
				b = md5hh(b, c, d, a, x[i + 14], 23, -35309556)
				a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060)
				d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353)
				c = md5hh(c, d, a, b, x[i + 7], 16, -155497632)
				b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640)
				a = md5hh(a, b, c, d, x[i + 13], 4, 681279174)
				d = md5hh(d, a, b, c, x[i], 11, -358537222)
				c = md5hh(c, d, a, b, x[i + 3], 16, -722521979)
				b = md5hh(b, c, d, a, x[i + 6], 23, 76029189)
				a = md5hh(a, b, c, d, x[i + 9], 4, -640364487)
				d = md5hh(d, a, b, c, x[i + 12], 11, -421815835)
				c = md5hh(c, d, a, b, x[i + 15], 16, 530742520)
				b = md5hh(b, c, d, a, x[i + 2], 23, -995338651)

				a = md5ii(a, b, c, d, x[i], 6, -198630844)
				d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415)
				c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905)
				b = md5ii(b, c, d, a, x[i + 5], 21, -57434055)
				a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571)
				d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606)
				c = md5ii(c, d, a, b, x[i + 10], 15, -1051523)
				b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799)
				a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359)
				d = md5ii(d, a, b, c, x[i + 15], 10, -30611744)
				c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380)
				b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649)
				a = md5ii(a, b, c, d, x[i + 4], 6, -145523070)
				d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379)
				c = md5ii(c, d, a, b, x[i + 2], 15, 718787259)
				b = md5ii(b, c, d, a, x[i + 9], 21, -343485551)

				a = safeAdd(a, olda)
				b = safeAdd(b, oldb)
				c = safeAdd(c, oldc)
				d = safeAdd(d, oldd)
			}
			return [a, b, c, d]
		}

        /*
        * Convert an array of little-endian words to a string
        */
		function binl2rstr(input) {
			var i
			var output = ''
			var length32 = input.length * 32
			for (i = 0; i < length32; i += 8) {
				output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xff)
			}
			return output
		}

        /*
        * Convert a raw string to an array of little-endian words
        * Characters >255 have their high-byte silently ignored.
        */
		function rstr2binl(input) {
			var i
			var output = []
			output[(input.length >> 2) - 1] = undefined
			for (i = 0; i < output.length; i += 1) {
				output[i] = 0
			}
			var length8 = input.length * 8
			for (i = 0; i < length8; i += 8) {
				output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << (i % 32)
			}
			return output
		}

        /*
        * Calculate the MD5 of a raw string
        */
		function rstrMD5(s) {
			return binl2rstr(binlMD5(rstr2binl(s), s.length * 8))
		}

        /*
        * Calculate the HMAC-MD5, of a key and some data (raw strings)
        */
		function rstrHMACMD5(key, data) {
			var i
			var bkey = rstr2binl(key)
			var ipad = []
			var opad = []
			var hash
			ipad[15] = opad[15] = undefined
			if (bkey.length > 16) {
				bkey = binlMD5(bkey, key.length * 8)
			}
			for (i = 0; i < 16; i += 1) {
				ipad[i] = bkey[i] ^ 0x36363636
				opad[i] = bkey[i] ^ 0x5c5c5c5c
			}
			hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8)
			return binl2rstr(binlMD5(opad.concat(hash), 512 + 128))
		}

        /*
        * Convert a raw string to a hex string
        */
		function rstr2hex(input) {
			var hexTab = '0123456789abcdef'
			var output = ''
			var x
			var i
			for (i = 0; i < input.length; i += 1) {
				x = input.charCodeAt(i)
				output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f)
			}
			return output
		}

        /*
        * Encode a string as utf-8
        */
		let this_ = this
		function str2rstrUTF8(input) {
			return this_._utf8_decode(encodeURIComponent(input))
			//return unescape(encodeURIComponent(input))
		}

        /*
        * Take string arguments and return either raw or hex encoded strings
        */
		function rawMD5(s) {
			return rstrMD5(str2rstrUTF8(s))
		}
		function hexMD5(s) {
			return rstr2hex(rawMD5(s))
		}
		function rawHMACMD5(k, d) {
			return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d))
		}
		function hexHMACMD5(k, d) {
			return rstr2hex(rawHMACMD5(k, d))
		}

		function md5(string, key, raw): string {
			if (!key) {
				if (!raw) {
					return hexMD5(string)
				}
				return rawMD5(string)
			}
			if (!raw) {
				return hexHMACMD5(key, string)
			}
			return rawHMACMD5(key, string)
		}
		return md5(str_, null, null)
	}


	///////////////////龙骨动画
	/**
	 * 创建一个骨骼动画
	 * @param node:添加到的对象
	 * @param jsonName:骨骼数据名称,不带路径,不要后缀,动画名要和这个名字一致
	 * @param resName:资源名称,不带路径,不要后缀,资源的json和png必须一致
	 * @param actionName:播放的动画名称
	 * @returns 创建的动画实例。
	 */
	public create_dragonbone(node: any, jsonName: string, resName: string, armatureName: string, actionName: string, playTimes: number) {
		var dragonbonesData = RES.getRes(jsonName + "_json");
		var textureData = RES.getRes(resName + "_json");
		var texture = RES.getRes(resName + "_png");
		let egretFactory: dragonBones.EgretFactory = dragonBones.EgretFactory.factory;
		egretFactory.parseDragonBonesData(dragonbonesData);
		egretFactory.parseTextureAtlasData(textureData, texture);
		//
		let armatureDisplay: dragonBones.EgretArmatureDisplay = egretFactory.buildArmatureDisplay(armatureName);
		if (!armatureDisplay) {
			console.log("错误：没有找到骨骼动画数据或资源丢失")
			return null
		}
		//console.log("判断是否是DisplayObject",colorLabel instanceof fairygui.GObject)
		//console.log("判断是否是DisplayObject2",colorLabel instanceof egret.DisplayObject)
		if (node instanceof egret.DisplayObject) {
			node = node;
			node.addChild(armatureDisplay);
		} else if (node instanceof fairygui.GObject) {
			node = node;
			node._container.addChild(armatureDisplay);
		}
		if (actionName) {
			if (!playTimes && playTimes != 0) { playTimes = -1; }
			armatureDisplay.animation.play("Walk", playTimes);
		}
		return armatureDisplay
	}
	/**
	 * 删除一个骨骼动画
	 * @param node:删除的对象
	 * @param animationName:实例缓存名称
	 * @param disposeData:是否释放数据,默认:true
	 */
	public remove_dragonbone(armture: any, animationName: string, disposeData: boolean) {
		//释放资源数据
		let egretFactory: dragonBones.EgretFactory = dragonBones.EgretFactory.factory;
		egretFactory.removeDragonBonesData(animationName, disposeData)
		egretFactory.removeTextureAtlasData(animationName, disposeData)

		armture.animation.stop();
		armture.removeFromParent();
		armture = null;
	}

	public dragonbone_addEvent(armatureDisplay: dragonBones.EgretArmatureDisplay, eventName: string, callback: Function, obj: any) {
		// addEventListener
		if (eventName === null) {
			eventName = dragonBones.AnimationEvent.LOOP_COMPLETE;
		}
		armatureDisplay.addEventListener(eventName, callback, obj);
		// armatureDisplay.addEventListener(dragonBones.AnimationEvent.LOOP_COMPLETE,function(evt:dragonBones.ArmatureEvent){
		// 	console.log("动画播放完一轮完成")
		// },this);
		// armatureDisplay.addEventListener(dragonBones.FrameEvent.ANIMATION_FRAME_EVENT,function(evt:dragonBones.ArmatureEvent){
		// 	console.log( "armature 播放到了一个关键帧！ 帧标签为：",evt.frameLabel);
		// },this);
	}
	public dragonbone_removeEvent(armatureDisplay: dragonBones.EgretArmatureDisplay, eventName: string, callback: Function, obj: any) {
		// addEventListener
		if (eventName === null) {
			eventName = dragonBones.AnimationEvent.LOOP_COMPLETE;
		}
		armatureDisplay.removeEventListener(eventName, callback, obj);
	}

}