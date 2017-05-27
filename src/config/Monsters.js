import {MOVE_ATTACK} from "./Config"

export const MONSTERS = {
	goblin: {
		creature: "goblin",
		movement: MOVE_ATTACK,
		alive: {
			health: 10,
			strength: 2
		}
	},
	ogre: {
		creature: "ogre",
		movement: MOVE_ATTACK,
		alive: {
			health: 30,
			strength: 8
		}
	},
	scorpion: {
		creature: "scorpion",
		movement: MOVE_ATTACK,
		alive: {
			health: 20,
			strength: 4
		}
	},
	scorpion_large: {
		creature: "scorpion_large",
		movement: MOVE_ATTACK,
		alive: {
			health: 30,
			strength: 8
		}
	},
	drake: {
		creature: "drake",
		movement: MOVE_ATTACK,
		alive: {
			health: 200,
			strength: 45
		}
	},
	drake_blue: {
		creature: "drake_blue",
		movement: MOVE_ATTACK,
		alive: {
			health: 200,
			strength: 45
		}
	},
	drake_green: {
		creature: "drake_green",
		movement: MOVE_ATTACK,
		alive: {
			health: 200,
			strength: 45
		}
	},
    skeleton: {
        creature: "skeleton",
        movement: MOVE_ATTACK,
        alive: {
            health: 25,
            strength: 4,
            attackWait: 1500
        }
    },
    skeleton_blue: {
        creature: "skeleton_blue",
        movement: MOVE_ATTACK,
        alive: {
            health: 10,
            strength: 6,
            attackWait: 1000
        }
    },
    skeleton_red: {
        creature: "skeleton_red",
        movement: MOVE_ATTACK,
        alive: {
            health: 10,
            strength: 8,
            attackWait: 500
        }
    },

}
