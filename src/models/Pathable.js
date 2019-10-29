import * as Config from "./../config/Config.js"
import { dist3d } from "../utils.js"
import {getLogger} from "../config/Logger.js"

export default class {

    constructor(arkona) {
        this.arkona = arkona
        this.reset()
    }

    reset() {
        this.pathIndex = 0
        this.path = null
        this.to = [0,0,0]
        this.targetCreature = null
        this.attemptCount = 0
        this.pathAttemptCount = 0
        this.attemptDelay = 0
        this.ignoreCreatures = true
    }

    /**
     * Find a path to a static location.
     *
     * @param toX
     * @param toY
     * @param toZ
     */
    findPathTo(toX, toY, toZ) {
        this.pathAttemptCount = 0
        this.targetCreature = null
        this._findPathTo(toX, toY, toZ)
    }

    _findPathTo(toX, toY, toZ) {
        // fill in this.to with a position that is accessible (ie. not partly in the wall or something)
        // this.to will be a position where the sprite can move to and includes the point at toX,toY,toZ.
        let found = this.arkona.blocks.findClosestAccessiblePos(
            this.animatedSprite.sprite,
            this._getIgnoreSprite(),
            toX, toY, toZ,
            this.ignoreCreatures,
            this.to)
        if(found) {
            this.x = this.animatedSprite.sprite.gamePos[0]
            this.y = this.animatedSprite.sprite.gamePos[1]
            this.z = this.animatedSprite.sprite.gamePos[2]
            this._findPath()
        } else {
            getLogger("PATH").warn(this.getName() + " could not find destination at to " + toX + "," + toY)
            this.reset()
        }
    }

    /**
     * Find a path to a moving target.
     * Will recompute path occasionally as the target moves.
     *
     * @param animatedSprite
     */
    findPathToSprite(target) {
        this.pathAttemptCount = 0
        this.targetCreature = target
        this._findPathToTargetSprite()
    }

    _findPathToTargetSprite() {
        this.lastTargetPos = [
            this.targetCreature.animatedSprite.sprite.gamePos[0],
            this.targetCreature.animatedSprite.sprite.gamePos[1],
            this.targetCreature.animatedSprite.sprite.gamePos[2]]
        this._findPathTo(...this.lastTargetPos)
    }

    _findPath() {
        getLogger("PATH").warn(this.getName() + " looking for path to " + this.to[0] + "," + this.to[1])
        let currPos = this.animatedSprite.sprite.gamePos
        let p = this.arkona.blocks.getPath(
            this.animatedSprite.sprite,
            currPos[0], currPos[1], currPos[2],
            this.to[0], this.to[1], this.to[2],
            this._getIgnoreSprite(),
            this.ignoreCreatures
        )
        this.ignoreCreatures = true // reset this after getPath()
        if(p) {
            this._setPath(p)
        } else {
            getLogger("PATH").warn(this.getName() + " could not find path to " + this.to[0] + "," + this.to[1])
            this.reset()
        }
    }

    _setPath(path) {
        this.path = path
        this.pathIndex = 0
        this.attemptCount = 0
        this.attemptDelay = 0
        this.targetMovedCheck = 0
    }

    _clearPath() {
        this._setPath(null)
    }

    isFollowingPath() {
        return this.path != null || this._hasTargetCreature() || this.to[0] > 0
    }

