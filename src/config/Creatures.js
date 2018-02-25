import {dirsFrom} from "./Config"

export const CREATURES = {
	cow: {
		src: "assets/creatures/cow.png",
		dim: [64, 64],
		blockName: "4x4x4.placeholder",
		animations: [
			{ name: "walk", frameCount: 4, dirs: dirsFrom("s") },
			{ name: "stand", frameCount: 1, dirs: dirsFrom("sw") },
		],
		speed: "slow"
	},
	man: {
		src: "assets/creatures/man.png",
		dim: [64, 64],
		blockName: "2x2x4.placeholder",
		animations: [
			{ name: "walk", frameCount: 4, dirs: dirsFrom("e") },
			{ name: "stand", frameCount: 1, dirs: dirsFrom("se") },
			{ name: "attack", frameCount: 1, dirs: dirsFrom("e") },
		]
	},
	skeleton: {
		src: "assets/creatures/skeleton.png",
		dim: [64, 64],
		blockName: "2x2x4.placeholder",
		animations: [
			{ name: "walk", frameCount: 4, dirs: dirsFrom("e") },
			{ name: "stand", frameCount: 1, dirs: dirsFrom("e") },
			{ name: "attack", frameCount: 4, dirs: dirsFrom("e") },
		]
	},
	skeleton_blue: {
		src: "assets/creatures/skeleton_blue.png",
		dim: [64, 64],
		blockName: "2x2x4.placeholder",
		animations: [
			{ name: "walk", frameCount: 4, dirs: dirsFrom("e") },
			{ name: "stand", frameCount: 1, dirs: dirsFrom("e") },
			{ name: "attack", frameCount: 4, dirs: dirsFrom("e") },
		]
	},
	skeleton_red: {
		src: "assets/creatures/skeleton_red.png",
		dim: [64, 64],
		blockName: "2x2x4.placeholder",
		animations: [
			{ name: "walk", frameCount: 4, dirs: dirsFrom("e") },
			{ name: "stand", frameCount: 1, dirs: dirsFrom("e") },
			{ name: "attack", frameCount: 4, dirs: dirsFrom("e") },
		],
        speed: "fast"
	},
	scorpion: {
		src: "assets/creatures/scorpion.png",
		dim: [64, 64],
		blockName: "4x4x4.placeholder",
		animations: [
			{ name: "walk", frameCount: 4, dirs: dirsFrom("e") },
			{ name: "stand", frameCount: 1, dirs: dirsFrom("e") },
			{ name: "attack", frameCount: 4, dirs: dirsFrom("e") },
		]
	},
	scorpion_large: {
		src: "assets/creatures/scorpion2.png",
		dim: [96, 96],
		blockName: "4x4x4.placeholder",
		animations: [
			{ name: "walk", frameCount: 4, dirs: dirsFrom("e") },
			{ name: "stand", frameCount: 1, dirs: dirsFrom("e") },
			{ name: "attack", frameCount: 4, dirs: dirsFrom("e") },
		]
	},
    drake: {
        src: "assets/creatures/drake.png",
        dim: [128, 128],
        blockName: "8x8x8.placeholder",
        animations: [
            { name: "walk", frameCount: 4, dirs: dirsFrom("e") },
            { name: "stand", frameCount: 1, dirs: dirsFrom("e") },
            { name: "attack", frameCount: 4, dirs: dirsFrom("e") },
        ]
    },
    drake_blue: {
        src: "assets/creatures/drake_blue.png",
        dim: [128, 128],
        blockName: "8x8x8.placeholder",
        animations: [
            { name: "walk", frameCount: 4, dirs: dirsFrom("e") },
            { name: "stand", frameCount: 1, dirs: dirsFrom("e") },
            { name: "attack", frameCount: 4, dirs: dirsFrom("e") },
        ]
    },
    drake_green: {
        src: "assets/creatures/drake_green.png",
        dim: [128, 128],
        blockName: "8x8x8.placeholder",
        animations: [
            { name: "walk", frameCount: 4, dirs: dirsFrom("e") },
            { name: "stand", frameCount: 1, dirs: dirsFrom("e") },
            { name: "attack", frameCount: 4, dirs: dirsFrom("e") },
        ]
    },
	goblin: {
		src: "assets/creatures/goblin.png",
		dim: [64, 64],
		blockName: "2x2x4.placeholder",
		animations: [
			{ name: "walk", frameCount: 4, dirs: dirsFrom("w") },
			{ name: "stand", frameCount: 1, dirs: dirsFrom("w") },
			{ name: "attack", frameCount: 2, dirs: dirsFrom("w") },
		]
	},
	ogre: {
		src: "assets/creatures/ogre.png",
		dim: [96, 96],
		blockName: "4x4x4.placeholder",
		animations: [
			{ name: "walk", frameCount: 4, dirs: dirsFrom("w") },
			{ name: "stand", frameCount: 1, dirs: dirsFrom("w") },
			{ name: "attack", frameCount: 2, dirs: dirsFrom("w") },
		]
	},
	man_blue: {
		src: "assets/creatures/man-blue.png",
		dim: [32, 64],
		blockName: "2x2x4.placeholder",
		animations: [
			{ name: "walk", frameCount: 4, dirs: dirsFrom("e") },
			{ name: "stand", frameCount: 1, dirs: dirsFrom("se") },
		]
	},
	man_yellow: {
		src: "assets/creatures/man-yellow.png",
		dim: [32, 64],
		blockName: "2x2x4.placeholder",
		animations: [
			{ name: "walk", frameCount: 4, dirs: dirsFrom("e") },
			{ name: "stand", frameCount: 1, dirs: dirsFrom("se") },
		]
	},
	monk: {
		src: "assets/creatures/monk.png",
		dim: [32, 64],
		blockName: "2x2x4.placeholder",
		animations: [
			{ name: "walk", frameCount: 4, dirs: dirsFrom("s") },
			{ name: "stand", frameCount: 1, dirs: dirsFrom("s") },
		]
	},
	monk_blue: {
		src: "assets/creatures/monk-blue.png",
		dim: [32, 64],
		blockName: "2x2x4.placeholder",
		animations: [
			{ name: "walk", frameCount: 4, dirs: dirsFrom("s") },
			{ name: "stand", frameCount: 1, dirs: dirsFrom("s") },
		]
	},
	monk_red: {
		src: "assets/creatures/monk-red.png",
		dim: [32, 64],
		blockName: "2x2x4.placeholder",
		animations: [
			{ name: "walk", frameCount: 4, dirs: dirsFrom("s") },
			{ name: "stand", frameCount: 1, dirs: dirsFrom("s") },
		]
	},
	woman: {
		src: "assets/creatures/woman.png",
		dim: [32, 64],
		blockName: "2x2x4.placeholder",
		animations: [
			{ name: "walk", frameCount: 4, dirs: dirsFrom("e") },
			{ name: "stand", frameCount: 1, dirs: dirsFrom("se") },
		]
	},
	woman_brown: {
		src: "assets/creatures/woman.brown.png",
		dim: [32, 64],
		blockName: "2x2x4.placeholder",
		animations: [
			{ name: "walk", frameCount: 4, dirs: dirsFrom("e") },
			{ name: "stand", frameCount: 1, dirs: dirsFrom("se") },
		]
	},
    wolf: {
        src: "assets/creatures/wolf.png",
        dim: [64, 64],
        blockName: "2x2x4.placeholder",
        animations: [
            { name: "walk", frameCount: 4, dirs: dirsFrom("e") },
            { name: "stand", frameCount: 1, dirs: dirsFrom("e") },
            { name: "attack", frameCount: 2, dirs: dirsFrom("e") },
        ],
        speed: "fast"
    },
    wolf_blue: {
        src: "assets/creatures/wolf_blue.png",
        dim: [64, 64],
        blockName: "2x2x4.placeholder",
        animations: [
            { name: "walk", frameCount: 4, dirs: dirsFrom("e") },
            { name: "stand", frameCount: 1, dirs: dirsFrom("e") },
            { name: "attack", frameCount: 2, dirs: dirsFrom("e") },
        ],
        speed: "fast"
    },
    wolf_red: {
        src: "assets/creatures/wolf_red.png",
        dim: [64, 64],
        blockName: "2x2x4.placeholder",
        animations: [
            { name: "walk", frameCount: 4, dirs: dirsFrom("e") },
            { name: "stand", frameCount: 1, dirs: dirsFrom("e") },
            { name: "attack", frameCount: 2, dirs: dirsFrom("e") },
        ],
        speed: "fast"
    },
    aligator: {
        src: "assets/creatures/lizard.png",
        dim: [96, 96],
        blockName: "4x4x4.placeholder",
        animations: [
            { name: "walk", frameCount: 4, dirs: dirsFrom("e") },
            { name: "stand", frameCount: 1, dirs: dirsFrom("e") },
            { name: "attack", frameCount: 2, dirs: dirsFrom("e") },
        ],
    },
    snake: {
        src: "assets/creatures/snake.png",
        dim: [64, 64],
        blockName: "2x2x4.placeholder",
        animations: [
            { name: "walk", frameCount: 4, dirs: dirsFrom("e") },
            { name: "stand", frameCount: 1, dirs: dirsFrom("e") },
            { name: "attack", frameCount: 2, dirs: dirsFrom("e") },
        ]
    },
    guard: {
        src: "assets/creatures/guard.png",
        dim: [64, 64],
        blockName: "2x2x4.placeholder",
        animations: [
            { name: "walk", frameCount: 4, dirs: dirsFrom("e") },
            { name: "stand", frameCount: 1, dirs: dirsFrom("e") }
        ]
    },
    demon: {
        src: "assets/creatures/demon.png",
        dim: [96, 96],
        blockName: "4x4x4.placeholder",
        animations: [
            { name: "walk", frameCount: 4, dirs: dirsFrom("e") },
            { name: "stand", frameCount: 1, dirs: dirsFrom("e") },
            { name: "attack", frameCount: 2, dirs: dirsFrom("e") },
        ]
    },
}
