import * as Config from "../config/Config"

const TALK_MODE = "talk"
const USE_MODE = "use"
const DOOR_MODE = "door"
const ATTACK_MODE = "attack"
const ENTER_SHIP_MODE = "enter"
const EXIT_SHIP_MODE = "exit"
const RED_CRYSTAL_MODE = "red"
const GREEN_CRYSTAL_MODE = "green"
const PURPLE_CRYSTAL_MODE = "purple"
const YELLOW_CRYSTAL_MODE = "yellow"

const PRECEDENCE = {}
PRECEDENCE[ATTACK_MODE] = 1
PRECEDENCE[USE_MODE] = 2
PRECEDENCE[DOOR_MODE] = 3
PRECEDENCE[TALK_MODE] = 4
PRECEDENCE[ENTER_SHIP_MODE] = 5
PRECEDENCE[EXIT_SHIP_MODE] = 5

const MAX_PRECEDENCE = 100

export default class {
    getType() {
        return "use_object"
    }

    getPos() {
        return this.sprite ? this.sprite.gamePos : null
    }

    // eslint-disable-next-line no-unused-vars
    setContext(context) {
        this.mode = null
        this.sprite = null
        this.action = null
    }

    check(arkona) {
        let sprites = arkona.blocks.findAllNearby(arkona.player.animatedSprite.sprite, 10, (sprite) => this.getMode(arkona, sprite))

        // find the mode with the lowest precedence
        let minPrec = MAX_PRECEDENCE
        this.sprite = null
        this.mode = null
        this.action = null
        for(let obj of sprites) {
            let sprite = obj.sprite
            let [mode, action] = obj.value
            let prec = PRECEDENCE[mode] || MAX_PRECEDENCE
            if(this.mode == null || prec < minPrec) {
                minPrec = prec
                this.sprite = sprite
                this.mode = mode
                this.action = action
            }
        }
        return this.sprite
    }

    getMode(arkona, sprite) {
        let mode = null
        let action = this._getAction(arkona, sprite)
        if(this._canTalkTo(sprite)) {
            mode = TALK_MODE
        } else if(this._isDoor(sprite)) {
            mode = DOOR_MODE
        } else if(action) {
            mode = USE_MODE
        } else if(this._canEnterShip(arkona, sprite)) {
            mode = ENTER_SHIP_MODE
        } else if(this._canExitShip(arkona, sprite)) {
            mode = EXIT_SHIP_MODE
        } else if(this._canAttack(sprite)) {
            mode = ATTACK_MODE
        } else {
            // make sure this is the last 'else' block
            mode = this._getCrystalMode(sprite)
        }
        return mode == null ? null : [mode, action]
    }

    setMode(arkona, sprite) {
        let obj = this.getMode(arkona, sprite)
        if(obj) {
            this.mode = obj[0]
            this.action = obj[1]
        } else {
            this.mode = this.action = null
        }
        return this.mode != null
    }

    _getCrystalMode(sprite) {
        switch(sprite.name) {
            case "crystal.red": return RED_CRYSTAL_MODE;
            case "crystal.green": return GREEN_CRYSTAL_MODE;
            case "crystal.purple": return PURPLE_CRYSTAL_MODE;
            case "crystal.yellow": return YELLOW_CRYSTAL_MODE;
            default: return null;
        }
    }

    _canAttack(sprite) {
        return sprite.npc != null && sprite.npc.getMonster() != null
    }

    _canExitShip(arkona, sprite) {
        return arkona.player.ship && arkona.player.canExitShipHere(sprite)
    }

    _canEnterShip(arkona, sprite) {
        return arkona.player.ship == null && sprite.vehicle
    }

    _getAction(arkona, sprite) {
        return arkona.getAction(sprite.gamePos, this)
    }

    _isDoor(sprite) {
        return Config.DOORS.indexOf(sprite.name) >= 0
    }

    _canTalkTo(sprite) {
        return sprite.npc != null && sprite.npc.getMonster() == null
    }

    setSprite(arkona, sprite) {
        this.sprite = sprite
        return this
    }

    run(arkona) {
        let updated = true
        switch(this.mode) {
            case DOOR_MODE:
                arkona.useDoor(this.sprite)
                break
            case ENTER_SHIP_MODE:
                arkona.player.enterShip(this.sprite)
                break
            case EXIT_SHIP_MODE:
                updated = arkona.player.exitShip()
                break
            case USE_MODE:
                if(this.action) {
                    this.action.action(arkona)
                    updated = true
                } else {
                    updated = false
                }
                break
            case TALK_MODE:
                arkona.allCreaturesStop()
                arkona.convoUi.start(this.sprite.npc)
                break
            case ATTACK_MODE:
                arkona.player.attack(this.sprite.npc)
                break
            case RED_CRYSTAL_MODE:
                arkona.player.redCrystal(this.sprite)
                break
            case GREEN_CRYSTAL_MODE:
                arkona.player.greenCrystal(this.sprite)
                break
            case PURPLE_CRYSTAL_MODE:
                arkona.player.purpleCrystal(this.sprite)
                break
            case YELLOW_CRYSTAL_MODE:
                arkona.player.yellowCrystal(this.sprite)
                break
            default: updated = false
        }
        return updated
    }
}