// TypeScript file

class PackageMgr {
    private cfg: any;
    public constructor() {
        this.cfg = {
        }
    }

    public destroy() {
    }

    ////////////////////////////////////////////////////
    //根据编号,构造c2s数据包
    public gen_package(id: Number, data: any): any {
        let bytes: egret.ByteArray = new egret.ByteArray()
        bytes.endian = egret.Endian.LITTLE_ENDIAN
        switch (id) {
            case 0:
                this.ClientVersion(data, bytes)
                break;
            case 1:
                this.Disconnect(data, bytes)
                break;
            case 2:
                this.KeepAlive(data, bytes)
                break;
            case 3:
                this.NewAccount(data, bytes)
                break;
            case 5:
                this.Login(data, bytes)
                break;
            case 6:
                this.NewCharacter(data, bytes)
                break;
            case 8:
                this.StartGame(data, bytes)
                break;
            default:
                break;
        }
        return bytes
    }

    //VersionHash, 版本号
    public ClientVersion(data: any, bytes: egret.ByteArray) {
        let id: number = 0
        bytes.writeShort(2 + 2 + 4 + data.VersionHash.length)           //长度
        bytes.writeShort(id)                                            //协议号
        bytes.writeInt(data.VersionHash.length)                         //内容
        bytes.writeUTFBytes(data.VersionHash)
    }

    public Disconnect(data: any, bytes: egret.ByteArray) {
    }

    //Time, 时间戳
    public KeepAlive(data: any, bytes: egret.ByteArray) {
        let id: number = 2
        bytes.writeShort(2 + 2 + 8)
        bytes.writeShort(id)

        let uni: Long = Long.fromString("112233445566");
        bytes.writeInt(uni.getLowBits())
        bytes.writeInt(uni.getHighBits())
    }

    //创建新账号
    //AccountID, 账号
    //Password, 密码
    //UserName, 名字
    //SecretQuestion, 安全提问
    //SecretAnswer, 安全密码
    //EMailAddress, 电子邮件
    public NewAccount(data: any, bytes: egret.ByteArray) {
        let id: number = 3
        let length = data.AccountID.length + data.Password.length + 8 + data.UserName.length + data.SecretQuestion.length + data.SecretAnswer.length + data.EMailAddress.length
        bytes.writeShort(2 + 2 + length + 6)
        bytes.writeShort(id)

        bytes.writeByte(data.AccountID.length)
        bytes.writeUTFBytes(data.AccountID)
        bytes.writeByte(data.Password.length)
        bytes.writeUTFBytes(data.Password)

        //bytes.writeUTFBytes(data.BirthDate)
        let birth: Long = Long.fromString("10000000");
        bytes.writeInt(birth.getLowBits())
        bytes.writeInt(birth.getHighBits())

        bytes.writeByte(data.UserName.length)
        bytes.writeUTFBytes(data.UserName)
        bytes.writeByte(data.SecretQuestion.length)
        bytes.writeUTFBytes(data.SecretQuestion)
        bytes.writeByte(data.SecretAnswer.length)
        bytes.writeUTFBytes(data.SecretAnswer)
        bytes.writeByte(data.EMailAddress.length)
        bytes.writeUTFBytes(data.EMailAddress)
    }

    //登陆
    //AccountID, 账号
    //Password, 密码
    public Login(data: any, bytes: egret.ByteArray) {
        let id: number = 5
        let length = data.AccountID.length + data.Password.length + 2
        bytes.writeShort(2 + 2 + length)
        bytes.writeShort(id)

        bytes.writeByte(data.AccountID.length)
        bytes.writeUTFBytes(data.AccountID)
        bytes.writeByte(data.Password.length)
        bytes.writeUTFBytes(data.Password)
    }

    //新角色
    //Name, 角色名
    //Gender, 性别
    //Class, 职业
    public NewCharacter(data: any, bytes: egret.ByteArray) {
        let id: number = 6
        let length = 1 + data.Name.length + 1 + 1
        bytes.writeShort(2 + 2 + length)
        bytes.writeShort(id)

        bytes.writeByte(data.Name.length)
        bytes.writeUTFBytes(data.Name)
        bytes.writeByte(data.Gender)
        bytes.writeByte(data.Class)
    }

    public StartGame(data: any, bytes: egret.ByteArray) {
        let id: number = 8
        let length = 4
        bytes.writeShort(2 + 2 + length)
        bytes.writeShort(id)

        bytes.writeInt(data.Index)
    }
    ////////////////////////////////////////////////////



