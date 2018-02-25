export default class {

	constructor() {
		this.dir = null
		this.x = 0
		this.y = 0
		this.z = 0
	}

	getType() {
		return "move_player"
	}

	getPos() {
		return this.pos
	}

	// eslint-disable-next-line no-unused-vars
	check(arkona) {
		return true
	}

	// eslint-disable-next-line no-unused-vars
	setContext(context) {
        this.dir = null
        this.x = 0
        this.y = 0
        this.z = 0
		if(typeof context === "object") {
			this.x = context[0]
			this.y = context[1]
			this.z = context[2]
		} else {
            this.dir = context
        }
	}

	run(arkona) {
		return this.dir ? arkona.player.move(this.dir) : arkona.player.findPathTo(this.x, this.y, this.z)
	}
}