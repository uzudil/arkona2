import {MOVE_ANCHOR} from "./Config"
import * as FARM_CONVO from "../convo/farm"
import * as MEDIAN_CONVO from "../convo/median"
import * as ELDUN_CONVO from "../convo/eldun"
import {MONSTERS} from "./Monsters"

export const WORLD = {
    "2,10": {
        npcs: [
            { creature: "man_blue", x: 252, y: 1019, options: { movement: MOVE_ANCHOR, name: "Arton", convo: ELDUN_CONVO.ARTON } },
            { creature: "woman", x: 256, y: 1036, options: { movement: MOVE_ANCHOR, name: "Sara", convo: ELDUN_CONVO.SARA } },
        ]
    },
    "3,10": {
        npcs: [
            { creature: "monk_red", x: 309, y: 1007, z: 7, options: { movement: MOVE_ANCHOR, name: "Marisan of Eldun", convo: ELDUN_CONVO.MARISAN } },
        ]
    },
    "2,12": {
        npcs: [
            {
                creature: "woman_brown",
                x: 239, y: 1166,
                options: {
                    movement: MOVE_ANCHOR,
                    name: "Sharya",
                    convo: FARM_CONVO.SHARYA
                },
            },
            { creature: "cow", x: 258, y: 1159, options: { convo: FARM_CONVO.COW } }
        ]
    },
    "3,12": {
        // eslint-disable-next-line no-unused-vars
        onLoad: function(arkona, section) {
            if(!arkona.gameState["intro_seen"]) {
                arkona.gameState["intro_seen"] = true
                arkona.narrate("You have crash landed on a strange planet and your ship is damaged. " +
                    "How will you get back home? " +
                    "Perhaps you should ask someone for help?")
            }
        }
    },
    "1,9": {
        vehicles: [
            { name: "ship", x: 139, y: 892, dir: "se" }
        ]
    },
    "1,12": {
        generators: [
            { x: 153, y: 1205, z: 0, type: MONSTERS.goblin, count: 3 }
        ],
    },
    "1,11": {
        generators: [
            { x: 180, y: 1096, z: 0, type: MONSTERS.goblin, count: 3 }
        ],
    },
    "0,12": {
        npcs: [
            { creature: "monk", x: 72, y: 1177, options: { movement: MOVE_ANCHOR, name: "Brother Aradun", convo: MEDIAN_CONVO.ARADUN } },
        ],
        // eslint-disable-next-line no-unused-vars
        onLoad: function(arkona, section) {
            if(!arkona.gameState["median_visited"]) {
                arkona.gameState["median_visited"] = true
                arkona.narrate("In the distance you see crumbling stone huts surrounded by a few fruit trees and a small vegetable garden. " +
                    "A robed figure in black paces back and forth in the court yard, his face lined with worry.")
            }
        }
    },
    "0,11": {
        onLoad: function(arkona, section) {
            if(arkona.gameState["archives_open"]) {
                section.removeNpcByName("Brother Xan")
                section.removeNpcByName("Brother Fran")
                section.removeNpcByName("Brother Smen")
            }
        },
        npcs: [
            { creature: "monk", x: 46, y: 1100, options: { movement: MOVE_ANCHOR, name: "Brother Xan", convo: MEDIAN_CONVO.XAN } },
            { creature: "monk", x: 64, y: 1096, options: { movement: MOVE_ANCHOR, name: "Brother Fran", convo: MEDIAN_CONVO.FRAN } },
            { creature: "monk", x: 71, y: 1115, options: { movement: MOVE_ANCHOR, name: "Brother Smen", convo: MEDIAN_CONVO.SMEN } },
        ]
    }
}