    ////////////////////////////////////////////////////
    //根据编号,解析s2c数据包
    public ana_package(id: Number, buff: egret.ByteArray, data: any): Boolean {
        switch (id) {
            case 0:
                this.SConnected(buff, data)
                break;
            case 1:
                this.SClientVersion(buff, data)
                break;
            case 2:
                this.SDisconnect(buff, data)
                break;
            case 3:
                this.SKeepAlive(buff, data)
                break;
            case 4:
                this.SNewAccount(buff, data)
                break;
            case 7:
                this.SLogin(buff, data)
                break;
            case 9:
                this.SLoginSuccess(buff, data)
                break;
            case 11:
                this.SNewCharacterSuccess(buff, data)
                break;
            case 14:
                this.SStartGame(buff, data)
                break;
            case 17:
                this.SMapInformation(buff, data)
                break;
            case 18:
                this.SUserInformation(buff, data)
                break;
            case 22:
                this.SObjectTurn(buff, data)
                break;
            case 25:
                this.SChat(buff, data)
                break;
            case 27:
                this.SNewItemInfo(buff, data)
                break;
            case 49:
                this.STimeOfDay(buff, data)
                break;
            case 50:
                this.SChangeAMode(buff, data)
                break;
            case 51:
                this.SChangePMode(buff, data)
                break;
            case 65:
                this.SHealthChanged(buff, data)
                break;
            case 77:
                this.SObjectNpc(buff, data)
                break;
            case 78:
                this.SNPCResponse(buff, data)
                break;
            case 113:
                this.SSwitchGroup(buff, data)
                break;
            case 124:
                this.SAddBuff(buff, data)
                break;
            case 141:
                this.SBaseStatsInfo(buff, data)
                break;
            case 154:
                this.SDefaultNPC(buff, data)
                break;
            case 155:
                this.SNPCUpdate(buff, data)
                break;
            case 170:
                this.SCompletedQuests(buff, data)
                break;
            case 172:
                this.SNewQuestInfo(buff, data)
                break;
            case 201:
                this.SReceiveMail(buff, data)
                break;
            case 210:
                this.SUpdateIntelligentCreatureList(buff, data)
                break;
            case 215:
                this.SFriendUpdate(buff, data)
                break;
            case 216:
                this.SLoverUpdate(buff, data)
                break;
            case 217:
                this.SMentorUpdate(buff, data)
                break;
            case 218:
                this.SGuildBuffList(buff, data)
                break;
            case 220:
                this.SGameShopInfo(buff, data)
                break;
            default:
                break;
        }
        return true
    }
    public SConnected(buff: egret.ByteArray, data): Boolean {
        return true
    }
    public SClientVersion(buff: egret.ByteArray, data): Boolean {
        data.Result = buff.readByte()
        return true
    }
    public SDisconnect(buff: egret.ByteArray, data): Boolean {
        data.Reason = buff.readByte()
        return true
    }
    public SKeepAlive(buff: egret.ByteArray, data): Boolean {
        let uni: Long = Long.fromBits(buff.readInt(), buff.readUnsignedInt())
        data.Time = uni
        return true
    }
    public SNewAccount(buff: egret.ByteArray, data): Boolean {
        data.Result = buff.readByte()
        return true
    }
    public SLogin(buff: egret.ByteArray, data): Boolean {
        data.Result = buff.readByte()
        return true
    }
    public SLoginSuccess(buff: egret.ByteArray, data): Boolean {
        data.count = buff.readInt()
        data.Characters = []
        let charact = {}
        let length = 0
        for (let i = 0; i < data.count; i++) {
            charact["Index"] = buff.readInt()
            charact["Name"] = buff.readUTFBytes(this.readLen(buff))
            charact["Level"] = buff.readUnsignedShort()
            charact["Class"] = buff.readByte()
            charact["Gender"] = buff.readByte()
            charact["LastAccess"] = Long.fromBits(buff.readInt(), buff.readUnsignedInt())

            data.Characters.push(charact)
        }
        return true
    }

    //
    public SNewCharacterSuccess(buff: egret.ByteArray, data): Boolean {
        data.Characters = []
        let charact = {}
        charact["Index"] = buff.readInt()
        charact["Name"] = buff.readUTFBytes(this.readLen(buff))
        charact["Level"] = buff.readUnsignedShort()
        charact["Class"] = buff.readByte()
        charact["Gender"] = buff.readByte()
        charact["LastAccess"] = Long.fromBits(buff.readInt(), buff.readUnsignedInt())

        data.Characters.push(charact)
        return true
    }

    //
    public SStartGame(buff: egret.ByteArray, data): Boolean {
        data.Result = buff.readByte()
        data.Resolution = buff.readInt()
        return true
    }

    //
    public STimeOfDay(buff: egret.ByteArray, data): Boolean {
        data.Lights = buff.readByte()
        return true
    }

