import {MOVE_ANCHOR, MOVE_NEAR_PLAYER} from "./Config"
import * as FARM_CONVO from "../convo/farm"
import * as MEDIAN_CONVO from "../convo/median"
import * as ELDUN_CONVO from "../convo/eldun"
import * as ARCHIVES_CONVO from "../convo/archives"
import * as DRAGONS_CONVO from "../convo/dragons"
import * as VOLN_CONVO from "../convo/voln"
import * as MISC_CONVO from "../convo/misc"
import * as VARHOLM from "../convo/varholm"
import * as HAAGA from "../convo/haaga"
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
        ],
        generators: [
            { x: 152, y: 1031, z: 0, type: MONSTERS.wolf, count: 3 }
        ]
    },
    "5,21": {
        connect: [
            {
                x: 536, y: 2045, z: 0,
                action: (arkona) => arkona.transitionTo(118, 1605, 0, "n")
            }
        ],
        monsters: [
            { monster: MONSTERS.snake, pos: [ [495, 2040], [496, 2092], [512, 2075], [556, 2032] ] }
        ]
    },
    "6,21": {
        monsters: [
            { monster: MONSTERS.snake, pos: [ [627, 2067], [636, 2030] ] }
        ]
    },
    "6,22": {
        connect: [
            {
                x: 588, y: 2125, z: 0,
                action: (arkona) => arkona.transitionTo(791, 2085, 0, "n")
            }
        ],
        monsters: [
            { monster: MONSTERS.scorpion, pos: [ [644, 2135], [646, 2125], [629, 2160], [627, 2168] ] },
            { monster: MONSTERS.ogre, pos: [ [583, 2135], [584, 2143] ] },
        ]
    },
    "8,21": {
        connect: [
            {
                x: 791, y: 2080, z: 0,
                action: (arkona) => arkona.transitionTo(588, 2130, 0, "s")
            },
            {
                x: 780, y: 2044, z: 0,
                action: (arkona) => arkona.transitionTo(210, 1564, 0, "e")
            }
        ],
        npcs: [
            { creature: "monk_red", x: 845, y: 2074, options: { movement: MOVE_ANCHOR, name: "Varholm Acolyte", convo: VARHOLM.ACOLYTE } },
            { creature: "monk_red", x: 801, y: 2062, options: { movement: MOVE_ANCHOR, name: "Varholm Acolyte", convo: VARHOLM.ACOLYTE } },
            { creature: "monk_red", x: 820, y: 2042, options: { movement: MOVE_ANCHOR, name: "Varholm Acolyte", convo: VARHOLM.ACOLYTE } }
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
        ],
        generators: [
            { x: 375, y: 1048, z: 0, type: MONSTERS.wolf, count: 3 }
        ]
    },
    "2,12": {
        npcs: [
            { creature: "woman_brown", x: 239, y: 1166, options: { movement: MOVE_ANCHOR, name: "Sharya", convo: FARM_CONVO.SHARYA } },
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
    "1,8": {
        // eslint-disable-next-line no-unused-vars
        npcs: [
            { creature: "man_yellow", x: 113, y: 781, options: {movement: MOVE_ANCHOR, name: "Arindol", convo: MISC_CONVO.ARINDOL} }
        ]
    },
    "1,9": {
        vehicles: [
            { name: "ship", x: 139, y: 892, dir: "se" }
        ],
        generators: [
            { x: 169, y: 942, z: 0, type: MONSTERS.wolf, count: 3 },
            { x: 164, y: 907, z: 0, type: MONSTERS.wolf, count: 3 }
        ]
    },
    "2,9": {
        generators: [
            { x: 237, y: 906, z: 0, type: MONSTERS.wolf, count: 3 },
            { x: 244, y: 942, z: 0, type: MONSTERS.wolf, count: 3 }
        ]
    },
    "3,9": {
        generators: [
            { x: 314, y: 921, z: 0, type: MONSTERS.wolf, count: 3 },
            { x: 348, y: 924, z: 0, type: MONSTERS.wolf, count: 3 }
        ]
    },
    "3,11": {
        generators: [
            { x: 330, y: 1069, z: 0, type: MONSTERS.wolf, count: 3 },
            { x: 364, y: 1110, z: 0, type: MONSTERS.wolf, count: 3 }
        ]
    },
    "1,12": {
        generators: [
            { x: 153, y: 1205, z: 0, type: MONSTERS.wolf, count: 2 }
        ]
    },
    "1,11": {
        generators: [
            { x: 180, y: 1096, z: 0, type: MONSTERS.wolf, count: 1 },
            { x: 155, y: 1090, z: 0, type: MONSTERS.wolf, count: 3 },
            { x: 177, y: 1094, z: 0, type: MONSTERS.wolf, count: 3 }
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
            if(!arkona.gameState["median_visited"] && arkona.player.ship == null) {
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

    // varholm
    "0,16": {
        generators: [
            { x: 80, y: 1587, z: 0, type: MONSTERS.aligator, count: 1 },
        ]
    },
    "0,17": {
        generators: [
            { x: 80, y: 1666, z: 0, type: MONSTERS.aligator, count: 1 },
        ]
    },
    "1,16": {
        connect: [
            {
                x: 116, y: 1600, z: 0,
                action: (arkona) => arkona.transitionTo(534, 2050, 0, "s")
            }
        ],
        generators: [
            { x: 143, y: 1556, z: 0, type: MONSTERS.snake, count: 3 },
        ]
    },
    // varholm castle
    "2,16": {
        connect: [
            {
                x: 205, y: 1566, z: 0,
                action: (arkona) => arkona.transitionTo(785, 2042, 0, "e")
            }
        ],
        actions: [
            {
                type: "use_object", x: 276, y: 1575, z: 0,
                // eslint-disable-next-line no-unused-vars
                allow: (arkona) => true,
                action: (arkona) => arkona.showOverlay("sign", "Varholm Castle")
            },
            {
                type: "use_object", x: 261, y: 1581, z: 0, allow: (arkona) => arkona.gameState["mezalka_dead"] == true
            },
            {
                type: "use_object", x: 261, y: 1578, z: 0, allow: (arkona) => arkona.gameState["mezalka_dead"] == true
            },
        ],
        npcs: [
            { creature: "guard", x: 202, y: 1574, z: 7, options: { movement: MOVE_ANCHOR, name: "Guard", convo: VARHOLM.GUARD } },
            { creature: "guard", x: 230, y: 1550, z: 7, options: { movement: MOVE_ANCHOR, name: "Guard", convo: VARHOLM.GUARD } },
            { creature: "guard", x: 230, y: 1606, z: 7, options: { movement: MOVE_ANCHOR, name: "Guard", convo: VARHOLM.GUARD } },
            { creature: "guard", x: 258, y: 1578, z: 7, options: { movement: MOVE_ANCHOR, name: "Guard", convo: VARHOLM.GUARD } },
            { creature: "guard", x: 244, y: 1573, options: { movement: MOVE_ANCHOR, name: "Guard", convo: VARHOLM.GUARD } },
            { creature: "guard", x: 228, y: 1592, options: { movement: MOVE_ANCHOR, name: "Guard", convo: VARHOLM.GUARD } },
            { creature: "guard", x: 229, y: 1557, options: { movement: MOVE_ANCHOR, name: "Guard", convo: VARHOLM.GUARD } },

            { creature: "man_blue", x: 238, y: 1575, z: 7, options: { movement: MOVE_ANCHOR, name: "Noble Aghan", convo: VARHOLM.NOBLE } },
            { creature: "man_yellow", x: 262, y: 1610, z: 7, options: { movement: MOVE_ANCHOR, name: "Noble Venin", convo: VARHOLM.NOBLE } },
            { creature: "woman", x: 201, y: 1610, z: 7, options: { movement: MOVE_ANCHOR, name: "Noble Mal", convo: VARHOLM.NOBLE } },
            { creature: "man_yellow", x: 253, y: 1558, z: 7, options: { movement: MOVE_ANCHOR, name: "Noble Ignar", convo: VARHOLM.NOBLE } },
            { creature: "man_blue", x: 210, y: 1558, z: 7, options: { movement: MOVE_ANCHOR, name: "Advisor Oren", convo: VARHOLM.OREN } },

            { creature: "man_yellow", x: 230, y: 1577, options: { movement: MOVE_ANCHOR, name: "Noble Anam", convo: VARHOLM.NOBLE } },
            { creature: "woman", x: 221, y: 1577, options: { movement: MOVE_ANCHOR, name: "Noble Ayrth", convo: VARHOLM.NOBLE } },
            { creature: "woman_brown", x: 213, y: 1577, options: { movement: MOVE_ANCHOR, name: "Noble Extal", convo: VARHOLM.NOBLE } },

            { creature: "man_yellow", x: 209, y: 1575, z: 2, options: { movement: MOVE_ANCHOR, name: "Chief Mezalka", convo: VARHOLM.KING } },
        ],
        onLoad: function(arkona, section) {
            if(arkona.gameState["mezalka_dead"] && !arkona.sessionState["mezalka_corpse"]) {
                section.removeNpcByName("Chief Mezalka")
                arkona.blocks.set("corpse", 215, 1580, 0)
                arkona.blocks.set("blood.small", 218, 1578, 0)
                arkona.blocks.set("blood.small", 220, 1582, 0)
                arkona.blocks.set("blood.small", 217, 1576, 0)
                arkona.sessionState["mezalka_corpse"] = true
            }
        },
    },
    "1,17": {
        generators: [
            { x: 131, y: 1662, z: 0, type: MONSTERS.aligator, count: 1 },
            { x: 168, y: 1691, z: 0, type: MONSTERS.snake, count: 3 },
            { x: 173, y: 1649, z: 0, type: MONSTERS.aligator, count: 2 },
        ]
    },
    "2,17": {
        npcs: [
            { creature: "woman_brown", x: 255, y: 1668, options: { movement: MOVE_ANCHOR, name: "Wilda the Woodcutter", convo: VARHOLM.WOODCUTTER } },
        ]
    },
    "3,17": {
        npcs: [
            { creature: "woman_brown", x: 349, y: 1699, options: { movement: MOVE_ANCHOR, name: "Villager", convo: VARHOLM.COMMON } },
            { creature: "man_yellow", x: 358, y: 1699, options: { movement: MOVE_ANCHOR, name: "Villager", convo: VARHOLM.COMMON } },
            { creature: "woman", x: 349, y: 1689, options: { movement: MOVE_ANCHOR, name: "Bartender", convo: VARHOLM.COMMON } },
            { creature: "man_blue", x: 323, y: 1698, options: { movement: MOVE_ANCHOR, name: "Host", convo: VARHOLM.COMMON } },
            { creature: "man_blue", x: 316, y: 1719, options: { movement: MOVE_ANCHOR, name: "Guest", convo: VARHOLM.COMMON } },
            { creature: "man_yellow", x: 314, y: 1708, options: { movement: MOVE_ANCHOR, name: "Guest", convo: VARHOLM.COMMON } },
            { creature: "man_blue", x: 316, y: 1668, options: { movement: MOVE_ANCHOR, name: "Farmer", convo: VARHOLM.COMMON } },
            { creature: "cow", x: 313, y: 1644, options: { convo: FARM_CONVO.COW } },
            { creature: "cow", x: 300, y: 1646, options: { convo: FARM_CONVO.COW } },
        ]
    },
    "3,18": {
        npcs: [
            { creature: "woman_brown", x: 325, y: 1742, options: { movement: MOVE_ANCHOR, name: "Villager", convo: VARHOLM.COMMON } },
            { creature: "man_blue", x: 347, y: 1745, options: { movement: MOVE_ANCHOR, name: "Villager", convo: VARHOLM.COMMON } },
        ]
    },
    "4,16": {
        npcs: [
            { creature: "man_blue", x: 403, y: 1621, options: { movement: MOVE_ANCHOR, name: "Farmer", convo: VARHOLM.COMMON } },
        ]
    },
    "4,17": {
        actions: [
            {
                type: "use_object", x: 443, y: 1675, z: 0,
                // eslint-disable-next-line no-unused-vars
                allow: (arkona) => true,
                action: (arkona) => arkona.showOverlay("sign", "Varholm")
            }
        ]
    },
    "3,15": {
        npcs: [
            { creature: "monk_red", x: 314, y: 1492, options: { movement: MOVE_ANCHOR, name: "Marten the Hermit", convo: VARHOLM.HERMIT } },
        ]
    },
    "3,16": {
        npcs: [
            { creature: "woman", x: 355, y: 1611, options: { movement: MOVE_ANCHOR, name: "Farmer's wife", convo: VARHOLM.COMMON } },
            { creature: "man_yellow", x: 319, y: 1598, options: { movement: MOVE_ANCHOR, name: "Zoo keeper", convo: VARHOLM.COMMON } },
            { creature: "wolf_blue", x: 307, y: 1595, options: { convo: FARM_CONVO.COW } },
            { creature: "wolf_red", x: 297, y: 1603, options: { convo: FARM_CONVO.COW } },
        ]
    },
    "9,21": {
        npcs: [
            { creature: "monk", x: 903, y: 2050, options: { movement: MOVE_ANCHOR, name: "Grandmaster Zaren", convo: VARHOLM.ZAREN } },
            { creature: "monk_red", x: 914, y: 2050, options: { movement: MOVE_ANCHOR, name: "Acolyte Mohk", convo: VARHOLM.ACOLYTE_RITUAL } },
            { creature: "monk_red", x: 917, y: 2061, options: { movement: MOVE_ANCHOR, name: "Acolyte Hanem", convo: VARHOLM.ACOLYTE_RITUAL } },
        ],
        actions: [
            {
                type: "use_object", x: 882, y: 2042, z: 0, allow: (arkona) => arkona.gameState["ritual_gate_open"] == true && !arkona.gameState["ritual_demon_lives"]
            }
        ],
    },


    // Haaga, desert town
    "9,0": {
        npcs: [
            { creature: "man_yellow", x: 907, y: 75, options: { movement: MOVE_ANCHOR, name: "Mayor Reva", convo: HAAGA.MAYOR } }
        ],
        actions: [
            {
                type: "use_object", x: 934, y: 61, z: 0,
                // eslint-disable-next-line no-unused-vars
                allow: (arkona) => true,
                action: (arkona) => arkona.showOverlay("sign", "Haaga")
            }
        ]
    },
    "9,1": {
        npcs: [
            { creature: "man_blue", x: 882, y: 123, options: { movement: MOVE_ANCHOR, name: "Commoner", convo: HAAGA.COMMON } },
            { creature: "woman_brown", x: 894, y: 141, options: { movement: MOVE_ANCHOR, name: "Bartender", convo: HAAGA.COMMON } },
            { creature: "woman", x: 890, y: 147, options: { movement: MOVE_ANCHOR, name: "Patron", convo: HAAGA.COMMON } },
            { creature: "woman", x: 930, y: 142, options: { movement: MOVE_ANCHOR, name: "Seer", convo: HAAGA.COMMON } },
            { creature: "man_yellow", x: 936, y: 111, options: { movement: MOVE_ANCHOR, name: "Commoner", convo: HAAGA.COMMON } },
            { creature: "man_blue", x: 916, y: 126, options: { movement: MOVE_ANCHOR, name: "Trader", convo: HAAGA.COMMON } },
            { creature: "woman_brown", x: 930, y: 162, options: { movement: MOVE_ANCHOR, name: "Commoner", convo: HAAGA.COMMON } },
            { creature: "man_blue", x: 888, y: 164, options: { movement: MOVE_ANCHOR, name: "Commoner", convo: HAAGA.COMMON } },
            { creature: "cow", x: 920, y: 78, options: { convo: FARM_CONVO.COW } },
        ],
        actions: [
            {
                type: "use_object", x: 874, y: 136, z: 0,
                // eslint-disable-next-line no-unused-vars
                allow: (arkona) => true,
                action: (arkona) => arkona.showOverlay("sign", "Haaga")
            }
        ]
    },

    "6,3": {
        generators: [
            { x: 534, y: 344, z: 0, type: MONSTERS.scorpion_large, count: 2 }
        ],
        actions: [
            {
                type: "use_object", x: 616, y: 369, z: 0, allow: (arkona) => arkona.gameState["desert_shrine_key"] == true
            }
        ],
    },
    "6,4": {
        connect: [
            {
                x: 589, y: 410, z: 0,
                action: (arkona) => arkona.transitionTo(620, 2225, 0, "s")
            }
        ],
    },
    "6,23": {
        connect: [
            {
                x: 620, y: 2221, z: 0,
                action: (arkona) => arkona.transitionTo(592, 408, 0, "e")
            }
        ],
    },

}
