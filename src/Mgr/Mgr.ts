class Mgr {
	public constructor() {
		console.log("new Mgr ")
	}

	public async load_all(stage: egret.Stage) {
		gMgrs["ComMgr"] = new ComMgr(stage);
		gMgrs["EventMgr"] = new EventMgr(stage);

		gMgrs["CfgMgr"] = new CfgMgr();

		try {
			await gMgrs["CfgMgr"].load_configs();
		} catch (e) {
			console.error(e);
		}
		gMgrs["ResMgr"] = new ResMgr();
		gMgrs["DataMgr"] = new DataMgr();
		gMgrs["LocalMgr"] = new LocalMgr();
		gMgrs["DialogMgr"] = new DialogMgr(stage);
		gMgrs["PlayerMgr"] = new PlayerMgr();
		gMgrs["LogicMgr"] = new LogicMgr();
		gMgrs["FormulaMgr"] = new FormulaMgr();
		//gMgrs["GuideMgr"] = new GuideMgr();
		gMgrs["SoundMgr"] = new SoundMgr();
		gMgrs["PlatformMgr"] = new PlatformMgr();
		gMgrs["PackageMgr"] = new PackageMgr();
		gMgrs["MapMgr"] = new MapMgr();
	}

	public destroy() {
		gMgrs["MapMgr"].destroy()
		gMgrs["PackageMgr"].destroy()
		gMgrs["PlatformMgr"].destroy()
		gMgrs["SoundMgr"].destroy()
		//gMgrs["GuideMgr"].destroy()
		gMgrs["FormulaMgr"].destroy()
		gMgrs["LogicMgr"].destroy()
		gMgrs["PlayerMgr"].destroy()
		gMgrs["DialogMgr"].destroy()
		gMgrs["LocalMgr"].destroy()
		gMgrs["DataMgr"].destroy()
		gMgrs["ResMgr"].destroy()
		gMgrs["CfgMgr"].destroy()
		gMgrs["EventMgr"].destroy()
		gMgrs["ComMgr"].destroy()
		/*
		//
		for (let key in gMgrs) {
			//if (key != "Mgr" && key != "DialogMgr") {
			if (key != "Mgr") {
				console.log("Key: " + key)

				gMgrs[key].destroy()
				gMgrs[key] = null
			}
		}
		*/
	}
}