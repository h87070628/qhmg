/*
*重启游戏的时候, 该管理器只会清理窗口,不会清理资源
*/
class DialogMgr {

	private stage_: egret.Stage;

	public constructor(stage: egret.Stage) {
		console.log("new DialogMgr")
		this.stage_ = stage;

		//加载公共组件
		if (!fairygui.UIPackage.getByName("_Common_00")) {
			fairygui.UIPackage.addPackage("_Common_00");
		}

		this.init_Layouts();
	}

	public init_Layouts() {

		this.stage_.addChild(fairygui.GRoot.inst.displayObject);

		//创建4个根layout
		let Layouts: string[] = ["WAR_LAYOUT", "UI_LAYOUT", "COM_LAYOUT", "MASK_LAYOUT"]
		let ui: fairygui.GComponent;
		for (let i = 0; i < Layouts.length; i++) {
			ui = new fairygui.GComponent();
			ui.name = Layouts[i]
			ui.setSize(fairygui.GRoot.inst.width, fairygui.GRoot.inst.height)
			fairygui.GRoot.inst.addChild(ui);
		}
	}

	public destroy() {
		//关闭全部已打开的窗口
		this.close_all()

		///*
		fairygui.GRoot.inst.removeChildren()
		this.stage_.removeChild(fairygui.GRoot.inst.displayObject);

		//卸载公共组件
		//包卸载，对象也要全部卸载。(TODO)
		//fairygui.UIPackage.removePackage("_Common_00");

		this.stage_ = null;
		//*/
	}

