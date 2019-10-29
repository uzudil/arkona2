import * as Config from "../config/Config.js"
import {getLogger} from "../config/Logger.js"

export default class {
	constructor(arkona, info) {
		this.arkona = arkona
		this.info = info
		this.generated = 0
        this.lastTime = null
	}

	update() {
		// - only create 1 per call
		// - only if generator location is off-screen
		if(this._generateNow()) {
            getLogger("GENERATOR").warn("Generating " + this.info.type.creature + " at " + this.info.x + "," + this.info.y + "," + this.info.z)
            this.lastTime = Date.now()
            let section = this.arkona.sectionAt(this.info.x, this.info.y)
            if(section) {
                let monster = this.info.type
                let npc = section.addNpc({
                    creature: monster.creature,
                    x: 0, y: 0, z: 0,
                    options: {
                        movement: Config.MOVE_ATTACK,
                        monster: monster
                    }
                })

                // try to find a place for it
                if (this.arkona.blocks.moveNear(npc.animatedSprite.sprite, this.info.x, this.info.y, this.info.z, this.getRange())) {
                    getLogger("GENERATOR").warn("Starting " + this.info.type.creature + " at " + npc.animatedSprite.sprite.gamePos)
                    npc.setPosFromSprite(npc.animatedSprite.sprite)
                    this.generated++
                    npc.generator = [this.info.x, this.info.y]
                } else {
                    getLogger("GENERATOR").warn("Generator unable to position " + this.info.type.creature + " at " + this.info.x + "," + this.info.y + "," + this.info.z)
                    section.removeNpc(npc)
                }
            }
		}
	}

	_generateNow() {
        return (this.lastTime == null || Date.now() - this.lastTime > Math.random() * 15000 + 10000) &&
            this.getCount() > this.generated &&
            !this.isOnScreen()
    }

	remove() {
		this.generated--
	}

	getCount() {
		return this.info["count"] ? this.info.count : 1
	}

	getRange() {
		return this.info["range"] ? this.info.range : 6
	}

	isOnScreen() {
		return this.arkona.getDistanceToPlayer(this.info.x, this.info.y, this.info.z) < 25
	}
}