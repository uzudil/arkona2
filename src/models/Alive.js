/**
 * Anything that is alive, can attack and can be killed. Headless creature combat stats.
 */
export default class {
    constructor(info, events) {
        this.info = info || {}
        this.events = events
        this.startingHealth = this.info["health"] || 10
        this.health = this.startingHealth
        this.def = this.info["def"] || 0
        this.shieldType = this.info["shieldType"]
        this.strength = this.info["strength"] || 10
        this.attackWait = this.info["attackWait"] || 1500
        this.range = this.info["range"] || 15 // this is an angle of who around the player is affected. Not yet used.
        this.lastAttack = 0
        this.level = 1
    }

    getStats() {
        return {
            health: this.health,
            def: this.def,
            str: this.strength,
            wait: this.attackWait,
            level: this.level
        }
    }

    setStats(stats) {
        if(stats) {
            if(stats["health"]) this.health = stats.health
            if(stats["def"]) this.def = stats.def
            if(stats["str"]) this.strength = stats.str
            if(stats["wait"]) this.attackWait = stats.wait
            if(stats["level"]) this.level = stats.level
        }
    }

    getWeaponCooldown() {
        return Math.max(0, Math.min(1, (Date.now() - this.lastAttack) / this.attackWait))
    }

    attack(other) {
        let now = Date.now()
        if(now - this.lastAttack > this.attackWait) {
            this.lastAttack = now
            let str = this.level * this.strength
            other.takeDamage(
                Math.max(1, (Math.random() * str * 0.3 + str * 0.7)|0),
                this.info["attack"]
            )
            return true
        } else {
            return false
        }
    }

    attackInc() {
        this.strength = Math.round(this.strength * 1.5)
        this.events.onAttackInc()
    }

    defInc() {
        this.def = Math.round(this.def * 1.5)
        this.events.onDefInc()
    }

    speedInc() {
        this.attackWait = Math.round(this.attackWait * 0.85)
        this.events.onSpeedInc()
    }

    rangeInc() {
        this.range = Math.min(360, this.range + 15)
        this.events.onRangeInc()
    }

    takeDamage(damage, type) {
        let def = this.level * this.def
        let shield = Math.max(0, (Math.random() * def * 0.3 + def * 0.7)|0)
        let dam = damage - shield
        if(dam > 0) {
            this.health -= dam
            this.events.onDamage(dam, type)
            if (this.health <= 0) {
                this.events.onDeath()
            }
        }
        if(shield > 0) {
            this.events.onDefense(shield, this.shieldType)
        }
    }

    heal(amount) {
        if(amount == null) {
            amount = this.startingHealth - this.health
        } else {
            amount = Math.min(amount, this.startingHealth - this.health)
        }
        if(amount > 0) {
            this.health += amount
            this.events.onHeal(amount)
        }
    }
}
