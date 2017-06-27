import * as Config from "./../config/Config"
import * as Vehicles from "../config/Vehicles"
import AnimatedSprite from "../world/Animation"

export default class {
    constructor(arkona, info) {
        this.arkona = arkona
        this.dir = info["dir"] || Config.DIR_N
        this.vehicleDef = Vehicles.VEHICLES[info.name]
        this.id = "" + info.x + "," + info.y + "," + (info["z"] || 0)
        this.animatedSprite = new AnimatedSprite(arkona.game, info.name, arkona.blocks, info.x, info.y, info["z"] || 0, this.vehicleDef.animations, this.vehicleDef.blockName)
        this.animatedSprite.sprite.vehicle = this
        this.setDir(this.dir)
    }

    setDir(dir) {
        this.dir = dir
        this.animatedSprite.setAnimation("stand", this.dir)
    }
}
