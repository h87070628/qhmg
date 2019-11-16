/*
*选择界面
*/
class Choice {
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
		if (typeof (param.confirm_btn_text) === "undefined" || param.confirm_btn_text === null) {
			param.confirm_btn_text = "确定"
		}
		if (typeof (param.cancel_btn_text) === "undefined" || param.cancel_btn_text === null) {
			param.cancel_btn_text = "取消"
		}

		let widget: any = null
		widget = <fairygui.GTextField>this._view.getChild("title")
		widget.text = param.title

		widget = <fairygui.GTextField>this._view.getChild("content")
		widget.text = param.content

		widget = <fairygui.GButton>this._view.getChild("confirm_btn")
		widget.text = param.confirm_btn_text

		widget = <fairygui.GButton>this._view.getChild("cancel_btn")
		widget.text = param.cancel_btn_text

		gMgrs["ComMgr"].touch_btn(<fairygui.GButton>this._view.getChild("confirm_btn"), this.btn_callback, this)
		gMgrs["ComMgr"].touch_btn(<fairygui.GButton>this._view.getChild("cancel_btn"), this.btn_callback, this)
	}

	public destroy() {
		gMgrs["ComMgr"].untouch_btn(<fairygui.GButton>this._view.getChild("confirm_btn"), this.btn_callback, this)
		gMgrs["ComMgr"].untouch_btn(<fairygui.GButton>this._view.getChild("cancel_btn"), this.btn_callback, this)

		this._root = null
		this._view = null
	}

	public btn_callback(evt: egret.TouchEvent) {
		evt.stopImmediatePropagation();				//阻止事件向父节点传递

		//阻止按钮被再次点击,防止按钮连点{TODO}
		//evt.currentTarget

		let btn_name = evt.currentTarget.name
		if (btn_name === "confirm_btn") {
			this.onConfirm()
		} else if (btn_name === "cancel_btn") {
			let onCancel = this._root.data.param.onCancel
			gMgrs["DialogMgr"].close_dlg({
				Type: 3, Name: "Choice", Callback: function () {
					if (onCancel) {
						onCancel()
					}
				}
			})
		}
	}

	public onConfirm() {
		let onConfirm = this._root.data.param.onConfirm
		gMgrs["DialogMgr"].close_dlg({
			Type: 3, Name: "Choice", Callback: () => {
				if (onConfirm) {
					onConfirm()

				}
			}
		})
	}

}