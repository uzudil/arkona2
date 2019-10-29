import {dirsFrom} from "./Config.js"

export const VEHICLES = {
    ship: {
        src: "assets/creatures/ship.png",
        dim: [128, 128],
        blockName: "8x8x8.placeholder",
        animations: [
            { name: "stand", frameCount: 1, dirs: dirsFrom("ne") },
        ],
        speed: 2.5
    },
}
