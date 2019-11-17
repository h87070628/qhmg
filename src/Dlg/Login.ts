/*
	//登陆界面
*/
class Login {
	private _root: fairygui.GComponent;
	private _view: fairygui.GComponent;

	private _account_panel: fairygui.GComponent;
	private _server_panel: fairygui.GComponent;
	private _playerData: any;
	private _server_idx: number;
	private _refresh_data: any;

	private cfg: any;

	//构造函数
	public constructor(_root: fairygui.GComponent) {
		this.cfg = {
			server_list: {},		//服务器列表
			server_info: {			//当前服务器信息
				id: 0,
				name: "剑齿虎的尾巴",
				status: -1,
			},
		}

		this._root = _root;
		//this._root.data.param
		//this._root.data.close
		this._view = <fairygui.GComponent>_root.getChild("background")
		this._view.visible = false;

		gMgrs["ComMgr"].touch_btn(<fairygui.GButton>this._view.getChild("login_btn"), this.btn_callback, this)
		gMgrs["ComMgr"].touch_btn(<fairygui.GButton>this._view.getChild("btn_setting"), this.btn_callback, this)
		gMgrs["ComMgr"].touch_btn(<fairygui.GButton>this._view.getChild("choose_svr"), this.btn_callback, this)
		gMgrs["ComMgr"].touch_btn(<fairygui.GButton>this._view.getChild("test_btn"), this.btn_callback, this)
		gMgrs["ComMgr"].touch_btn(<fairygui.GButton>this._view.getChild("top_btn"), this.btn_callback, this)
		gMgrs["ComMgr"].touch_btn(<fairygui.GButton>this._view.getChild("right_btn"), this.btn_callback, this)
		gMgrs["ComMgr"].touch_btn(<fairygui.GButton>this._view.getChild("bom_btn"), this.btn_callback, this)
		gMgrs["ComMgr"].touch_btn(<fairygui.GButton>this._view.getChild("left_btn"), this.btn_callback, this)

		gMgrs["EventMgr"].addEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, this.get_serverinfo, this)
		this._view.getChild("login_btn").visible = false
		//自动选择一个默认的服务器
		this.choose_server(function () {
			this.update_server()
			this._view.visible = true;
		}.bind(this))

		//开启后台资源下载(TODO)
		let channel = gMgrs["ComMgr"].gCNT().CHANNEL

