import Npc from "./Npc"
import * as Config from "./../config/Config"
import Generator from "./Generator"
import Vehicle from "./Vehicle"
import {WORLD} from "../config/World"
import {mapName} from "../utils"

/**
 * The model of a runtime map section: npcs, monsters, generators, etc.
 */
export default class {

    constructor(mapX, mapY, arkona) {
        this.mapX = mapX
        this.mapY = mapY
        this.arkona = arkona

        this.npcs = []
        this.generators = []
        this.vehicles = []

        this.load()
    }

    load() {
        this.arkona.loadSection(mapName(this.mapX, this.mapY) + ".json", (data) => {
            this.info = WORLD["" + this.mapX + "," + this.mapY] || {};
            (this.info["npcs"] || []).forEach(npcInfo => this.addNpc(npcInfo, data ? data.npcs : null));
            (this.info["monsters"] || []).forEach(monsterInfo => this.addMonster(monsterInfo, data ? data.npcs : null));
            (this.info["generators"] || []).forEach(generatorInfo => this.addGenerator(generatorInfo));
            (this.info["vehicles"] || []).forEach(info => this.addVehicle(info, data ? data.vehicles : null));
        })
    }

    save(tempSave) {
        this.arkona.saveSection(mapName(this.mapX, this.mapY) + ".json", tempSave, {
            version: 1,
            npcs: this.npcs.filter(npc => npc["generator"] == null).reduce((acc, npc) => {
                acc[npc.id] = {
                    x: npc.animatedSprite.sprite.gamePos[0],
                    y: npc.animatedSprite.sprite.gamePos[1],
                    z: npc.animatedSprite.sprite.gamePos[2],
                    alive: npc.alive.getStats()
                }
                return acc
            }, {}),
            vehicles: this.vehicles.reduce((acc, vehicle) => {
                acc[vehicle.id] = {
                    x: vehicle.animatedSprite.sprite.gamePos[0],
                    y: vehicle.animatedSprite.sprite.gamePos[1],
                    z: vehicle.animatedSprite.sprite.gamePos[2]
                }
                return acc
            }, {}),
            doors: {
                // locked? open?
            }
        })
    }

    unload() {
        // save mutated map section in tmp
        this.save(true)

        // remove npcs (this also removes them from their generator)
        this.npcs.forEach(npc => this.removeNpc(npc))
    }

    addNpc(npcInfo, savedNpcs) {
        let [x, y, z] = [npcInfo.x, npcInfo.y, npcInfo["z"] || 0]
        let id = "" + x + "," + y + "," + z

        // is the creature killed or in another section?
        if(savedNpcs && !savedNpcs[id]) {
            return null
        }

        if(savedNpcs) {
            x = savedNpcs[id].x
            y = savedNpcs[id].y
            z = savedNpcs[id].z
        }

        if(id == "72,1177,0") {
            console.log("Adding Aradun at " + x + "," + y + " saved=", savedNpcs)
            console.trace()
        }

        let npc = new Npc(this.arkona, x, y, z, npcInfo["options"], npcInfo.creature)

        // update stats
        if(savedNpcs) {
            npc.alive.setStats(savedNpcs[id].alive)
        }

        this.addNpcRef(npc)

        return npc
    }

    addMonster(monsterInfo, savedNpcs) {
        for(let pos of monsterInfo.pos) {
            this.addNpc({
                x: pos[0],
                y: pos[1],
                z: pos[2] || 0,
                creature: monsterInfo.monster.creature,
                options: {
                    movement: Config.MOVE_ATTACK,
                    monster: monsterInfo.monster
                }
            }, savedNpcs)
        }
    }

    addGenerator(generatorInfo) {
        this.generators.push(new Generator(this.arkona, generatorInfo))
    }

    getGeneratorAt(x, y) {
        for(let g of this.generators) {
            if(g.info.x == x && g.info.y == y) return g
        }
        return null
    }

    addVehicle(info, savedVehicles) {
        let x = info.x
        let y = info.y
        let z = info.z || 0
        let id = "" + x + "," + y + "," + z

        // killed or moved to another section
        if(savedVehicles && !savedVehicles[id]) {
            return
        }

        if(savedVehicles) {
            info.x = savedVehicles[id].x
            info.y = savedVehicles[id].y
            info.z = savedVehicles[id].z
        }

        let vehicle = new Vehicle(this.arkona, info)
        this.vehicles.push(vehicle)
    }

    removeNpcByName(name) {
        for(let npc of this.npcs) {
            if(npc.getName() == name) {
                this.removeNpc(npc)
                return
            }
        }
    }

    turnHostileByName(names) {
        for(let npc of this.npcs) {
            if(names.indexOf(npc.getName()) > -1) {
                // do something...
            }
        }
    }

    removeNpc(npc) {
        if(npc["generator"]) {
            // find the generator where this creature came from
            let section = this.arkona.sectionAt(...npc["generator"])
            if(section) {
                let generator = section.getGeneratorAt(...npc["generator"])
                if(generator) {
                    generator.remove()
                }
            }
        }
        this.arkona.blocks.remove(npc.animatedSprite.sprite)
        this.removeNpcRef(npc)
    }

    removeNpcRef(npc) {
        let idx = this.npcs.indexOf(npc)
        this.npcs.splice(idx, 1)
    }

    addNpcRef(npc) {
        this.npcs.push(npc)
    }

    checkBounds(px, py) {
        for(let conn of this.info.connect || []) {
            let found = false
            if(conn.src.dir == "w" && px <= -4) {
                found = true
            } else if(conn.src.dir == "e" && px >= this.arkona.blocks.w - 4) {
                found = true
            } else if(conn.src.dir == "n" && py <= -4) {
                found = true
            } else if(conn.src.dir == "s" && py >= this.arkona.blocks.h - 4) {
                found = true
            }
            if(found) {
                if(conn["test"] && !conn.test(this.arkona)) {
                    // todo: play 'denined' sound
                    return
                }
                return conn.dst
            }
        }
        return null
    }

    onLoad() {
        if (this.info["onLoad"]) {
            this.info.onLoad(this.arkona, this)
        }
    }

    checkPosition(x, y, z) {
        for(let c of this.info.connect || []) {
            if (c.x == x && c.y == y && c.z == z) {
                if(c["allow"] && !c.allow(this.arkona)) {
                    // todo: play 'denined' sound
                    return
                }
                c.action(this.arkona)
            }
        }
    }

    isAllowed(action) {
        if(this.info["actions"] && action.getPos()) {
            let actionAllowed = this._getAction(action.getPos(), action.getType())
            if(actionAllowed) return actionAllowed.allow(this.arkona)
        }
        return true
    }

    getAction(pos, action) {
        if(this.info["actions"]) {
            let actionInfo = this._getAction(pos, action.getType())
            if(actionInfo && actionInfo["action"]) return actionInfo
        }
        return null
    }

    _getAction(pos, type) {
        return this.info.actions.find(o => o.type == type && o.x == pos[0] && o.y == pos[1] && o.z == pos[2])
    }

    static isLamplight(mapX, mapY) {
        return mapX >= Config.MAX_MAP_X || mapY >= Config.MAX_MAP_Y
    }
}
