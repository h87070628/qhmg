class Test {
	private stage_: egret.Stage;
	private heartbeat_: Function;
	public constructor(stage: egret.Stage) {
		console.log("new Test")
		this.stage_ = stage
	}

	public destroy() {
		//停止定时心跳
		this.heartbeat_();
		this.heartbeat_ = null
		this.stage_ = null;
	}

	private _view: fairygui.GComponent;
	public function_00() {
		//测试事件模块
		gMgrs["EventMgr"].addEvent("XEvent", this.x_event_cb, this);
		gMgrs["EventMgr"].sendEvent("XEvent", { a: 1, b: "www" })

		gMgrs["EventMgr"].delEvent("XEvent", this.x_event_cb, this);
		gMgrs["EventMgr"].sendEvent("XEvent", { a: 1, b: "wwwwww" })

		//测试全局模块
		console.log(gMgrs["ComMgr"].gCNT().BASE_KEY)

		//测试加密解密
		var str = gMgrs["ComMgr"].B64encode("羊羊羊:admin");
		console.log("base64 encode:" + str);
		//解密
		str = gMgrs["ComMgr"].B64decode(str);
		console.log("base64 decode:" + str);

		//定时器
		//gMgrs["ComMgr"].send_timeout();

		//下一帧执行
		/*
		let sprite: egret.Sprite = new egret.Sprite()
		sprite.graphics.beginFill(0x00ff00);
		sprite.graphics.drawRect(0, 0, 100, 100);
		sprite.graphics.endFill();
		this.stage_.addChild(sprite);
		let count: number = 0
		let callback = function () {
			if (count == 10) {
				sprite.removeEventListener(egret.Event.ENTER_FRAME, callback, this);
				console.log("___Z___")
			} else {
				console.log("___X___")
			}
			count += 1
		}.bind(this)
		sprite.addEventListener(egret.Event.ENTER_FRAME, callback, this);

		sprite.addEventListener(egret.Event.REMOVED_FROM_STAGE, function () {
			sprite.removeEventListener(egret.Event.ENTER_FRAME, callback, this);
			console.log("___Y___")
		}.bind(this), this);

		let timer: egret.Timer = new egret.Timer(35, 1);
		let timerComFunc = function () {
			console.log("___www___")
			timer.removeEventListener(egret.TimerEvent.TIMER_COMPLETE, timerComFunc, this);
			timer.stop();
			timer = null;

			this.stage_.removeChild(sprite);
			sprite = null;
		}.bind(this)
		timer.addEventListener(egret.TimerEvent.TIMER_COMPLETE, timerComFunc, this);
		timer.start();
		*/

		/*
		let param = { "cmd": 10001, "param": { i: 100, s: "西施" } }
		gMgrs["ComMgr"].send_https(param, function (jdata) {
			console.log(jdata.data)
			console.log("时间戳: " + Math.floor(Number(jdata.data.time)))
		})
		*/

		/*
        fairygui.UIPackage.addPackage("_Common_00");
        this.stage_.addChild(fairygui.GRoot.inst.displayObject);
        this._view = fairygui.UIPackage.createObject("_Common_00", "Component1").asCom;
        this._view.setSize(fairygui.GRoot.inst.width, fairygui.GRoot.inst.height);
        fairygui.GRoot.inst.addChild(this._view);
        //remove{TODO}
		*/

		/*
		fairygui.UIPackage.addPackage("_Common_00");
		fairygui.UIPackage.addPackage("Login");
		this._view = fairygui.UIPackage.createObject("Login", "Component1").asCom;
		this._view.setSize(fairygui.GRoot.inst.width, fairygui.GRoot.inst.height);
		fairygui.GRoot.inst.addChild(this._view);
		*/


		//3秒后关闭窗口
		gMgrs["ComMgr"].run_once(function () {
			//打开指定窗口
			//gMgrs["DialogMgr"].open_dlg({ Type: 2, Name: "Login", Callback: function () { this.print_(); }.bind(this) })

			//关闭指定窗口
			//gMgrs["DialogMgr"].close_dlg({Type: 2, Name: "Login"})

			//关闭窗口,并重启游戏
			/*
			gMgrs["DialogMgr"].close_dlg({
				Type: 2, Name: "Login", Callback: function () {
					console.log("_____________YYY")
					gMgrs["ComMgr"].run_once(function () {
						gMgrs["EventMgr"].sendEvent("RESTART", { TYPE: 0 })
						//gMgrs["DialogMgr"].open_dlg({ Type: 2, Name: "Login", Callback: function () { console.log("reopen Login") }.bind(this) })
					}.bind(this), 3000)
					console.log("_____________YYYYYY")
				}.bind(this)
			})
			*/

			//关闭所有UI窗口
			//gMgrs["DialogMgr"].close_all()

			//获取管理类
			//let view = gMgrs["DialogMgr"].get_dlg({Type: 2, Name: "Login"})
			//view.data.inst.login_()

			/*
			//打开遮罩
			gMgrs["ComMgr"].open_mask()

			//关闭遮罩
			gMgrs["ComMgr"].run_once(function () {
				gMgrs["ComMgr"].close_mask()
				console.log("close_mask")
			}.bind(this), 3000)
			*/

			//飘字
			//gMgrs["ComMgr"].open_fly("名字都是七个字")

			//添加提示框
			//gMgrs["ComMgr"].open_ntf({callback: function(){this.print_()}.bind(this), title:"提示框", content:"恭喜,恭喜,恭喜你", btn_title: "OK"})

			//添加选择框
			/*
			gMgrs["ComMgr"].open_cho({
				title: "提示框", content: "恭喜,恭喜,恭喜你",
				confirm_btn_text: "YES", onConfirm: function () { this.print_() }.bind(this),
				cancel_btn_text: "NO", onCancel: function () { this.print__() }.bind(this)
			})
			*/

			//读取配置
			//console.log("___XXXXXX___")
			//console.log(gMgrs["CfgMgr"].gs("guide_json", "100", "position"))
		}.bind(this), 3000)
	}


	public print_() {
		console.log("___ TEST:print_ ___")
	}
	public print__() {
		console.log("___ TEST:print__ ___")
	}

	public x_event_cb(event: any) {
		console.log(event.data)
	}

	public function_01() {
		let token = ""
		let param = {}
		//获取Token
		param = { "cmd": 10000, "param": { "chanel": "0", "unique": "aaabbbcccdddeeee" } }
		gMgrs["ComMgr"].sends(param, function (jdata) {
			//console.log(jdata.data)
			token = jdata.data.token

			let select_svr = null

			//拉取角色列表
			param = { "cmd": 10002, "param": { "token": token } }
			gMgrs["ComMgr"].sends(param, function (jdata) {
				//console.log(jdata.data)

				//显示服务器选择界面
				if (typeof (select_svr) == "function") {
					select_svr(jdata.data)
				}
			})

			//选择服务器
			select_svr = function (data) {
				//--最近登陆服务器(本都数据)
				//--推荐服务器(服务器数据)
				//--存在角色的服务器(服务器数据)
				//--全部服务器(服务器数据)

				//console.log("select _ svr")
				//玩家选择的服务器存在角色,直接拉取角色信息
				//玩家选择的服务器没有角色,创建默认角色,拉取角色信息
				param = { "cmd": 10004, "param": { "token": token, "svrid": 100 } }
				gMgrs["ComMgr"].sends(param, function (jdata) {
					//console.log(jdata.data)
					if (jdata.data.roles[0].lastlogin === 0) {
						//首次登陆,创建新的角色,弹出修改名称等参数的界面
						console.log("提供修改名称, 服务端需要记录最后登陆时间, 以此来判断是否为新角色")

						//拉取游戏信息
						param = { "cmd": 10005, "param": { "token": token } }
						gMgrs["ComMgr"].sends(param, function (jdata) {
							//console.log(jdata)
							this.heartbeat(token)
							
							//在玩家基地0号位置,建造公司总部
							param = { "cmd": 10006, "param": { "token": token, "type": 100, "pos": 0 } }
							gMgrs["ComMgr"].sends(param, function (jdata) {
								//console.log(jdata)
							})
						}.bind(this))
					} else {
						//老玩家,直接开始游戏
						console.log("开始游戏")
					}
				}.bind(this))
			}.bind(this)
		}.bind(this))
	}

	public heartbeat(token) {
		//开始间隔发送心跳
		let param = { "cmd": 90000, "param": { "token": token } }
		this.heartbeat_ = gMgrs["ComMgr"].run_loop(function () {
			gMgrs["ComMgr"].send_passive(param)
		}.bind(this), 3000)
	}
	
	public creat_dragon_bone() {
		let anima = gMgrs["ComMgr"].create_dragonbone(this._view, "Robot", "texture", "robot", "Walk", 0);
		if (anima) {
			anima.x = 360;
			anima.y = 500;
			anima.animation.timeScale = 3;
		}
	}
}