    //
    public SChangeAMode(buff: egret.ByteArray, data): Boolean {
        data.Mode = buff.readByte()
        return true
    }

    //
    public SChangePMode(buff: egret.ByteArray, data): Boolean {
        data.Mode = buff.readByte()
        return true
    }

    //
    public SHealthChanged(buff: egret.ByteArray, data): Boolean {
        data.HP = buff.readUnsignedShort()
        data.MP = buff.readUnsignedShort()
        return true
    }

    //
    public SObjectNpc(buff: egret.ByteArray, data): Boolean {
        data.QuestIDs = new Array()

        data.ObjectID = buff.readUnsignedInt()
        data.Name = buff.readUTFBytes(this.readLen(buff))
        data.NameColour = buff.readInt()
        data.Image = buff.readUnsignedShort()
        data.Colour = buff.readInt()
        data.Location = { x: buff.readInt(), y: buff.readInt() }
        data.Direction = buff.readByte()
        let count = buff.readInt()
        for (let i = 0; i < count; i++) {
            data.QuestIDs.push(buff.readInt())
        }
        return true
    }

    public SNPCResponse(buff: egret.ByteArray, data): Boolean {
        data.Page = new Array()
        let count = buff.readInt()
        for (let i = 0; i < count; i++) {
            data.Page.push(buff.readUTFBytes(this.readLen(buff)))
        }
        return true
    }

    public SSwitchGroup(buff: egret.ByteArray, data): Boolean {
        data.AllowGroup = buff.readBoolean()
        return true
    }

    public SAddBuff(buff: egret.ByteArray, data): Boolean {
        data.Type = buff.readByte()
        data.Caster = buff.readUTFBytes(this.readLen(buff))
        data.Visible = buff.readBoolean()
        data.ObjectID = buff.readUnsignedInt()
        data.Expire = Long.fromBits(buff.readInt(), buff.readUnsignedInt())
        data.Values = new Array(buff.readInt())
        for (let i = 0; i < data.Values.length; i++) {
            data.Values[i] = buff.readInt()
        }
        data.Infinite = buff.readBoolean()
        return true
    }

    //用户信息
    public SUserInformation(buff: egret.ByteArray, data): Boolean {
        data.ObjectID = buff.readUnsignedInt()
        data.RealId = buff.readUnsignedInt()
        data.Name = buff.readUTFBytes(this.readLen(buff))
        data.GuildName = buff.readUTFBytes(this.readLen(buff))
        data.GuildRank = buff.readUTFBytes(this.readLen(buff))
        data.NameColour = buff.readInt()
        data.Class = buff.readByte()
        data.Gender = buff.readByte()
        data.Level = buff.readUnsignedShort()
        data.Location = { x: buff.readInt(), y: buff.readInt() }
        data.Direction = buff.readByte()
        data.Hair = buff.readByte()
        data.HP = buff.readUnsignedShort()
        data.MP = buff.readUnsignedShort()
        data.Experience = Long.fromBits(buff.readInt(), buff.readUnsignedInt())
        data.MaxExperience = Long.fromBits(buff.readInt(), buff.readUnsignedInt())
        data.LevelEffects = buff.readByte()

        //读取装备
        if (buff.readBoolean()) {
            data.Inventory = new Array(buff.readInt());
            for (let i = 0; i < data.Inventory.length; i++) {
                data.Inventory[i] = {}
                if (!buff.readBoolean()) {
                    continue;
                } else {
                    this.UserItem(buff, data.Inventory[i])
                }
            }
        }

        if (buff.readBoolean()) {
            data.Equipment = new Array(buff.readInt());
            for (let i = 0; i < data.Equipment.length; i++) {
                data.Equipment[i] = {}
                if (!buff.readBoolean()) {
                    continue;
                } else {
                    this.UserItem(buff, data.Equipment[i])
                }
            }
        }

        if (buff.readBoolean()) {
            data.QuestInventory = new Array(buff.readInt());
            for (let i = 0; i < data.QuestInventory.length; i++) {
                data.QuestInventory[i] = {}
                if (!buff.readBoolean()) {
                    continue;
                } else {
                    this.UserItem(buff, data.QuestInventory[i])
                }
            }
        }

        data.Gold = buff.readUnsignedInt()
        data.Credit = buff.readUnsignedInt()
        data.HasExpandedStorage = buff.readBoolean()
        data.ExpandedStorageExpiryTime = Long.fromBits(buff.readInt(), buff.readUnsignedInt())

        data.Magics = new Array(buff.readInt())
        for (let i = 0; i < data.Magics.length; i++) {
            data.Magics[i] = {}
            this.ClientMagic(buff, data.Magics[i])
        }

        data.IntelligentCreatures = new Array(buff.readInt())
        for (let i = 0; i < data.IntelligentCreatures.length; i++) {
            data.IntelligentCreatures[i] = {}
            this.ClientIntelligentCreature(buff, data.IntelligentCreatures[i])
        }

        data.SummonedCreatureType = buff.readByte()
        data.CreatureSummoned = buff.readBoolean()
        return true
    }

