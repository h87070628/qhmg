class PlayerMgr {
	private cfg: any;
	private wxUserInfo: any;

	private init_data() {
		this.cfg.base = {}					//信息
		this.cfg.bags = new Array()			//背包
		this.cfg.maps = {}					//地图
		this.cfg.quest = new Array()		//任务
		this.cfg.shop = new Array()			//商城


		this.cfg.guide = { data: 0 }		//引导
		this.cfg.guild = {}					//行会
		this.cfg.depot = {}					//仓库
		this.cfg.friend_msgs = new Array()
		this.cfg.rollmsgs = new Array()

		this.wxUserInfo = null
		//等等...
	}

	public constructor() {
		console.log("new PlayerMgr")
		this.cfg = gMgrs["DataMgr"].get_player_data()

		//初始化数据
		this.init_data()

		//监听网络消息
		gMgrs["EventMgr"].addEvent(gMgrs["ComMgr"].gCNT().EVENT.NETWORK_MSG, this.onNetwork_msg, this);
		//监听被动消息
		gMgrs["EventMgr"].addEvent(gMgrs["ComMgr"].gCNT().EVENT.PASSIVE_MSG, this.onPassive_msg, this);
	}

	public destroy() {
		gMgrs["EventMgr"].delEvent(gMgrs["ComMgr"].gCNT().EVENT.NETWORK_MSG, this.onNetwork_msg, this);
		gMgrs["EventMgr"].delEvent(gMgrs["ComMgr"].gCNT().EVENT.PASSIVE_MSG, this.onPassive_msg, this);

		this.cfg = null
	}

	//被动消息
	private onPassive_msg(event: any) {
		let data = event.data.DATA
		let base = this.get_data("base")
		if (data.mID === 25) {					//聊天内容
		} else if (data.mID === 27) {			//玩家道具
			let bags = this.get_data("bags")
			bags.push(data)
		} else if (data.mID === 17) {
			this.set_data("maps", data)
		} else if (data.mID === 18) {			//角色信息
			this.set_data("base", data)
		} else if (data.mID === 22) {			//目标移动
		} else if (data.mID === 49) {
		} else if (data.mID === 50) {
		} else if (data.mID === 51) {
		} else if (data.mID === 77) {
			//TODO
		} else if (data.mID === 78) {			//NPC回复
			//TODO
		} else if (data.mID === 113) {
		} else if (data.mID === 124) {			//AddBuff
			//TODO
		} else if (data.mID === 141) {			//BaseStats
			//TODO
		} else if (data.mID === 154) {
			//TODO
		} else if (data.mID === 155) {
			//TODO
		} else if (data.mID === 170) {
			//TODO
		} else if (data.mID === 172) {
			this.get_data("quest").push(data)
		} else if (data.mID === 201) {			//邮件
			//TODO
		} else if (data.mID === 210) {
			//TODO
		} else if (data.mID === 215) {			//好友信息
			//TODO
		} else if (data.mID === 216) {			//夫妻信息
			//TODO
		} else if (data.mID === 217) {			//师徒信息
			//TODO
		} else if (data.mID === 218) {
			//TODO
		} else if (data.mID === 220) {
			this.get_data("shop").push(data)
		}
		//管理器处理完毕后,广播模块消息给响应的窗口(分析变化逻辑,界面并作出相应,例如:红点提示)
		gMgrs["EventMgr"].sendEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, { TARGET: null, TYPE: "PlayerMgr", PARAM: "PASSIVE", DATA: data })
	}

	//主动消息
	private onNetwork_msg(event: any) {
		//通过mID判断,只处理跟自己逻辑有关系的消息
		let Data = event.data.DATA
		//let param = Data.data.param_		//发起请求的参数都回传放置到["param_"]字段

		if (Data.mID === 14) {				//开始游戏
			if (Data.ret === 0) {
				//gMgrs["PlayerMgr"].set_data("base", {})
				//gMgrs["PlayerMgr"].set_data("country", Data.data.country)
				//gMgrs["PlayerMgr"].set_data("all_country", Data.data.all_country)
				//gMgrs["PlayerMgr"].set_data("mails", Data.data.mails)
				//gMgrs["PlayerMgr"].set_data("chats", Data.data.chats)
				//gMgrs["PlayerMgr"].set_data("friends", Data.data.friends)
			}
		}

		//管理器处理完毕后,广播模块消息给响应的窗口
		gMgrs["EventMgr"].sendEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, { TARGET: null, TYPE: "PlayerMgr", PARAM:"INITIATIVE", DATA: Data })
	}

	//广播初始化数据
	//窗口已经创建完毕,需要使用管理器数据内的数据刷新相关的默认数据
	//到了这个阶段,理论上所有数据都已经从服务器拉取或者本地读取完毕并通过对应的管理器处理完毕
	public broadcast() {
		gMgrs["EventMgr"].sendEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, { TARGET: null, TYPE: "PlayerMgr", PARAM: "INIT", DATA: this.cfg })
	}

	public get_data(key: string) {
		if (this.cfg[key]) {
			return this.cfg[key]
		} else {
			return null
		}
	}

	public set_data(key: string, value: any) {
		this.cfg[key] = value
		//发出数据改变的事件
		gMgrs["EventMgr"].sendEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, { TYPE: "PlayerMgr", DATA: key })
	}

	//获取自己的uid
	public get_uid(): number {
		let base = gMgrs["PlayerMgr"].get_data("base")
		return Number(base["uid"])
	}

	//[[基地相关逻辑]]
	//建造成功
	private bases_build(info: any) {
		let base = gMgrs["PlayerMgr"].get_data("base")
		let build = {}

		let idx = ''
		for (let i = 0; i < 10; i++) {
			idx = ('00' + i).slice(-2);		//补零
			build["ext_INT_" + idx] = 0
		}
		for (let i = 0; i < 4; i++) {
			idx = ('00' + i).slice(-2);		//补零
			build["ext_CHAR_" + idx] = ""
		}
		build["id"] = 0
		build["level"] = 1
		build["worker_cap"] = 0
		build["worker_num"] = 0

		build["position"] = info.position
		build["style"] = info.style
		build["uid"] = info.uid

		base.build_list.push(build)
	}

	//拆除成功
	private bases_dismantle(info: any) {
		let base = gMgrs["PlayerMgr"].get_data("base")
		for (let i = 0; i < base.build_list.length; i++) {
			if (base.build_list[i].position === info.position) {
				base.build_list.splice(i, 1)
				break;
			}
		}
	}

	//升级成功
	private bases_upgrade(info: any) {
		let base = gMgrs["PlayerMgr"].get_data("base")
		for (let i = 0; i < base.build_list.length; i++) {
			if (base.build_list[i].position === info.position) {
				base.build_list[i].level = base.build_list[i].level + 1
				break;
			}
		}
	}

	//查找某产品的库存数量(不考虑品质)
	private get_goods_count(goods_id: number) {
		let count = 0
		let base = gMgrs["PlayerMgr"].get_data("base")
		for (let i = 0; i < base.depots_list.length; i++) {
			if (Number(String(base.depots_list[i].goods_id).slice(0, -2)) === goods_id) {
				count += base.depots_list[i].count
			}
		}
		return count
	}

	//收获产品
	private bases_harvest(info: any) {
		//产品入库
		console.log("产品入库")
		console.log(info.result)

		let base = gMgrs["PlayerMgr"].get_data("base")
		let goods_id = info.result.goods + (('00' + info.result.quality).slice(-2));
		let has = false
		for (let i = 0; i < base.depots_list.length; i++) {
			if (Number(base.depots_list[i].goods_id) === Number(goods_id)) {
				//仓库已存在该道具则更新道具数量
				base.depots_list[i].count += info.result.count
				has = true
				break
			}
		}

		//仓库不存在该道具则添加
		if (has === false) {
			let goods = { "id": info.result.id, "uid": info.result.uid, "count": info.result.count, "goods_id": goods_id }
			base.depots_list.push(goods)
		}
	}

	//探索成功
	private bases_explore(info: any) {
		let base = gMgrs["PlayerMgr"].get_data("base")
		for (let i = 0; i < base.build_list.length; i++) {
			if (base.build_list[i].position === info.position) {
				let field = "ext_INT_" + (('00' + info.idx).slice(-2));
				base.build_list[i][field] = base.build_list[i][field] + info.count
				break;
			}
		}
	}

	//提交生产计划成功
	private bases_reduce_res(info: any) {
		//原料需要维护探索数量
		if (info.goods >= 1001 && info.goods <= 1005) {
			let idx = (info.goods - 1001)
			let base = gMgrs["PlayerMgr"].get_data("base")
			for (let i = 0; i < base.build_list.length; i++) {
				if (base.build_list[i].position === info.position) {
					let field = "ext_INT_" + (('00' + idx).slice(-2));
					base.build_list[i][field] = base.build_list[i][field] - info.count
					break;
				}
			}
		} else {
			let items = this.get_consumes(info.material)
			let base = gMgrs["PlayerMgr"].get_data("base")
			console.log("*********************112")
			console.log(items)

			for (let i = 0; i < items.length; i++) {
				for (let j = 0; j < base.depots_list.length; j++) {
					if (Number(base.depots_list[j].goods_id) === Number(items[i].goods)) {
						//仓库已存在该道具则更新道具数量
						base.depots_list[j].count -= Number(items[i].count)
						break
					}
				}
			}
		}
	}

	private get_consumes(material: string) {
		let rets = new Array()
		let items = material.split(";")
		let hc = new Array()
		for (let i = 0; i < items.length; i++) {
			hc = items[i].split("_")
			rets.push({ "goods": Number(hc[0]), "count": Number(hc[1]) })
		}
		return rets;
	}

	private pet_del(uqs: string) {
		let base = gMgrs["PlayerMgr"].get_data("base")
		let pet_list = base.pet_list
		for (let i = 0; i < pet_list.length; i++) {
			if (pet_list[i]["uniques"] === uqs) {
				pet_list.splice(i, 1)
				break;
			}
		}
	}

	private pet_add(data: any) {
		let base = gMgrs["PlayerMgr"].get_data("base")
		base.pet_list.push(data)
	}

	private pet_into_battle(data: any) {
		let base = gMgrs["PlayerMgr"].get_data("base")
		//下架已上阵的宠物
		for (let i = 0; i < base.pet_list.length; i++) {
			if (base.pet_list[i]["position"] === data["position"]) {
				base.pet_list[i]["position"] = 0
			}
		}

		//上架新宠物
		for (let i = 0; i < base.pet_list.length; i++) {
			if (base.pet_list[i]["uniques"] === data["uniques"]) {
				base.pet_list[i]["position"] = data["position"]
			}
		}
	}

	//获取好友列表
	//style === 1, 好友
	//style === 0, 申请中
	public get_friends(style: Number) {
		let frds = new Array();
		let info = {}
		let friends = gMgrs["PlayerMgr"].get_data("friends")
		let uid = this.get_uid()
		for (let i = 0; i < friends.length; i++) {
			info = {}
			info["id"] = friends[i]["id"]
			info["style"] = friends[i]["style"]
			if (friends[i]["style"] === style) {
				if (friends[i]["a_uid"] === uid) {
					info["uid"] = friends[i]["b_uid"]
					info["name"] = friends[i]["b_name"]
					info["icon"] = friends[i]["b_icon"]
					info["type"] = 0
					frds.splice(-1, 0, info)
				} else if (friends[i]["b_uid"] === uid) {
					info["uid"] = friends[i]["a_uid"]
					info["name"] = friends[i]["a_name"]
					info["icon"] = friends[i]["a_icon"]
					info["type"] = 1
					frds.splice(-1, 0, info)
				}
			}
		}

		return frds
	}

	//插入一条自己发送的好友消息
	public add_friend_message(f_uid: Number, msg: String) {
		let info = {
			["sender"]: this.get_uid(),
			["receive"]: f_uid,
			["msg"]: msg,
			["time"]: gMgrs["ComMgr"].get_s_time()
		}
		this.cfg.friend_msgs.push(info)
	}

	// 筛选好友的聊天记录
	public get_friend_msgs(f_uid: number) {
		let fMsgs = new Array();
		let friendMsg = this.cfg.friend_msgs
		for (let i = 0; i < friendMsg.length; i++) {
			if ((f_uid === friendMsg[i].receive && this.get_uid() === friendMsg[i].sender) || (f_uid === friendMsg[i].sender && this.get_uid() === friendMsg[i].receive)) {
				fMsgs.push(friendMsg[i])
			}
		}
		return fMsgs;
	}

	//获取当前挑战任务的状态(0.未达成, 1.已达成未领取奖励)
	public get_challenge(idx: number): number {
		let ret = 0
		let base = gMgrs["PlayerMgr"].get_data("base")

		let value = 1
		if (idx <= 30) {
			value = value << (idx - 1)
			if ((base["challenge_0"] & value) === value) {
				ret = 1
			}
		} else if (idx <= 60) {
			idx = idx - 30
			value = value << (idx - 1)
			if ((base["challenge_1"] & value) === value) {
				ret = 1
			}
		} else {
		}
		return ret
	}

	//获取并删除最前面的一条走马灯消息
	public remove_rollmsgs(): any {
		return this.cfg.rollmsgs.shift()
	}

	// 技能配置 获取当前帮派技能的配置信息
	public getSkillData(tag: number) {
		let gData = new Array()
		let guildSkill = gMgrs["CfgMgr"].gs("guild_skill_json")
		for (let key in guildSkill) {
			gData.push({ key: key, data: guildSkill[key] })
		}
		for (let i = 0; i < gData.length; i++) {
			if (Number(gData[i].key) == tag) {
				return gData[i]
			}
		}
		return null;
	}

	// 判断帮派技能是否已经存在
	public bSkillExist(skillId: number) {
		let base = gMgrs["PlayerMgr"].get_data("base")
		if (!base.skills) {
			return false
		}
		let skills = gMgrs["ComMgr"].decompose_array(base.skills)
		for (let i = 0; i < skills.length; i++) {
			if (Number(skills[i].key) === skillId) {
				return true
			}
		}
		return false

	}

	public setWxUserInfo(wxUserInfo: any) {
		this.wxUserInfo = wxUserInfo;
	}

	public getWxUserInfo() {
		return this.wxUserInfo;
	}
	// 机器人头像
	public randRobotUrl() {
		let robotUrl = ["https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTIiaTYLY8aSP94C8AgCn9I242ic1ibswIhl8qvePzXeN7BrT1Nrnoqqcv7lrf8deFohQic2ImGNYRZ6gQ/132", "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83epHCNAh9hJaakVJMMWW3sSzWUdP4uwP9xxFMdsKn9q3t4tc50WygwhPdLqKmdSJxKHU5eBicBZEuvg/132", "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83epBiaEhFhRzSw6dm7ia4amq2UhWyRNWHzcRmvLOHssmVSxuAvuQ6BMenR76OPaeUITonyoe8F7s8y8Q/132", "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJC9Gtp9TORNHZuggOzlCu5BPNwkFwOyPllTJnykQGvniaPMuHHJF7Wg01c8sdA1Z2JwJsTFsticwhQ/132", "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTIKrHDzJW01nSKOyJwDert4CVkXfaL1Zh41W4ibc7fNHRr2E2vlaW5KaXjfmuv75vKsP8pkQibk8Dvw/132", "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKFASdZ7SWviaHbqlp6tEVO5lLkaic3TIs8BBuczkQsWp7Hf1DvW9vyias1owNlEtrEEV45pl84k94gw/132", "https://wx.qlogo.cn/mmopen/vi_32/z83qsUEIvwfdAElFIgRZmGMF3QJexLX8QBXB2BHXxroU8sjZnEQ9qqXou9dn2iaf0l5e1W18HGaNetKYmYxQfDw/132", "https://wx.qlogo.cn/mmopen/vi_32/PiajxSqBRaEK11rib5lLCoEdOghKNAK9f6N5ibRUxC9F3bYPicvTsMfFjsianUPR6dGycUQVHbSCYB8avFqoFlia49EA/132", "https://wx.qlogo.cn/mmopen/vi_32/ajNVdqHZLLAyLIu50OvSfuhQBTqTgcJbLIWqxgPCN51Itkrj0vO2ZpSjm7kcNcgwZbUiaO8yQyDZN0jA7ugp3Fw/132", "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83eoCrmuQkAlp1Og06icVGib7UEDKaSmpE7fYmFsiaAQ1OT9H2VmAr8cpXfsjq0knwq2yoVxPaDODk4ia3w/132", "https://wx.qlogo.cn/mmopen/vi_32/aNPtwEhfmLqTaibMrg9yCnCW9ebpXibPJKQjscuibW5PntGicUvoQAUhQHBQFGQ19lhQdiaVcFQ2CicLpvSfYciccbdyQ/132", "https://wx.qlogo.cn/mmopen/vi_32/KRO0TRAmL5V0UTnU40oUrvgYiaUyO4Lm0sh775VMosVSibto2DhqJEibliaNJ4DXYBLDxNX0GMyNuJ0bMrrEu7Gtnw/132", "https://wx.qlogo.cn/mmopen/vi_32/qWeCpS9QMWTx5fZ1XEiaM6WBeCvCAN4SrLekAibTCP97MQbvYWniaaia0NCRHSCicp4PTibH7kNyNIricqN2OmCu5aDoQ/132", "https://wx.qlogo.cn/mmopen/vi_32/Q4TjjcZ6cd94UyKZ2UBSLcQYCqo4cUlnJQJBS0sHiaqUN8nia2hT1s3dBx4m7xraRpq446vxUA0h88m6Rzly4k3Q/132"]
		return robotUrl[Math.floor(Math.random() * robotUrl.length)]
	}
	/**
	 * key
	 * value
	 */
	public rewardList(reward: any[]) {
		let reward_list = []
		for (let i = 0; i < reward.length; i++) {
			let key = 100;
			if (reward[i].key === "reward") {
				key = 100
			}
			if (reward[i].key === "add_exp") {
				key = 102
			}
			reward_list.push({ key: key, value: reward[i].value })
		}
		return reward_list;
	}

}