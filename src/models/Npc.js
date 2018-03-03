import * as Config from "./../config/Config"
import { dist3d } from "../utils"
import * as Creatures from "../config/Creatures"
import AnimatedSprite from "../world/Animation"
import Alive from "./Alive"
import Pathable from "./Pathable"
import { distSprites } from "../world/Block"
import {getLogger} from "../config/Logger"

const SPEEDS = {
    "slow": 0.01,
    "normal": 0.05,
    "fast": 0.1
}

export default class extends Pathable {

    constructor(arkona, x, y, z, options, creatureName) {
        super(arkona)

        this.options = options || {}
        this.id = this.options["id"] || ("" + x + "," + y + "," + z)
        this.x = x
        this.y = y
        this.z = z
        this.anchorX = x
        this.anchorY = y
        this.anchorZ = z
        this.dir = options["dir"] || Config.DIR_N
        this.stopClock = null
        this.moveClock = Date.now() + Config.MOVE_TIME
        this.creatureName = creatureName
        this.info = Creatures.CREATURES[creatureName]
        this.animatedSprite = new AnimatedSprite(arkona.game, creatureName, arkona.blocks, x, y, z, this.info.animations, this.info.blockName)
        this.animatedSprite.sprite.npc = this
        this.alive = new Alive(this.getMonster() ? this.getMonster()["alive"] : {}, this)
        this.target = null
        this.lastTargetFind = 0
    }

    moveTo(x, y, z) {
        this.animatedSprite.moveTo(x, y, z)
        this.x = x
        this.y = y
        this.z = z
    }

    isVisible() {
        return this.animatedSprite.sprite.visible
    }

    onDamage(amount, type) {
        this.arkona.fx.run("damages", this.animatedSprite.sprite, { amount: amount, isPlayerDamage: false })
        if(type) this.arkona.fx.run(type, this.animatedSprite.sprite, { amount: amount })
    }

    onDefense(amount, type) {
        if(type) this.arkona.fx.run(type, this.animatedSprite.sprite, { amount: amount })
    }

    onDeath(fromDelay) {
        if(!fromDelay) {
            getLogger("NPC").warn(this.getName() + " dies.")
            if(this.getMonster()) {
                this.arkona.player.incKillCount(this.getMonster()["monsterLevel"] || 1)
            }
            // onDeath shows the creature until a ui is closed
            if (this.options["monsterInfo"] && this.options.monsterInfo.onDeath) {
                this.arkona.delayedDeathNpcs.push(this)
                this.options.monsterInfo.onDeath(this.arkona, this)
                return
            }
            // afterDeath removes the creature immediately
            if (this.options["monsterInfo"] && this.options.monsterInfo.afterDeath) {
                this.options.monsterInfo.afterDeath(this.arkona, this)
            }
        }
        let section = this.arkona.sectionAt(this.x|0, this.y|0)
        if(section) section.removeNpc(this)
        else throw "Can't remove creature from section at " + this.x + "," + this.y
    }

    move() {
        // precalculate some stuff
        this.distToPlayer = this.arkona.getDistanceToPlayer(this.x, this.y, this.z)
        this.dirToPlayer = this.getDirToPlayer()

        if(this.options["movement"] == Config.MOVE_ATTACK) {
            this.moveAttack()
        } else {
            this.moveFriendly()
        }
    }

    getMonster() {
        return this.options["monster"]
    }

    moveAttack() {
        if(this.arkona.npcPaused) return

        if(!this.target) this._findAttackTarget()

        if(this.target && this.target.alive) {
            let dist = distSprites(this.animatedSprite.sprite, this.target.animatedSprite.sprite)
            if(this.target.alive.health <= 0 || dist > Config.FAR_DIST) {
                this._clearPathAndTarget()
            } else if (dist <= Config.NEAR_DIST) {
                if (this.alive.attack(this.target.alive)) {
                    this.animatedSprite.setAnimation("attack", this.dir)
                }
            } else if (dist <= Config.FAR_DIST) {
                if (this.isFollowingPath()) {
                    if (!this._followPath()) {
                        // couldn't move
                        getLogger("NPC").warn(this.getName() + " Abandoning path")
                        this._clearPathAndTarget()
                    }
                } else {
                    let now = Date.now()
                    if(now - this.lastTargetFind > 1500) {
                        this.lastTargetFind = now
                        this.findPathToSprite(this.target)
                        // getLogger("NPC").log(this.getName() + " path to " + this.getTargetName() + ":", this.path)
                    }
                }
            }
        } else {
            this._clearPathAndTarget()
        }

        if(!this.target) {
            this.moveFriendly()
        }
    }

    getTargetName() {
        return this.target == null ? "null" : this.target.getName()
    }

    _clearPathAndTarget() {
        this.target = null
        if(this.options["movement"] == Config.MOVE_ATTACK) {
            // don't retry path
            this.reset()
        } else {
            // retry path
            this._makePathAttemptOrFinish()
        }
    }

