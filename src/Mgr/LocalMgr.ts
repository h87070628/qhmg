class LocalMgr {
	private cfg: any;

	//初始化数据
	private init_data() {
		this.cfg.choose_server = 0			//设置默认服务器编号
	}

	//构造函数
	public constructor() {
		console.log("new LocalMgr")
		this.cfg = gMgrs["DataMgr"].get_local_data()
		this.init_data()
		this.load_local_data()
	}

	//析构函数
	public destroy() {
		console.log("destroy LocalMgr")
		this.save_local_data()
	}

	//加载本地数据
	public load_local_data() {
		let LData_ = egret.localStorage.getItem("Huos")
		if(LData_){
			//反序列化
			let LData = JSON.parse(LData_)
			this.cfg.choose_server = LData.choose_server
		}
	}

	//保存本地数据
	public save_local_data() {
		let LData = JSON.stringify(this.cfg)
		egret.localStorage.setItem("Huos", LData)
	}

	//获取本地数据
	public get_data(key: string){
		return this.cfg[key]
	}

	//设置本地数据
	public set_data(key: string, value:any){
		this.cfg[key] = value
		//发出数据改变的事件
		gMgrs["EventMgr"].sendEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, { TYPE: "LocalMgr", DATA: key })
		this.save_local_data();
	}
}