/*
*** 新手引导模块
*/
class GuideMgr {
	private cfg: any
	private val: any
	private init_data() {
		this.val = {
			current: 0,     					 //当前引导节点
			guiding: false,    					 //是否处于引导状态
			conditions: [], 					 //下一引导的触发条件
			behavior: { action: "", param: {} }  //当前的行为
		}

	}

	public constructor() {
		console.log("new GuideMgr")
		this.cfg = gMgrs["PlayerMgr"].get_data("guide")
		this.init_data()
		this.init_guide()
		//gMgrs["EventMgr"].addEvent(gMgrs["ComMgr"].gCNT().EVENT.NETWORK_MSG, this.onNetwork_msg, this);
		gMgrs["EventMgr"].addEvent(gMgrs["ComMgr"].gCNT().EVENT.TRIGGER_GUIDE, this.onNetwork_msg, this)
	}

	public destroy() {
		//gMgrs["EventMgr"].delEvent(gMgrs["ComMgr"].gCNT().EVENT.NETWORK_MSG, this.onNetwork_msg, this);
		gMgrs["EventMgr"].delEvent(gMgrs["ComMgr"].gCNT().EVENT.TRIGGER_GUIDE, this.onNetwork_msg, this)

		console.log("destroy GuideMgr")
	}
	// 网络监听
	private onNetwork_msg(event: any) {

	}
	// 监听引导
	private trigger_guide(event: any) {
		if (typeof (event.TARGET) === "undefined" || event.TARGET === "GuideMgr") {
			if (this.val.guiding === true) { // 引导中
				return null
			}
			console.log("event", event)
			if (event.data.TYPE === "open_dlg") {            //打开界面(1)
				this.val.behavior.action = "1"
			} else if (event.data.TYPE === "close_dlg") {  //关闭界面(2)
				this.val.behavior.action = "2"
			} else if (event.data.TYPE === "att_change") { // 属性变化
				this.val.behavior.action = "3"
			}
		}
		this.val.behavior.param = event.data.DATA
		// 获取引导条件并检测
		if (this.check_condition(this.val.conditions)) {
			console.log("条件满足，开始引导")
			this.val.guiding = true
			let index = this.get_next_guide()
			let info = gMgrs["CfgMgr"].gs("guide_json", String(index))
			console.log("info", info, "index", index)
			if (info.position === "null") {
				//需要特殊处理
				//引导方式非触摸,需要特殊处理,例如"拖动式"
			} else {
				// 满足 开启界面
				let data_ = {
					index: index, position: info.position, next: info.next_time, btn_dlg: info.dlg,tip_pos:info.tipPos, tlaks: info.talks, callback: function (param) {
						this.touchCallBack(param)
					}.bind(this)
				}
				gMgrs["DialogMgr"].open_dlg({ Type: 4, Name: "Guide", Data: data_, Blank: false, Elastic: false })
			}
		} else {
			console.log("引导未触发,条件未满足")
		}
		//通过mID判断,只处理跟自己逻辑有关系的消息
		//event.data.mID, event.data.mInfo
		//if(event.data.mID === 10000){
		//}

		//this.init_()

		//管理器处理完毕后,广播模块消息给响应的窗口
		//gMgrs["EventMgr"].sendEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, { TARGET: null, TYPE: "GuideMgr", DATA: event.data })
	}

