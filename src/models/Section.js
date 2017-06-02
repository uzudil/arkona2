import Npc from "./Npc"
import * as Config from "./../config/Config"
import Generator from "./Generator"
import Vehicle from "./Vehicle"
import {WORLD} from "../config/World"

/**
 * The model of a runtime map section: npcs, monsters, generators, etc.
 */
export default class {

    constructor(mapX, mapY, arkona) {
        this.mapX = mapX
        this.mapY = mapY
        this.arkona = arkona
        let key = "" + mapX + "," + mapY

        this.npcs = []
        this.generators = []
        this.vehicles = []

        // todo: load from savegame folder if exists, otherwise fallback to WORLD
        this.info = WORLD[key] || {};
        (this.info["npcs"] || []).forEach(npcInfo => this.addNpc(npcInfo));
        (this.info["monsters"] || []).forEach(monsterInfo => this.addMonster(monsterInfo));
        (this.info["generators"] || []).forEach(generatorInfo => this.addGenerator(generatorInfo));
        (this.info["vehicles"] || []).forEach(info => this.addVehicle(info));
    }

    unload() {
        // todo: save mutated map section

        // remove npcs (this also removes them from their generator)
        this.npcs.forEach(npc => this.removeNpc(npc))
    }

    addNpc(npcInfo) {
        let [x, y, z] = [npcInfo.x, npcInfo.y, npcInfo["z"] || 0]
        let npc = new Npc(this.arkona, x, y, z, npcInfo["options"], npcInfo.creature)
        this.addNpcRef(npc)
        return npc
    }

    // eslint-disable-next-line no-unused-vars
    addMonster(monsterInfo) {
        for(let pos of monsterInfo.pos) {
            let npc = new Npc(this.arkona, pos[0], pos[1], pos[2] || 0, {
                movement: Config.MOVE_ATTACK,
                monster: monsterInfo.monster
            }, monsterInfo.monster.creature)
            this.addNpcRef(npc)
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

    addVehicle(info) {
        this.vehicles.push(new Vehicle(this.arkona, info))
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
        return
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
        let key = "" + mapX + "," + mapY
        return WORLD[key] && WORLD[key]["lamplight"]
    }
}
