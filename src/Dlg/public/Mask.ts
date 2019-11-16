/*
*遮罩层
*/
class Mask {
	private _root: fairygui.GComponent;
	private _view: fairygui.GComponent;

	public constructor(_root: fairygui.GComponent) {
		this._root = _root;
		//this._root.data.param
		//this._root.data.close
		this._view = <fairygui.GComponent>_root.getChild("background")
	}

	public destroy() {
		this._root = null
		this._view = null
	}
}