		if (channel === 0) {
			this._view.getChild("login_btn").visible = true
		}
		gMgrs["PlatformMgr"].login_game();
	}

	//析构函数
	public destroy() {
		gMgrs["ComMgr"].untouch_btn(<fairygui.GButton>this._view.getChild("login_btn"), this.btn_callback, this)
		gMgrs["ComMgr"].untouch_btn(<fairygui.GButton>this._view.getChild("btn_setting"), this.btn_callback, this)
		gMgrs["ComMgr"].untouch_btn(<fairygui.GButton>this._view.getChild("choose_svr"), this.btn_callback, this)
		gMgrs["ComMgr"].untouch_btn(<fairygui.GButton>this._view.getChild("test_btn"), this.btn_callback, this)

		gMgrs["EventMgr"].delEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, this.get_serverinfo, this)

		this._root = null
		this._view = null
	}

	private async loadResource() {
		const loadingView = new LoadingUI();
		//this.stage.addChild(loadingView);
		//按需加载本地资源组
		await RES.loadGroup("preload", 0, loadingView);
		await RES.loadGroup("maps", 0, loadingView);

		//加载远程资源组
		//await RES.loadGroup("r_preload_00", 0, loadingView);
		//加载远程公共组件
		//if (!fairygui.UIPackage.getByName("r_preload_00")) {
		//	fairygui.UIPackage.addPackage("r_preload_00");
		//}

		//this.stage.removeChild(loadingView);
	}

	public update_server() {
		console.log(this.cfg.server_info)
		let name = <fairygui.GTextField>this._view.getChild("svr_name");
		name.text = this.cfg.server_info.name
		//let status = <fairygui.GImage>this._view.getChild("status");
		// if (this.cfg.server_info.status === 0) {
		// 	status.color = 0x33CCFF;
		// } else {
		// 	status.color = 0xFFFFFF;
		// }
	}

	//选择一个默认的服务器
	public async choose_server(callback: Function) {
		await this.loadResource();
		//拉取服务器列表
		let param = {}
		param = { "cmd": 10001, "param": { "token": 0 } }
		gMgrs["ComMgr"].sends(param, function (jdata) {
			console.log(jdata.data.time)
			gMgrs["ComMgr"].set_svr_deviation((Math.floor(Date.now() / 1000)) - jdata.data.time)

			console.log(jdata.data.svr_list)
			this.cfg.server_list = jdata.data.svr_list

			let count = jdata.data.svr_list.length
			let cur_S = gMgrs["LocalMgr"].get_data("choose_server")
			if (cur_S === 0) {
				//玩家没有默认的服务器
				if (count > 0) {
					//选择查询到的最后一个服务器作为默认服务器
					let s_info = jdata.data.svr_list[count - 1]
					gMgrs["LocalMgr"].set_data("choose_server", s_info.id)
					this.cfg.server_info = s_info
				}
			} else {
				//玩家存在默认的服务器, 验证服务器状态正常
				for (let i = 0; i < count; i++) {
					if (jdata.data.svr_list[i].id === cur_S) {
						this.cfg.server_info = jdata.data.svr_list[i]
						break
					}
				}
			}
			callback()
		}.bind(this));
	}

	public close_() {
		console.log("___close___")
		this._root.data.close();
	}

	//拉取玩家游戏信息
	private get_playerinfo() {
		let param = { "cmd": 10005, "param": { "token": gMgrs["PlayerMgr"].get_data("token") } }
		gMgrs["ComMgr"].sends(param, function (jdata) {
			//console.log(jdata.data)
			//jdata.data.player
			//jdata.data.country
			//jdata.data.all_country

			/*
			gMgrs["PlayerMgr"].set_data("base", jdata.data.player)
			gMgrs["PlayerMgr"].set_data("country", jdata.data.country)
			gMgrs["PlayerMgr"].set_data("all_country", jdata.data.all_country)
			gMgrs["PlayerMgr"].set_data("mails", jdata.data.mails)
			gMgrs["PlayerMgr"].set_data("chats", jdata.data.chats)
			*/
			if (jdata.ret === 0) {
				gMgrs["LogicMgr"].game_start()
			} else {
				//拉取信息失败
			}
		}.bind(this))
	}

	public async login_() {
		console.log("___login___")
		//第三方登陆,并获取信息
		//await platform.login();
		//const userInfo = await platform.getUserInfo();
		//console.log(userInfo);

		//获取服务器信息,选择服务器
		//输入账号密码
		let channel = gMgrs["ComMgr"].gCNT().CHANNEL

		if (channel === 0) {			//web平台需要输入账号密码
			gMgrs["DialogMgr"].open_dlg({
				Type: 2, Name: "Input", Callback: function () { }.bind(this), Data: {
					title: "请输入账号密码",
					callback: function (str) {
						if (str.length < 3) {
							gMgrs["ComMgr"].open_float("输入的账号不合法")
						} else {
							//拉取玩家信息
							//console.log("Acc: " + str)
							let token = ""
							let param = {}
							//获取Token
							param = { "cmd": 10000, "param": { "chanel": channel + "", "unique": str } }
							gMgrs["ComMgr"].sends(param, function (jdata) {
								token = jdata.data.token
								gMgrs["PlayerMgr"].set_data("token", jdata.data.token)

								//拉取角色列表
								param = { "cmd": 10002, "param": { "token": token } }
								gMgrs["ComMgr"].sends(param, function (jdata) {
									//console.log(jdata.data)

									//拉取玩家在选择的服务器的角色信息,如果没有角色会自动创建
									let sid = gMgrs["LocalMgr"].get_data("choose_server")
									param = { "cmd": 10004, "param": { "token": token, "svrid": sid } }
									gMgrs["ComMgr"].sends(param, function (jdata) {
										//console.log(jdata.data.roles[0])
										//gMgrs["PlayerMgr"].set_data("base", jdata.data.roles[0])
										//数据整理(TODO)

										//关闭登陆界面
										gMgrs["DialogMgr"].close_dlg({
											Type: 2, Name: "Login", Callback: function () {
												if (jdata.data.roles[0].lastlogin === 0) {
													//新角色(设置角色名和阵营)
													gMgrs["DialogMgr"].open_dlg({
														Type: 2, Name: "NewRole", Callback: function () { }.bind(this), Data: {
															callback: function () {
																//拉取玩家全部数据,交给各个Mgr处理(10005)
																this.get_playerinfo()
															}.bind(this)
														}
													})
												} else {
													//老角色
													//拉取玩家全部数据,交给各个Mgr处理(10005)
													this.get_playerinfo()
												}
											}.bind(this)
										})
									}.bind(this))
								}.bind(this))
							}.bind(this))
						}
					}.bind(this),
				}
			})
		} else if (channel === 1) {
		}
	}
	public LoginGame(channel, str) {
		//拉取玩家信息
		//console.log("Acc: " + str)
		if (!str) {
			return;
		}
		let token = ""
		let param = {}
		//获取Token
		param = { "cmd": 10000, "param": { "chanel": channel + "", "unique": str } }
		gMgrs["ComMgr"].sends(param, function (jdata) {
			token = jdata.data.token
			gMgrs["PlayerMgr"].set_data("token", jdata.data.token)

			//拉取角色列表
			param = { "cmd": 10002, "param": { "token": token } }
			gMgrs["ComMgr"].sends(param, function (jdata) {
				//console.log(jdata.data)

				//拉取玩家在选择的服务器的角色信息,如果没有角色会自动创建
				let sid = gMgrs["LocalMgr"].get_data("choose_server")
				param = { "cmd": 10004, "param": { "token": token, "svrid": sid } }
				gMgrs["ComMgr"].sends(param, function (jdata) {
					//console.log(jdata.data.roles[0])
					//gMgrs["PlayerMgr"].set_data("base", jdata.data.roles[0])
					//数据整理(TODO)

					//关闭登陆界面
					gMgrs["DialogMgr"].close_dlg({
						Type: 2, Name: "Login", Callback: function () {
							if (jdata.data.roles[0].lastlogin === 0) {
								//新角色(设置角色名和阵营)
								gMgrs["DialogMgr"].open_dlg({
									Type: 2, Name: "NewRole", Callback: function () { }.bind(this), Data: {
										callback: function () {
											//拉取玩家全部数据,交给各个Mgr处理(10005)
											this.get_playerinfo()
											if (channel === 0) {
												egret.localStorage.setItem("userId", str);
											}
										}.bind(this)
									}
								})
							} else {
								//老角色
								//拉取玩家全部数据,交给各个Mgr处理(10005)
								this.get_playerinfo()
							}
						}.bind(this)
					})
				}.bind(this))
			}.bind(this))
		}.bind(this))

	}
	//获取服务器信息
	private get_serverinfo(event: any) {
		if (typeof (event.data.TARGET) === "undefined" || event.data.TARGET === "Login") {
			if (event.data.TYPE === "LocalMgr" && event.data.DATA === "choose_server") {
				//找到玩家选择的服务器
				let sid = gMgrs["LocalMgr"].get_data("choose_server")
				for (let i = 0; i < this.cfg.server_list.length; i++) {
					if (this.cfg.server_list[i].id === sid) {
						this.cfg.server_info = this.cfg.server_list[i]
						this.update_server()
						break;
					}
				}
			}
		}
	}

	//创建测试实例
	public test: Test
	public test_() {
		//this.test = new Test(this._root.data.param.stage)
		//this.test.function_01()
		gMgrs["DialogMgr"].open_dlg({
			Type: 1, Name: "Scenes", Elastic: false, Callback: function () {
				console.log("open Scene");
				this.close_()
			}.bind(this)
		})
	}
	//销毁测试实例
	public async login__() {
		this.test.destroy();
		this.test = null;
	}

	//选择服务器
	public choose_svr_() {
		gMgrs["DialogMgr"].open_dlg({ Type: 2, Name: "ChooseSvr", Callback: function () { console.log("open ChooseSvr") }.bind(this), Data: { svr_list: this.cfg.server_list } })
	}

	public btn_callback(evt: egret.TouchEvent) {
		evt.stopImmediatePropagation();				//阻止事件向父节点传递

		//阻止按钮被再次点击,防止按钮连点{TODO}
		//evt.currentTarget

		let btn_name = evt.currentTarget.name
		if (btn_name === "close_btn") {
			this.close_()
		} else if (btn_name === "login_btn") {
			//this.login_() // egret.localStorage.getItem("userId")
			//let str = egret.localStorage.getItem("userId") ? egret.localStorage.getItem("userId") : Math.floor(Math.random() * (99999 - 1000) + 1000)
			//this.LoginGame(0, str)
			gMgrs["LogicMgr"].game_start()
		} else if (btn_name === "choose_svr") {
			this.choose_svr_()
		} else if (btn_name === "btn_setting") {
			gMgrs["DialogMgr"].open_dlg({
				Type: 2, Name: "Setting", Elastic: false, Callback: function () {
					console.log("open Setting");
					gMgrs["EventMgr"].sendEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, { TARGET: null, TYPE: "SETTING", PARAM: "hideStartBtn", DATA: {} })
				}.bind(this), Data: {},
			})
		} else if (btn_name === "test_btn") {
			this.load_tiled()
		} else if (btn_name === "top_btn") {
			this.cfg.tmxTileMap.y = this.cfg.tmxTileMap.y + 32
		} else if (btn_name === "right_btn") {
			this.cfg.tmxTileMap.x = this.cfg.tmxTileMap.x - 64
		} else if (btn_name === "bom_btn") {
			this.cfg.tmxTileMap.y = this.cfg.tmxTileMap.y - 32
		} else if (btn_name === "left_btn") {
			this.cfg.tmxTileMap.x = this.cfg.tmxTileMap.x + 64
		}
	}

	/* **************测试代码************** */
	public load_tiled() {
		//加载TiledMap
		RES.getResAsync("B341_tmx", function (data, key): void {
			if (this.cfg.tmxTileMap) {
				this._view._container.removeChild(this.cfg.tmxTileMap);
			}

			let tiled_: any = egret.XML.parse(data);
			this.cfg.tmxTileMap = new tiled.TMXTilemap(2560, 1280, tiled_, "resource/assets/maps/");
			this.cfg.tmxTileMap.render();
			this._view._container.addChildAt(this.cfg.tmxTileMap, 1);

			//属性
			console.log(this.cfg.tmxTileMap)

			//层
			let layers = this.cfg.tmxTileMap.getLayers()
			let layer: tiled.TMXLayer = null
			for (let i = 0; i < layers.length; i++) {
				if (layers[i] instanceof tiled.TMXLayer) {
					//widht = layers[i].tilewidth
					//height = layers[i].tileheight
					layer = layers[i]
					//console.log(layers[i].getTile(1024, 20))
					let renderer: any = layer.getRenderer()

					//获取障碍物体ID
					let obstacle: egret.Point = renderer.tileToPixelCoords(0, 0)
					let obsID = layer.getTileId(obstacle.x, obstacle.y)

					//根据地图黑白图添加障碍物
					let M2CellInfo = gMgrs["MapMgr"].get_cfg("M2CellInfo")
					for (let ii = 0; ii < this.cfg.tmxTileMap.rows; ii++) {
						for (let jj = 0; jj < this.cfg.tmxTileMap.cols; jj++) {
							console.log("x:"+jj+"y:"+ii+"="+M2CellInfo[ii * this.cfg.tmxTileMap.cols + jj])
							if (M2CellInfo[ii * this.cfg.tmxTileMap.cols + jj] === 0) {
								layer.setTile(jj, ii, obsID)
							}
						}
					}
					//绘制参考线段
					//this.draw_wire(renderer)
				} else if (layers[i] instanceof tiled.TMXObjectGroup) {
					console.log("tiled.TMXObjectGroup")
				}
			}
		}.bind(this), this)
	}

	//绘制线段
	public draw_wire(renderer) {
		let rows = this.cfg.tmxTileMap.rows
		let cols = this.cfg.tmxTileMap.cols
		let width = this.cfg.tmxTileMap.tilewidth
		let height = this.cfg.tmxTileMap.tileheight

		let lt: egret.Point = renderer.tileToPixelCoords(0, 0)
		let lb: egret.Point = renderer.tileToPixelCoords(0, rows - 1)
		let rt: egret.Point = renderer.tileToPixelCoords(cols - 1, 0)
		let rb: egret.Point = renderer.tileToPixelCoords(cols - 1, rows - 1)
		for (let ii = 0; ii < rows; ii++) {
			lt = renderer.tileToPixelCoords(0, ii)
			lb = renderer.tileToPixelCoords(0, ii + 1)
			rt = renderer.tileToPixelCoords(cols, ii)
			rb = renderer.tileToPixelCoords(cols, ii + 1)
			let shp: egret.Shape = this.draw_grid(lt, lb, rt, rb)
			this.cfg.tmxTileMap.addChildAt(shp, 1);
		}

		for (let ii = 0; ii < cols; ii++) {
			lt = renderer.tileToPixelCoords(ii, 0)
			lb = renderer.tileToPixelCoords(ii, rows - 1)
			lb = lb.add(new egret.Point(-width / 2, +height / 2))
			rt = renderer.tileToPixelCoords(ii + 1, 0)
			rb = renderer.tileToPixelCoords(ii + 1, rows - 1)
			rb = rb.add(new egret.Point(-width / 2, +height / 2))
			let shp: egret.Shape = this.draw_grid(lt, lb, rt, rb)
			this.cfg.tmxTileMap.addChildAt(shp, 1);
		}
	}

	//根据左上, 左下, 右上, 右下四个点以及宽高绘制线段
	public draw_grid(lt: egret.Point, lb: egret.Point, rt: egret.Point, rb: egret.Point): egret.Shape {
		let shp: egret.Shape = new egret.Shape();
		shp.graphics.lineStyle(1, 0x00ff00);
		shp.graphics.moveTo(lt.x, lt.y);
		shp.graphics.lineTo(lb.x, lb.y);
		shp.graphics.lineTo(rb.x, rb.y);
		shp.graphics.lineTo(rt.x, rt.y);
		shp.graphics.lineTo(lt.x, lt.y);
		shp.graphics.endFill();
		return shp
	}
}