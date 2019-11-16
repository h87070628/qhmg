class CfgMgr {
	private cfg: any;
	public constructor() {
		console.log("new CfgMgr")
		this.cfg = {}
	}

	public async load_configs() {
		//异步加载配置文件
		/*
		await this.load_config("guide_json")
		await this.load_config("cs_builds_json")
		await this.load_config("jd_builds_json")
		await this.load_config("description_json")
		await this.load_config("list_server_json")
		await this.load_config("goods_list_json")
		await this.load_config("shop_type_json")
		await this.load_config("pet_list_json")
		await this.load_config("pet_skills_json")
		await this.load_config("scenes_json")
		await this.load_config("npc_json")
		await this.load_config("boss_list_json")
		await this.load_config("mtask_list_json")
		await this.load_config("role_head_json")
		await this.load_config("achievement_json")
		await this.load_config("guild_skill_json")
		await this.load_config("guild_task_json")
		await this.load_config("guild_post_json")
		await this.load_config("cards_json")
		await this.load_config("global_json")
		await this.load_config("exp_json")
		await this.load_config("item_json")
		*/
	}

	private async load_config(name) {
		this.cfg[name] = await RES.getResAsync(name)
	}

	public destroy() {
		this.cfg = {}
	}

	public gs(file: string, key: string = "NULL", column: string = "NULL") {
		if (key === "NULL") {
			return this.cfg[file]
		}
		if (key !== "NULL" && column === "NULL") {
			return this.cfg[file][key]
		}
		return this.cfg[file][key][column]
	}
}