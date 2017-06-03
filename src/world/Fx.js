import * as Config from "../config/Config"
import {BLOCKS} from "../config/Blocks"

class Effect {
    constructor(arkona, sprite) {
        this.arkona = arkona
        this.sprite = sprite
    }
}

class ColumnEffect extends Effect {
    constructor(color, arkona, sprite) {
        super(arkona, sprite)
        this.color = color

        this.gfxBack = this.arkona.game.add.graphics(0, 0, this.arkona.blocks.group)
        this.gfxBack.beginFill(0xffffff)
        this.gfxBack.drawRect(0, 0, Config.WIDTH, Config.HEIGHT)
        this.gfxBack.endFill()

        this.gfx = this.arkona.game.add.graphics(0, 0, this.arkona.blocks.objectLayer.group)
        this.gfx.beginFill(color)
        this.gfx.drawRect(0, 0, 2, Config.HEIGHT - 20)
        this.gfx.drawRect(4, 0, 2, Config.HEIGHT - 10)
        this.gfx.drawRoundedRect(8, 0, 25, Config.HEIGHT)
        this.gfx.drawRect(35, 0, 2, Config.HEIGHT - 10)
        this.gfx.drawRect(39, 0, 2, Config.HEIGHT - 20)
        this.gfx.endFill()
        this.gfx.renderable = false // skip in sorting

        this.ttl = Date.now() + 1500
    }

    update() {
        if(Date.now() < this.ttl) {
            let block = BLOCKS[this.sprite.name]
            let screenPos = this.arkona.blocks.toScreenCoords(...this.sprite.floatPos, this.sprite.gamePos[2])
            this.gfx.x = (screenPos[0] - block.size[0] * Config.GRID_SIZE) + (Math.random() * 2 - 1)
            this.gfx.y = -(Config.HEIGHT - screenPos[1]) + (Math.random() * 2 - 1)
            this.gfx.alpha = 0.25 + Math.random() * 0.25

            this.gfxBack.alpha = 0.25 + Math.random() * 0.25
            return true
        } else {
            this.gfx.destroy()
            this.gfxBack.destroy()
            return false
        }
    }
}

export default class {
    constructor(arkona) {
        this.arkona = arkona
        this.queue = []
    }

    run(type, sprite) {
        let effect
        switch(type) {
            case "heal": effect = new ColumnEffect(0x0088ff, this.arkona, sprite); break
            default: throw "Can't create effect of type: " + type
        }
        this.queue.push(effect)
    }

    update() {
        for(let i = 0; i < this.queue.length; i++) {
            let fx = this.queue[i]
            if(!fx.update()) {
                this.queue.splice(i--, 1)
            }
        }
    }
}
