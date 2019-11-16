/*
地图对象管理器
*/
class MapMgr {
	private cfg: any;
	private init_data() {
		//地块,可行走&纹理
		this.cfg.M2CellInfo = new Array()

		//对象
		this.cfg.Objects = new Array()
		this.cfg.Effects = new Array()
		this.cfg.Doors = new Array()
	}

	//构造函数
	public constructor() {
		this.cfg = gMgrs["DataMgr"].get_map_data()
		this.init_data()
		gMgrs["EventMgr"].addEvent(gMgrs["ComMgr"].gCNT().EVENT.PASSIVE_MSG, this.onPassive, this, -1);
	}

	//析构函数
	public destroy() {
		console.log("destroy DataMgr")
		gMgrs["EventMgr"].delEvent(gMgrs["ComMgr"].gCNT().EVENT.PASSIVE_MSG, this.onPassive, this);
	}

	//清理(切换地图时)
	public Dispose() {
		this.cfg.Doors.splice(0, this.cfg.Doors.length)
		this.cfg.Effects.splice(0, this.cfg.Effects.length)
		this.cfg.Objects.splice(0, this.cfg.Objects.length)

		this.cfg.M2CellInfo.splice(0, this.cfg.M2CellInfo.length)
	}

	//加载地图
	private LoadMap(FileName: String) {
		this.Dispose()

		RES.getResAsync("B341", function (data, key): void {
			let ba: egret.ByteArray = new egret.ByteArray(data)
			ba.endian = egret.Endian.LITTLE_ENDIAN
			let value = 0
			let length = 0

			while (ba.position < ba.length) {
				value = ba.readUnsignedShort()
				if (value === 0xFE) {
					length = ba.readUnsignedByte()
					for (let i = 0; i < length; i++) {
						this.cfg.M2CellInfo.push(0x00)
					}
				} else {
					if (value === 0xFF) {
						this.cfg.M2CellInfo.push(0x00)
					} else {
						this.cfg.M2CellInfo.push(value)
					}
				}
			}
			console.log(this.cfg.M2CellInfo.length)
			//通知界面绘制TODO
			gMgrs["EventMgr"].sendEvent(gMgrs["ComMgr"].gCNT().EVENT.MAP_MSG, { TARGET: "MainScenes", TYPE: "MapMgr", PARAM:"INIT", DATA: this.cfg.M2CellInfo })
		}.bind(this), this)
	}

	public onPassive(event: any) {
		let data = event.data.DATA
		if (data.mID === 17) {	//SMapInformation地图信息
			this.LoadMap(data.FileName)
		}
	}
}