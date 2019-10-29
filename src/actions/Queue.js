import UseObject from "./UseObject.js"
import MovePlayer from "./MovePlayer.js"
import MoveNpc from "./MoveNpc.js"
import GeneratorAction from "./GeneratorAction.js"
import MouseClickAction from "./MouseClickAction.js"
import {getLogger} from "../config/Logger.js"

const ACTIONS = [
	new UseObject(),
	new MovePlayer(),
	new MoveNpc(),
	new GeneratorAction(),
	new MouseClickAction()
]

export const USE_OBJECT = 0
export const MOVE_PLAYER = 1
export const MOVE_NPC = 2
export const GENERATORS = 3
export const CLICK = 4

const DONT_LOG = [MOVE_PLAYER, MOVE_NPC, GENERATORS]

export class Queue {
	constructor(arkona) {
		this.arkona = arkona
		this.queue = []
	}

	add(actionIndex, context) {
		let action = ACTIONS[actionIndex]
		action.setContext(context)
		this.queue.push(actionIndex)
	}

	update() {
		let updated = false
		while(this.queue.length > 0) {
			let action = ACTIONS[this.queue[0]]
			this.log(action, "Trying")
			if(action.check(this.arkona)) {
				this.log(action, "Running")
				if(this.arkona.isAllowed(action)) {
					let b = action.run(this.arkona)
					if (b) updated = b
				} else {
					this.log(action, "NOT ALLOWED")
					// todo: play FAIL sound or special handling?
				}
			}
			this.queue.splice(0, 1)
		}
		return updated
	}

	log(action, message) {
		if(DONT_LOG.find(s => ACTIONS[s] == action)) return
		getLogger("ACTION").warn(message + ": type=" + action.getType() + " at " + action.getPos())
	}
}