/**
 * Anything that is alive, can attack and can be killed. Headless creature combat stats.
 */
export default class {
    constructor(info, events) {
        this.info = info || {}
        this.events = events
        this.startingHealth = this.info["health"] || 10
        this.health = this.startingHealth
        this.strength = this.info["strength"] || 10
        this.attackWait = this.info["attackWait"] || 1500
        this.lastAttack = 0
    }

    attack(other) {
        let now = Date.now()
        if(now - this.lastAttack > this.attackWait) {
            this.lastAttack = now
            other.takeDamage(
                Math.max(1, (Math.random() * this.strength * 0.3 + this.strength * 0.7)|0),
                this.info["attack"]
            )
            return true
        } else {
            return false
        }
    }

    takeDamage(damage, type) {
        this.health -= damage
        this.events.onDamage(damage, type)
        if(this.health <= 0) {
            this.events.onDeath()
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