	/*
    --打开界面
    param = {
        Type = 1,						--代表打开的窗口属于哪个层
        Name = "ModelLayer",			--NOTE:窗口的名字一定要跟games/dlg/下对应,会根据这个名字去加载脚本
        Data = {a = 1, b = "vVv"},		--创建窗口时的参数
        Blank = true,					--点击空白区域是否关闭窗口
        Elastic = false,				--是否使用动效
		Pierce = false,					--是否不拦截全部点击
        Callback = function,            --打开后的回调,因为加载预制体是异步过程,所以在大部分场景下需要回调
    }
    返回值:
        0.正常打开
        1.参数错误
        2.窗口已存在
		3.窗口资源加载失败
    */
	public open_dlg(param: any) {
		if (typeof (param.Data) === "undefined") {
			param.Data = {}
		}
		if (typeof (param.Order) === "undefined") {
			param.Order = 0
		}
		if (typeof (param.Blank) === "undefined") {
			param.Blank = true
		}
		if (typeof (param.Elastic) === "undefined") {
			param.Elastic = true
		}
		if (typeof (param.Pierce) === "undefined") {
			param.Pierce = false
		}

		let pNode: fairygui.GComponent;
		if (param.Type == 1) {
			pNode = <fairygui.GComponent>fairygui.GRoot.inst.getChild("WAR_LAYOUT")
		} else if (param.Type == 2) {
			pNode = <fairygui.GComponent>fairygui.GRoot.inst.getChild("UI_LAYOUT")
		} else if (param.Type == 3) {
			pNode = <fairygui.GComponent>fairygui.GRoot.inst.getChild("COM_LAYOUT")
		} else if (param.Type == 4) {
			pNode = <fairygui.GComponent>fairygui.GRoot.inst.getChild("MASK_LAYOUT")
		} else {
			console.log("ERROR: DialogMgr.open_dlg")
		}

		//Type参数错误
		if (pNode == null) {
			return 1
		}

		//窗口已打开
		if (pNode.getChild(param.Name) != null) {
			return 2
		}

		//检查该窗口依赖的资源文件是否已经准备好.
		//已准备好则继续显示
		//未准备好则弹出资源动态加载界面(玩家此时不可进行任何操作),载入完毕后继续显示界面(TODO)

		//这里涉及到内存管理的问题,如果需要内存占用小,就必须用时加载,关闭清理,优点:是内存占用小, 缺点:是频繁读取硬盘数据,容易导致手机发烫, 这里暂时采用才该方案.
		//另外一种策略是窗口一旦打开,相关数据缓存到内存,优点的是:界面打开速度快,手机不容易发烫, 缺点:内存会比较大
		//加载窗口资源
		if (fairygui.UIPackage.getByName(param.Name)) {
			fairygui.UIPackage.removePackage(param.Name)
		}
		if (!fairygui.UIPackage.getByName(param.Name)) {
			if (!fairygui.UIPackage.addPackage(param.Name)) {
				return 3
			}
		}

		//添加到主节点
		let _view: fairygui.GComponent = fairygui.UIPackage.createObject(param.Name, "Component1").asCom;
		_view.setSize(fairygui.GRoot.inst.width, fairygui.GRoot.inst.height);
		_view.name = param.Name
		pNode.addChild(_view);

		_view.data = {
			inst: null,
			close: Function
		};

		//执行动效
		let trans: fairygui.Transition = _view.getTransition("t0")

		//背景区域点击
		let back_touch = function (evt: egret.TouchEvent) {
			//console.log("___222___" + param.Name)
			gMgrs["EventMgr"].sendEvent("Entrance", { TYPE: 0, BuildingId: "0" })
			evt.stopImmediatePropagation();		//阻止事件向父节点传递
		}

		//空白区域点击(关闭当前窗口)
		let blank_touch = function (evt: egret.TouchEvent) {
			//console.log("___111___" + param.Name)
			gMgrs["ComMgr"].open_mask()

			if (evt) {
				evt.stopImmediatePropagation();		//阻止事件向父节点传递
			}

			let delay_ = 0
			if (param.Elastic === true) {
				trans.play(null, null, null, 1, 0, 0.25, 0.5);
				delay_ = 300
			}

			//0.3秒后动态关闭界面
			gMgrs["ComMgr"].run_once(function () {
				if (param.Pierce) {
				} else {
					//开始节点删除
					if (param.Blank === true) {
						_view.removeEventListener(egret.TouchEvent.TOUCH_TAP, blank_touch, this);
					} else {
						_view.removeEventListener(egret.TouchEvent.TOUCH_TAP, back_touch, this);
					}

					let background: fairygui.GComponent = <fairygui.GComponent>_view.getChild("background")
					background.removeEventListener(egret.TouchEvent.TOUCH_TAP, back_touch, this);
				}

				//实例析构
				//放置被重复调用
				if (typeof (_view.data) === "undefined" || _view.data === null) {
				} else {
					if (typeof (_view.data.inst) === "undefined" || _view.data.inst === null) {
					} else {
						_view.data.inst.destroy()
						_view.data.inst = null
						_view.data = null

						//清理节点
						pNode.removeChild(_view)
						if (fairygui.UIPackage.getByName(param.Name)) {
							fairygui.UIPackage.removePackage(param.Name)
						}
					}
				}

				gMgrs["ComMgr"].close_mask()
			}.bind(this), delay_)
			
			//关闭窗口有延时, 发送窗口即将关闭消息
			gMgrs["EventMgr"].sendEvent("SOON_CLOSE", { TYPE: 0 })
		}

		_view.data.close = blank_touch
		_view.data.param = param.Data

		//加载脚本{TODO}
		//if (param.Name === "Login") {
		//保存脚本实例,当删除组件时需要释放该实例
		//_view.data.inst = new Login(_view);
		//_view.data.inst = new window[param.Name](_view);		//wx下没有window对象
		//}
		this.create_view(_view, param.Name)

		let background: fairygui.GComponent = <fairygui.GComponent>_view.getChild("background")
		background.setScale(fairygui.GRoot.inst.width/720, fairygui.GRoot.inst.height/1280);
		if (param.Pierce) {
			_view.opaque = false
			background.opaque = false
		} else {
			//设置"空白区域"回调,
			//如果为true则点击后关闭, 
			//否则点击后只拦截事件,并阻止向父节点传递.
			_view.opaque = true
			if (param.Blank === true) {
				_view.addEventListener(egret.TouchEvent.TOUCH_TAP, blank_touch, this);
			} else {
				_view.addEventListener(egret.TouchEvent.TOUCH_TAP, back_touch, this);
			}

			//点击背景区域,吞噬点击事件
			background.opaque = true
			background.addEventListener(egret.TouchEvent.TOUCH_TAP, back_touch, this);
		}
		//播放界面打开动效
		if (param.Elastic === true) {
			trans.play(null, null, null, 1, 0, 0.0, 0.25);
			gMgrs["ComMgr"].run_once(function () {
				//加载完毕后执行回调函数
				if (typeof (param.Callback) === "function") {
					param.Callback()
					gMgrs["EventMgr"].sendEvent(gMgrs["ComMgr"].gCNT().EVENT.TRIGGER_GUIDE, { TARGET: "GuideMgr", TYPE: "open_dlg", DATA: { Name: param.Name } })
				}
			}.bind(this), 300)
		} else {
			if (typeof (param.Callback) === "function") {
				param.Callback()
				gMgrs["EventMgr"].sendEvent(gMgrs["ComMgr"].gCNT().EVENT.TRIGGER_GUIDE, { TARGET: "GuideMgr", TYPE: "open_dlg", DATA: { Name: param.Name } })
			}
		}

		return 0;
	}