    //读取装备
    public UserItem(buff: egret.ByteArray, item: any) {
        item.UniqueID = Long.fromBits(buff.readInt(), buff.readUnsignedInt())
        item.ItemIndex = buff.readInt()
        item.CurrentDura = buff.readUnsignedShort()
        item.MaxDura = buff.readUnsignedShort()
        item.Count = buff.readUnsignedInt()
        item.AC = buff.readByte()
        item.MAC = buff.readByte()
        item.DC = buff.readByte()
        item.MC = buff.readByte()
        item.SC = buff.readByte()
        item.Accuracy = buff.readByte()
        item.Agility = buff.readByte()
        item.HP = buff.readByte()
        item.MP = buff.readByte()
        item.AttackSpeed = buff.readByte()  //有符号
        item.Luck = buff.readByte() //有符号
        item.SoulBoundId = buff.readInt()
        item.Bools = buff.readByte()
        item.Identified = ((item.bools & 0x01) == 0x01)
        item.Cursed = ((item.bools & 0x02) == 0x02)
        item.Strong = buff.readByte()
        item.MagicResist = buff.readByte()
        item.PoisonResist = buff.readByte()
        item.HealthRecovery = buff.readByte()
        item.ManaRecovery = buff.readByte()
        item.PoisonRecovery = buff.readByte()
        item.CriticalRate = buff.readByte()
        item.CriticalDamage = buff.readByte()
        item.Freezing = buff.readByte()
        item.PoisonAttack = buff.readByte()

        //孔
        let count = buff.readInt()
        item.Slots = new Array(count)
        for (let i = 0; i < item.Slots.length; i++) {
            item.Slots[i] = {}
            if (buff.readBoolean()) {
                continue;
            } else {
                this.UserItem(buff, item.Slots[i])
            }
        }

        //宝石数量
        item.GemCount = buff.readUnsignedInt()
        item.Awake = {}
        this.Awake(buff, item.Awake)

        item.RefinedValue = buff.readByte()
        item.RefineAdded = buff.readByte()
        item.WeddingRing = buff.readInt()
        if (buff.readBoolean()) {
            item.ExpireInfo = Long.fromBits(buff.readInt(), buff.readUnsignedInt())
        }

        if (buff.readBoolean()) {
            item.RentalInformation = {}
            this.RentalInformation(buff, item.RentalInformation)
        }
    }

    public Awake(buff: egret.ByteArray, awake) {
        awake.type = buff.readByte()
        awake.count = buff.readInt()
        awake.listAwake = new Array()
        for (let i = 0; i < awake.count; i++) {
            awake.listAwake.push(buff.readByte())
        }
    }

    public RentalInformation(buff: egret.ByteArray, rental) {
        rental.OwnerName = buff.readUTFBytes(this.readLen(buff))
        rental.BindingFlags = buff.readShort()
        rental.ExpiryDate = Long.fromBits(buff.readInt(), buff.readUnsignedInt())
        rental.RentalLocked = buff.readBoolean()
    }

    public ClientMagic(buff: egret.ByteArray, magic) {
        magic.Spell = buff.readByte()
        magic.BaseCost = buff.readByte()
        magic.LevelCost = buff.readByte()
        magic.Icon = buff.readByte()
        magic.Level1 = buff.readByte()
        magic.Level2 = buff.readByte()
        magic.Level3 = buff.readByte()
        magic.Need1 = buff.readUnsignedShort()
        magic.Need2 = buff.readUnsignedShort()
        magic.Need3 = buff.readUnsignedShort()
        magic.Level = buff.readByte()
        magic.Key = buff.readByte()
        magic.Experience = buff.readUnsignedShort()
        magic.Delay = Long.fromBits(buff.readInt(), buff.readUnsignedInt())
        magic.Range = buff.readByte()
        magic.CastTime = Long.fromBits(buff.readInt(), buff.readUnsignedInt())
    }

