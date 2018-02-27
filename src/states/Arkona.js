import Phaser from "phaser"
import $ from "jquery"
import Block from "../world/Block"
import * as Config from "../config/Config"
import Player from "../models/Player"
import Messages from "../ui/Messages"
import ConvoUI from "../ui/ConvoUI"
import Transition from "../ui/Transition"
import InGameMenu from "../ui/InGameMenu"
import Lamp from "../ui/Lamp"
import * as Queue from "../actions/Queue"
import MouseClickAction from "../actions/MouseClickAction"
import Stats from "stats.js"
import Device from "../ui/Device"
import { dist3d } from "../utils"
import Section from "../models/Section"
import Fx from "../world/Fx"
import * as Movies from "../config/Movies"

const fs = window.require("fs-extra")
const path = window.require("path")
const os = window.require("os")

export default class extends Phaser.State {
    constructor() {
        super()
        this.startFromSavedGame = false
    }

    init(context) {
        if(context && context["loadGame"]) {
            this.startFromSavedGame = context.loadGame
        }
    }

    create() {
        this.game.stage.backgroundColor = "#000000"

        this.gameState = {}
        this.overlayShowing = false
        this.actionQueue = new Queue.Queue(this)
        this.mouseClickAction = new MouseClickAction()
        this.player = new Player(this)
        this.paused = false
        this.npcPaused = false
        this.lastPos = null
        this.sections = {}
        this.playerSpeed = 1
        this.mouseClicked = false
        this.fx = new Fx(this)
        this.delayedDeathNpcs = []
        this.movie = null
        this.movieSceneIndex = 0
        this.movieContext = {}
        this.checkpoint = Date.now()

        // controls
        this.cursors = this.game.input.keyboard.createCursorKeys()
        this.space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
        this.ctrl = this.game.input.keyboard.addKey(Phaser.Keyboard.CONTROL)
        this.enter = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
        this.esc = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC)
        this.w_key = this.game.input.keyboard.addKey(Phaser.Keyboard.W)

        // ui (order matters)
        this.blocks = new Block(this)
        this.lamp = new Lamp(this)
        this.device = new Device(this)
        this.messages = new Messages(this)
        this.convoUi = new ConvoUI(this)
        this.transition = new Transition()
        this.inGameMenu = new InGameMenu(this)

        // movement cursor
        this.movementCursor = this.game.add.image(0, 0, "sprites2", "cursor.arrow2")
        this.movementCursor.visible = false
        this.movementCursor.anchor.setTo(0.5, 0.5)

        if(Config.DEBUG_MODE) {
            this.stats = new Stats();
            this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            this.phaserStatsPanel = this.stats.addPanel( new Stats.Panel( "SP", "#ff8", "#221" ) );
            this.stats.domElement.style.left = ""
            this.stats.domElement.style.right = "0px"
            document.body.appendChild(this.stats.dom);
        } else {
            this.stats = null
            this.phaserStatsPanel = null
        }

        // start game
        this.loadGame(this.startFromSavedGame)

        // use jquery click detection - couldn't get phaser's to work...
        $("body").click(() => this.onMouseClick())

