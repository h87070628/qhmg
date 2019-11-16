/*
	--[[游戏地图层]]--
*/
class MainScenes {
	private _root: fairygui.GComponent
	private _view: fairygui.GComponent
	public constructor(_root: fairygui.GComponent) {
		this._root = _root
		this._view = <fairygui.GComponent>this._root.getChild("background")
		this.onLoadView()
		gMgrs["EventMgr"].addEvent(gMgrs["ComMgr"].gCNT().EVENT.MAP_MSG, this.onUpdateUI, this);
	}

	public onLoadView() {
		console.log("MainScenes__")
	}
	public destroy() {
		gMgrs["EventMgr"].delEvent(gMgrs["ComMgr"].gCNT().EVENT.MAP_MSG, this.onUpdateUI, this);

		this._view = null
		this._root = null
	}

	private onUpdateUI(event: any) {
		if (typeof (event.data.TARGET) === "undefined" || event.data.TARGET === null || event.data.TARGET === "MainScenes") {
			if (event.data.TYPE === "MapMgr") {
				if (event.data.PARAM === "INIT") {
					this.on_update_maps(event.data.DATA)
				}
			}
		}
	}

	//绘制地图
	private on_update_maps(data) {
		//let _url = "" + head[index].head.headImage
		//iconLoader.url = `ui://_Common_00/${_url}`;
	}
}