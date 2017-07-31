import {MOVE_ANCHOR, MOVE_NEAR_PLAYER} from "./Config"
import * as FARM_CONVO from "../convo/farm"
import * as MEDIAN_CONVO from "../convo/median"
import * as ELDUN_CONVO from "../convo/eldun"
import * as ARCHIVES_CONVO from "../convo/archives"
import * as DRAGONS_CONVO from "../convo/dragons"
import * as VOLN_CONVO from "../convo/voln"
import {MONSTERS} from "./Monsters"

export const WORLD = {
    "1,4": {
        npcs: [
            { creature: "woman_brown", x: 103, y: 464, options: { movement: MOVE_ANCHOR, name: "Farmer Rhee", convo: VOLN_CONVO.RHEE } },
            { creature: "woman_brown", x: 103, y: 411, options: { movement: MOVE_ANCHOR, name: "Vernon", convo: VOLN_CONVO.VERNON } },
            { creature: "woman", x: 147, y: 392, options: { movement: MOVE_ANCHOR, name: "Kat", convo: VOLN_CONVO.KAT } },
            { creature: "woman", x: 134, y: 434, options: { movement: MOVE_ANCHOR, name: "Niso", convo: VOLN_CONVO.NISO } },
            { creature: "cow", x: 150, y: 427, options: { convo: FARM_CONVO.COW } },
            { creature: "cow", x: 133, y: 397, options: { convo: FARM_CONVO.COW } },
            { creature: "man_blue", x: 173, y: 390, options: { movement: MOVE_NEAR_PLAYER, name: "Sgt Travor", convo: VOLN_CONVO.TRAVOR } },
            { creature: "man_yellow", x: 167, y: 398, options: { movement: MOVE_ANCHOR, name: "Prenor", convo: VOLN_CONVO.COMMON } },
            { creature: "woman_brown", x: 150, y: 395, options: { movement: MOVE_ANCHOR, name: "Clanis", convo: VOLN_CONVO.COMMON } },
        ],
        vehicles: [
            { name: "ship", x: 157, y: 464, dir: "se" }
        ]
    },

    "0,4": {
        npcs: [
            { creature: "monk_blue", x: 33, y: 424, options: { movement: MOVE_ANCHOR, name: "The hermit", convo: VOLN_CONVO.HERMIT } }
        ]
    },
    "2,4": {
        npcs: [
            { creature: "man_yellow", x: 227, y: 474, options: { movement: MOVE_ANCHOR, name: "Hiso", convo: VOLN_CONVO.HISO } },
            { creature: "man_blue", x: 234, y: 417, z: 7, options: { movement: MOVE_ANCHOR, name: "Mayor Gratt", convo: VOLN_CONVO.MAYOR } },
            { creature: "man_yellow", x: 203, y: 467, options: { movement: MOVE_ANCHOR, name: "Encat", convo: VOLN_CONVO.ENCAT } },
            { creature: "man_blue", x: 262, y: 400, options: { movement: MOVE_ANCHOR, name: "Eris", convo: VOLN_CONVO.COMMON } },
            { creature: "man_yellow", x: 245, y: 391, options: { movement: MOVE_ANCHOR, name: "Staln", convo: VOLN_CONVO.COMMON } },
            { creature: "woman", x: 203, y: 394, options: { movement: MOVE_ANCHOR, name: "Manitt", convo: VOLN_CONVO.COMMON } },
        ]
    },
    "0,10": {
        npcs: [
            { creature: "drake", x: 78, y: 1036, options: { movement: MOVE_ANCHOR, name: "Aggroxzu", convo: DRAGONS_CONVO.AGGROX } }
        ]
    },
    "1,10": {
        actions: [
            {
                type: "use_object", x: 177, y: 1014, z: 0,
                // eslint-disable-next-line no-unused-vars
                allow: (arkona) => true,
                action: (arkona) => arkona.showOverlay("sign", "Eldun")
            }
        ]
    },
    "2,11": {
        connect: [
            {
                x: 276, y: 1072, z: 0,
                action: (arkona) => arkona.transitionTo(144, 2044, 0, "s")
            }
        ],
        actions: [
            {
                type: "use_object", x: 270, y: 1076, z: 0,
                // eslint-disable-next-line no-unused-vars
                allow: (arkona) => true,
                action: (arkona) => arkona.showOverlay("sign", "Beware of wolves")
            }
        ],
        generators: [
            { x: 233, y: 1102, z: 0, type: MONSTERS.wolf, count: 1 }
        ],
    },
    "1,21": {
        connect: [
            {
                x: 144, y: 2033, z: 0,
                action: (arkona) => arkona.transitionTo(275, 1080, 0, "n")
            }
        ],
        monsters: [
            { monster: MONSTERS.wolf, pos: [ [121, 2082], [123,2098], [138,2091] ] }
        ]
    },
    "1,22": {
        monsters: [
            { monster: MONSTERS.wolf_red, pos: [ [124,2189] ] },
            { monster: MONSTERS.wolf, pos: [ [119,2182], [133,2182], [125,2174], [167,2126], [159,2126] ] }
        ]
    },
    "2,21": {
        monsters: [
            { monster: MONSTERS.wolf_blue, pos: [ [205, 2088], [213, 2092] ] },
            { monster: MONSTERS.wolf, pos: [ [215, 2081], [220, 2087] ] }
        ]
    },
    "2,22": {
    },
    "2,10": {
        npcs: [
            { creature: "man_blue", x: 252, y: 1019, options: { movement: MOVE_ANCHOR, name: "Arton", convo: ELDUN_CONVO.ARTON } },
            { creature: "woman", x: 256, y: 1036, options: { movement: MOVE_ANCHOR, name: "Sara the Healer", convo: ELDUN_CONVO.SARA } },
        ]
    },
    "3,10": {
        npcs: [
            { creature: "monk_red", x: 314, y: 1012, z: 7, options: { movement: MOVE_ANCHOR, name: "Marisan of Eldun", convo: ELDUN_CONVO.MARISAN } },
        ],
        actions: [
            {
                type: "use_object", x: 316, y: 1009, z: 0, allow: (arkona) => arkona.gameState["marisan_key"] == true
            },
            {
                type: "use_object", x: 310, y: 1008, z: 0,
                allow: (arkona) => arkona.gameState["marisan_key"] == true && arkona.gameState["marisan_purple_tome"] != true,
                action: (arkona) => {
                    arkona.gameState["marisan_purple_tome"] = true
                    arkona.narrate("You carefully inspect the books on this shelf. " +
                        "After considering many, you pick a large purple tome with ornately gilded lettering. " +
                        "You can't understand its text but hopefully Marisan can make sense of it.")
                }
            },
            {
                type: "use_object", x: 318, y: 1015, z: 14,
                // eslint-disable-next-line no-unused-vars
                allow: (arkona) => true,
                action: (arkona) => arkona.showOverlay("raighd")
            }
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
            { x: 153, y: 1205, z: 0, type: MONSTERS.wolf, count: 2 }
        ],
    },
    "1,11": {
        generators: [
            { x: 180, y: 1096, z: 0, type: MONSTERS.wolf, count: 1 }
        ],
        actions: [
            {
                type: "use_object", x: 155, y: 1133, z: 0,
                // eslint-disable-next-line no-unused-vars
                allow: (arkona) => true,
                action: (arkona) => arkona.showOverlay("sign", "Median")
            }
       ]
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
        ],
        actions: [
            {
                type: "use_object", x: 77, y: 1089, z: 0,
                // eslint-disable-next-line no-unused-vars
                allow: (arkona) => true,
                action: (arkona) => arkona.showOverlay("sign", arkona.gameState["archives_open"] ? "The Archives" : "The Archives [Closed]")
            }
        ],
        connect: [
            {
                x: 76, y: 1088, z: 0,
                allow: (arkona) => arkona.gameState["archives_open"],
                action: (arkona) => arkona.transitionTo(40, 2021, 0, "s")
            }
        ]
    },
    "0,21": {
        connect: [
            {
                x: 40, y: 2017, z: 0,
                action: (arkona) => arkona.transitionTo(73, 1091, 0, "n")
            }
        ],
        npcs: [
            { creature: "monk", x: 18, y: 2039, options: { movement: MOVE_ANCHOR, name: "Brother Xan", convo: ARCHIVES_CONVO.XAN } },
            { creature: "monk", x: 61, y: 2034, options: { movement: MOVE_ANCHOR, name: "Brother Fran", convo: ARCHIVES_CONVO.FRAN } },
            { creature: "monk", x: 60, y: 2084, options: { movement: MOVE_ANCHOR, name: "Brother Smen", convo: ARCHIVES_CONVO.SMEN } }
        ],
        actions: [
            {
                type: "use_object", x: 32, y: 2077, z: 0,
                // eslint-disable-next-line no-unused-vars
                allow: (arkona) => true,
                action: (arkona) => {
                    if(!arkona.gameState["pazu_cell"]) {
                        arkona.gameState["pazu_cell"] = true
                        arkona.narrate("This room must have belonged to brother Pazu. " +
                            "Crumpled papers are stacked high on a small desk. " +
                            "A lone candelabra stands oddly placed at the center of the room; underneath ashes cover the floor.")
                    }
                }
            },
            {
                type: "use_object", x: 6, y: 2084, z: 0,
                // eslint-disable-next-line no-unused-vars
                allow: (arkona) => true,
                action: (arkona) => {
                    if(arkona.gameState["see_pazus_notes"]) {
                        if(arkona.gameState["green_sky_stone"]) {
                            arkona.narrate("You remember the weird green stone you found on these shelves.")
                        } else {
                            arkona.narrate("You thoroughly search the shelves. " +
                                "Hidden behind a large book you find a strange green stone.")
                            arkona.gameState["green_sky_stone"] = true
                        }
                    } else {
                        arkona.narrate("You look through the books on the shelves but nothing catches your interest.")
                    }
                }
            },
            {
                type: "use_object", x: 11, y: 2071, z: 0,
                // eslint-disable-next-line no-unused-vars
                allow: (arkona) => true,
                action: (arkona) => {
                    if(arkona.gameState["see_pazus_notes"]) {
                        arkona.gameState["urhaw_notes"] = true
                        arkona.narrate("At first glance this chest contains only dirty laundry. " +
                            "However after some delicate rifling, you find some hastily hidden notes." +
                            "'The green sky stone found me, bless the Kada'. " +
                            "'Through it I feel the Raighd speak the Illumis'. " +
                            "'In the tower of Urhaw, pass the stone through the first gates'. " +
                            "'Beware the grey race, fear will raise them from the Raighd'.")
                    } else {
                        arkona.narrate("This chest seems to contain Pazu's laundry.")
                    }
                }
            }
        ]
    },
    "9,2": {
        generators: [
            { x: 917, y: 243, z: 0, type: MONSTERS.scorpion, count: 3 }
        ],
    },
    "7,2": {
        generators: [
            { x: 720, y: 206, z: 0, type: MONSTERS.scorpion, count: 4 }
        ],
    },
    "6,1": {
        generators: [
            { x: 608, y: 130, z: 0, type: MONSTERS.scorpion_large, count: 2 }
        ],
    },
    "7,4": {
        generators: [
            { x: 702, y: 417, z: 0, type: MONSTERS.scorpion, count: 5 }
        ],
    },
    "6,3": {
        generators: [
            { x: 534, y: 344, z: 0, type: MONSTERS.scorpion_large, count: 2 }
        ],
    },
    "0,2": {
        generators: [
            { x: 42, y: 274, z: 0, type: MONSTERS.skeleton, count: 3 }
        ],
        connect: [
            {
                x: 23, y: 252, z: 0,
                action: (arkona) => arkona.transitionTo(336, 2038, 0, "s")
            }
        ]
    },
    "3,21": {
        connect: [
            {
                x: 336, y: 2033, z: 0,
                action: (arkona) => arkona.transitionTo(26, 248, 0, "e")
            }
        ],
        monsters: [
            { monster: MONSTERS.goblin, pos: [ [363,2079], [333,2079], [303,2077] ] }
        ]
    },
    "3,22": {
        monsters: [
            { monster: MONSTERS.goblin, pos: [ [304,2157], [317,2154], [312,2161], [348,2124], [351,2135], [361,2135] ] },
            { monster: MONSTERS.wolf_red, pos: [ [303,2173], [311,2167] ] }
        ]
    },
    "4,22": {
        monsters: [
            { monster: MONSTERS.goblin, pos: [ [428,2171], [428,2159], [418,2180], [423,2152], [453,2137], [453,2130] ] },
            {
                monster: MONSTERS.ogre,
                onDeath: (arkona, npc) => arkona.convoUi.start(npc, VOLN_CONVO.URGIL),
                pos: [ [407,2169,1 ] ]
            }
        ]
    },
    "4,21": {
        monsters: [
            { monster: MONSTERS.goblin, pos: [ [449,2061], [449,2050], [460,2044], [406,2090], [413,2090], [411,2083] ] }
        ]
    },

}
