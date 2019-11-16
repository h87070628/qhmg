
/*
//数据管理模块
//*****重要*****: 数据的流向唯一路径 网络 -> DataMgr -> xxxMgr -> xxxDlg
*/

class DataMgr {
	private cfg: any;

	private init_data() {
		this.cfg = {
			player_data: {},
			local_data: {},
			map_data: {},
		}
	}

	//构造函数
	public constructor() {
		console.log("new DataMgr")
		this.init_data()
	}

	//析构函数
	public destroy() {
		console.log("destroy DataMgr")
	}

	//处理来自网络的数据
	public process_msg(data: any) {
		//数据修改可以直接在这里处理
		//this.cfg.player_data.xx = ???
		//data.mID, data.mInfo
		//console.log(data)
		if (data.ret === -99999) {
			//token验证失败,回到登陆界面
			gMgrs["ComMgr"].open_ntf({
				callback: function () {
					gMgrs["EventMgr"].sendEvent("RESTART", { TYPE: 0 })
				}.bind(this), title: "提示框", content: "网络发生错误,请重新登陆", btn_title: "确定"
			})

		} else {
			//涉及到逻辑更新,分发给具体的管理器, 再通过管理器通过消息广播到各个dlg
			gMgrs["EventMgr"].sendEvent(gMgrs["ComMgr"].gCNT().EVENT.NETWORK_MSG, { TYPE: "network_msg", DATA: data })
		}
	}

	//被动消息,例如(红点, 主城建筑升级)
	public passive_msg(data: any) {
		gMgrs["EventMgr"].sendEvent(gMgrs["ComMgr"].gCNT().EVENT.PASSIVE_MSG, { TYPE: "passive_msg", DATA: data })
	}

	//存储玩家数据
	public get_player_data() {
		return this.cfg.player_data
	}

	public get_local_data() {
		return this.cfg.local_data
	}

	//存储当前地图数据
	public get_map_data(){
		return this.cfg.map_data
	}

	//每3秒心跳一次
	public heartbeat() {
	}
}