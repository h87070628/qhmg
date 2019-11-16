// TypeScript file
class Input {
	private _root: fairygui.GComponent;
	private _view: fairygui.GComponent;

	public constructor(_root: fairygui.GComponent) {
		this._root = _root;
		//this._root.data.param
		//this._root.data.close
		this._view = <fairygui.GComponent>_root.getChild("background")
		this._view.getChild("title").text = this._root.data.param.title
		gMgrs["ComMgr"].touch_btn(<fairygui.GButton>this._view.getChild("confirm"), this.btn_callback, this)
	}

	public destroy() {
		gMgrs["ComMgr"].untouch_btn(<fairygui.GButton>this._view.getChild("confirm"), this.btn_callback, this)
		this._root = null
		this._view = null
	}

	public btn_callback(evt: egret.TouchEvent) {
		evt.stopImmediatePropagation();				//阻止事件向父节点传递
		let btn_name = evt.currentTarget.name
		if (btn_name === "confirm") {
			this._root.data.param.callback(this._view.getChild("input").text)
			this._root.data.close()
		}
	}
}