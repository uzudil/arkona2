import * as Config from "./../config/Config"
import { dist3d } from "../utils"
import * as Creatures from "../config/Creatures"
import AnimatedSprite from "../world/Animation"
import Alive from "./Alive"

const SPEEDS = {
    "slow": 0.01,
    "normal": 0.05,
    "fast": 0.1
}

export default class {

    constructor(arkona, x, y, z, options, creatureName) {
        this.arkona = arkona
        this.x = x
        this.y = y
        this.z = z
        this.pathIndex = 0
        this.path = null
        this.lastPathFindTime = 0
        this.lastPlayerPos = [0, 0, 0]
        this.playerPosAtPathFind = [0, 0, 0]
        this.lastPathCheck = 0
        this.playerMoved = false
        this.anchorX = x
        this.anchorY = y
        this.anchorZ = z
        this.options = options || {}
        this.dir = options["dir"] || Config.DIR_N
        this.stopClock = null
        this.moveClock = Date.now() + Config.MOVE_TIME
        this.creatureName = creatureName
        this.info = Creatures.CREATURES[creatureName]
        this.animatedSprite = new AnimatedSprite(arkona.game, creatureName, arkona.blocks, x, y, z, this.info.animations, this.info.blockName)
        this.animatedSprite.sprite.npc = this
        this.alive = new Alive(this.getMonster() ? this.getMonster()["alive"] : {}, this)
    }

    isVisible() {
        return this.animatedSprite.sprite.visible
    }

    onDamage(amount, type) {
        this.arkona.fx.run("damages", this.animatedSprite.sprite, { amount: amount, isPlayerDamage: false })
        if(type) this.arkona.fx.run(type, this.animatedSprite.sprite, { amount: amount })
    }

    onDeath() {
        console.warn(this.getName() + " dies.")
        let section = this.arkona.sectionAt(this.x|0, this.y|0)
        if(section) section.removeNpc(this)
        else throw "Can't remove creature from section at " + this.x + "," + this.y
    }

    move() {
        // precalculate some stuff
        this.distToPlayer = this.arkona.getDistanceToPlayer(this.x, this.y, this.z)
        this.dirToPlayer = this.getDirToPlayer()
        let playerPos = this.arkona.player.animatedSprite.sprite.gamePos
        this.playerMoved = !(this.lastPlayerPos[0] == playerPos[0] && this.lastPlayerPos[1] == playerPos[1] && this.lastPlayerPos[2] == playerPos[2])
        this.lastPlayerPos[0] = playerPos[0]
        this.lastPlayerPos[1] = playerPos[1]
        this.lastPlayerPos[2] = playerPos[2]

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
        if(this.arkona.player.animatedSprite) {
            if(this.distToPlayer <= Config.NEAR_DIST) {
                // todo: attack instead
                if(this.alive.attack(this.arkona.player.alive)) {
                    this.animatedSprite.setAnimation("attack", this.dir)
                }
            } else if(this.distToPlayer <= Config.FAR_DIST) {
                if(this.path == null) {
                    this._findPathToPlayer()
                } else {
                    if(!this._followPath()) {
                        // couldn't move
                        console.warn("Abandoning path")
                        this._clearPath()
                    }
                }
            } else {
                this.moveFriendly()
            }
        } else {
            this.animatedSprite.setAnimation("stand", this.dir)
        }
    }
    
    _findPathToPlayer() {
        let now = Date.now()
        // if the player hasn't moved since the last path find, don't bother
        let playerHasntMoved =
            this.playerPosAtPathFind[0] == this.lastPlayerPos[0] &&
            this.playerPosAtPathFind[1] == this.lastPlayerPos[1] &&
            this.playerPosAtPathFind[2] == this.lastPlayerPos[2]
        if(now - this.lastPathFindTime > 1000 && !playerHasntMoved) {
            this.lastPathFindTime = now
            this.playerPosAtPathFind[0] = this.lastPlayerPos[0]
            this.playerPosAtPathFind[1] = this.lastPlayerPos[1]
            this.playerPosAtPathFind[2] = this.lastPlayerPos[2]
            this._findPathTo(...this.arkona.player.animatedSprite.sprite.gamePos)
        }
    }

    _findPathTo(toX, toY, toZ) {
        console.warn("Finding path")
        let currPos = this.animatedSprite.sprite.gamePos
        let p = this.arkona.blocks.getPath(this.animatedSprite.sprite, currPos[0], currPos[1], currPos[2], toX, toY, toZ, this.arkona.player.animatedSprite.sprite)
        if(p) {
            this._setPath(p)
        }
    }

    _setPath(path) {
        this.path = path
        this.pathIndex = 0
    }

    _clearPath() {
        this.path = null
        this.pathIndex = 0
    }

    _followPath() {
        let now = Date.now()
        if(this.playerMoved && now - this.lastPathCheck > 1000) {
            this.lastPathCheck = now
            this._findPathToPlayer()
            return true
        }
        let [px, py, pz] = this.path[this.pathIndex]
        let currPos = this.animatedSprite.sprite.gamePos
        if(dist3d(currPos[0], currPos[1], currPos[2], px, py, pz) < 0.1) {
            this.pathIndex++
            if(this.pathIndex >= this.path.length) {
                this._clearPath()
            }
            // force position to waypoint
            return this._stepTo(px, py, pz)
        } else {
            // calculate direction from integers
            this.dir = Config.getDirByDelta(px - currPos[0], py - currPos[1])
            return this._takeStep()
        }
    }

    moveFriendly() {
        if (this._willStop()) {
            this._stop()
        } else if(this._isStopped()) {
            this._turnToPlayer()
        } else if (!this._takeStep()) {
            this._changeDir()
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

    _stepTo(nx, ny, nz) {
        if(this.x == nx && this.y == ny) {
            this.animatedSprite.setAnimation("stand", this.dir)
            return true
        } else if(this._moveToNextStep(nx, ny, nz)) {
            [this.x, this.y, this.z] = [nx, ny, nz]
            this.animatedSprite.setAnimation("walk", this.dir)
            return true
        } else {
            this.animatedSprite.setAnimation("stand", this.dir)
            return false
        }
    }

    _moveToNextStep(nx, ny, nz) {
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