        // for debug/hacking
        window.arkona = this
    }

    onMouseClick() {
        this.mouseClicked = true
        setTimeout(() => this.mouseClicked = false, 500)
    }

    update() {
        if(this.stats) {
            this.stats.begin()
        }

        if(this.loading || !this.player.animatedSprite) return

        this.blocks.update()

        this.fx.update()

        if(!this.paused && !this.updateUI()) {

            // assemble the actions
            if(!this.npcPaused) {
                let npcs = []
                let generators = []
                for (let key in this.sections) {
                    let section = this.sections[key]
                    if (section.npcs) section.npcs.filter(npc => npc.isVisible()).forEach(npc => npcs.push(npc))
                    if (section.generators) section.generators.forEach(g => generators.push(g))
                }
                if (npcs.length > 0) this.actionQueue.add(Queue.MOVE_NPC, npcs)
                if (generators.length > 0) this.actionQueue.add(Queue.GENERATORS, generators)
            }

            this.positionMovementCursor()

            let moving = false
            if(!this.updateMovie()) {
                moving = this.playerInput()
            }

            // run the actions
            if(this.actionQueue.update()) {
                this.blocks.sort()
            }

            let section = this.sectionAt(
                this.player.animatedSprite.sprite.gamePos[0],
                this.player.animatedSprite.sprite.gamePos[1])
            if(section) {
                section.onLoad()
            }

            this.player.update(moving || this.player.path != null)
        } else {
            this.showMovementCursor(false)
        }

        this.device.update()

        if(this.stats) {
            this.stats.end()
            this.phaserStatsPanel.update(this.world.camera.totalInView, this.stage.currentRenderOrderID)
        }
    }

    playerInput() {
        let moving = false
        if (this.w_key.isDown && this.movementCursor.visible && !this.isCursorKeyDown()) {
            this.actionQueue.add(Queue.MOVE_PLAYER, this.movementCursor.dir)
            this.playerSpeed = (this.movementCursor.scale.y / 2)
            moving = true
        } else {
            moving = this.isCursorKeyDown()
            if (moving) {
                let dir = this.getDirFromCursorKeys()
                if (dir != null) {
                    this.actionQueue.add(Queue.MOVE_PLAYER, dir)
                    this.playerSpeed = 1
                }
            }
        }

        let ctrlDown = this.ctrl.isDown
        if (this.space.justDown || ctrlDown) this.actionQueue.add(Queue.USE_OBJECT, ctrlDown)

        let spriteUnderMouse = this.getSpriteUnderMouse()
        this.showMovementCursor(!spriteUnderMouse)
        if (this.mouseClicked) {
            if (spriteUnderMouse) {
                this.mouseClicked = false // consume click
                this.actionQueue.add(Queue.CLICK, spriteUnderMouse)
            } else {
                // move player here
                let worldCoords = this.blocks.toWorldCoords(this.game.input.x / this.blocks.zoom, this.game.input.y / this.blocks.zoom)
                this.actionQueue.add(Queue.MOVE_PLAYER, worldCoords)
                this.mouseClicked = false // consume click
            }
        } else if (this.game.input.activePointer.isDown && this.movementCursor.visible && !this.isCursorKeyDown()) {
            this.actionQueue.add(Queue.MOVE_PLAYER, this.movementCursor.dir)
            this.playerSpeed = (this.movementCursor.scale.y / 2)
            moving = true
        }
        return moving
    }

    positionMovementCursor() {
        // position
        this.movementCursor.position.x = this.game.input.x
        this.movementCursor.position.y = this.game.input.y

        // size
        let d = dist3d(Config.WIDTH/2, Config.HEIGHT/2, 0, this.game.input.x, Config.HEIGHT - this.game.input.y, 0)
        this.movementCursor.scale.setTo(1, 1 + Math.sin((d / (Config.HEIGHT / 2)) * Math.PI/2))

        // angle
        let rot = Config.getRotation(
            this.game.input.x, Config.HEIGHT - this.game.input.y,
            Config.WIDTH/2, Config.HEIGHT/2
        ) - Math.PI/2
        // need to use a variable here b/c assigning to cursor.angle changes the value to negative
        let angle = ((Math.round((rot / Math.PI * 180) / 45) * 45) + 360) % 360
        this.movementCursor.angle = angle
        this.movementCursor.dir = Config.DIR_ANGLES[angle]
    }

    getPlayerSpeed() {
        return Config.PLAYER_SPEED * this.playerSpeed
    }

    showMovementCursor(visible) {
        $("canvas").toggleClass("no-cursor", visible)
        this.movementCursor.visible = visible
    }

    getSpriteUnderMouse() {
        let underMouse = this.blocks.getTopSpriteAt(this.game.input.x, this.game.input.y)
        this.mouseClickAction.setContext(underMouse)
        if(!this.mouseClickAction.check(this)) {
            // there is a sprite but mouse click action can't handle it
            underMouse = null
        }
        // highlight (or de-highlight)
        this.blocks.highlight(underMouse)
        return underMouse
    }

    updateUI() {
        if(this.inGameMenu.visible) {
            if (this.esc.justDown) {
                this.inGameMenu.hide()
            }
            return true
        } else if(this.overlayShowing) {
            if (this.esc.justDown || this.space.justDown || this.enter.justDown || this.mouseClicked) {
                this.mouseClicked = false // consume click
                this.hideOverlay()
            }
            return true
        } else if(this.messages.group.visible) {
            if (this.space.justDown) {
                this.messages.showNextLine()
            }
            return true
        } else if(this.convoUi.group.visible) {
            if (this.esc.justDown) {
                this._processDelayedDeaths()
                this.convoUi.end()
            } else if (this.space.justDown || this.enter.justDown) {
                this.convoUi.select()
            } else if (this.cursors.up.justDown) {
                this.convoUi.change(-1)
            } else if (this.cursors.down.justDown) {
                this.convoUi.change(1)
            }
            return true
        } else {
            if (this.esc.justDown) {
                this.inGameMenu.show()
                return true;
            }
            return false
        }
    }

    uiClosed(ui) {
        if(ui == this.convoUi) {
            this._processDelayedDeaths()
        }
    }

    _processDelayedDeaths() {
        this.delayedDeathNpcs.forEach(npc => npc.onDeath(true))
    }

    isCursorKeyDown() {
        return this.cursors.up.isDown || this.cursors.left.isDown || this.cursors.down.isDown || this.cursors.right.isDown
    }

    getDirFromCursorKeys() {
        let dir = null
        if (this.cursors.up.isDown && this.cursors.left.isDown) {
            dir = "w"
        } else if (this.cursors.up.isDown && this.cursors.right.isDown) {
            dir = "n"
        } else if (this.cursors.down.isDown && this.cursors.right.isDown) {
            dir = "e"
        } else if (this.cursors.down.isDown && this.cursors.left.isDown) {
            dir = "s"
        } else if (this.cursors.up.isDown) {
                dir = "nw"
        } else if (this.cursors.down.isDown) {
            dir = "se"
        } else if (this.cursors.left.isDown) {
            dir = "sw"
        } else if (this.cursors.right.isDown) {
            dir = "ne"
        }
        return dir
    }

    wrapAroundWorld(sprite, dir, onLoad) {
        let [x, y, z] = sprite.gamePos
        let [ox, oy] = [x, y]
        if(x < 0) x = Config.TOTAL_MAP_X + x
        if(y < 0) y = Config.TOTAL_MAP_Y + y
        if(x >= Config.TOTAL_MAP_X) x -= Config.TOTAL_MAP_X
        if(y >= Config.TOTAL_MAP_Y) y -= Config.TOTAL_MAP_Y
        if(x != ox || y != oy) {
            console.warn("teleport around: from " + ox + "," + oy + " to " + x + "," + y)
            this.teleport(x, y, z, dir, onLoad)
        }
    }

    checkMapBoundary(px, py, onLoad) {
        let mx = (px / Config.MAP_SIZE)|0
        let my = (py / Config.MAP_SIZE)|0
        let dx = ((px % Config.MAP_SIZE) / (Config.MAP_SIZE/2))|0
        let dy = ((py % Config.MAP_SIZE) / (Config.MAP_SIZE/2))|0

        let pos = "" + dx + "." + dy
        if(pos != this.lastPos) {
            this.lastPos = pos
            console.warn("New pos=" + pos)
            let maps = []
            if (dx == 0 && dy == 0) maps.push([mx - 1, my - 1])
            if (dx == 0 && dy == 1) maps.push([mx - 1, my + 1])
            if (dx == 1 && dy == 0) maps.push([mx + 1, my - 1])
            if (dx == 1 && dy == 1) maps.push([mx + 1, my + 1])
            if (dx == 0) maps.push([mx - 1, my])
            if (dx == 1) maps.push([mx + 1, my])
            if (dy == 1) maps.push([mx, my + 1])
            if (dy == 0) maps.push([mx, my - 1])
            maps.push([mx, my])

            // load all the maps in parallel
            let c = {}
            maps.forEach(pos => {
                this.blocks.loadXY(pos[0], pos[1], () => {
                    c[pos] = true
                    if (Object.keys(c).length == maps.length) {
                        this.blocks.sort()
                        this.mapLoaded(mx, my)
                        if(onLoad) onLoad()
                    }
                })
            })
        } else {
            if(onLoad) onLoad()
        }
    }

    checkMapPosition(x, y, z) {
        let section = this.sectionAt(x, y)
        if(section) section.checkPosition(x, y, z)
        return false
    }

    static doesSaveGameExist() {
        let dir = path.join(os.homedir(), ".arkona")
        return fs.existsSync(path.join(dir, "state.json"))
    }

    /**
     * Save the game. This currently only saves player state not level state.
     */
    saveGame() {
        let dir = path.join(os.homedir(), ".arkona")
        fs.ensureDirSync(dir)
        fs.writeFileSync(path.join(dir, "state.json"), JSON.stringify({
            version: 1,
            pos: this.player.animatedSprite.sprite.gamePos,
            dir: this.player.lastDir,
            state: this.gameState,
            stats: this.player.alive.getStats()
        }));

        // copy over section data from tmp
        let tmp = path.join(dir, "tmp")
        if(fs.existsSync(tmp)) {
            dir = path.join(dir, "sections")
            fs.ensureDirSync(dir)
            fs.readdirSync(tmp).forEach(file => {
                fs.copySync(path.join(tmp, file), path.join(dir, file))
            })

            // delete the tmp data
            this.clearData(true)
        }

        // save any active sections
        for(let key in this.sections) {
            this.sections[key].save(false)
        }
    }

    clearData(tempSave) {
        let dir = path.join(os.homedir(), ".arkona")
        if(fs.existsSync(dir)) {
            dir = path.join(dir, tempSave ? "tmp" : "sections")
            fs.emptydirSync(dir) // empty or create dir
        }
    }

    loadSection(name, onLoad) {
        // look in tmp first
        let dir = path.join(os.homedir(), ".arkona", "tmp", name)
        if(!fs.existsSync(dir)) {
            // if that fails, look in sections
            dir = path.join(os.homedir(), ".arkona", "sections", name)
        }

        if(fs.existsSync(dir)) {
            let data = fs.readFileSync(dir)
            onLoad(JSON.parse(data))
        } else {
            onLoad(null)
        }
    }

    saveSection(name, tempSave, sectionData) {
        let dir = path.join(os.homedir(), ".arkona")
        fs.ensureDirSync(dir)
        dir = path.join(dir, tempSave ? "tmp" : "sections")
        fs.ensureDirSync(dir)
        fs.writeFileSync(path.join(dir, name), JSON.stringify(sectionData));
    }

    /**
     * Load the game.
     */
    loadGame(startFromSavedGame) {
        let startX = Config.START_X
        let startY = Config.START_Y
        let startZ = 0
        let startDir = Config.DIR_E

        // delete any temporary saved files
        this.clearData(true)

        // if starting a new game, delete old sections data
        if(!startFromSavedGame) {
            this.clearData(false)
            let dir = path.join(os.homedir(), ".arkona")
            fs.removeSync(path.join(dir, "state.json"))
        }

        let dir = path.join(os.homedir(), ".arkona")
        if(startFromSavedGame && fs.existsSync(dir)) {
            let str = fs.readFileSync(path.join(dir, "state.json"))
            if(str) {
                let obj = JSON.parse(str)
                startX = obj.pos[0]
                startY = obj.pos[1]
                startZ = obj.pos[2]
                startDir = obj.dir
                this.gameState = obj.state
                this.player.alive.setStats(obj["stats"])
            }
        }

        this.teleport(startX, startY, startZ, startDir)
    }

    transitionTo(startX, startY, startZ, startDir) {
        this.loading = true // set this so further movement won't start a transition
        this.transition.fadeIn(() => {
            this.teleport(startX, startY, startZ, startDir)
        })
    }

    teleport(x, y, z, dir, onLoad) {
        this.loading = true
        let mx = (x / Config.MAP_SIZE)|0
        let my = (y / Config.MAP_SIZE)|0
        this.blocks.loadXY(mx, my, () => {
            this.player.onLevelStart(x, y, z, dir)
            this.lamp.setVisible(Section.isLamplight(mx, my));
            this.mapLoaded(mx, my)
            this.blocks.sort()

            this.checkMapBoundary(x, y, () => {
                this.transition.fadeOut(() => {
                    this.loading = false
                    if(onLoad) onLoad()
                })
            })
        })
    }

    narrate(message, color) {
        this.allCreaturesStop()
        this.messages.showFirstLine(message, color)
    }

    showOverlay(image, message) {
        let overlay = $("#overlay")
        $("img", overlay).attr("src", "./assets/images/" + image + ".png")
        $(".text", overlay).text(message ? message : "")
        overlay.show()
        $("#overlay-shadow").show();
        this.overlayShowing = true
    }

    hideOverlay() {
        let overlay = $("#overlay")
        overlay.hide()
        $("#overlay-shadow").hide();
        this.overlayShowing = false
    }

    // move along a direction vector
    moveInDir(x, y, z, dir, speed) {
        // run at 100% speed at 60fps (16.666 ms/frame)
        // if game runs slower, increase speed of movement
        let d = (this.game.time.elapsedMS * speed) / 16.666
        // smooth movement, fallback to a delta of 1 if can't maintain fps
        let dx = Math.max(-1, Math.min(1, Config.MOVE_DELTA[dir][0] * d))
        let dy = Math.max(-1, Math.min(1, Config.MOVE_DELTA[dir][1] * d))
        // console.warn("*** " + this.game.time.elapsedMS + " ms, d=" + dx. toFixed(2) + ", " + dy.toFixed(2))
        return [x + dx, y + dy, z]
    }

    getDistanceToPlayer(x, y, z) {
        return dist3d(x, y, z, ...this.player.animatedSprite.sprite.gamePos)
    }

    pause() {
        this.paused = true
    }

    unpause() {
        this.paused = false
    }

    _sectionKey(mapX, mapY) {
        return "" + mapX + "," + mapY
    }

    sectionAt(worldX, worldY) {
        let mapX = (worldX / Config.MAP_SIZE) | 0
        let mapY = (worldY / Config.MAP_SIZE) | 0
        let key = this._sectionKey(mapX, mapY)
        return this.sections[key]
    }

    mapLoaded(mapX, mapY) {
        let key = this._sectionKey(mapX, mapY)
        if(this.sections[key] == null) {
            this.sections[key] = new Section(mapX, mapY, this)
        }
    }

    mapUnloaded(mapX, mapY) {
        let key = this._sectionKey(mapX, mapY)
        if(this.sections[key] != null) {
            this.sections[key].unload()
            delete this.sections[key]
        }
    }

    isAllowed(action) {
        if(action && action.getPos()) {
            let section = this.sectionAt(...action.getPos())
            if (section) return section.isAllowed(action)
        }
        return true
    }

    getAction(pos, action) {
        let section = this.sectionAt(...pos)
        if (section) return section.getAction(pos, action)
    }

    allCreaturesStop() {
        for(let key in this.sections) {
            this.sections[key].npcs.forEach(npc => npc.animatedSprite.setAnimation("stand", npc.dir))
        }
        if(this.player.animatedSprite) this.player.animatedSprite.setAnimation("stand", this.player.lastDir)
    }

    useDoor(doorSprite) {
        let newDoor = Config.getOppositeDoor(doorSprite.name)
        if(this.blocks.objectLayer.canFitByName(newDoor, doorSprite.gamePos[0], doorSprite.gamePos[1], doorSprite.gamePos[2], doorSprite)) {
            this.blocks.replace(doorSprite, newDoor)
        } else {
            // todo: play denied sound
        }
    }

    levelUp() {
        let levelUp = $("#level-up")
        levelUp.css("font-size", "20px")
        levelUp.show()
        levelUp.animate({ fontSize: "64px" }, 1000)
        levelUp.fadeOut()
        this.player.alive.levelUp()
    }

    startMovie(name) {
        this.movie = Movies.MOVIES[name]
        this.movieSceneIndex = 0
        this.movie[this.movieSceneIndex].scene(this)
        console.log("Starting movie " + name + " index=" + this.movieSceneIndex + "/" + this.movie.length)
    }

    updateMovie() {
        if(this.movie && this.movie[this.movieSceneIndex].endCondition(this)) {
            this.movieSceneIndex++
            console.log("Next scene=" + this.movieSceneIndex + "/" + this.movie.length)
            if(this.movieSceneIndex >= this.movie.length) {
                this.movie = null
            } else {
                this.movie[this.movieSceneIndex].scene(this)
            }
        }
        return this.movie != null
    }

    getNpcByName(name) {
        for (let key in this.sections) {
            let section = this.sections[key]
            let npc = section.getNpcByName(name)
            if(npc) return npc
        }
        return null
    }

    setCheckpoint() {
        this.checkpoint = Date.now()
    }

    addMonster(monster, worldX, worldY, worldZ) {
        let monsterInfo = { monster: monster, pos: [ [worldX, worldY, worldZ] ] }
        let section = this.sectionAt(worldX, worldY)
        return section.addNpc({
            x: worldX,
            y: worldY,
            z: worldZ,
            creature: monster.creature,
            options: {
                movement: Config.MOVE_ATTACK,
                monster: monster,
                monsterInfo: monsterInfo
            }
        })
    }
}
