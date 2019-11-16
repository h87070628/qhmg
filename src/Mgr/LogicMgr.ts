
class LogicMgr {
	private cfg: any;
	public constructor() {
		console.log("new LogicMgr")
		this.cfg = {
			heartbeat_: Function,			//心跳定时器

			//远程资源集合
			r_resources: {
				r_preload_00: { name: "r_preload_00", loaded: false, size: 26 },
				r_preload_01: { name: "r_preload_01", loaded: false, size: 28 },
				r_preload_02: { name: "r_preload_02", loaded: false, size: 36 },
			},
			r_loadComplete: Function,		//远程资源全部加载完毕的回调

			//用于游戏定时逻辑
			ms_timer_: Function,			//100毫秒定时器

			friend_msg_time: 0,				//好友消息定时器
			friend_msg_time_interval: 5000,	//定时拉取好友消息(默认为5秒,进入聊天界面需要调整为1秒)

			//
			loding: false,					//
		}

		//记录资源加载完毕后的逻辑
		this.cfg.r_loadComplete = function () {
			//关闭资源加载界面
			gMgrs["DialogMgr"].close_dlg({
				Type: 2, Name: "LoadResources", Callback: function () {
					console.log("close LoadResources");
					this.load_succeed()
				}.bind(this)
			})
		}.bind(this)

		//优先级低,等其他Mgr处理完在处理
		gMgrs["EventMgr"].addEvent(gMgrs["ComMgr"].gCNT().EVENT.PASSIVE_MSG, this.onPassive, this, -1);
	}

	public destroy() {
		//this.cfg.heartbeat_();	//停止定时器
		//this.cfg.heartbeat_ = null

		this.cfg.ms_timer_();	//停止毫秒逻辑定时器
		this.cfg.ms_timer_ = null
		RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
		RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
		RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadErr, this);

