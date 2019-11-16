declare var wx: { getFileSystemManager, getSystemInfoSync, createUserInfoButton, login, shareAppMessage, showShareMenu, setUserCloudStorage, getOpenDataContext, env }
class PlatformMgr {

	private bitmap: egret.Bitmap;
	private isdisplay = false;
	private rankingListMask: egret.Shape;
	private btn_start: any
	public constructor() {
		console.log("new PlatformMgr")
		gMgrs["EventMgr"].addEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, this.onUpdateUI, this);
	}

	// 登录授权
	public login_game(bshow: boolean = true) {
		// 获取登录界面
		let dlg = gMgrs["DialogMgr"].get_dlg({ Type: 2, Name: `Login` })
		let channel = gMgrs["ComMgr"].gCNT().CHANNEL
		if (channel === 0) {
			// 不处理
		} else if (channel === 1) { // 微信
			//获取用户授权
			let W = wx.getSystemInfoSync().windowWidth;
			let H = wx.getSystemInfoSync().windowHeight;
			// 创建一个按钮
			this.btn_start = wx.createUserInfoButton({
				type: 'image',
				withCredentials: true,
				lang: 'zh_CN',
				image: 'https://ydmg.jys-club.com:7298/Game/WeGames/Bqbs/start_btn.png',
				style: {
					left: (W - 216) / 2,
					top: (H-202)/2,
					width: 216,
					height: 202,
				}
			});
			this.btn_start.onTap((res) => {
				if (res.userInfo) {
					console.log("用户授权", res.userInfo)
					var userInfo = res.userInfo;
					var nickName = userInfo.nickName;
					var avatarUrl = userInfo.avatarUrl;
					var gender = userInfo.gender; //性别 0：未知、1：男、2：女
					var province = userInfo.province;
					var city = userInfo.city;
					var country = userInfo.country;
					gMgrs["PlayerMgr"].setWxUserInfo(userInfo);
					wx.login({
						success: (loginres) => {
							//console.log("res", loginres)
							let params = "cmd=10003&code=" + loginres.code
							gMgrs["ComMgr"].send_third_request(params, function (msg) {
								let data = JSON.parse(msg.data.result);
								if (dlg) {
									dlg.data.inst.LoginGame(channel, data.openid)
								}
							}.bind(this));
							this.btn_start.destroy();
						}
					})
				} else {
					console.log("拒绝授权，登录失败")
				}
			})

		}

	}
	// 分享
	public shara_game() {
		let channel = gMgrs["ComMgr"].gCNT().CHANNEL
		let share_opt = {
			title: "表情包大作战",
			imageUrl: 'https://ydmg.jys-club.com:7298/Game/WeGames/shy/share.jpg',
			success: function (res) {
				console.log("分享成功", res);
				if (res.errMsg == 'shareAppMessage:ok') {
					console.log("成功啦")
				}

			},
			fail: function (res) {
				console.log("分享失败", res);
			}
		}
		if (channel === 0) {
			// 不处理
		} else if (channel === 1) { // 微信
			console.log("微信分享")
			wx.shareAppMessage(share_opt)
		}
	}
	// 排行榜
	public open_rank_game() {
		let channel = gMgrs["ComMgr"].gCNT().CHANNEL
		if (channel === 0) {
			// 不处理
		} else if (channel === 1) { // 微信
			platform.openDataContext.postMessage({
				isRanking: this.isdisplay,
				text: "wx",
				year: (new Date()).getFullYear(),
				command: "open"
			});
			this.isdisplay = true


		}
	}

	public close_rank_game() {
		let channel = gMgrs["ComMgr"].gCNT().CHANNEL
		if (channel === 0) {
			// 不处理
		} else if (channel === 1) { // 微信
			if (this.isdisplay) {
				this.isdisplay = false
				platform.openDataContext.postMessage({
					isRanking: this.isdisplay,
					text: "wx",
					year: (new Date()).getFullYear(),
					command: "close"
				});
			}
		}
	}

	// 存储
	public submit_data(data, channel) {
		if (channel === 1) {
			wx.setUserCloudStorage({
				KVDataList: [data],
				success: (res) => {
					console.log("微信托管数据回调成功" + res)
				},
				// 失败回调
				fail: (res) => {
					console.log('微信托管数据回调失败！！' + res);
				}
			})
		}
	}
	private onUpdateUI(event: any) {
		if (!gMgrs["ComMgr"].gCNT().CHANNEL) {
			return;
		}
		if (typeof (event.data.TARGET) === "undefined" || event.data.TARGET === null || event.data.TARGET === "MainUI") {
			if (event.data.TYPE === "MapMgr_INIT") {

			} else if (event.data.TYPE === "SETTING") {
				if (event.data.PARAM === "showStartBtn") {
					this.btn_start.show()
				} else if (event.data.PARAM === "hideStartBtn") {
					this.btn_start.hide()
				}
			}
		}
	}

	public destroy() {
		gMgrs["EventMgr"].delEvent(gMgrs["ComMgr"].gCNT().EVENT.UPDATE_UI_MSG, this.onUpdateUI, this);
	}
}