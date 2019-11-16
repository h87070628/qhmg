class FloatingWorld {
	private _root: fairygui.GComponent;
	private _view: fairygui.GComponent;
	private _stop: Function;
	public constructor(_root: fairygui.GComponent) {
		this._root = _root
		this._view = <fairygui.GComponent>this._root.getChild("background");
		let text: fairygui.GRichTextField = <fairygui.GRichTextField>this._view.getChild("n1")
		text.text = this._root.data.param.text
		//飘字效果,3秒后自动关闭
		this._stop = gMgrs["ComMgr"].run_once(function () {
			gMgrs["DialogMgr"].close_dlg({ Type: 3, Name: "FloatingWorld" })
			this._stop = null
		}.bind(this), 1500)
	}
	public destroy() {
		if(this._stop){
			this._stop()
		}
		this._stop = null
		this._view = null
		this._root = null
	}
}