
class DateEvent extends egret.Event{
	public data:any;
	public constructor(type:string, bubbles:boolean=false, cancelable:boolean=false)
    {
        super(type,bubbles,cancelable);
    }
}

class EventMgr {
	private stage_: egret.Stage;

	public constructor(stage:egret.Stage) {
		console.log("new EventMgr")
		this.stage_ = stage;
	}

	public addEvent(EventName: string, callback: Function, obj: any, priority:number = 0){
		this.stage_.addEventListener(EventName, callback, obj, false, priority);
	}

	public delEvent(EventName: string, callback: Function, obj: any){
		this.stage_.removeEventListener(EventName, callback, obj, false);
	}

	public sendEvent(EventName: string, data_: any){
		let daterEvent:DateEvent = new DateEvent(EventName);
		daterEvent.data = data_

		this.stage_.dispatchEvent(daterEvent);
	}

	public destroy(){
		//清理全部挂载的事件{TODO}
		this.stage_ = null;
	}
}