import UseObject from "./UseObject.js"

export default class {

	constructor() {
		this.sprite = null
		this.useObject = new UseObject()
		this.action = null
	}

	getType() {
		return "mouse_click"
	}

	getPos() {
		return this.sprite ? this.sprite.gamePos : null
	}

	check(arkona) {
		this.action = null
		if(this.sprite && arkona.player.canReach(this.sprite)) {
			if(this.useObject.setMode(arkona, this.sprite)) {
                this.useObject.mouseActivate = true
				this.action = this.useObject
			}
		}
		return this.action != null
	}

	setContext(context) {
		this.sprite = context
	}

	run(arkona) {
		return this.action.setSprite(arkona, this.sprite).run(arkona)
	}
}