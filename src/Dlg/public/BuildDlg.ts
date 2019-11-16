class BuildDlg {

	private _root: fairygui.GComponent;
	private _view: fairygui.GComponent;

	public constructor(_root: fairygui.GComponent) {
		this._root = _root
		this._view = <fairygui.GComponent>_root.getChild("background");
		this.hideBtn();
		this.onloadView();
	}

	public onloadView() {
		console.log("data.param==========", this._root.data.param)
		let level = this._root.data.param.serverData.level ? this._root.data.param.serverData.level : 0
		this._view.getChild("build_name").text = this._root.data.param.confData.data.name
		this._view.getChild("build_lv").text = "等级:" + level + "级"
		this._view.getChild("bulid_content").text = this._root.data.param.confData.data.msg
		this._view.getChild("build_icon").icon = "ui://_Common_00/" + this._root.data.param.confData.data.static
		for (let i = 0; i < this._root.data.param.btnData.length; i++) {
			let data = Number(this._root.data.param.btnData[i]);
			let node = <fairygui.GButton>this._view.getChild(`fun_btn_${i}`);
			gMgrs['ComMgr'].touch_btn(node, this.btn_callback, this);
			node.getChild("title").text = gMgrs["ComMgr"].gCNT().BUILD_BTN_TEXT[`BTN_${data}`]
			node.visible = true
		}
		// 是否显示建筑的贡献度
		if (this._root.data.param.bCityBuild) {
			this.showBuildGx();
		}

	}
	//贡献值显示
	public showBuildGx() {
		let build = Number(this._root.data.param.confData.key);
		let param = { "cmd": 10012, "param": { "token": gMgrs["PlayerMgr"].get_data("token"), "action": 2, "build": build } }
		gMgrs["ComMgr"].sends(param, function (jdata) {
			console.log(jdata.data)
			if (jdata.data.total > 0 && jdata.ret == 0) {
				let cityGx = <fairygui.GTextField>this._view.getChild("city_gx")
				cityGx.text = "总贡献值：" + jdata.data.total
				cityGx.visible = this._root.data.param.bCityBuild
				let myGx = <fairygui.GTextField>this._view.getChild("my_gx")
				myGx.text = "我的贡献值：" + jdata.data.donate
				myGx.visible = this._root.data.param.bCityBuild
				let myPer = <fairygui.GTextField>this._view.getChild("my_per")
				let per = Number((jdata.data.donate / jdata.data.total).toFixed(4));
				myPer.text = "我的贡献值占比：" + (per * 100).toFixed(2) + "%"
				myPer.visible = this._root.data.param.bCityBuild
				this._view.getChild("bottomTip").visible = this._root.data.param.bCityBuild
			} else {
				console.log("查询出差");
			}
		}.bind(this))

	}
	//所有的按钮默认情况都是隐藏的
	public hideBtn() {
		for (let i = 0; i < 6; i++) {
			let node = <fairygui.GButton>this._view.getChild(`fun_btn_${i}`);
			node.visible = false;
		}
	}
	// 移除按钮监听
	public removeBtnTouch() {
		for (let i = 0; i < this._root.data.param.btnData.length; i++) {
			let node = <fairygui.GButton>this._view.getChild(`fun_btn_${i}`);
			gMgrs['ComMgr'].untouch_btn(node, this.btn_callback, this);
		}
	}

	public destroy() {
		this.removeBtnTouch();
		this._root = null
		this._view = null
	}
	public btn_callback(evt: egret.TouchEvent) {
		evt.stopImmediatePropagation();				//阻止事件向父节点传递
		let btn_name = evt.currentTarget.name
		let build_type = this._root.data.param.confData.key; // 建筑类型  ===  配表id
		let index = Number(btn_name.match(/\d/g).join(""))
		if (this._root.data.param.callback) {
			let btn_type = Number(this._root.data.param.btnData[index]);
			let callback = this._root.data.param.callback
			gMgrs["DialogMgr"].close_dlg({
				Type: 2, Name: "BulidDlg", Callback: function () {
					callback(build_type, btn_type);// 传入建筑类型 和 按钮类型 
				}
			})
		}
	}
}