		gMgrs["EventMgr"].delEvent(gMgrs["ComMgr"].gCNT().EVENT.PASSIVE_MSG, this.onPassive, this);
	}

	//开始远程资源加载
	public async game_start() {
		console.log("___ Game Start ___")
		//启动心跳
		//this.heartbeat()

		//开启毫秒定时器
		this.ms_timer()

		//开发阶段暂不使用远程资源加载
		let remote = gMgrs["ComMgr"].gCNT().REMOTE
		if (remote === 0) {
			this.load_succeed()
		} else {
			//打开资源加载界面
			gMgrs["DialogMgr"].open_dlg({
				Type: 2, Name: "LoadResources", Elastic: false, Callback: async function () {
					console.log("open LoadResources");
					await this.loadResource()	//远程资源加载中...
				}.bind(this)
			})
		}
	}

	//加载成功后开始进入游戏
	public load_succeed() {
		//打开游戏载入界面

		//资源加载完毕后,开始登陆过程
		this.onLogin()
	}

	//定时拉取好友消息
	private get_friend_msg() {
		this.cfg.friend_msg_time += 100
		if (this.cfg.friend_msg_time >= this.cfg.friend_msg_time_interval) {
			this.cfg.friend_msg_time = 0

			//修改为心跳拉取
			//拉取全部好友消息
			//let param = { "cmd": 10017, "param": { "token": gMgrs["PlayerMgr"].get_data("token"), "action": 8 } }
			//gMgrs["ComMgr"].sends(param, (jdata) => {
			//	if (jdata.ret === 0) {
			//		
			//	}
			//})
		}
	}

	//调整拉取好友消息的间隔时间
	public set_friend_timer_interval(time: Number) {
		this.cfg.friend_msg_time_interval = time
	}

	//毫秒定时器
	private ms_timer() {
		this.cfg.ms_timer_ = gMgrs["ComMgr"].run_loop(function () {
			//每100毫秒运行一次
			this.get_friend_msg()
		}.bind(this), 100)
	}

	//开启定时心跳
	private heartbeat() {
		//开始间隔发送心跳
		let param = { "cmd": 90000, "param": { "token": gMgrs["PlayerMgr"].get_data("token") } }
		this.cfg.heartbeat_ = gMgrs["ComMgr"].run_loop(function () {
			gMgrs["ComMgr"].send_passive(param)
		}.bind(this), 3000)
	}

	//进入战斗
	public start_battle() {
		gMgrs["EventMgr"].sendEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, { TARGET: null, TYPE: "LogicMgr", PARAM: "start_battle", DATA: {} })
	}

	//结束战斗
	public ended_battle() {
		gMgrs["EventMgr"].sendEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, { TARGET: null, TYPE: "LogicMgr", PARAM: "ended_battle", DATA: {} })
	}

	//加载远程资源
	public async loadResource() {
		await RES.loadConfig("remote.res.json", "https://ydmg.jys-club.com:7298/Game/WeGames/Huos/resource/");

		RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
		RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
		RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadErr, this);

		RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
		RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
		RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadErr, this);

		this.start_load()
	}
	//资源加载成功
	private onResourceLoadComplete(event: RES.ResourceEvent): void {
		//if (event.groupName == "r_preload_00") {
		if (this.cfg.r_resources[event.groupName]) {
			//标记资源已经载入成功
			this.cfg.r_resources[event.groupName].loaded = true
			//加载资源到游戏资源库中
			if (!fairygui.UIPackage.getByName(event.groupName)) {
				fairygui.UIPackage.addPackage(event.groupName);
			}

			this.start_load()
		}
		//}
	}

	//获取当前资源的加载进度信息
	private get_progress() {
		let info: any = { progress: 0, total_size: 0, loaded_size: 0 }

		let progress: number = 0
		let total: number = 0
		let loaded: number = 0

		let total_size: number = 0
		let loaded_size: number = 0
		for (let v in this.cfg.r_resources) {
			++total
			total_size += this.cfg.r_resources[v].size

			if (RES.isGroupLoaded(v)) {
				if (this.cfg.r_resources[v].loaded === true) {
					++loaded
					loaded_size += this.cfg.r_resources[v].size
				}
			}
		}
		progress = Math.floor((loaded / total) * 100)

		info.progress = progress
		info.total_size = total_size
		info.loaded_size = loaded_size

		return info
	}

	//资源加载进度
	public load_progress() {
		let info: any = this.get_progress()
		gMgrs["EventMgr"].sendEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, { TARGET: "LoadResources", TYPE: "LogicMgr", PARAM: "progress", DATA: { progress: info.progress, total_size: info.total_size, loaded_size: info.loaded_size } })
	}

	//资源加载中(进度提示)
	private onResourceProgress(event: RES.ResourceEvent): void {
		console.log("load " + event.groupName + ": " + event.itemsLoaded + "|" + event.itemsTotal)
		this.load_progress()
	}

	//资源加载失败
	private onResourceLoadErr(event: RES.ResourceEvent): void {
		if (++this.cfg.countGroupError < 3) {
			RES.loadGroup(event.groupName);
		} else {
			//多次重试均下载失败,弹出网络失去连接提示等(重启游戏)
			console.log("load error: " + event.groupName)
		}
	}

	//获取一个尚未加载的资源,全部加载会返回null
	private get_unload_res(): string {
		for (let v in this.cfg.r_resources) {
			if (!RES.isGroupLoaded(v)) {
				if (this.cfg.r_resources[v].loaded === false) {
					return v
				}
			}
		}
		return "NULL"
	}

	// 随机获取数组中 不重复的元素
	/**
	 *  dataArr 数组
	 * 	num    需要随机的个数
 	 */
	public getRandomArray(dataArr: [any], num: number) {
		let s_data = []
		if (dataArr.length < num) { // 随机的长度大于数组长度
			return 0;
		}
		for (let i = 0; i < num; i++) {
			let ran = Math.floor(Math.random() * (dataArr.length - i))
			s_data.push(dataArr[ran])
			dataArr[ran] = dataArr[dataArr.length - i - 1]
		}
		return s_data

	}

	// 获取卡牌类型的数组 (1平民卡 2黄金卡)
	public getCardOfType(cardType: number) {
		let cards = gMgrs["CfgMgr"].gs("cards_json");
		let gData = []
		for (let key in cards) {
			if (Number(cards[key].type) === cardType) {
				gData.push(cards[key])
			}
		}
		return gData;
	}
	// 随机乱序
	public randomDisorder(arr) {
		var len = arr.length;
		for (var i = len - 1; i >= 0; i--) {
			var randomIndex = Math.floor(Math.random() * (i + 1));
			var itemIndex = arr[randomIndex];
			arr[randomIndex] = arr[i];
			arr[i] = itemIndex;
		}
		return arr;
	}

	//踢出 已经存在的 card
	public getBqCards() {
		let base = gMgrs["PlayerMgr"].get_data("base")
		let bq_bts_cards = base.bq_bts_cards.split(";")
		let bqb_cards = base.bqb_cards
		let temp1 = [];//临时数组2
		let temp2 = [];//临时数组3
		for (var i = 0; i < bq_bts_cards.length; i++) {
			temp1[Number(bq_bts_cards[i])] = true;
		}
		for (var i = 0; i < bqb_cards.length; i++) {
			if (!temp1[bqb_cards[i].id]) {
				temp2.push(bqb_cards[i]);
			}
		}
		return temp2;
	}
	// 根据id获取card
	public getCardOfId(id: number) {
		// 根据
		let base = gMgrs["PlayerMgr"].get_data("base")
		for (let i = 0; i < base.bqb_cards.length; i++) {
			if (base.bqb_cards[i].id === id) {
				return base.bqb_cards[i].card;
			}
		}
		return 0
	}
	/**
	 * 获取效果的的背景
	 */
	public getCardEffectBg(id: string) {
		let data_list = gMgrs["CfgMgr"].gs("cards_json")
		if (!data_list[id]) {
			return "battle_frame_05";
		}

		let keeps = data_list[id].keeps.split("_")
		let effect = Number(data_list[id].effect) > 0 ? Number(data_list[id].effect) : Number(keeps[1])
		let value = Number(data_list[id].value) != 0 ? Number(data_list[id].value) : Number(keeps[2])
		if (effect === 2 || effect === 5 || effect === 6) {
			return "battle_frame_06";
		}
		return "battle_frame_05";
	}
	// 获取效果的icon
	public getCardEffectIcon(id: string) {
		let data_list = gMgrs["CfgMgr"].gs("cards_json")

		if (!data_list[id]) {
			return "hp_down"; // 默认掉血
		}
		let icon = ""
		let keeps = data_list[id].keeps.split("_")
		let effect = Number(data_list[id].effect) > 0 ? Number(data_list[id].effect) : Number(keeps[1])
		let value = Number(data_list[id].value) != 0 ? Number(data_list[id].value) : Number(keeps[2])
		if (effect === 1 || effect === 3) {
			icon = value > 0 ? "hp_up" : "hp_down"
		} else if (effect === 2) {
			icon = value > 0 ? "action_point_up" : "action_point_down"
		} else if (effect === 4) {
			icon = value > 0 ? "defense_up" : "defense_down"
		} else if (effect === 5) {
			icon = value > 0 ? "action_time_up" : "action_time_down"
		} else {
			icon = value > 0 ? "action_max_up" : "action_max_down"
		}
		return icon;

	}
	/** 效果背景图 */
	public getCardEffectNameBg(id: string) {
		let data_list = gMgrs["CfgMgr"].gs("cards_json")
		if (!data_list[id]) {
			return "battle_frame_01"; // 默认掉血
		}
		let keeps = data_list[id].keeps.split("_")
		let effect = Number(data_list[id].effect) > 0 ? Number(data_list[id].effect) : Number(keeps[1])
		return effect == 1 ? "battle_frame_03" : (effect == 4 ? "battle_frame_02" : "battle_frame_01");
	}

	/** 获取名字 */
	public getCardEffectName(id: string) {
		let data_list = gMgrs["CfgMgr"].gs("cards_json")

		if (!data_list[id]) {
			return "气血"; // 默认掉血
		}
		let keeps = data_list[id].keeps.split("_")
		let effect = Number(data_list[id].effect) > 0 ? Number(data_list[id].effect) : Number(keeps[1])
		let value = Number(data_list[id].value) != 0 ? Number(data_list[id].value) : Number(keeps[2])
		let name = ""
		if (effect === 1 || effect === 3 || effect === 4) {
			name = `${value}`
		} else if (effect === 2) {
			name = "行动点"
		} else if (effect === 5) {
			name = "行动点回复时间"
		} else {
			name = value > 0 ? "增加行动点" : "减少行动点"
		}
		return name;
	}

	// 当前以抽到数量
	public getHaveNum() {
		let bqb_cards = gMgrs["PlayerMgr"].get_data("base").bqb_cards
		let arr = []
		let num = 0
		for (var i = 0; i < bqb_cards.length; i++) {
			if (!arr[bqb_cards[i]]) {
				arr[bqb_cards[i]] = true;
				//把当前数组元素存入到临时数组中  
				arr.push(bqb_cards[i]);
				num++
			}
		}
		return num;
	}


	//删除全部缓存资源(TODO)

	//启动远程资源加载
	private start_load() {
		let name = this.get_unload_res()
		console.log("load : " + name)
		if (name === "NULL") {
			//所以资源加载成功,则进入游戏
			RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
			RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
			RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadErr, this);

			this.cfg.r_loadComplete()
		} else {
			//开始加载该资源
			RES.loadGroup(name);
		}
	}


	//资源加载完毕后的登陆流程
	public onLogin() {
		//连接到服务器
		gMgrs["ComMgr"].open_mask()
		gMgrs["ComMgr"].wss_connect("ws://192.168.1.168:7299", function () {
			gMgrs["ComMgr"].close_mask()
			gMgrs["ComMgr"].open_fly("wss连接成功")

			//登陆中
			this.cfg.loding = true

			//验证客户端版本
			let data = {}
			data["VersionHash"] = "201908031432"
			gMgrs["ComMgr"].wss_send_binary(0, data, function (data) {
				if (data["Result"] === 1) {
					//匹配成功
					let account = this.getAccountInfo()
					if (egret.localStorage.getItem("AccountID")) {
						//登陆
						this.login(account)
					} else {
						//注册
						this.register(account)
					}
				} else {
					//匹配失败
					gMgrs["ComMgr"].wss_close()
				}
			}.bind(this))
		}.bind(this))
	}

	public getAccountInfo() {
		let account = {}
		let AccountID = egret.localStorage.getItem("AccountID")

		if (AccountID) {
			account["AccountID"] = AccountID
			account["Password"] = egret.localStorage.getItem("Password")
			account["UserName"] = egret.localStorage.getItem("UserName")
			account["SecretQuestion"] = egret.localStorage.getItem("SecretQuestion")
			account["SecretAnswer"] = egret.localStorage.getItem("SecretAnswer")
			account["EMailAddress"] = egret.localStorage.getItem("EMailAddress")
		} else {
			//AccountID = gMgrs["ComMgr"].get_md5(String(new Date().getTime()) + String(Math.random() * 1000000000))

			AccountID = "test" + Math.floor((Math.random()*100)+1);
			account["AccountID"] = AccountID
			account["Password"] = AccountID		//gMgrs["ComMgr"].get_md5(AccountID + "Password")
			account["UserName"] = "UserName"
			account["SecretQuestion"] = "SecretQuestion"
			account["SecretAnswer"] = "SecretAnswer"
			account["EMailAddress"] = "email@qq.com"
		}
		return account
	}

	//登陆
	public login(account) {
		gMgrs["ComMgr"].wss_send_binary(5, account, function (data) {
			if (data["count"] === 0) {
				//创建角色
				let param = {}
				param["Name"] = "TS" + Math.floor(Math.random() * 10000000)
				param["Gender"] = 0		//0-1
				param["Class"] = 0		//0-4
				gMgrs["ComMgr"].wss_send_binary(6, param, function (data) {
					//开始游戏
					this.start_game(data)
				}.bind(this))
			} else {
				//开始游戏
				this.start_game(data)
			}
		}.bind(this))
	}

	//注册
	public register(account) {
		gMgrs["ComMgr"].wss_send_binary(3, account, function (data) {
			if (data.Result === 8) {
				egret.localStorage.setItem("AccountID", account["AccountID"]);
				egret.localStorage.setItem("Password", account["Password"]);
				egret.localStorage.setItem("UserName", account["UserName"]);
				egret.localStorage.setItem("SecretQuestion", account["SecretQuestion"]);
				egret.localStorage.setItem("SecretAnswer", account["SecretAnswer"]);
				egret.localStorage.setItem("EMailAddress", account["EMailAddress"]);

				//登陆
				this.login(account)
			} else {
				gMgrs["ComMgr"].open_ntf({
					callback: function () {
						gMgrs["EventMgr"].sendEvent("RESTART", { TYPE: 0 })
					}.bind(this), title: "提示框", content: ("注册失败, 错误码: " + data.Result), btn_title: "确定"
				})
			}
		}.bind(this))
	}

	//开始游戏
	public start_game(data) {
		let param = data["Characters"][0]
		gMgrs["ComMgr"].wss_send_binary(8, param, function (data) {
			//发送8(登陆消息), 只会返回14(SStartGame),该消息只是通知登陆成功,未包含玩家信息
		})
	}

	//登陆成功后(SStartGame),服务端会下发大量消息,最后一条消息下发时,数据都同步到客户端,可以开始界面显示
	public onPassive(event: any) {
		let data = event.data.DATA
		if (data.mID === 218) {		//登陆成功后最后下发的消息是: SGuildBuffList
			//玩家信息完整同步客户端后,根据数据显示主界面
			if (this.cfg.loding === true) {
				this.cfg.loding = false
				//关闭登陆界面
				gMgrs["DialogMgr"].close_dlg({
					Type: 2, Name: "Login", Callback: function () {
						//打开主界面
						gMgrs["DialogMgr"].open_dlg({
							Type: 2, Name: "MainUI", Blank: false, Elastic: false, Pierce: true, Callback: function () {
								//打开地图层
								gMgrs["DialogMgr"].open_dlg({
									Type: 1, Name: "MainScenes", Blank: false, Elastic: false, Pierce: true, Callback: function () {
										//调用各Mgr的broadcast函数,广播数据, MainUI已经打开监听, 广播后会刷新数据.
										gMgrs["PlayerMgr"].broadcast()
										
										//关闭游戏载入界面
										console.log("Login Succ")
									}.bind(this)
								})

								//载入资源
								if (gMgrs["ComMgr"].gCNT().CHANNEL === 1)
									platform.openDataContext.postMessage({ command: 'loadRes' });

							}.bind(this)
						})
					}.bind(this)
				})
			}
		}
	}
}