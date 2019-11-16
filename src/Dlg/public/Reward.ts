class Reward {
	private _root: fairygui.GComponent
	private _view: fairygui.GComponent
	public constructor(_root: fairygui.GComponent) {
		this._root = _root
		this._view = <fairygui.GComponent>this._root.getChild("background")
		gMgrs["ComMgr"].touch_btn(<fairygui.GButton>this._view.getChild("btn_close"), this.btn_callback, this)
	}
	private btn_callback(evt: egret.TouchEvent) {
		evt.stopImmediatePropagation();
		let btn_name = evt.currentTarget.name
		if (btn_name === "btn_close") {
			gMgrs["DialogMgr"].close_dlg({
				Type: 2, Name: "Reward", Callback: function () {

				}
			})
		}
	}
	public destroy() {
		gMgrs["ComMgr"].untouch_btn(<fairygui.GButton>this._view.getChild("btn_close"), this.btn_callback, this)
		this._view = null
		this._root = null
	}
}
