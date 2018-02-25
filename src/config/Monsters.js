import {MOVE_ATTACK} from "./Config"

export const MONSTERS = {
	goblin: {
		creature: "goblin",
		movement: MOVE_ATTACK,
        monsterLevel: 1,
		alive: {
			health: 10,
			strength: 2,
            attack: "slash"
		}
	},
	ogre: {
		creature: "ogre",
		movement: MOVE_ATTACK,
        monsterLevel: 3,
		alive: {
			health: 30,
			strength: 8,
            attack: "slash_big"
		}
	},
	scorpion: {
		creature: "scorpion",
		movement: MOVE_ATTACK,
        monsterLevel: 2,
		alive: {
			health: 20,
			strength: 4,
            attack: "slash"
		}
	},
	scorpion_large: {
		creature: "scorpion_large",
		movement: MOVE_ATTACK,
        monsterLevel: 3,
		alive: {
			health: 30,
			strength: 8,
            attack: "slash_big"
		}
	},
	drake: {
		creature: "drake",
		movement: MOVE_ATTACK,
        monsterLevel: 5,
		alive: {
			health: 200,
			strength: 45,
            attack: "fire"
		}
	},
	drake_blue: {
		creature: "drake_blue",
		movement: MOVE_ATTACK,
        monsterLevel: 6,
		alive: {
			health: 200,
			strength: 45,
            attack: "ice"
		}
	},
	drake_green: {
		creature: "drake_green",
		movement: MOVE_ATTACK,
        monsterLevel: 7,
		alive: {
			health: 200,
			strength: 45,
            attack: "slash"
		}
	},
    skeleton: {
        creature: "skeleton",
        movement: MOVE_ATTACK,
        monsterLevel: 3,
        alive: {
            health: 25,
            strength: 4,
            attackWait: 1500,
            attack: "slash"
        }
    },
    skeleton_blue: {
        creature: "skeleton_blue",
        movement: MOVE_ATTACK,
        monsterLevel: 4,
        alive: {
            health: 10,
            strength: 6,
            attackWait: 1000,
            attack: "ice"
        }
    },
    skeleton_red: {
        creature: "skeleton_red",
        movement: MOVE_ATTACK,
        monsterLevel: 5,
        alive: {
            health: 10,
            strength: 8,
            attackWait: 500,
            attack: "fire"
        }
    },
    wolf: {
        creature: "wolf",
        movement: MOVE_ATTACK,
        monsterLevel: 1,
        alive: {
            health: 12,
            strength: 2,
            attackWait: 1250,
            attack: "slash"
        }
    },
    wolf_blue: {
        creature: "wolf_blue",
        movement: MOVE_ATTACK,
        monsterLevel: 2,
        alive: {
            health: 20,
            strength: 5,
            attackWait: 500,
            attack: "ice"
        }
    },
    wolf_red: {
        creature: "wolf_red",
        movement: MOVE_ATTACK,
        monsterLevel: 3,
        alive: {
            health: 40,
            strength: 8,
            attackWait: 500,
            attack: "fire"
        }
    },
    aligator: {
        creature: "aligator",
        movement: MOVE_ATTACK,
        monsterLevel: 3,
        alive: {
            health: 24,
            strength: 3,
            attackWait: 1250,
            attack: "slash"
        }
    },
    snake: {
        creature: "snake", // fixme, add poison
        movement: MOVE_ATTACK,
        monsterLevel: 1,
        alive: {
            health: 10,
            strength: 1,
            attackWait: 1250,
            attack: "slash"
        }
    },
    demon: {
        creature: "demon",
        movement: MOVE_ATTACK,
        monsterLevel: 6,
        alive: {
            health: 250,
            strength: 50,
            attack: "fire"
        }
    },
}
