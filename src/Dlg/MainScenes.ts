/*
	--[[游戏地图层]]--
*/
class MainScenes {
	private _root: fairygui.GComponent
	private _view: fairygui.GComponent
	private cfg: any
	public constructor(_root: fairygui.GComponent) {
		this._root = _root
		this._view = <fairygui.GComponent>this._root.getChild("background")
		this.cfg = {
			tmxTileMap: null,
		}
		this.onLoadView()
		gMgrs["EventMgr"].addEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, this.onUpdateUI, this);
		gMgrs["EventMgr"].addEvent(gMgrs["ComMgr"].gCNT().EVENT.MAP_MSG, this.onUpdateUI, this);
		console.log("======================X2:")
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
			if (event.data.TYPE === "PlayerMgr") {
				//初始化地图
				if (event.data.PARAM === "INIT") {
					this.on_update_maps(event.data.DATA)
				}
			}else if(event.data.TYPE === "MapMgr"){
				//切换地图
				if (event.data.PARAM === "UPDATE") {
					this.on_update_maps(event.data.DATA)
				}
			}
		}
	}

	//绘制地图
	private on_update_maps(data_) {
		//let _url = "" + head[index].head.headImage
		//iconLoader.url = `ui://_Common_00/${_url}`;
		console.log("====================================")
		//加载TiledMap
		RES.getResAsync("desert", function (data, key): void {
			if(this.cfg.tmxTileMap){
				this._view._container.removeChild(this.cfg.tmxTileMap);
			}

			let tiled_:any = egret.XML.parse(data);
			let tmxTileMap: tiled.TMXTilemap = new tiled.TMXTilemap(2000, 2000, tiled_, "resource/assets/maps/");
			this.cfg.tmxTileMap.render();
			this._view._container.addChild(tmxTileMap);
		}.bind(this), this)
	}

	//构造碰撞区域
}