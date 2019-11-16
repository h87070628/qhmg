//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var gMgrs: any = {}
class Main extends egret.DisplayObjectContainer {



    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        this.addEventListener("RESTART", this.restart, this);
    }

    private onAddToStage(event: egret.Event) {

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin

            context.onUpdate = () => {

            }
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        if (egret.Capabilities.runtimeType == egret.RuntimeType.WXGAME && egret.Capabilities.os === "iOS") {
            //ios设置为60帧
        } else {
            //android设置为30帧
        }

        this.runGame().catch(e => {
            console.log(e);
        })
    }

    //重启游戏
    private restart() {
        console.log("Main.restart()")

        this.runGame().catch(e => {
            console.log(e);
        })
    }

    private print_env() {
        console.log("     Height: " + egret.Capabilities.boundingClientHeight);
        console.log("      Width: " + egret.Capabilities.boundingClientWidth);
        console.log("    Version: " + egret.Capabilities.engineVersion);
        console.log("   isMobile: " + egret.Capabilities.isMobile);
        console.log("   language: " + egret.Capabilities.language);
        console.log("         os: " + egret.Capabilities.os);
        console.log(" renderMode: " + egret.Capabilities.renderMode);
        console.log("runtimeType: " + egret.Capabilities.runtimeType);
        console.log("***********: " + "game ready.");
    }

    private async runGame() {
        this.print_env();

        //如果是重置游戏,需要清理资源
        //清理this.stage
        //清理缓存资源{TODO}
        if (gMgrs["Mgr"]) {
            gMgrs["Mgr"].destroy()
            gMgrs["Mgr"] = null;
        } else {
            //资源加载界面
            //RES.loadConfig 只加载一次
            await this.loadResource();
            //await platform.login();
        }
        //管理器释放,可能需要延时完成

        //游戏界面
        this.createGameScene();
    }

    private async loadResource() {
        try {
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig("resource/default.res.json", "resource/");
            //按需加载本地资源组
            await RES.loadGroup("login_step", 0, loadingView);

            //加载远程资源配置
            //await RES.loadConfig("remote.res.json", "https://ydmg.jys-club.com:7298/Game/WeGames/Huos/resource/");

            //判断是否为原生环境,热更新{TODO}
            if (egret.Capabilities.runtimeType == egret.RuntimeType.NATIVE) {
                await loadingView.hotUpdate();
            }

            this.stage.removeChild(loadingView);
            // if (gMgrs["ComMgr"].gCNT().CHANNEL === 1)
            //     platform.openDataContext.postMessage({ command: 'loadRes' });

        }
        catch (e) {
            console.error(e);
        }
    }

    private textfield: egret.TextField;

    private async createGameScene() {
        egret.ImageLoader.crossOrigin = 'anonymous';
        //加载管理器
        gMgrs["Mgr"] = new Mgr();
        await gMgrs["Mgr"].load_all(this.stage);

        //添加重置游戏的监听
        if (this.stage.hasEventListener("RESTART")) {
            console.log("Has Restart Event")
            gMgrs["EventMgr"].delEvent("RESTART", this.restart, this);
        }
        gMgrs["EventMgr"].addEvent("RESTART", this.restart, this);

        //打开登陆界面
        gMgrs["DialogMgr"].open_dlg({ Type: 2, Name: "Login", Blank: false, Elastic: false, Callback: function () { 
            console.log("open Login")
        }.bind(this), Data: { stage: this.stage } })
    }

    public x_event_cb(event: any) {
        console.log(event.data)
    }


    /**
     * 创建游戏场景
     * Create a game scene
    */
    private createGameScene1() {
        let sky = this.createBitmapByName("bg_jpg");
        this.addChild(sky);
        let stageW = this.stage.stageWidth;
        let stageH = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;

        let topMask = new egret.Shape();
        topMask.graphics.beginFill(0x000000, 0.5);
        topMask.graphics.drawRect(0, 0, stageW, 172);
        topMask.graphics.endFill();
        topMask.y = 33;
        this.addChild(topMask);

        let icon = this.createBitmapByName("egret_icon_png");
        this.addChild(icon);
        icon.x = 26;
        icon.y = 33;

        let line = new egret.Shape();
        line.graphics.lineStyle(2, 0xffffff);
        line.graphics.moveTo(0, 0);
        line.graphics.lineTo(0, 117);
        line.graphics.endFill();
        line.x = 172;
        line.y = 61;
        this.addChild(line);


        let colorLabel = new egret.TextField();
        colorLabel.textColor = 0xffffff;
        colorLabel.width = stageW - 172;
        colorLabel.textAlign = "center";
        colorLabel.text = "Hello Egret";
        colorLabel.size = 24;
        colorLabel.x = 172;
        colorLabel.y = 80;
        this.addChild(colorLabel);

        let textfield = new egret.TextField();
        this.addChild(textfield);
        textfield.alpha = 0;
        textfield.width = stageW - 172;
        textfield.textAlign = egret.HorizontalAlign.CENTER;
        textfield.size = 24;
        textfield.textColor = 0xffffff;
        textfield.x = 172;
        textfield.y = 135;
        this.textfield = textfield;
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name: string) {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    private startAnimation(result: string[]) {
        /*
        let parser = new egret.HtmlTextParser();

        let textflowArr = result.map(text => parser.parse(text));
        let textfield = this.textfield;
        let count = -1;
        let change = () => {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            let textFlow = textflowArr[count];

            // 切换描述内容
            // Switch to described content
            textfield.textFlow = textFlow;
            let tw = egret.Tween.get(textfield);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, this);
        };

        change();
        */
    }
}