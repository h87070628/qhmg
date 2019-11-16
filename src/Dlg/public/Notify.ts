/*
*通知框
*/
class Notify {
	private _root: fairygui.GComponent;
	private _view: fairygui.GComponent;

	public constructor(_root: fairygui.GComponent) {
		this._root = _root;
		//this._root.data.param
		//this._root.data.close
		this._view = <fairygui.GComponent>_root.getChild("background")

		let param = this._root.data.param

		if (typeof (param.title) === "undefined" || param.title === null) {
			param.title = "提示"
		}
		if (typeof (param.content) === "undefined" || param.content === null) {
			param.content = "___内容___"
		}
		if (typeof (param.btn_title) === "undefined" || param.btn_title === null) {
			param.btn_title = "确定"
		}
		if (typeof (param.btn_title_cancel) === "undefined" || param.btn_title_cancel === null) {
			param.btn_title_cancel = "取消"
		}

		let widget: any = null
		widget = <fairygui.GTextField>this._view.getChild("title")
		widget.text = param.title

		widget = <fairygui.GTextField>this._view.getChild("content")
		widget.text = param.content

		widget = <fairygui.GButton>this._view.getChild("confirm")
		widget.text = param.btn_title

		widget = <fairygui.GButton>this._view.getChild("cancel")
		widget.text = param.btn_title_cancel

		gMgrs["ComMgr"].touch_btn(<fairygui.GButton>this._view.getChild("confirm"), this.btn_callback, this)
		gMgrs["ComMgr"].touch_btn(<fairygui.GButton>this._view.getChild("cancel"), this.btn_callback, this)
	}

	public destroy() {
		gMgrs["ComMgr"].untouch_btn(<fairygui.GButton>this._view.getChild("confirm"), this.btn_callback, this)
		gMgrs["ComMgr"].untouch_btn(<fairygui.GButton>this._view.getChild("cancel"), this.btn_callback, this)


		this._root = null
		this._view = null
	}

	public btn_callback(evt: egret.TouchEvent) {
		evt.stopImmediatePropagation();				//阻止事件向父节点传递

		//阻止按钮被再次点击,防止按钮连点{TODO}
		//evt.currentTarget

		let btn_name = evt.currentTarget.name
		if (btn_name === "confirm") {
			console.log("confirm")
			if (this._root.data.param.callback) {
				this._root.data.param.callback()
			}
			gMgrs["DialogMgr"].close_dlg({ Type: 3, Name: "Notify" })
		}else if(btn_name === "cancel"){
			gMgrs["DialogMgr"].close_dlg({ Type: 3, Name: "Notify" })
		}
	}
}