//import * as Config from "../config/Config"
//import Phaser from "phaser"

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
	}

	update() {
		this.health.scale.x = Math.max(0, this.arkona.player.alive.health
			/ this.arkona.player.alive.startingHealth)
		this.power.scale.x = this.arkona.player.alive.getWeaponCooldown()
	}


}