import * as Config from "../config/Config"
import * as Creatures from "../config/Creatures"
import AnimatedSprite from "../world/Animation"
import Alive from "./Alive"
import * as Utils from "../utils"
import $ from "jquery"

export default class {
    constructor(arkona) {
        this.arkona = arkona
        this.ship = null
        this.lastDir = null
        this.attacking = null

        this.alive = new Alive({
            health: 10,
            strength: 3,
            attackWait: 300
        }, this)

        this.animatedSprite = null
    }

    update(moving) {
        if(this.isAttacking()) {
            this.setAnimation("attack")
        } else if (!moving) {
            this.setAnimation("stand")
        }
    }

    onLevelStart(startX, startY, startZ, startDir) {
        let creatureInfo = Creatures.CREATURES[Config.PLAYER_CREATURE_NAME]
        if(this.animatedSprite) {
            this.arkona.blocks.forceMoveTo(this.animatedSprite.sprite, startX, startY, startZ)
            if(this.ship) {
                this.arkona.blocks.forceMoveTo(this.ship, startX, startY, startZ)
            }
        } else {
            this.animatedSprite = new AnimatedSprite(
                this.arkona.game,
                Config.PLAYER_CREATURE_NAME,
                this.arkona.blocks,
                startX,
                startY,
                startZ,
                creatureInfo.animations,
                creatureInfo.blockName)
            this.animatedSprite.sprite.userControlled = true
            this.animatedSprite.animationSpeed = 16
        }

        if(startDir) this.lastDir = startDir
        this.animatedSprite.setAnimation("stand", startDir || this.lastDir || Config.DIR_E)
        this.animatedSprite.centerOn()
    }

    onDamage(amount, type) {
        this.arkona.damages.add(amount,
            this.animatedSprite.sprite.gamePos[0] - 2,
            this.animatedSprite.sprite.gamePos[1] - 2,
            this.animatedSprite.sprite.gamePos[2],
            true)

        if(type) this.arkona.fx.run(type, this.animatedSprite.sprite)
    }

    onDeath() {
        if(!Config.GODMODE) {
            this.arkona.pause()
            $("#overlay-shadow").show()
            $("#death").show()
        }
    }

    onHeal(amount) {
        this.arkona.fx.run("heal", this.animatedSprite.sprite)
        this.arkona.damages.add(-amount,
            this.animatedSprite.sprite.gamePos[0] - 2,
            this.animatedSprite.sprite.gamePos[1] - 2,
            this.animatedSprite.sprite.gamePos[2],
            true)
    }

    setAnimation(name) {
        if(this.animatedSprite) this.animatedSprite.setAnimation(name, this.lastDir)
    }

    setDir(dir) {
        this.lastDir = dir
    }

    attack(npc) {
        console.warn("Attacking: ", npc.getName())
        let dir = Config.getDirToLocation(
            this.animatedSprite.sprite.gamePos[0],
            this.animatedSprite.sprite.gamePos[1],
            npc.x, npc.y)
        this.setDir(dir)
        this.attacking = Date.now()
        this.alive.attack(npc.alive)
    }

    isAttacking() {
        if (this.attacking) {
            if (Date.now() - this.attacking > 200) this.attacking = null
        }
        return this.attacking != null
    }

    move(dir) {
        if(this.animatedSprite) {
            if(this.ship) {
                let [ox, oy] = this.ship.floatPos
                let oz = this.ship.gamePos[2]
                if (dir) {
                    let [nx, ny] = this.arkona.moveInDir(ox, oy, oz, dir, this.arkona.getPlayerSpeed())
                    if (this.arkona.blocks.moveShipTo(this.ship, nx, ny, true) ||
                        this.arkona.blocks.moveShipTo(this.ship, nx, oy, true) ||
                        this.arkona.blocks.moveShipTo(this.ship, ox, ny, true)) {
                        if(!Config.isOverland(this.ship.gamePos[0], this.ship.gamePos[1])) {
                            console.warn("calling wrap around")
                            this.arkona.wrapAroundWorld(this.ship, dir, () => {
                                this._shipMoved(dir)
                            })
                        } else {
                            this._shipMoved(dir)
                        }
                        return true
                    }
                }
            } else {
                let [ox, oy] = this.animatedSprite.sprite.floatPos
                let oz = this.animatedSprite.sprite.gamePos[2]
                let blockTestFx = (blocker) => this._blockedBy(blocker)
                if (dir) {
                    let [nx, ny, nz] = this.arkona.moveInDir(ox, oy, oz, dir, this.arkona.getPlayerSpeed())
                    if (this.arkona.blocks.moveTo(this.animatedSprite.sprite, nx, ny, nz, false, true, blockTestFx) ||
                        this.arkona.blocks.moveTo(this.animatedSprite.sprite, nx, oy, nz, false, true, blockTestFx) ||
                        this.arkona.blocks.moveTo(this.animatedSprite.sprite, ox, ny, nz, false, true, blockTestFx)) {
                        this._moved(dir)
                        return true
                    }
                }
            }
        }
        return false
    }

    _shipMoved(dir) {
        if(dir && this.ship) {
            this.ship.vehicle.setDir(dir)
            let [px, py] = this.ship.gamePos
            // move the player along
            this.arkona.blocks.forceMoveTo(this.animatedSprite.sprite, px, py, 0)
            // load maps
            this.arkona.checkMapBoundary(px, py)
        }
    }

    /**
     * The player just moved in this direction.
     *
     * @param dir the direction of the player's last step
     */
    _moved(dir) {
        let [px, py, pz] = this.animatedSprite.sprite.gamePos
        this.arkona.blocks.checkRoof(px, py, pz, this.animatedSprite.sprite.name)
        if (dir != null) {
            this.setDir(dir)
            this.setAnimation("walk")
        }
        this.arkona.checkMapBoundary(px, py)
    }

    /**
     * The player was just blocked by this sprite.
     *
     * @param sprite the sprite blocking the player
     */
    _blockedBy(sprite) {
        return this.arkona.checkMapPosition(...sprite.gamePos)
    }

    canReach(sprite) {
        // todo: find path to sprite

        // for now just check distance
        return sprite && this.animatedSprite && Utils.dist3d(
                this.animatedSprite.sprite.gamePos[0],
                this.animatedSprite.sprite.gamePos[1],
                this.animatedSprite.sprite.gamePos[2],
                sprite.gamePos[0],sprite.gamePos[1],sprite.gamePos[2],
            ) < Config.ACTION_DIST
    }

    enterShip(sprite) {
        console.warn("Entering ship")
        this.ship = sprite
        this.animatedSprite.sprite.visible = false
        this.ship.vehicle.animatedSprite.centerOn()
    }

    canExitShipHere(sprite) {
        let [x, y, z] = [...sprite.gamePos];
        return this.arkona.blocks.canMoveTo(this.animatedSprite.sprite, x, y, z)
    }

    exitShip() {
        console.warn("Exiting ship")
        if(this.arkona.blocks.moveNextToSprite(this.ship, this.animatedSprite.sprite)) {
            this._moved(Config.DIR_E)
            this.ship = null
            this.animatedSprite.sprite.visible = true
            this.animatedSprite.centerOn()
            return true
        } else {
            return false
        }
    }
}
