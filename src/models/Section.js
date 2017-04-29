import Npc from "./Npc"
// import * as Levels from "./../config/Levels"
// import * as Config from "./../config/Config"
import Generator from "./Generator"
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

        // todo: load from savegame folder if exists, otherwise fallback to WORLD
        this.info = WORLD[key] || {};
        (this.info["npcs"] || []).forEach(npcInfo => this.addNpc(npcInfo));
        (this.info["monsters"] || []).forEach(monsterInfo => this.addMonster(monsterInfo));
        (this.info["generators"] || []).forEach(generatorInfo => this.addGenerator(generatorInfo));
    }

    unload() {
        // todo: save mutated map section
    }

    addNpc(npcInfo) {
        let [x, y, z] = [npcInfo.x, npcInfo.y, npcInfo["z"] || 0]
        let npc = new Npc(this.arkona, x, y, z, npcInfo["options"], npcInfo.creature)
        this.npcs.push(npc)
        return npc
    }

    // eslint-disable-next-line no-unused-vars
    addMonster(monsterInfo) {
        // for(let pos of monsterInfo.pos) {
            // let npc = new Npc(this.arkona, pos[0], pos[1], pos[2] || 0, {
            // 	movement: Config.MOVE_ATTACK,
            // 	monster: monsterInfo.monster
            // }, monsterInfo.monster.creature)
        // 	this.npcs.push(npc)
        // }
    }

    addGenerator(generatorInfo) {
        this.generators.push(new Generator(this.arkona, generatorInfo))
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
            npc.generator.remove(npc)
        }
        this.arkona.blocks.remove(npc.animatedSprite.sprite)
        let idx = this.npcs.indexOf(npc)
        this.npcs.splice(idx, 1)
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
            if (c.src["x"] == x && c.src["y"] == y && c.src["z"] == z) {
                if(c["test"] && !c.test(this.arkona)) {
                    // todo: play 'denined' sound
                    return
                }
                return c.dst
            }
        }
        return null
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
}