	//初始化引导
	private init_guide() {
		if (typeof (this.cfg.data) === "undefined" || this.cfg.data === 0) {
			this.cfg.data = {
				current_: 0,           //当前已完成引导编号
			}
		}
		this.val.current = this.cfg.data.current_
		this.analysis_condition()
	}
	// 获取下一步引导
	private get_next_guide() {
		// 初始 id 
		let next = this.val.current + 1
		if (next >= gMgrs["ComMgr"].gCNT().GUIDE_MAX) {
			return gMgrs["ComMgr"].gCNT().GUIDE_MAX;
		}

		if (next === 1) {
			next = 100
		} else {
			// 读取引导表数据
			let next_ = gMgrs["CfgMgr"].gs("guide_json", String(next))
			if (typeof (next_) === "undefined") {
				next = (Math.floor(next / 100) + 1) * 100
				if (typeof (gMgrs["CfgMgr"].gs("guide_json", String(next))) === "undefined") {
					next = gMgrs["ComMgr"].gCNT().GUIDE_MAX
				}
			}
		}

		return next
	}
	// 获取 引导的触发条件
	private analysis_condition() {
		// 获取到当前需要引导的 id 
		let index = this.get_next_guide()
		console.log("获取引导的id", index)
		// 条件提取 
		this.val.conditions = []

		if (index === gMgrs["ComMgr"].gCNT().GUIDE_MAX) {
			this.val.current = gMgrs["ComMgr"].gCNT().GUIDE_MAX
		} else {
			let condition = gMgrs["CfgMgr"].gs("guide_json", String(index), "condition")
			let condition_ = condition.split(":")
			if (condition_.length > 1) {
				//存在或条件
			} else {
				//有且只有且条件
				let conditions = []
				let condition__ = condition_[0].split(";")
				for (let i = 0; i < condition__.length; i += 2) {
					conditions.push({ action: condition__[i], param: condition__[i + 1] })
				}
				this.val.conditions = conditions
			}

		}
	}
	//检查单一条件是否满足
	private check_condition(conditions) {
		if (conditions.length <= 0) { //条件不存在
			return false
		}
		for (let i = 0; i < conditions.length; i++) {
			if (conditions[i].action === "1") {
				if (String(this.val.behavior.action) !== "1" || conditions[i].param !== this.val.behavior.param.Name) {
					return false
				}
			} else if (conditions[i].action === "2") {
				if (String(this.val.behavior.action) !== "2" || conditions[i].param !== this.val.behavior.param.Name) {
					return false
				}
			} else if (conditions[i].action === "3") {
				if (!this.check_attribute(conditions[i].param)) {
					return false;
				}
			}
		}
		return true;
	}
	//属性检查
	private check_attribute(expression) {
		var exps = []
		if (expression.indexOf(">") !== -1) {
			exps = expression.split(">")
			return Number(this.get_attribute(exps[0])) > Number(exps[1])
		} else if (expression.indexOf("<") !== -1) {
			exps = expression.split("<")
			return Number(this.get_attribute(exps[0])) < Number(exps[1])
		} else if (expression.indexOf("=") !== -1) {
			exps = expression.split("=")
			return Number(this.get_attribute(exps[0])) === Number(exps[1])
		}
	}
	// 获取单一属性  
	private get_attribute(exp) {
		// 具体分析属性
		if (exp === "att_100") {    //当前引导
			return this.val.current
		}
		return false
	}
	//用户点击引导区域后的回调
	private touchCallBack(param_) {
		console.log("触摸返回", param_)
		if (typeof (param_.next) === "undefined") {
			param_.next = 0
		}
		//如果当前界面的key为1,则保存引导节点
		if (gMgrs["CfgMgr"].gs("guide_json", String(param_.idx), "key") === "1") {
			this.cfg.data.current_ = param_.idx
			// PlayerMgr存储 
		}
		//响应具体的引导{TODO}

		this.dispose(param_.idx, param_.btn_dlg)

		//设置非引导状态
		this.val.guiding = false
		//关闭当前引导界面
		gMgrs["DialogMgr"].close_dlg({ Type: 4, Name: "Guide" })
		//记录当前完成的引导
		this.val.current = param_.idx
		// 设置时间 检测下一次引导触发
		gMgrs["ComMgr"].run_once(() => {
			//解析下一引导的触发条件
			this.analysis_condition()

			//抛出结束当前引导的事件(属性发生变化)
			gMgrs["EventMgr"].sendEvent(gMgrs["ComMgr"].gCNT().EVENT.TRIGGER_GUIDE, { TARGET: "GuideMgr", TYPE: "att_change", DATA: { name: "att_change", value: this.val.current } })
		}, Number(param_.next))

	}

	//用户点击后的具体处理逻辑(根据引导编号)
	//*********************************************************************** */
	private dispose(idx, btn_dlg) {
		//找到对应界面,找到相应的脚本,执行相应的方法
		let dlg = null
		if (idx === 100) {
			dlg = gMgrs["DialogMgr"].get_dlg({ Type: 2, Name: `${btn_dlg}` })
			if (dlg) {
				dlg.data.inst.searchPet()
			}
		} else if (idx === 101) {
			dlg = gMgrs["DialogMgr"].get_dlg({ Type: 3, Name: `${btn_dlg}` })
			if (dlg) {
				dlg.data.inst.onConfirm()
			}
			
		} else if (idx === 102) {
			
		} else if (idx === 103) {
			dlg = gMgrs["DialogMgr"].get_dlg({ Type: 2, Name: `${btn_dlg}` })
			if (dlg) {
				dlg.data.inst.catchPet()
			}
		}
	}
}