	/*
    --关闭界面
    --[[
    param = {
	    Type = 1,						--代表打开的窗口属于哪个层
	    Name = "ModelLayer",			--NOTE:窗口的名字一定要跟games/dlg/下对应,会根据这个名字去加载脚本
	    Callback = function,			--关闭后的回调函数
    }
    --]]
    */
	public close_dlg(param: any) {
		let pNode: fairygui.GComponent;
		if (param.Type == 1) {
			pNode = <fairygui.GComponent>fairygui.GRoot.inst.getChild("WAR_LAYOUT")
		} else if (param.Type == 2) {
			pNode = <fairygui.GComponent>fairygui.GRoot.inst.getChild("UI_LAYOUT")
		} else if (param.Type == 3) {
			pNode = <fairygui.GComponent>fairygui.GRoot.inst.getChild("COM_LAYOUT")
		} else if (param.Type == 4) {
			pNode = <fairygui.GComponent>fairygui.GRoot.inst.getChild("MASK_LAYOUT")
		} else {
			console.log("ERROR: DialogMgr.open_dlg")
		}
		//Type参数错误
		if (pNode == null) {
			return 1
		}

		//窗口未找到
		if (pNode.getChild(param.Name) == null) {
			return 2
		}

		//动效窗口有250毫秒的延迟
		pNode.getChild(param.Name).data.close();

		//窗口关闭后执行回调函数
		gMgrs["ComMgr"].run_once(function () {
			if (typeof (param.Callback) === "function") {
				param.Callback()
			}
		}, 500)

		return 0;
	}

	//查找某个窗口
	/*
	--[[
    param = {
	    Type = 1,						--代表打开的窗口属于哪个层
	    Name = "ModelLayer",			--NOTE:窗口的名字一定要跟games/dlg/下对应,会根据这个名字去加载脚本
    }
    --]]
	*/
	public get_dlg(param: any) {
		let pNode: fairygui.GComponent;
		if (param.Type == 1) {
			pNode = <fairygui.GComponent>fairygui.GRoot.inst.getChild("WAR_LAYOUT")
		} else if (param.Type == 2) {
			pNode = <fairygui.GComponent>fairygui.GRoot.inst.getChild("UI_LAYOUT")
		} else if (param.Type == 3) {
			pNode = <fairygui.GComponent>fairygui.GRoot.inst.getChild("COM_LAYOUT")
		} else if (param.Type == 4) {
			pNode = <fairygui.GComponent>fairygui.GRoot.inst.getChild("MASK_LAYOUT")
		} else {
			console.log("ERROR: DialogMgr.open_dlg")
		}


		//Type参数错误
		if (pNode == null) {
			return null
		}

		//窗口未找到
		let view = pNode.getChild(param.Name)
		if (!view) {
			return null
		}

		return view
	}

	//清理全部已经添加的界面
	public close_all() {
		let Layouts: string[] = ["WAR_LAYOUT", "UI_LAYOUT", "COM_LAYOUT", "MASK_LAYOUT"]
		let pNode: fairygui.GComponent;
		for (let i = 0; i < Layouts.length; i++) {
			pNode = <fairygui.GComponent>fairygui.GRoot.inst.getChild(Layouts[i])
			for (let j = 0; j < pNode.numChildren; j++) {
				this.close_dlg({ Type: i + 1, Name: pNode._children[j].name })

				//清理包资源
				fairygui.UIPackage.removePackage(pNode._children[j].name)
			}
		}
	}

	//根据字段创建窗口实例
	private create_view(view, name) {
		if (name === "Login") {
			view.data.inst = new Login(view);
		} else if (name === "Mask") {
			view.data.inst = new Mask(view);
		} else if (name === "Flyword") {
			view.data.inst = new Flyword(view);
			view.data.inst = new Mask(view);
		} else if (name === "FloatingWorld") {
			view.data.inst = new FloatingWorld(view);
		} else if (name === "Notify") {
			view.data.inst = new Notify(view);
		} else if (name === "Choice") {
			view.data.inst = new Choice(view);
		} else if (name === "MainUI") {
			view.data.inst = new MainUI(view);
		} else if (name === "Input") {
			view.data.inst = new Input(view);
		} else if (name === "Switch") {
			view.data.inst = new Switch(view);
		} else if (name === "BulidDlg") {
			view.data.inst = new BuildDlg(view);
		} else if (name === "LevyCell") {
			view.data.inst = new LevyCell(view);
		} else if(name === "MainScenes"){
			view.data.inst = new MainScenes(view)
		}
	}
}