    public ClientIntelligentCreature(buff: egret.ByteArray, intelligent) {
        intelligent.PetType = buff.readByte()
        intelligent.Icon = buff.readInt()
        intelligent.CustomName = buff.readUTFBytes(this.readLen(buff))
        intelligent.Fullness = buff.readInt()
        intelligent.SlotIndex = buff.readInt()
        intelligent.ExpireTime = Long.fromBits(buff.readInt(), buff.readUnsignedInt())
        intelligent.BlackstoneTime = Long.fromBits(buff.readInt(), buff.readUnsignedInt())
        intelligent.petMode = buff.readByte()

        this.IntelligentCreatureRules(buff, intelligent.CreatureRules)
        this.IntelligentCreatureItemFilter(buff, intelligent.Filter)

        intelligent.Filter.PickupGrade = buff.readByte()
        intelligent.MaintainFoodTime = Long.fromBits(buff.readInt(), buff.readUnsignedInt())
    }

    public IntelligentCreatureRules(buff: egret.ByteArray, rules) {
        rules.MinimalFullness = buff.readInt()
        rules.MousePickupEnabled = buff.readBoolean()
        rules.MousePickupRange = buff.readInt()
        rules.AutoPickupEnabled = buff.readBoolean()
        rules.AutoPickupRange = buff.readInt()
        rules.SemiAutoPickupEnabled = buff.readBoolean()
        rules.SemiAutoPickupRange = buff.readInt()
        rules.CanProduceBlackStone = buff.readBoolean()
        rules.Info = buff.readUTFBytes(this.readLen(buff))
        rules.Info1 = buff.readUTFBytes(this.readLen(buff))
        rules.Info2 = buff.readUTFBytes(this.readLen(buff))
    }

    public IntelligentCreatureItemFilter(buff: egret.ByteArray, filter) {
        filter.PetPickupAll = buff.readBoolean()
        filter.PetPickupGold = buff.readBoolean()
        filter.PetPickupWeapons = buff.readBoolean()
        filter.PetPickupArmours = buff.readBoolean()
        filter.PetPickupHelmets = buff.readBoolean()
        filter.PetPickupBoots = buff.readBoolean()
        filter.PetPickupBelts = buff.readBoolean()
        filter.PetPickupAccessories = buff.readBoolean()
        filter.PetPickupOthers = buff.readBoolean()
    }

    //地图信息
    public SMapInformation(buff: egret.ByteArray, data) {
        data.FileName = buff.readUTFBytes(this.readLen(buff))
        data.Title = buff.readUTFBytes(this.readLen(buff))
        data.MiniMap = buff.readUnsignedShort()
        data.BigMap = buff.readUnsignedShort()
        data.Lights = buff.readByte()
        data.bools = buff.readByte()
        data.Lightning = ((data.bools & 0x01) == 0x01)
        data.Fire = ((data.bools & 0x02) == 0x02)
        data.MapDarkLight = buff.readByte()
        data.Music = buff.readUnsignedShort()
    }

    //目标移动
    public SObjectTurn(buff: egret.ByteArray, data): Boolean {
        data.ObjectID = buff.readUnsignedInt()
        data.Location = { x: buff.readInt(), y: buff.readInt() }
        data.Direction = buff.readByte()
        return true
    }

    //聊天
    public SChat(buff: egret.ByteArray, data): Boolean {
        data.Message = buff.readUTFBytes(this.readLen(buff))
        data.Type = buff.readByte()

        console.log(data.Type + " : " + data.Message)
        return true
    }

