/*
公式管理器
*/
class FormulaMgr {
	private cfg: any;
	public constructor() {
		this.cfg = {
		}
	}

	public destroy() {
	}

	//[[宠物相关公式]]
	//计算面板气血
	public get_pet_hp(data: any){
		//体质 * 体力资质
		return data["potential_T"] * data["aptitude_T"]
	}
	//计算面板攻击
	public get_pet_attack(data: any){
		return data["potential_L"] * 5
	}
	//计算面板防御
	public get_pet_defense(data: any){
		return data["potential_Z"] * 8
	}
	//计算面板速度
	public get_pet_speed(data: any){
		return data["potential_M"] * 15
	}

	//[[其他公式]]
}