    _followPath() {
        let now = Date.now()

        // keep waiting?
        if(now < this.attemptDelay) return true

        // follow moving target
        if(this._hasTargetCreature() && now - this.targetMovedCheck > 1500) {
            this.targetMovedCheck = now
            let targetPos = this.target.animatedSprite.sprite.gamePos
            let targetMoved = !(this.lastTargetPos[0] == targetPos[0] && this.lastTargetPos[1] == targetPos[1] && this.lastTargetPos[2] == targetPos[2])
            if(targetMoved) {
                this.attemptDelay = now + ((Math.random() * 2000 + 500)|0)
                getLogger("PATH").log(this.getName() + " looking for path to creature " + this.targetCreature.getName())
                this._findPathToTargetSprite()
                return true
            }
        } else if(this.path == null && this.to[0] > 0) {
            getLogger("PATH").log(this.getName() + " looking for path to position" + this.to[0] + "," + this.to[1])
            this._findPath()
        }

        if(!this.path) return false

        let [px, py, pz] = this.path[this.pathIndex]
        let currPos = this.animatedSprite.sprite.gamePos
        // let currPos = this.animatedSprite.sprite.floatPos
        // currPos[2] = this.animatedSprite.sprite.gamePos[2]
        this.dir = Config.getDirByDelta(px - currPos[0], py - currPos[1])

        // where would the next step take us
        let [nx, ny, nz] = this.arkona.moveInDir(this.x, this.y, this.z, this.dir, this._speed())

        // is this position past a waypoint?
        let dir = Config.getDirByDelta(px - Math.round(nx), py - Math.round(ny))
        let pastWaypoint = dir != this.dir

        // try to step there
        let success = this._stepTo(nx, ny, nz, dir)
        // getLogger("PATH").log("currpos=" + Math.round(currPos[0]) + "," + Math.round(currPos[1]) + " vs " + px + "," + py + " pastWaypoint=" + pastWaypoint)

        if(pastWaypoint) {
            if(!success) {
                // try to move to the waypoint if can't get to original destination
                success = this._stepTo(px, py, pz, dir)
            }

            // advance to the next waypoint
            // getLogger("PATH").log("waypoint advance to " + px + "," + py + " success=" + success)
            this.pathIndex++
            if (this.pathIndex >= this.path.length) {
                // if we're there stop (or try another path attempt)
                if(this._makePathAttemptOrFinish(now)) return true
            }
        }

        // if can't get there now, wait some time and try again a few times
        if(success) {
            this.attemptCount = this.attemptDelay = 0
        }

        if(!success && this.attemptCount < 3) {
            if(Math.random() > 0.75) {
                // sometimes try a new path w/o ignoring creatures
                // this is here to solve a deadlock of two npc-s waiting for each other
                getLogger("PATH").warn(this.getName() + " will attempt path find without ignoring creatures.")
                this.ignoreCreatures = false
                if(this._makePathAttemptOrFinish(now)) return true
            } else {
                this.attemptCount++
                this.attemptDelay = now + ((Math.random() * 500 + 500) | 0)
                getLogger("PATH").warn(this.getName() + " attempt: " + this.attemptCount + " will wait " + (this.attemptDelay - now) + " millis")
                success = true
            }
        }

        // if couldn't retry, make another path attempt
        if(!success) {
            if(this._makePathAttemptOrFinish(now)) return true
        }

        return success
    }

    _makePathAttemptOrFinish(now) {
        if(!now) now = Date.now()
        this._clearPath()

        // try again if we didn't reach the target
        let [nowX, nowY, nowZ] = this.animatedSprite.sprite.gamePos
        let reachedTo = this._isAtTargetPos()
        if(!this._hasTargetCreature() && !reachedTo && this.pathAttemptCount < 3) {
            this.pathAttemptCount++
            this.attemptDelay = now + ((Math.random() * 500 + 500)|0)
            getLogger("PATH").warn(this.getName() + " path attempt: " + this.pathAttemptCount + " will wait " + (this.attemptDelay - now) + " millis")
            return true
        } else if(!this._hasTargetCreature()) {
            getLogger("PATH").log(this.getName() + " is at " + nowX +"," + nowY + "," + nowZ + " vs " + this.to[0] + "," + this.to[1])
            if(reachedTo) {
                this.reset()
                getLogger("PATH").log(this.getName() + " reached target position")
            }
        }
    }

    _hasTargetCreature() {
        return this.targetCreature && this.targetCreature.alive && this.targetCreature.alive.health >= 0
    }

    _isAtTargetPos() {
        let [nowX, nowY, nowZ] = this.animatedSprite.sprite.gamePos
        let dist = dist3d(this.to[0], this.to[1], this.to[2], nowX, nowY, nowZ)
        return dist <= 1
    }

    _stepTo(nx, ny, nz, dir) {
        // eslint-disable-next-line no-unused-vars
        let [x,y,z] = this.animatedSprite.sprite.gamePos
        if(x == nx && y == ny) {
            this.animatedSprite.setAnimation("stand", this.dir)
            return true
        } else if(this._moveToNextStep(nx, ny, nz, dir)) {
            [this.x, this.y, this.z] = [nx, ny, nz]
            this.animatedSprite.setAnimation("walk", this.dir)
            return true
        } else {
            this.animatedSprite.setAnimation("stand", this.dir)
            return false
        }
    }

    _getIgnoreSprite() {
        return this.arkona.player.animatedSprite.sprite // doesn't really matter what this is set to
    }
}