    public SNewItemInfo(buff: egret.ByteArray, data): Boolean {
        data.Index = buff.readInt()
        data.Name = buff.readUTFBytes(this.readLen(buff))
        data.Type = buff.readByte()
        data.Grade = buff.readByte()
        data.RequiredType = buff.readByte()
        data.RequiredClass = buff.readByte()
        data.RequiredGender = buff.readByte()
        data.Set = buff.readByte()
        data.Shape = buff.readShort()
        data.Weight = buff.readByte()
        data.Light = buff.readByte()
        data.RequiredAmount = buff.readByte()
        data.Image = buff.readUnsignedShort()
        data.Durability = buff.readUnsignedShort()
        data.StackSize = buff.readUnsignedInt()
        data.Price = buff.readUnsignedInt()

        data.MinAC = buff.readByte()
        data.MaxAC = buff.readByte()
        data.MinMAC = buff.readByte()
        data.MaxMAC = buff.readByte()
        data.MinDC = buff.readByte()
        data.MaxDC = buff.readByte()
        data.MinMC = buff.readByte()
        data.MaxMC = buff.readByte()
        data.MinSC = buff.readByte()
        data.MaxSC = buff.readByte()

        data.HP = buff.readUnsignedShort()
        data.MP = buff.readUnsignedShort()

        data.Accuracy = buff.readByte()
        data.Agility = buff.readByte()
        data.Luck = buff.readByte()
        data.AttackSpeed = buff.readByte()
        data.StartItem = buff.readBoolean()
        data.BagWeight = buff.readByte()
        data.HandWeight = buff.readByte()
        data.WearWeight = buff.readByte()

        data.Effect = buff.readByte()
        data.Strong = buff.readByte()
        data.MagicResist = buff.readByte()
        data.PoisonResist = buff.readByte()
        data.HealthRecovery = buff.readByte()
        data.SpellRecovery = buff.readByte()
        data.PoisonRecovery = buff.readByte()
        data.HPrate = buff.readByte()
        data.MPrate = buff.readByte()
        data.CriticalRate = buff.readByte()
        data.CriticalDamage = buff.readByte()

        data.bools = buff.readByte()
        data.NeedIdentify = ((data.bools & 0x01) == 0x01)
        data.ShowGroupPickup = ((data.bools & 0x02) == 0x02)
        data.ClassBased = ((data.bools & 0x04) == 0x04)
        data.LevelBased = ((data.bools & 0x08) == 0x08)
        data.CanMine = ((data.bools & 0x10) == 0x10)
        data.GlobalDropNotify = ((data.bools & 0x20) == 0x20)

        data.MaxAcRate = buff.readByte()
        data.MaxMacRate = buff.readByte()
        data.Holy = buff.readByte()
        data.Freezing = buff.readByte()
        data.PoisonAttack = buff.readByte()
        data.Bind = buff.readShort()

        data.Reflect = buff.readByte()
        data.HpDrainRate = buff.readByte()
        data.Unique = buff.readShort()
        data.RandomStatsId = buff.readByte()
        data.CanFastRun = buff.readBoolean()
        data.CanAwakening = buff.readBoolean()
        data.isTooltip = buff.readBoolean()
        if (data.isTooltip) {
            data.ToolTip = buff.readUTFBytes(this.readLen(buff))
        }
        return true
    }

    //读取字符串长度,C#的字符串首字节记录字符串的长度,不定长,字符串小于128字节时,使用单字节,大于128时,使用双字节..
    public readLen(buff: egret.ByteArray): number {
        let count: number = 0
        let length: number = buff.readUnsignedByte()
        //检查是否有后继位标志,有后继位标志表示字符串长度超过128,需要再读一个字节
        if ((length & 0x80) == 0x80) {
            //首字节只保留后7位 + 后继位 * 128获得字符串的实际长度
            count = (buff.readUnsignedByte() * 0x80) + (length & 0x7f)
        } else {
            //无后继位直接返回长度
            count = length
        }
        return count
    }

    public SBaseStatsInfo(buff: egret.ByteArray, data): Boolean {
        data.Stats = this.BaseStats(buff)
        return true
    }

    public BaseStats(buff: egret.ByteArray) {
        let Stats: any = {}
        Stats.HpGain = buff.readFloat()
        Stats.HpGainRate = buff.readFloat()
        Stats.MpGainRate = buff.readFloat()
        Stats.MinAc = buff.readByte()
        Stats.MaxAc = buff.readByte()
        Stats.MinMac = buff.readByte()
        Stats.MaxMac = buff.readByte()
        Stats.MinDc = buff.readByte()
        Stats.MaxDc = buff.readByte()
        Stats.MinMc = buff.readByte()
        Stats.MaxMc = buff.readByte()
        Stats.MinSc = buff.readByte()
        Stats.MaxSc = buff.readByte()

        Stats.StartAccuracy = buff.readByte()
        Stats.StartAgility = buff.readByte()
        Stats.StartCriticalRate = buff.readByte()
        Stats.StartCriticalDamage = buff.readByte()
        Stats.CritialRateGain = buff.readByte()
        Stats.CriticalDamageGain = buff.readByte()

        Stats.BagWeightGain = buff.readFloat()
        Stats.WearWeightGain = buff.readFloat()
        Stats.HandWeightGain = buff.readFloat()
        return Stats
    }

    public SDefaultNPC(buff: egret.ByteArray, data): Boolean {
        data.ObjectID = buff.readUnsignedInt()
        return true
    }

    public SNPCUpdate(buff: egret.ByteArray, data): Boolean {
        data.NPCID = buff.readUnsignedInt()
        return true
    }

    public SCompletedQuests(buff: egret.ByteArray, data): Boolean {
        data.CompletedQuests = new Array()
        let count = buff.readInt()
        for (let i = 0; i < count; i++) {
            data.CompletedQuests.push(buff.readInt())
        }
        return true
    }

    public SNewQuestInfo(buff: egret.ByteArray, data): Boolean {
        data.Info = {}
        this.ClientQuestInfo(buff, data.Info)
        return true
    }

