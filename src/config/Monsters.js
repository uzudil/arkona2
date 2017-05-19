import {MOVE_ATTACK} from "./Config"

export const MONSTERS = {
	goblin: {
		creature: "goblin",
		speed: 100,
		animationSpeed: 10,
		movement: MOVE_ATTACK,
		alive: {
			health: 10,
			strength: 2
		}
	},
	ogre: {
		creature: "ogre",
		speed: 80,
		animationSpeed: 10,
		movement: MOVE_ATTACK,
		alive: {
			health: 30,
			strength: 8
		}
	},
	scorpion: {
		creature: "scorpion",
		speed: 100,
		animationSpeed: 10,
		movement: MOVE_ATTACK,
		alive: {
			health: 20,
			strength: 4
		}
	},
	scorpion_large: {
		creature: "scorpion_large",
		speed: 80,
		animationSpeed: 10,
		movement: MOVE_ATTACK,
		alive: {
			health: 30,
			strength: 8
		}
	},
	drake: {
		creature: "drake",
		speed: 80,
		animationSpeed: 10,
		movement: MOVE_ATTACK,
		alive: {
			health: 200,
			strength: 45
		}
	},
	drake_blue: {
		creature: "drake_blue",
		speed: 80,
		animationSpeed: 10,
		movement: MOVE_ATTACK,
		alive: {
			health: 200,
			strength: 45
		}
	},
	drake_green: {
		creature: "drake_green",
		speed: 80,
		animationSpeed: 10,
		movement: MOVE_ATTACK,
		alive: {
			health: 200,
			strength: 45
		}
	}
}
