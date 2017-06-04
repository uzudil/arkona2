import * as Config from "../config/Config"
import {BLOCKS} from "../config/Blocks"

class Effect {
    constructor(arkona, sprite) {
        this.arkona = arkona
        this.sprite = sprite
    }
}

class RainEffect extends Effect {
    constructor(colors, arkona, sprite) {
        super(arkona, sprite)

        this.gfx = this.arkona.game.add.graphics(0, 0, this.arkona.blocks.objectLayer.group)
        for(let c = 0; c < colors.length; c++) {
            let offs = Math.random() * colors.length
            this.gfx.beginFill(colors[c])
            for (let i = 0; i < (200/colors.length)|0; i++) {
                let y = Math.random() * 150
                let x = Math.sin(((2.5 * (y + offs * 90))/180) * Math.PI) * 10 + 10
                this.gfx.drawRect(x, y, 1 + Math.random() * 2, 3 + Math.random() * 5)
            }
        }
        this.gfx.endFill()
        this.gfx.anchor.setTo(0.5, 0.5)
        // this.gfx.angle = Math.random() * 60 - 30
        this.gfx.renderable = false // skip in sorting

        this.ttl = Date.now() + 250
    }

    update() {
        if(Date.now() < this.ttl) {
            let block = BLOCKS[this.sprite.name]
            let screenPos = this.arkona.blocks.toScreenCoords(...this.sprite.floatPos, this.sprite.gamePos[2])
            this.gfx.x = (screenPos[0] - block.size[0] * Config.GRID_SIZE) + (Math.random() * 2 - 1)
            this.gfx.y = screenPos[1] - 175 + (Math.random() * 2 - 1)
            this.gfx.alpha = 0.25 + Math.random() * 0.25
            return true
        } else {
            this.gfx.destroy()
            return false
        }
    }
}

class SlashEffect extends Effect {
    constructor(zoom, arkona, sprite) {
        super(arkona, sprite)

        this.gfx = this.arkona.game.add.graphics(0, 0, this.arkona.blocks.objectLayer.group)
        this.gfx.beginFill(0xff0000)
        this.gfx.drawRect(Math.random() * 5, 0, 15 + Math.random() * 15, 1)
        this.gfx.drawRect(Math.random() * 3, 2, 25 + Math.random() * 10, 2)
        this.gfx.drawRect(Math.random() * 5, 6, 15 + Math.random() * 15, 1)
        for(let i = 0; i < 5; i++) this.gfx.drawCircle(Math.random() * 35, Math.random() * 10, 3 + Math.random() * 3)
        this.gfx.endFill()
        this.gfx.anchor.setTo(0.5, 0.5)
        this.gfx.angle = Math.random() * 90 - 45
        this.gfx.scale.setTo(zoom, zoom)
        this.gfx.renderable = false // skip in sorting

        this.ttl = Date.now() + 250
    }

    update() {
        if(Date.now() < this.ttl) {
            let block = BLOCKS[this.sprite.name]
            let screenPos = this.arkona.blocks.toScreenCoords(...this.sprite.floatPos, this.sprite.gamePos[2])
            this.gfx.x = (screenPos[0] - block.size[0] * Config.GRID_SIZE) + (Math.random() * 2 - 1)
            this.gfx.y = (screenPos[1] - block.size[1] * Config.GRID_SIZE * 2) + (Math.random() * 2 - 1)
            this.gfx.alpha = 0.25 + Math.random() * 0.25
            return true
        } else {
            this.gfx.destroy()
            return false
        }
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
            case "slash": effect = new SlashEffect(1, this.arkona, sprite); break
            case "slash_big": effect = new SlashEffect(2.5, this.arkona, sprite); break
            case "ice": effect = new RainEffect([0x0088ff, 0x0000ff, 0x0022ff], this.arkona, sprite); break
            case "fire": effect = new RainEffect([0xff8800, 0xff0000, 0xffff00, 0xff2200], this.arkona, sprite); break
            default: throw "Can't create effect of type: " + type
        }
        console.log("Running effect: " + type)
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