    _findAttackTarget() {
        let minDist = 0
        this._clearPathAndTarget()
        this.arkona.forEachNonMonsterNpc(creature => {
            if(creature && creature.animatedSprite) {
                let dist = dist3d(this.x, this.y, this.z, ...creature.animatedSprite.sprite.gamePos)
                if ((this.target == null || dist < minDist) && dist <= Config.FAR_DIST) {
                    minDist = dist
                    this.target = creature
                }
            }
        })
        // getLogger("NPC").log(this.getName() + " targeting " + this.getTargetName())
        let dir = this.target ? Config.getDirToLocation(this.x, this.y, ...this.target.animatedSprite.sprite.gamePos) : null
        return [this.target, dir, minDist]
    }

    moveFriendly() {
        if(this.isFollowingPath()) {
            if (!this._followPath()) {
                // couldn't move
                getLogger("NPC").warn("Abandoning path")
                this._clearPathAndTarget()
            }
        } else if(!this.arkona.npcPaused) {
            if (this._willStop()) {
                this._stop()
            } else if (this._isStopped()) {
                this._turnToPlayer()
            } else if (!this._takeStep()) {
                this._changeDir()
            }
        }
    }

    _turnToPlayer() {
        if(this.isNearPlayer() && this.options.movement != Config.MOVE_DONT) {
            if(this.dirToPlayer != null) this.dir = this.dirToPlayer
        }
        this.animatedSprite.setAnimation("stand", this.dir)
    }

    _isStopped() {
        return this.stopClock != null && Date.now() - this.stopClock < Config.STOP_TIME
    }

    _willStop() {
        if(this.options.movement == Config.MOVE_DONT) return true

        if(this.options.movement == Config.MOVE_ATTACK) return false

        // move near player acts as anchor when the player is far
        if(this.options.movement == Config.MOVE_NEAR_PLAYER && this.distToPlayer < Config.MID_DIST) return false;

        // anchor stops near the player
        if(this.arkona.player.animatedSprite && this.distToPlayer < Config.NEAR_DIST) {
            this.moveClock = 0
        }
        return !this._isStopped() && (Date.now() >= this.moveClock)
    }

    isNearPlayer() {
        return this.isNearLocation(...this.arkona.player.animatedSprite.sprite.gamePos)
    }

    isNearLocation(x, y, z) {
        return dist3d(this.x, this.y, this.z, x, y, z) <= Config.NEAR_DIST
    }

    getDirToPlayer() {
        return Config.getDirToLocation(this.x, this.y, ...this.arkona.player.animatedSprite.sprite.gamePos)
    }

    _stop() {
        this.stopClock = Date.now()
        this.moveClock = Date.now() + Config.STOP_TIME + Config.MOVE_TIME * (0.5 + Math.random() * 0.5)
        this._turnToPlayer()
    }

    _speed() {
        return SPEEDS[this.info.speed || "normal"]
    }

    _takeStep() {
        let [nx, ny, nz] = this.arkona.moveInDir(this.x, this.y, this.z, this.dir, this._speed())
        return this._stepTo(nx, ny, nz)
    }

    // eslint-disable-next-line no-unused-vars
    _moveToNextStep(nx, ny, nz, dir) {
        if(this.options.movement == Config.MOVE_NEAR_PLAYER && this.distToPlayer < Config.NEAR_DIST) {
            return false
        } else if(this.options.movement == Config.MOVE_NEAR_PLAYER && this.distToPlayer < Config.MID_DIST && this.dir != this.dirToPlayer) {
            return false
        } else if((this.options.movement == Config.MOVE_ANCHOR || this.options.movement == Config.MOVE_NEAR_PLAYER) &&
            dist3d(this.anchorX, this.anchorY, this.anchorZ, nx, ny, nz) > Config.MID_DIST) {
            return false
        }

        // hand npc over to new section if needed
        let currentSection = this.arkona.sectionAt(this.x|0, this.y|0)
        let newSection = this.arkona.sectionAt(nx|0, ny|0)
        if(currentSection != newSection) {
            if(newSection == null) {
                // npc must be offscreen... just pause
                return false
            }
            currentSection.removeNpcRef(this)
            newSection.addNpcRef(this)
        }

        return this.animatedSprite.moveTo(nx, ny, nz)
    }

    _changeDir() {
        if(this.options.movement == Config.MOVE_NEAR_PLAYER && this.distToPlayer < Config.MID_DIST) {
            this.dir = this.dirToPlayer
        } else {
            this.dir = Config.getRandomDir()
        }
    }

    getName() {
        return this.options.name || this.creatureName
    }

    setPosFromSprite(sprite) {
        [this.x, this.y] = sprite.floatPos
        this.z = sprite.gamePos[2]
    }
}