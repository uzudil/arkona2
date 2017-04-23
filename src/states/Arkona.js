import Phaser from "phaser"
import $ from "jquery"
import Block from "../world/Block"
import * as Config from "../config/Config"
import Player from "../models/Player"
import Level from "../models/Level"
import Messages from "../ui/Messages"
import ConvoUI from "../ui/ConvoUI"
import Transition from "../ui/Transition"
import InGameMenu from "../ui/InGameMenu"
import Lamp from "../ui/Lamp"
import * as Queue from "../actions/Queue"
import MouseClickAction from "../actions/MouseClickAction"
import Stats from "stats.js"
import Damages from "../ui/Damages"
import Device from "../ui/Device"
import { dist3d } from "../utils"

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
        this.level = null
        this.overlayShowing = false
        this.actionQueue = new Queue.Queue(this)
        this.mouseClickAction = new MouseClickAction()
        this.player = new Player(this)
        this.paused = false
        this.lastPos = null

        // controls
        this.cursors = this.game.input.keyboard.createCursorKeys()
        this.space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
        this.esc = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC)
        this.t_key = this.game.input.keyboard.addKey(Phaser.Keyboard.T)
        this.a_key = this.game.input.keyboard.addKey(Phaser.Keyboard.A)

        // ui (order matters)
        this.blocks = new Block(this)
        this.level = new Level(this)
        this.damages = new Damages(this)
        this.lamp = new Lamp(this)
        this.device = new Device(this)
        this.messages = new Messages(this)
        this.convoUi = new ConvoUI(this)
        this.transition = new Transition()
        this.inGameMenu = new InGameMenu(this)

        if(document.location.hostname == "localhost") {
            this.stats = new Stats();
            this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            this.phaserStatsPanel = this.stats.addPanel( new Stats.Panel( "SP", "#ff8", "#221" ) );
            document.body.appendChild(this.stats.dom);
        } else {
            this.stats = null
            this.phaserStatsPanel = null
        }

        // start game
        // this.loadGame(this.startFromSavedGame)
        this.loading = true
        let mx = (Config.START_X / Config.MAP_SIZE)|0
        let my = (Config.START_Y / Config.MAP_SIZE)|0
        let px = Config.START_Y % Config.MAP_SIZE
        let py = Config.START_Y % Config.MAP_SIZE
        this.blocks.loadXY(mx, my, () => {
            this.player.onLevelStart(px, py, Config.DIR_W)
            // this.lamp.setVisible(this.level.info["lamplight"]);
            this.transition.fadeOut(() => {
                this.loading = false
            })
        })

        // for debug/hacking
        window.arkona = this
    }

    update() {
        if(this.stats) {
            this.stats.begin()
        }

        if(this.loading || !this.player.animatedSprite) return

        this.blocks.update()

        if(!this.paused && !this.updateUI()) {

            // show damage texts
            this.damages.update()

            // assemble the actions
            if(this.level.npcs) this.actionQueue.add(Queue.MOVE_NPC, this.level.npcs)
            if(this.level.generators) this.actionQueue.add(Queue.GENERATORS, this.level.generators)

            let moving = this.isCursorKeyDown()
            if (moving) {
                let dir = this.getDirFromCursorKeys()
                if (dir != null) this.actionQueue.add(Queue.MOVE_PLAYER, dir)
            }

            if (this.t_key.justDown) this.actionQueue.add(Queue.TALK)
            if (this.space.justDown) this.actionQueue.add(Queue.USE_OBJECT)
            if (this.a_key.justDown) this.actionQueue.add(Queue.ATTACK)

            let underMouse = this.getSpriteUnderMouse()
            if (underMouse && this.game.input.activePointer.justReleased(25)) {
                this.actionQueue.add(Queue.CLICK, underMouse)
            }

            // run the actions
            if(this.actionQueue.update()) {
                this.blocks.sort()
            }

            this.player.update(moving)
        }

        this.level.onLoad()

        if(this.stats) {
            this.stats.end()
            this.phaserStatsPanel.update(this.world.camera.totalInView, this.stage.currentRenderOrderID)
        }
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
            if (this.esc.justDown || this.space.justDown) {
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
                this.convoUi.end()
            } else if (this.space.justDown) {
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

    // eslint-disable-next-line no-unused-vars
    checkMapBoundary(px, py, dir) {
        if(this.loading) return

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
            let c = 0
            maps.forEach(pos => {
                // console.warn("Loading map: " + pos[0] + "," + pos[1])
                this.blocks.loadXY(pos[0], pos[1], () => {
                    c++
                    if (c == maps.length) {
                        this.blocks.sort()
                        this.loading = false
                    }
                })
            })
        }

        // let dst = this.level.checkBounds(this, px, py)
        // if(dst) {
        // 	this.transitionToLevel(dst.map, dst.x, dst.y, dst.dir)
        // }
    }

    // eslint-disable-next-line no-unused-vars
    checkMapPosition(x, y, z) {
        // let dst = this.level.checkPos(this, x, y, z)
        // if(dst) {
        // 	this.transitionToLevel(dst.map, dst.x, dst.y, dst.dir)
        // 	return true
        // }
        // return false
    }

    static doesSaveGameExist() {
        return window.localStorage["arkona"] != null
    }

    /**
     * Save the game. This currently only saves player state not level state.
     */
    saveGame() {
        window.localStorage["arkona"] = JSON.stringify({
            version: 1,
            levelx: this.blocks.x,
            levely: this.blocks.y,
            pos: this.player.animatedSprite.sprite.gamePos,
            dir: this.player.lastDir,
            state: this.gameState
        })
    }

    /**
     * Load the game. This currently only loads player state not level state.
     */
    // loadGame(startFromSavedGame) {
        // if(startFromSavedGame) {
        //     let savegameStr = window.localStorage["arkona2"]
        //     if (savegameStr) {
        //         let savegame = JSON.parse(savegameStr)
        //         if (savegame) {
        //             this.gameState = savegame.state
        //             this.loadLevel(savegame.levelx, savegame.levely, savegame.pos[0], savegame.pos[1], savegame.dir)
        //             return
        //         }
        //     }
        // }
        // this.loadLevel(Config.START_MAP_X, Config.START_MAP_Y, 64, 64, Config.DIR_W)
    // }

    narrate(message) {
        this.messages.showFirstLine(message)
    }

    showOverlay(image, message) {
        let overlay = $("#overlay")
        $("img", overlay).attr("src", "/assets/images/" + image + ".png")
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
        let d = this.game.time.elapsedMS / (60 * speed)
        // smooth movement, fallback to a delta of 1 if can't maintain fps
        let dx = Math.max(-1, Math.min(1, Config.MOVE_DELTA[dir][0] * d))
        let dy = Math.max(-1, Math.min(1, Config.MOVE_DELTA[dir][1] * d))
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
}