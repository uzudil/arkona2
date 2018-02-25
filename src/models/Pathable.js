import * as Config from "./../config/Config"

export default class {

    constructor(arkona) {
        this.arkona = arkona

        this.pathIndex = 0
        this.path = null
        this.lastPathFindTime = 0
        this.to = [0,0,0]
        this.targetMoved = false
        this.lastPathCheck = 0
        this.targetAnimatedSprite = null
    }

    /**
     * Find a path to a static location.
     *
     * @param toX
     * @param toY
     * @param toZ
     */
    findPathTo(toX, toY, toZ) {
        this.targetAnimatedSprite = null
        this._findPathTo(toX, toY, toZ)
    }

    _findPathTo(toX, toY, toZ) {
        this.to[0] = toX
        this.to[1] = toY
        this.to[2] = toZ
        this.x = this.animatedSprite.sprite.gamePos[0]
        this.y = this.animatedSprite.sprite.gamePos[1]
        this.z = this.animatedSprite.sprite.gamePos[2]
        this._findPath()
    }

    /**
     * Find a path to a moving target.
     * Will recompute path occasionally as the target moves.
     *
     * @param animatedSprite
     */
    findPathToSprite(animatedSprite) {
        this.targetAnimatedSprite = animatedSprite
        this._findPathToTargetSprite()
    }

    _findPathToTargetSprite() {
        this.lastTargetPos = [
            this.targetAnimatedSprite.sprite.gamePos[0],
            this.targetAnimatedSprite.sprite.gamePos[1],
            this.targetAnimatedSprite.sprite.gamePos[2]]
        this._findPathTo(...this.targetAnimatedSprite.sprite.gamePos)
    }

    _findPath() {
        let currPos = this.animatedSprite.sprite.gamePos
        let p = this.arkona.blocks.getPath(
            this.animatedSprite.sprite,
            currPos[0], currPos[1], currPos[2],
            this.to[0], this.to[1], this.to[2],
            this.arkona.player.animatedSprite.sprite
        )
        if(p) {
            this._setPath(p)
        }
    }

    _setPath(path) {
        this.path = path
        this.pathIndex = 0
    }

    _clearPath() {
        this._setPath(null)
    }

    _followPath() {
        let now = Date.now()

        // follow moving target
        if(this.targetAnimatedSprite) {
            let targetPos = this.arkona.player.animatedSprite.sprite.gamePos
            let targetMoved = !(this.lastTargetPos[0] == targetPos[0] && this.lastTargetPos[1] == targetPos[1] && this.lastTargetPos[2] == targetPos[2])
            if(targetMoved && now - this.lastPathCheck > 3000) {
                this.lastPathCheck = now
                this._findPathToTargetSprite()
                return true
            }
        }

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
        // console.log("currpos=" + Math.round(currPos[0]) + "," + Math.round(currPos[1]) + " vs " + px + "," + py + " pastWaypoint=" + pastWaypoint)

        if(pastWaypoint) {
            if(!success) {
                // try to move to the waypoint if can't get to original destination
                success = this._stepTo(px, py, pz, dir)
            }

            // advance to the next waypoint
            // console.log("waypoint advance to " + px + "," + py + " success=" + success)
            this.pathIndex++
            if (this.pathIndex >= this.path.length) {
                this._clearPath()
            }
        }

        return success
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
}
