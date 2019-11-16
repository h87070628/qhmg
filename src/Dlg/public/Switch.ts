class Switch {
	private _root: fairygui.GComponent;
	private _view: fairygui.GComponent;

	public constructor(_root: fairygui.GComponent) {
		this._root = _root;
		this._view = <fairygui.GComponent>_root.getChild("background")

		gMgrs["EventMgr"].addEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, this.onUpdateUI, this);

		let trans: fairygui.Transition = this._view.getTransition("t0")
		trans.play();
	}

	public destroy() {
		gMgrs["EventMgr"].delEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, this.onUpdateUI, this);
	}

	private play_stop(){
		let trans: fairygui.Transition = this._view.getTransition("t1")
		trans.play(function(){
			this._root.data.close()
		}.bind(this));
	}

	private onUpdateUI(event: any) {
		if (event.data.TARGET === "Switch") {
			if (event.data.TYPE === "Stop") {
				this.play_stop()
			}
		}
	}
}