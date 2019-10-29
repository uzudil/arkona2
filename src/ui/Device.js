import * as Config from "../config/Config.js"

const WIDTH = 74
const HEIGHT = 8

export default class {
	constructor(arkona) {
		this.arkona = arkona
		this.image = this.arkona.game.add.image(0, 0, "device", "device")
		this.image.anchor.set(0, 0)

		this.health = this.arkona.game.add.graphics(4, 5)
		this.health.beginFill(0xcccc00)
		this.health.drawRect(0, 0, WIDTH, HEIGHT)
		this.health.endFill()

		this.power = this.arkona.game.add.graphics(4, 20)
        this.power.beginFill(0x00cc66)
        this.power.drawRect(0, 0, WIDTH, HEIGHT)
        this.power.endFill()

		// these should be shown/hidden as found?
		this.purpleGem = this.arkona.game.add.image(245, 6, "device", "gem-purple")
		this.blueGem = this.arkona.game.add.image(277, 6, "device", "gem-blue")
		this.greenGem = this.arkona.game.add.image(309, 6, "device", "gem-green")
		this.redGem = this.arkona.game.add.image(341, 6, "device", "gem-red")
		this.yellowGem = this.arkona.game.add.image(373, 6, "device", "gem-yellow")

        this.level = this.arkona.game.add.text(86, 3, "", {
            font: "bold 18px " + Config.FONT_FAMILY,
            fill: "#fc0",
            boundsAlignH: "center",
            boundsAlignV: "center",
            wordWrap: false
        })
        this.level.setShadow(1, 1, "rgba(0,0,0,1)", 2)
    }

	update() {
		this.health.scale.x = this.arkona.player.alive.getHealth()
		this.power.scale.x = this.arkona.player.alive.getWeaponCooldown()
        this.level.setText("" + this.arkona.player.alive.level)
	}


}