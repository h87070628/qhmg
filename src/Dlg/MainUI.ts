class MainUI {
	private _root: fairygui.GComponent;
	private _view: fairygui.GComponent;
	private cfg: any;

	private others_: fairygui.GComponent;
	private pets_: fairygui.GComponent;

	private _searchPet: any
	private _bitmap: egret.Bitmap;
	private _rankNode: fairygui.GComponent
	private _rankingListMask: egret.Shape
	private _btn_close_rank: fairygui.GComponent

	public constructor(_root: fairygui.GComponent) {


		this._root = _root;
		//this._root.data.param
		//this._root.data.close
		this._view = <fairygui.GComponent>_root.getChild("background")
		this.cfg = {
			current_others: 0,
			current_players: 1,
			current_pet: 1,

			rollplaying: 0,
			sec_timer_: Function,
			wss: egret.WebSocket,
		}

		//console.log(fairygui.GRoot.inst)
		//this._root.setSize(fairygui.GRoot.inst.width, fairygui.GRoot.inst.height)
		//this._view.setSize(fairygui.GRoot.inst.width, fairygui.GRoot.inst.height)

		//适配刘海屏
		/*
		let channel = gMgrs["ComMgr"].gCNT().CHANNEL
		if (channel === 1) {			//web平台需要输入账号密码
			wx.getSystemInfo({
				success(res) {
					console.log(res.statusBarHeight)
					let top = <fairygui.GLabel>this._view.getChild("n40")
					top.y = res.statusBarHeight
				}
			})
		}
		*/
		//定位实际屏幕的底部
		let bottom = <fairygui.GLabel>this._view.getChild("n39")
		bottom.y = fairygui.GRoot.inst.height

		//创建一个渐变背景
		//let _shape = gMgrs["ComMgr"].creatShape(egret.GradientType.RADIAL, [0x70CCC6, 0xCFD6CC], [1, 1], [180, 250], 720, 1280, 220, 220)
		//this._view.getChild("bg").asCom._container.addChild(_shape);

		this._rankNode = <fairygui.GComponent>this._view.getChild("rank")
		gMgrs["ComMgr"].touch_btn(<fairygui.GButton>this._rankNode.getChild("btn_close"), this.onCloseRank, this)
		this._rankNode.visible = false

		this.add_btn_callback(["btn_handbook", "btn_enargy", "btn_combine", "btn_resolve", "btn_card", "btn_mate", "btn_ladder", "btn_rank"])

		this.cfg.sec_timer_ = gMgrs["ComMgr"].run_loop(function () {
			this.another_sec()
		}.bind(this), 1000)
		
		gMgrs["EventMgr"].addEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, this.onUpdateUI, this);
	}

	public destroy() {
		//this.cfg.sec_timer_();	//停止毫秒逻辑定时器
		//this.cfg.sec_timer_ = null

		gMgrs["EventMgr"].delEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, this.onUpdateUI, this);
		this.del_btn_callback(["btn_handbook", "btn_enargy", "btn_combine", "btn_resolve", "btn_card", "btn_mate", "btn_ladder", "btn_rank"])
		gMgrs["ComMgr"].untouch_btn(<fairygui.GButton>this._rankNode.getChild("btn_close"), this.onCloseRank, this)
		this._searchPet = null
		this._root = null
		this._view = null
	}

	//监听按钮
	private add_btn_callback(btns: any) {
		for (let i = 0; i < btns.length; i++) {
			gMgrs["ComMgr"].touch_btn(<fairygui.GButton>this._view.getChild(btns[i]), this.btn_callback, this)
		}
	}

	//注销按钮
	private del_btn_callback(btns: any) {
		for (let i = 0; i < btns.length; i++) {
			gMgrs["ComMgr"].untouch_btn(<fairygui.GButton>this._view.getChild(btns[i]), this.btn_callback, this)
		}
	}

	//秒定时器
	private another_sec() {
		if (this.cfg.rollplaying === 0) {
			let msg = gMgrs["PlayerMgr"].remove_rollmsgs()
			if (typeof (msg) === "object") {
				this.cfg.rollplaying = 1
				this.playroll(msg)
			}
		}
	}

	//播放走马灯
	private playroll(msg: Object) {
		//设置走马灯内容
		let roll = <fairygui.GLabel>this._view.getChild("n58")
		roll.text = msg["send"] + ":" + msg["msg"]
		let trans: fairygui.Transition = this._view.getTransition("rolls")
		trans.play(function () {
			//播放完毕后设置为0
			this.cfg.rollplaying = 0
		}.bind(this), this, null, 1, 0, 0.0, 2.0);
	}

	//
	private onUpdateUI(event: any) {
		if (typeof (event.data.TARGET) === "undefined" || event.data.TARGET === null || event.data.TARGET === "MainUI") {
			if (event.data.TYPE === "PlayerMgr") {
				if (event.data.PARAM === "INIT") {
					//this.updataUserInfo();
					console.log("MainUI:Init()")
				} else if (event.data.PARAM === "PASSIVE") { 		//被动监听
				} else if (event.data.PARAM === "INITIATIVE") {		//主动消息
				}
			} else if (event.data.TYPE === "LogicMgr") {
			}
		}
	}
	public btn_callback(evt: egret.TouchEvent) {
		evt.stopImmediatePropagation();				//阻止事件向父节点传递
		let btn_name = evt.currentTarget.name
		if (btn_name === "search_btn") {
			console.log("重新开始游戏...")
			gMgrs["DialogMgr"].close_dlg({
				Type: 2, Name: "MainUI", Callback: function () {
					gMgrs["EventMgr"].sendEvent("RESTART", { TYPE: 0 })
				}.bind(this)
			})
		} else if (btn_name === "btn_handbook") {// 图鉴
			gMgrs["DialogMgr"].open_dlg({
				Type: 2, Name: "FaceList", Data: null, Callback: function () {
				}.bind(this)
			});
		} else if (btn_name === "btn_enargy") {// 欧皇之力
			gMgrs["ComMgr"].open_fly("广告接口")
			gMgrs["PlatformMgr"].shara_game();
			/*
			let params = "cmd=10003&user=" + 10001000 + "&item=" + 101
			gMgrs["ComMgr"].send_third_request(params, function(data){
				console.log(data)
			}.bind(this));
			*/
		} else if (btn_name === "btn_card") {  // 抽卡
			gMgrs["DialogMgr"].open_dlg({
				Type: 2, Name: "DrawCard", Data: null, Callback: function () {
				}.bind(this)
			});
		} else if (btn_name === "btn_combine") {  // 组合
			gMgrs["DialogMgr"].open_dlg({
				Type: 2, Name: "CombineCard", Data: null, Callback: function () {
				}.bind(this)
			});
		} else if (btn_name === "btn_resolve") { // 分解
			let cards = gMgrs["LogicMgr"].getBqCards();
			gMgrs["DialogMgr"].open_dlg({
				Type: 2, Name: "ResolveCard", Data: { cards: cards }, Callback: function () {
				}.bind(this)
			});
		} else if (btn_name === "btn_mate") { // 匹配对战 
			let bqb_cards = gMgrs["PlayerMgr"].get_data("base").bq_bts_cards.split(";")
			if (bqb_cards.length < 4) {
				gMgrs["ComMgr"].open_fly(`牌型太少，无法匹配，请先去抽卡`);
				return
			}
			let avatarUrl = gMgrs["PlayerMgr"].getWxUserInfo() ? gMgrs["PlayerMgr"].getWxUserInfo().avatarUrl : gMgrs["PlayerMgr"].randRobotUrl()
			let param = { "cmd": 20001, "param": { "a": 1, "url": avatarUrl } }
			gMgrs["ComMgr"].wss_send(param, (jdata) => {
				if (jdata.ret === 0) {
					gMgrs["DialogMgr"].open_dlg({
						Type: 2, Name: "MateCompetitors", Data: {}, Callback: function () {

						}.bind(this)
					})
				} else {
					gMgrs["ComMgr"].open_fly(`匹配出错了----${jdata.ret}`)
				}
			})

		} else if (btn_name === "btn_ladder") {  // 天梯
			gMgrs["ComMgr"].open_fly(`后续扩展`)
		} else if (btn_name === "btn_rank") {
			this._rankNode.visible = true
			// 创建一个遮罩
			if (!gMgrs["ComMgr"].gCNT().CHANNEL) {
				return;
			}
			// 创建关闭按钮
			this._bitmap = platform.openDataContext.createDisplayObject(null, this._rankNode.width, this._rankNode.height);
			this._bitmap.name = "rank"
			this._rankNode._container.stage.addChild(this._bitmap);
			gMgrs["PlatformMgr"].open_rank_game();
		}

	}

	private onCloseRank() {
		this._rankNode.visible = false
		if (!gMgrs["ComMgr"].gCNT().CHANNEL) {
			return;
		}
		this._bitmap.parent.removeChild(this._bitmap)
		gMgrs["PlatformMgr"].close_rank_game();
	}

	private updataUserInfo() {
		let base = gMgrs["PlayerMgr"].get_data("base")
		let exp = gMgrs["CfgMgr"].gs("exp_json")
		let avatarUrl = gMgrs["PlayerMgr"].getWxUserInfo() ? gMgrs["PlayerMgr"].getWxUserInfo().avatarUrl : "ui://_Common_00/ui_10034"
		if (gMgrs["PlayerMgr"].getWxUserInfo()) {
			RES.getResByUrl(avatarUrl, (res: Object) => {
			}, this, RES.ResourceItem.TYPE_IMAGE)
		}
		let iconLoader = <fairygui.GLoader>this._view.getChild("head")
		iconLoader.url = avatarUrl;
		this._view.getChild("player_name").text = base.name
		this._view.getChild("power").text = "" + base.diamond
		this._view.getChild("coin").text = "" + base.money
		this._view.getChild("level").text = exp[base.level + 1].title
		let cfgExp = exp[base.level + 1].exp.split("_")
		this._view.getChild("exp").asProgress.value = Math.floor(base.exp / Number(cfgExp[1]) * 100)
	}
}