    public SReceiveMail(buff: egret.ByteArray, data): Boolean {
        let count = buff.readInt()
        data.Mail = new Array()
        for (let i = 0; i < count; i++) {
            data.Mail.push(this.ClientMail(buff))
        }
        return true
    }
    public ClientMail(buff: egret.ByteArray) {
        let Mail: any = {}
        Mail.Items = new Array()

        Mail.MailID = Long.fromBits(buff.readInt(), buff.readUnsignedInt())
        Mail.SenderName = buff.readUTFBytes(this.readLen(buff))
        Mail.Message = buff.readUTFBytes(this.readLen(buff))
        Mail.Opened = buff.readBoolean()
        Mail.Locked = buff.readBoolean()
        Mail.CanReply = buff.readBoolean()
        Mail.Collected = buff.readBoolean()
        Mail.DateSent = Long.fromBits(buff.readInt(), buff.readUnsignedInt())
        Mail.Gold = buff.readUnsignedInt()

        let count = buff.readInt()
        for (let i = 0; i < count; i++) {
            Mail.Items[i] = {}
            this.SNewItemInfo(buff, Mail.Items[i])
        }

        return Mail
    }

    public ClientQuestInfo(buff: egret.ByteArray, quest) {
        quest.Description = new Array()
        quest.TaskDescription = new Array()
        quest.CompletionDescription = new Array()
        quest.RewardsFixedItem = new Array()
        quest.RewardsSelectItem = new Array()

        quest.Index = buff.readInt()
        quest.NPCIndex = buff.readUnsignedInt()
        quest.Name = buff.readUTFBytes(this.readLen(buff))
        quest.Group = buff.readUTFBytes(this.readLen(buff))

        let count = 0
        count = buff.readInt()
        for (let i = 0; i < count; i++) {
            quest.Description.push(buff.readUTFBytes(this.readLen(buff)))
        }
        count = buff.readInt()
        for (let i = 0; i < count; i++) {
            quest.TaskDescription.push(buff.readUTFBytes(this.readLen(buff)))
        }
        count = buff.readInt()
        for (let i = 0; i < count; i++) {
            quest.CompletionDescription.push(buff.readUTFBytes(this.readLen(buff)))
        }
        quest.MinLevelNeeded = buff.readInt()
        quest.MaxLevelNeeded = buff.readInt()
        quest.QuestNeeded = buff.readInt()
        quest.ClassNeeded = buff.readByte()
        quest.Type = buff.readByte()
        quest.RewardGold = buff.readUnsignedInt()
        quest.RewardExp = buff.readUnsignedInt()
        quest.RewardCredit = buff.readUnsignedInt()

        count = buff.readInt()
        for (let i = 0; i < count; i++) {
            quest.RewardsFixedItem.push(this.QuestItemReward(buff))
        }

        count = buff.readInt()
        for (let i = 0; i < count; i++) {
            quest.RewardsSelectItem.push(this.QuestItemReward(buff))
        }

        quest.FinishNPCIndex = buff.readUnsignedInt()
    }

    public QuestItemReward(buff: egret.ByteArray) {
        let reward: any = {}
        reward.Item = {}

        this.SNewItemInfo(buff, reward.Item)
        reward.Count = buff.readUnsignedInt()
        return reward
    }

    public SGameShopInfo(buff: egret.ByteArray, data): Boolean {
        data.Item = {}
        this.GameShopItem(buff, data.Item)
        data.StockLevel = buff.readInt()
        return true
    }

    public GameShopItem(buff: egret.ByteArray, item) {
        item.ItemIndex = buff.readInt()
        item.GIndex = buff.readInt()
        item.Info = {}
        this.SNewItemInfo(buff, item.Info)
        item.GoldPrice = buff.readUnsignedInt()
        item.CreditPrice = buff.readUnsignedInt()
        item.Count = buff.readUnsignedInt()
        item.Class = buff.readUTFBytes(this.readLen(buff))
        item.Category = buff.readUTFBytes(this.readLen(buff))
        item.Stock = buff.readInt()
        item.iStock = buff.readBoolean()
        item.Deal = buff.readBoolean()
        item.TopItem = buff.readBoolean()
        item.Date = Long.fromBits(buff.readInt(), buff.readUnsignedInt())
    }

    public SUpdateIntelligentCreatureList(buff: egret.ByteArray, data): Boolean {
        let count = buff.readInt()
        data.CreatureList = new Array()
        for (let i = 0; i < count; i++) {
            data.CreatureList[i] = {}
            this.ClientIntelligentCreature(buff, data.CreatureList[i])
        }
        data.CreatureSummoned = buff.readBoolean()
        data.SummonedCreatureType = buff.readByte()
        data.PearlCount = buff.readInt()
        return true
    }

