/*
//飘字
*/
class Flyword {
	private _root: fairygui.GComponent;
	private _view: fairygui.GComponent;
	private _stop: Function;

	public constructor(_root: fairygui.GComponent) {
		this._root = _root;
		//this._root.data.param
		//this._root.data.close
		this._view = <fairygui.GComponent>_root.getChild("background")
		let text: fairygui.GRichTextField = <fairygui.GRichTextField>this._view.getChild("n1")
		text.text = this._root.data.param.text

		//飘字效果,3秒后自动关闭
		this._stop = gMgrs["ComMgr"].run_once(function () {
			gMgrs["DialogMgr"].close_dlg({ Type: 3, Name: "Flyword" })
			this._stop = null
		}.bind(this), 3000)
	}
	public destroy() {
		if(this._stop){
			this._stop()
		}
		this._stop = null
		this._root = null
		this._view = null
	}
}