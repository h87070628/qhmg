class LevyCell {
	private _root: fairygui.GComponent;
	private _view: fairygui.GComponent;
	private _goodsId: number;
	private _cellNum: number;
	private _price:number;
	public constructor(_root: fairygui.GComponent) {
		this._root = _root;
		this._view = <fairygui.GComponent>_root.getChild("background")
		//console.log("数量选择==========", this._root.data.param);
		gMgrs['ComMgr'].touch_btn(<fairygui.GComponent>this._view.getChild("confirm"), this.btn_callback, this)
		this.loadView();
	}
	public loadView() {
		let data = this._root.data.param
		this._view.getChild("title").text = data.title
		this._view.getChild("confirm").text = data.comfirmText
		let infos = gMgrs["CfgMgr"].gs("goods_list_json")
		//let counterInfo = data.product.split(":");
		this._goodsId = data.product.ID;
		let info = infos[String(data.product.ID).slice(0, -2)]
		this._view.getChild("name").text = info.name
		let quality = Number(String(data.product.ID).slice(-2))
		this._view.getChild("quality").text = "品质:" + (quality == 1 ? "劣质" : (quality == 2 ? "普通" : "优质"))
		this._view.getChild("price").text = data.priceText + data.product.price
		this._price = data.product.price
		this._view.getChild("sliderName").text = data.sliderName
		let priceSlider = <fairygui.GSlider>this._view.getChild("slider")
		priceSlider.value = 0
		priceSlider.max = Number(data.product.count) > data.maxCount ? data.maxCount : Number(data.product.count)
		priceSlider.addEventListener(fairygui.StateChangeEvent.CHANGED, this.onPriceChanged, this)
		this._view.getChild("sliderNum").text = "" + 0
	}
	public destroy() {
		gMgrs['ComMgr'].untouch_btn(<fairygui.GComponent>this._view.getChild("confirm"), this.btn_callback, this)
		let priceSlider = <fairygui.GSlider>this._view.getChild("slider")
		priceSlider.removeEventListener(fairygui.StateChangeEvent.CHANGED, this.onPriceChanged, this)
		this._goodsId = 0
		this._cellNum = 0
		this._root = null
		this._view = null
	}
	// 
	public onPriceChanged(event: fairygui.ItemEvent) {
		this._view.getChild("sliderNum").text = event.currentTarget.value + ""
		this._cellNum = Number(event.currentTarget.value)
	}
	// 回调
	public btn_callback(evt: egret.TouchEvent) {
		evt.stopImmediatePropagation();				//阻止事件向父节点传递
		let btn_name = evt.currentTarget.name
		let callback = this._root.data.param.callback
		if (callback) {
			if(this._cellNum ===0){
				gMgrs["ComMgr"].open_fly("征收数量不能为0");
				return ;
			}
			let data = { good_id: this._goodsId, cellNum: this._cellNum,price:this._price}
			gMgrs["DialogMgr"].close_dlg({
				Type: 2, Name: "LevyCell", Callback: function () {
					callback(data)
				}
			})
		}
	}
}