    public SFriendUpdate(buff: egret.ByteArray, data): Boolean {
        data.Friends = new Array()

        let count = buff.readInt()
        for (let i = 0; i < count; i++) {
            data.Friends.push(this.ClientFriend(buff))
        }
        return true
    }

    public ClientFriend(buff: egret.ByteArray) {
        let Friend: any = {}
        Friend.Index = buff.readInt()
        Friend.Name = buff.readUTFBytes(this.readLen(buff))
        Friend.Memo = buff.readUTFBytes(this.readLen(buff))
        Friend.Blocked = buff.readBoolean()
        Friend.Online = buff.readBoolean()
        return Friend
    }

    public SLoverUpdate(buff: egret.ByteArray, data): Boolean {
        data.Name = buff.readUTFBytes(this.readLen(buff))
        data.Date = Long.fromBits(buff.readInt(), buff.readUnsignedInt())
        data.MapName = buff.readUTFBytes(this.readLen(buff))
        data.MarriedDays = buff.readShort()
        return true
    }

    public SMentorUpdate(buff: egret.ByteArray, data): Boolean {
        data.Name = buff.readUTFBytes(this.readLen(buff))
        data.Level = buff.readUnsignedShort()
        data.Online = buff.readBoolean()
        data.MenteeEXP = Long.fromBits(buff.readInt(), buff.readUnsignedInt())
        return true
    }

    //
    public SGuildBuffList(buff: egret.ByteArray, data): Boolean {
        let count = 0
        data.ActiveBuffs = new Array()
        data.GuildBuffs = new Array()

        data.Remove = buff.readByte()
        count = buff.readInt()
        for (let i = 0; i < count; i++) {
            data.ActiveBuffs.push(this.GuildBuff(buff))
        }

        count = buff.readInt()
        for (let i = 0; i < count; i++) {
            data.GuildBuffs.push(this.GuildBuffInfo(buff))
        }
        return true
    }

    public GuildBuff(buff: egret.ByteArray) {
        let Buff: any = {}
        Buff.Id = buff.readInt()
        Buff.Active = buff.readBoolean()
        Buff.ActiveTimeRemaining = buff.readInt()
        return Buff
    }

    public GuildBuffInfo(buff: egret.ByteArray) {
        let Info: any = {}
        Info.Id = buff.readInt()
        Info.Icon = buff.readInt()
        Info.name = buff.readUTFBytes(this.readLen(buff))
        Info.LevelRequirement = buff.readByte()
        Info.PointsRequirement = buff.readByte()
        Info.TimeLimit = buff.readInt()
        Info.ActivationCost = buff.readInt()
        Info.BuffAc = buff.readByte()
        Info.BuffMac = buff.readByte()
        Info.BuffDc = buff.readByte()
        Info.BuffMc = buff.readByte()
        Info.BuffSc = buff.readByte()
        Info.BuffMaxHp = buff.readInt()
        Info.BuffMaxMp = buff.readInt()
        Info.BuffMineRate = buff.readByte()
        Info.BuffGemRate = buff.readByte()
        Info.BuffFishRate = buff.readByte()
        Info.BuffExpRate = buff.readByte()
        Info.BuffCraftRate = buff.readByte()
        Info.BuffSkillRate = buff.readByte()
        Info.BuffHpRegen = buff.readByte()
        Info.BuffMPRegen = buff.readByte()
        Info.BuffAttack = buff.readByte()
        Info.BuffDropRate = buff.readByte()
        Info.BuffGoldRate = buff.readByte()
        return Info
    }
    ////////////////////////////////////////////////////




    //根据服务器响应消息,获取客户端对应的消息
    public get_message_type(id: number) {
        if (id === 0 || id === 17 || id === 18 || id === 25
            || id === 27 || id === 172 || id === 210 || id === 220 || id === 22
            || id === 124 || id === 78 || id === 170 || id === 201 || id === 215
            || id === 216 || id === 217 || id === 141 || id === 77 || id === 49
            || id === 50 || id === 51 || id === 113 || id === 154 || id === 218
            || id === 155 || id === 155 || id === 155 || id === 155 || id === 155
        ) {
            return -1                   //被动消息
        } else {
            if (id === 1) {             //服务端消息1对应客户端请求0
                return 0
            } else if (id === 2) {      //服务端消息2对应客户端消息1
                return 1
            } else if (id === 3) {      //心跳
                return 2
            } else if (id === 4) {      //服务端消息4对应客户端消息3
                return 3
            } else if (id === 9) {      //登陆
                return 5
            } else if (id === 11) {     //创建角色
                return 6
            } else if (id === 14) {     //登陆游戏
                return 8
            }
        }
    }
}