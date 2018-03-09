import Phaser from "phaser"
import Block, { isFlat } from "../world/Block"
import {BLOCKS} from "../config/Blocks"
import {getRandom} from "../utils"
import * as Config from "../config/Config"
import Palette from "../editor/Palette"
import $ from "jquery"
import {getLogger} from "../config/Logger"

// electron has to be included like this: https://github.com/electron/electron/issues/7300
const electron = window.require("electron")

export default class extends Phaser.State {

    init() {
    }

    preload() {
        // adjust canvas
        $("#content").css("float", "left")
        $("#palette").height((Config.HEIGHT - 46) + "px")

        // make window bigger
        electron.remote.getCurrentWindow().setSize(1400, 800)

        document.getElementById("new-map").onclick = () => {
            $("#new-map-dialog").show()
            $("#new-map-name").focus()
        }
        $("#new-map-cancel").click(() => $("#new-map-dialog").hide())
        $("#new-map-ok").click(() => {
            $("#new-map-dialog").hide()
            this.startNewMap(parseInt($("#new-map-type").val()))
        })

        document.getElementById("save-map").onclick = () => {
            this.blocks.fixEdges()
            this.blocks.save(this.x, this.y)
            alert("Map saved.")
        }
        document.getElementById("load-map").onclick = () => {
            let pos = prompt("Map name:").split(",").map(s => parseInt(s, 10))
            this.x = pos[0]
            this.y = pos[1]
            this.blocks.loadXY(this.x, this.y, null, null)
        }
        $(".toggle-roof").click((event) => this.blocks.toggleRoof($(event.currentTarget).data("height")))
        document.getElementById("fix-edges").onclick = () => {
            this.blocks.fixEdges()
        }

        document.getElementById("editor-info-close").onclick = () => {
            $("#editor-info").toggle()
        }
        
    }

    create() {
        this.x = 0
        this.y = 0
        this.blocks = new Block(this, true)
        this.blocks.loadXY(this.x, this.y, null,
            // eslint-disable-next-line no-unused-vars
            (_) => this.blocks.newMap(this.x, this.y, Config.MAP_SIZE, Config.MAP_SIZE, "grass"))

        this.activeBlock = null
        this.lastBlock = null
        this.palette = new Palette(this)

        var style = {font: "bold 14px Arial", fill: "#fff", boundsAlignH: "left", boundsAlignV: "top"};

        //  The Text is positioned at 0, 100
        this.posLabel = this.game.add.text(0, 0, "Pos: ", style);
        this.posLabel.setShadow(1, 1, "rgba(0,0,0,1)", 2);
        this.posLabel.setTextBounds(0, 0, 800, 20);

        // keyboard
        this.cursors = this.game.input.keyboard.createCursorKeys()
        this.ground1 = this.game.input.keyboard.addKey(Phaser.Keyboard.ONE)
        this.ground2 = this.game.input.keyboard.addKey(Phaser.Keyboard.TWO)
        this.ground3 = this.game.input.keyboard.addKey(Phaser.Keyboard.THREE)
        this.ground4 = this.game.input.keyboard.addKey(Phaser.Keyboard.FOUR)
        this.ground5 = this.game.input.keyboard.addKey(Phaser.Keyboard.FIVE)
        this.ground6 = this.game.input.keyboard.addKey(Phaser.Keyboard.SIX)
        this.ground7 = this.game.input.keyboard.addKey(Phaser.Keyboard.SEVEN)
        this.ground8 = this.game.input.keyboard.addKey(Phaser.Keyboard.EIGHT)
        this.ground9 = this.game.input.keyboard.addKey(Phaser.Keyboard.NINE)
        this.ground0 = this.game.input.keyboard.addKey(Phaser.Keyboard.ZERO)
        this.groundA = this.game.input.keyboard.addKey(Phaser.Keyboard.A)
        this.groundB = this.game.input.keyboard.addKey(Phaser.Keyboard.B)
        this.groundC = this.game.input.keyboard.addKey(Phaser.Keyboard.C)
        this.tree = this.game.input.keyboard.addKey(Phaser.Keyboard.T)
        this.tree2 = this.game.input.keyboard.addKey(Phaser.Keyboard.Y)
        this.mountain = this.game.input.keyboard.addKey(Phaser.Keyboard.M)
        this.delete = this.game.input.keyboard.addKey(Phaser.Keyboard.D)
        this.shift = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT)
        this.dungeon = this.game.input.keyboard.addKey(Phaser.Keyboard.N)
        this.undo = this.game.input.keyboard.addKey(Phaser.Keyboard.Z)
        this.flood = this.game.input.keyboard.addKey(Phaser.Keyboard.F)
        this.forest = this.game.input.keyboard.addKey(Phaser.Keyboard.R)
        this.esc = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC)
    }

    render() {
    }

    setActiveBlock(name) {
        if (this.activeBlock) this.activeBlock.destroy()
        if(name) {
            let [x, y, z] = this.blocks.toWorldCoords(this.game.input.x, this.game.input.y)
            this.activeBlock = this.blocks.set(name, x, y, z, true)
        } else {
            this.activeBlock = null
        }
        this.addNew = false
    }

    moveCamera() {
        if (this.cursors.up.isDown && !this.cursors.up.ctrlKey) {
            this.blocks.move(0, Config.GRID_SIZE)
        } else if (this.cursors.down.isDown && !this.cursors.down.ctrlKey) {
            this.blocks.move(0, -Config.GRID_SIZE)
        }

        if (this.cursors.left.isDown && !this.cursors.left.ctrlKey) {
            this.blocks.move(Config.GRID_SIZE, 0)
        } else if (this.cursors.right.isDown && !this.cursors.right.ctrlKey) {
            this.blocks.move(-Config.GRID_SIZE, 0)
        }
    }

    moveMap() {
        let x = this.x
        let y = this.y
        if (this.cursors.up.justDown && this.cursors.up.ctrlKey) {
            y--
        } else if (this.cursors.down.justDown && this.cursors.down.ctrlKey) {
            y++
        } else if (this.cursors.left.justDown && this.cursors.left.ctrlKey) {
            x--
        } else if (this.cursors.right.justDown && this.cursors.right.ctrlKey) {
            x++
        }

        if((x >= 0 && x != this.x && x < Config.MAX_MAP_X + 4) || (y >= 0 && y != this.y && y < Config.MAX_MAP_Y + 4)) {
            if(this.blocks.isUpdated()) {
                getLogger("EDITOR").warn("Saving map: " + this.x + "," + this.y)
                this.blocks.fixEdges()
                this.blocks.save(this.x, this.y)
            }
            this.blocks.destroy()
            this.blocks.checkWorld()
            this.x = x
            this.y = y
            getLogger("EDITOR").warn("Loading map: " + x + "," + y)
            this.blocks.loadXY(x, y, () => getLogger("EDITOR").warn("Success"),
                // eslint-disable-next-line no-unused-vars
                (_) => {
                    getLogger("EDITOR").warn("Error: making new file")
                    this.blocks.newMap(x, y, Config.MAP_SIZE, Config.MAP_SIZE, x < Config.MAX_MAP_X && y < Config.MAX_MAP_Y ? "water" : "dungeon")
                })
        }
    }

    drawDungeon() {
        // find the starting point
        if (this.dungeon.justDown) {

            let dungeonType = this.dungeon.ctrlKey ? "2" : ""

            // delete everything except the floor
            this.blocks.stampLayer.reset()
            this.blocks.edgeLayer.reset()
            this.blocks.objectLayer.reset()
            for (let xx = 0; xx < Config.MAP_SIZE; xx += Config.GROUND_TILE_W) {
                for (let yy = 0; yy < Config.MAP_SIZE; yy += Config.GROUND_TILE_H) {
                    if (this.blocks.getFloor(xx, yy) == null) {
                        this.blocks.set("dungeon.floor.black", xx, yy, 0)
                    }
                }
            }

            // draw walls
            this._drawDungeonWalls(dungeonType)

            // draw earth outside the walls
            for (let xx = 0; xx < Config.MAP_SIZE; xx += Config.GROUND_TILE_W) {
                for (let yy = 0; yy < Config.MAP_SIZE; yy += Config.GROUND_TILE_H) {
                    if(this.blocks.getFloor(xx, yy) == "dungeon.floor.black" &&
                        this.blocks.getFloor(xx + Config.GROUND_TILE_W, yy) == "dungeon.floor.black" &&
                        this.blocks.getFloor(xx, yy + Config.GROUND_TILE_H) == "dungeon.floor.black" &&
                        this.blocks.getFloor(xx + Config.GROUND_TILE_W, yy + Config.GROUND_TILE_H) == "dungeon.floor.black") {
                        this.blocks.clear("dungeon.floor.black", xx, yy, 0)
                        this.blocks.clear("dungeon.floor.black", xx + Config.GROUND_TILE_W, yy, 0)
                        this.blocks.clear("dungeon.floor.black", xx, yy + Config.GROUND_TILE_H, 0)
                        this.blocks.clear("dungeon.floor.black", xx + Config.GROUND_TILE_W, yy + Config.GROUND_TILE_H, 0)
                        this.blocks.set("dungeon" + dungeonType + ".block.big", xx + Config.GROUND_TILE_W, yy + Config.GROUND_TILE_H, 0)
                    }
                }
            }
            for (let xx = 0; xx < Config.MAP_SIZE; xx += Config.GROUND_TILE_W) {
                for (let yy = 0; yy < Config.MAP_SIZE; yy += Config.GROUND_TILE_H) {
                    if(this.blocks.getFloor(xx, yy) == "dungeon.floor.black") {
                        this.blocks.clear("dungeon.floor.black", xx, yy, 0)
                        this.blocks.set("dungeon" + dungeonType + ".block", xx, yy, 0)
                    }
                }
            }
            this.blocks.sort()
        }
    }

    _drawDungeonWalls(dungeonType) {
        for (let xx = 0; xx < Config.MAP_SIZE; xx += Config.GROUND_TILE_W) {
            for (let yy = 0; yy < Config.MAP_SIZE; yy += Config.GROUND_TILE_H) {
                if (this.blocks.getFloor(xx, yy) == "dungeon" + dungeonType + ".floor") {
                    this._drawDungeonAt(xx, yy, {}, dungeonType)
                    return
                }
            }
        }
    }

    _isOffMap(x, y) {
        return x < 0 || y < 0 || x >= Config.MAP_SIZE || y >= Config.MAP_SIZE
    }

    _isFloor(x, y, floorName) {
        return this.blocks.getFloor(x, y) == floorName
    }

    _isOffMapOrFloor(x, y, floorName) {
        return this._isOffMap(x, y) || this._isFloor(x, y, floorName)
    }

    _drawDungeonAt(x, y, seen, dungeonType) {
        if(!seen[x + "." + y]) {
            seen[x + "." + y] = true

            let dungeonFloorName = "dungeon" + dungeonType + ".floor"
            for (let xx = x - Config.GROUND_TILE_W; xx < x; xx++) {
                for (let yy = y - Config.GROUND_TILE_H; yy < y; yy++) {
                    this.blocks.clear("dungeon" + dungeonType + ".col.nw", xx + 1, yy + 1, 0)
                }
            }

            let w = this._isOffMapOrFloor(x - Config.GROUND_TILE_W, y, dungeonFloorName)
            let e = this._isOffMapOrFloor(x + Config.GROUND_TILE_W, y, dungeonFloorName)
            let n = this._isOffMapOrFloor(x, y - Config.GROUND_TILE_W, dungeonFloorName)
            let s = this._isOffMapOrFloor(x, y + Config.GROUND_TILE_W, dungeonFloorName)
            let nw = this._isOffMapOrFloor(x - Config.GROUND_TILE_W, y - Config.GROUND_TILE_W, dungeonFloorName)
            let ne = this._isOffMapOrFloor(x + Config.GROUND_TILE_W, y - Config.GROUND_TILE_W, dungeonFloorName)
            let sw = this._isOffMapOrFloor(x - Config.GROUND_TILE_W, y + Config.GROUND_TILE_W, dungeonFloorName)
            let se = this._isOffMapOrFloor(x + Config.GROUND_TILE_W, y + Config.GROUND_TILE_W, dungeonFloorName)

            // getLogger("EDITOR").warn("pos=" + x + "," + y + " n=" + n + " s=" + s + " e=" + e + " w=" + w + " nw=" + nw + " ne=" + ne + " sw=" + sw + " se=" + se)

            if (w && e && n && s && nw && ne && sw && se) {
                // nada
            } else if (w && e && n && s && !nw && ne && sw && se) {
                this.blocks.set("dungeon" + dungeonType + ".col.nw", x - Config.GROUND_TILE_W + 1, y - Config.GROUND_TILE_H + 1, 0)
            } else if (w && e && n && s && nw && !ne && sw && se) {
                this.blocks.set("dungeon" + dungeonType + ".col.nw", x, y - Config.GROUND_TILE_H + 1, 0)
            } else if (w && e && n && s && nw && ne && sw && !se) {
                this.blocks.set("dungeon" + dungeonType + ".col.nw", x, y, 0)
            } else if (w && e && n && s && nw && ne && !sw && se) {
                this.blocks.set("dungeon" + dungeonType + ".col.nw", x - Config.GROUND_TILE_W + 1, y, 0)
            } else if (!w && n && s) {
                this.blocks.set("dungeon" + dungeonType + ".w.4", x - Config.GROUND_TILE_W + 1, y, 0)
            } else if (!e && n && s) {
                this.blocks.set("dungeon" + dungeonType + ".e.4", x, y, 0)
            } else if (w && e && !n) {
                this.blocks.set("dungeon" + dungeonType + ".n.4", x, y - Config.GROUND_TILE_H + 1, 0)
            } else if (w && e && !s) {
                this.blocks.set("dungeon" + dungeonType + ".s.4", x, y, 0)
            } else if (e && s) {
                this.blocks.set("dungeon" + dungeonType + ".col.se", x - Config.GROUND_TILE_W + 1, y - Config.GROUND_TILE_H + 1, 0)
                this.blocks.set("dungeon" + dungeonType + ".n.3", x, y - Config.GROUND_TILE_H + 1, 0)
                this.blocks.set("dungeon" + dungeonType + ".w.3", x - Config.GROUND_TILE_W + 1, y, 0)
            } else if (e && n) {
                this.blocks.set("dungeon" + dungeonType + ".col.se", x - Config.GROUND_TILE_W + 1, y, 0)
                this.blocks.set("dungeon" + dungeonType + ".s.3", x, y, 0)
                this.blocks.set("dungeon" + dungeonType + ".w.3", x - Config.GROUND_TILE_W + 1, y - 1, 0)
            } else if (w && n) {
                this.blocks.set("dungeon" + dungeonType + ".col.se", x, y, 0)
                this.blocks.set("dungeon" + dungeonType + ".s.3", x - 1, y, 0)
                this.blocks.set("dungeon" + dungeonType + ".e.3", x, y - 1, 0)
            } else if (w && s) {
                this.blocks.set("dungeon" + dungeonType + ".col.se", x, y - Config.GROUND_TILE_H + 1, 0)
                this.blocks.set("dungeon" + dungeonType + ".n.3", x - 1, y - Config.GROUND_TILE_H + 1, 0)
                this.blocks.set("dungeon" + dungeonType + ".e.3", x, y, 0)
            }

            // only recurse if direction is still on map
            w = this._isFloor(x - Config.GROUND_TILE_W, y, dungeonFloorName)
            e = this._isFloor(x + Config.GROUND_TILE_W, y, dungeonFloorName)
            n = this._isFloor(x, y - Config.GROUND_TILE_W, dungeonFloorName)
            s = this._isFloor(x, y + Config.GROUND_TILE_W, dungeonFloorName)
            nw = this._isFloor(x - Config.GROUND_TILE_W, y - Config.GROUND_TILE_W, dungeonFloorName)
            ne = this._isFloor(x + Config.GROUND_TILE_W, y - Config.GROUND_TILE_W, dungeonFloorName)
            sw = this._isFloor(x - Config.GROUND_TILE_W, y + Config.GROUND_TILE_W, dungeonFloorName)
            se = this._isFloor(x + Config.GROUND_TILE_W, y + Config.GROUND_TILE_W, dungeonFloorName)

            if (w) this._drawDungeonAt(x - Config.GROUND_TILE_W, y, seen, dungeonType)
            if (e) this._drawDungeonAt(x + Config.GROUND_TILE_W, y, seen, dungeonType)
            if (n) this._drawDungeonAt(x, y - Config.GROUND_TILE_W, seen, dungeonType)
            if (s) this._drawDungeonAt(x, y + Config.GROUND_TILE_W, seen, dungeonType)
            if (nw) this._drawDungeonAt(x - Config.GROUND_TILE_W, y - Config.GROUND_TILE_W, seen, dungeonType)
            if (ne) this._drawDungeonAt(x + Config.GROUND_TILE_W, y - Config.GROUND_TILE_W, seen, dungeonType)
            if (sw) this._drawDungeonAt(x - Config.GROUND_TILE_W, y + Config.GROUND_TILE_W, seen, dungeonType)
            if (se) this._drawDungeonAt(x + Config.GROUND_TILE_W, y + Config.GROUND_TILE_W, seen, dungeonType)
        }
    }

    drawForest() {
        if(this.forest.justDown) {
            for(let x = 0; x < Config.MAP_SIZE; x++) {
                for(let y = 0; y < Config.MAP_SIZE; y++) {
                    if(this.forest.shiftKey) {
                        this.drawDesertAt(x, y)
                    } else if(this.forest.ctrlKey) {
                        this.drawSwampAt(x, y)
                    } else {
                        this.drawForestAt(x, y)
                    }
                }
            }
        }
    }

    drawForestAt(x, y) {
        if(Math.random() > 0.95) {
            if(Math.random() < 0.75) {
                this._drawTree(x, y);
            } else {
                let name = getRandom([...Array(3).fill("bush"), ...Array(3).fill("dead"), ...Array(3).fill("rock.1"), ...Array(3).fill("rock.2"), "trunk.broken"])
                let block = BLOCKS[name]
                if(this.blocks.isFree(x, y, 0, ...block.size) && this.blocks.isFloorSafeForShape(x, y, name)) {
                    this.blocks.clear(name, x, y, 0)
                    this.blocks.set(name, x, y, 0)
                }
            }
        }
    }

    drawDesertAt(x, y) {
        if(Math.random() > 0.96) {
            let name = getRandom([...Array(3).fill("cactus.1"), ...Array(3).fill("cactus.2"), ...Array(3).fill("cactus.3"),
                ...Array(2).fill("rock.1"), ...Array(2).fill("rock.2"),
                "dead",
                "bones.1",
                "dunes"])
            let block = BLOCKS[name]
            if(this.blocks.isFree(x, y, 0, ...block.size) && this.blocks.getFloor(x, y) == "sand") {
                this.blocks.clear(name, x, y, 0)
                this.blocks.set(name, x, y, 0)
            }
        }
    }

    drawSwampAt(x, y) {
        let block = BLOCKS["4x4x4.placeholder"]
        if(this.blocks.isFree(x, y, 0, ...block.size) && (this.blocks.getFloor(x, y) == "swamp1" || this.blocks.getFloor(x, y) == "swamp2")) {
            if (Math.random() > 0.75) {
                if (0.7 <= Math.random()) {
                    this._drawTree(x, y);
                } else {
                    let name = getRandom([...Array(2).fill("rock.1"), ...Array(2).fill("rock.2"), ...Array(3).fill("corn"), "trunk.broken", ...Array(3).fill("bush"), "dead"])
                    let block = BLOCKS[name]
                    if (this.blocks.isFree(x, y, 0, ...block.size)) {
                        this.blocks.clear(name, x, y, 0)
                        this.blocks.set(name, x, y, 0)
                    }

                }
            }
        }
    }

    drawFlood(x, y) {
        if(this.flood.justDown) {
            let gx = ((x / Config.GROUND_TILE_W) | 0) * Config.GROUND_TILE_W
            let gy = ((y / Config.GROUND_TILE_H) | 0) * Config.GROUND_TILE_H
            let check = this.blocks.getFloor(gx, gy)
            this._drawFlood(gx, gy, check, {}, this.flood.ctrlKey ? "grass" : (this.flood.shiftKey ? "sand" : "water" ))
        }
    }

    _drawFlood(x, y, check, seen, floodName) {
        let key = "" + x + "." + y
        if(seen[key] != null || !this.blocks.isInBounds(x, y)) return

        seen[key] = true
        let ground = this.blocks.getFloor(x, y)
        if(ground == check) {
            this.blocks.clear("grass", x, y, 0)
            this.blocks.set(floodName, x, y, 0)

            this._drawFlood(x - Config.GROUND_TILE_W, y, check, seen, floodName)
            this._drawFlood(x + Config.GROUND_TILE_W, y, check, seen, floodName)
            this._drawFlood(x, y - Config.GROUND_TILE_W, check, seen, floodName)
            this._drawFlood(x, y + Config.GROUND_TILE_W, check, seen, floodName)
        }
    }

    drawGround(x, y) {
        let gx = ((x / Config.GROUND_TILE_W) | 0) * Config.GROUND_TILE_W
        let gy = ((y / Config.GROUND_TILE_H) | 0) * Config.GROUND_TILE_H

        let ground = null
        if (this.ground1.isDown) {
            ground = "grass"
        } else if (this.ground2.isDown) {
            ground = "mud"
        } else if (this.ground3.isDown) {
            ground = "sand"
        } else if (this.ground4.isDown) {
            ground = "moss"
        } else if (this.ground5.isDown) {
            ground = "water"
        } else if (this.ground6.isDown) {
            ground = "road"
        } else if (this.ground7.isDown) {
            ground = "scree"
        } else if (this.ground8.isDown) {
            ground = "bramble"
        } else if (this.ground9.isDown) {
            ground = "lava"
        } else if (this.ground0.isDown) {
            ground = "dungeon.floor"
        } else if (this.groundC.isDown) {
            ground = "dungeon2.floor"
        } else if (this.groundA.isDown) {
            ground = "dungeon.floor.black"
        } else if (this.groundB.isDown) {
            ground = Math.random() < 0.5 ? "swamp1" : "swamp2"
        }

        if (ground) {
            this.blocks.clear("grass", gx, gy, 0)
            this.blocks.set(ground, gx, gy, 0)
        }
    }

    drawObject(x, y) {
        if ((this.tree.isDown || this.tree2.isDown)) {
            this._drawTree(x, y, this.tree2.isDown);
        } else if (this.mountain.isDown) {
            let mx = ((x/8)|0)*8+4
            let my = ((y/8)|0)*8+4
            if(this.blocks.isFree(mx, my, 0, 8, 8, 8)) {
                let name = getRandom([...Array(3).fill("mtn.ctr"), ...Array(3).fill("mtn.ctr.2"), "mtn.ctr.2.snow"])
                this.blocks.clear(name, mx, my, 0)
                this.blocks.set(name, mx, my, 0)
                this.blocks.sort()
            }
        }
    }

    _drawTree(x, y, unpassable) {
        if(this.blocks.isFree(x, y, 0, 4, 4, 8) && this.blocks.isFloorSafeForShape(x, y, "trunk")) {
            if(this.blocks.getFloor(x, y, true) == "sand") {
                this.blocks.clear("trunk.palm", x, y, 0)
                this.blocks.set("trunk.palm", x, y, 0)
                this.blocks.clear("palm", x + 1, y + 2, 8)
                this.blocks.set("palm", x + 1, y + 2, 8)
            } else if(this.blocks.getFloor(x, y, true) == "swamp1" || this.blocks.getFloor(x, y, true) == "swamp2") {
                this.blocks.clear("trunk", x, y, 0)
                this.blocks.set("trunk", x, y, 0)
                if(Math.random() < 0.8) {
                    this.blocks.clear("willow", x + 2, y + 2, 4)
                    this.blocks.set("willow", x + 2, y + 2, 4)
                } else {
                    let name = getRandom([...Array(1).fill("pine"), ...Array(1).fill("pine2")])
                    this.blocks.clear(name, x, y, 4)
                    this.blocks.set(name, x, y, 4)
                }
            } else {
                if (unpassable) {
                    this.blocks.clear("trunk.wide", x, y, 0)
                    this.blocks.set("trunk.wide", x, y, 0)
                } else {
                    this.blocks.clear("trunk", x, y, 0)
                    this.blocks.set("trunk", x, y, 0)
                }

                let name = getRandom([...Array(4).fill("oak"), ...Array(3).fill("pine"), ...Array(3).fill("pine2"), "brown"])
                this.blocks.clear(name, x, y, 4)
                this.blocks.set(name, x, y, 4)
            }
            this.blocks.sort()
        }
    }

    // process esc outside of the usual inputs
    escPressed() {
        if (this.activeBlock) {
            this.setActiveBlock(null)
        } else {
            $("#editor-info").toggle()
        }
    }

    update() {
        this.blocks.update()

        if ($(".dialog").is(":visible") && !$("#editor-info").is(":visible")) {
            this.game.input.enabled = false;
            return
        } else {
            this.game.input.enabled = true;
        }

        if (this.undo.justDown && this.lastBlock) {
            this.blocks.clear(this.lastBlock.name, ...this.lastBlock.gamePos)
            this.lastBlock = null
        }

        if(this.esc.justDown) this.escPressed()

        this.moveMap()
        this.moveCamera()

        // find the top object under the mouse
        this.blocks.highlight(this.blocks.getTopSpriteAt(this.game.input.x, this.game.input.y))

        // find new top z
        let [x, y, z] = this.blocks.toWorldCoords(this.game.input.x, this.game.input.y)
        z = this.blocks.getTopAt(x, y, this.activeBlock)

        this.drawForest()
        if (this.blocks.isInBounds(x, y)) {
            this.drawFlood(x, y)
            this.drawGround(x, y)
            this.drawObject(x, y)
            this.drawDungeon()
        }
        this.deleteShape(x, y)

        this.blocks.drawCursor(x, y, z)

        if (this.activeBlock) {
            // handle click
            if (this.game.input.activePointer.isDown && this.addNew && this.blocks.isInBounds(x, y)) {
                if (isFlat(this.activeBlock)) {
                    if(!this.blocks.isStamp(this.activeBlock.name)) {
                        this.blocks.clear("grass", x, y, 0)
                    }
                    this.lastBlock = this.blocks.set(this.activeBlock.name, x, y, 0)
                } else {
                    this.lastBlock = this.blocks.set(this.activeBlock.name, x, y, z)
                }

                z = this.blocks.getTopAt(x, y, this.activeBlock)
                this.addNew = false // only add one
            }
            if (!this.game.input.activePointer.isDown) this.addNew = true

            // move active block to new position
            this.blocks.moveTo(this.activeBlock, x, y, z, true)

            this.blocks.sort()
        }
        this.posLabel.text = "Map:" +
            this.x + "-" + this.y +
            " Pos: " + (this.x * Config.MAP_SIZE + x) + "," + (this.y * Config.MAP_SIZE + y) + "," + z +
            (this.blocks.highlightedSprite ?
                " Shape:" + (this.x * Config.MAP_SIZE + this.blocks.highlightedSprite.gamePos[0]) + "," + (this.y * Config.MAP_SIZE + this.blocks.highlightedSprite.gamePos[1]) + "," + this.blocks.highlightedSprite.gamePos[2] :
                "")
    }

    deleteShape(x, y) {
        if (this.delete.justDown) {
            if(this.blocks.highlightedSprite) {
                this.blocks.clearSprite(this.blocks.highlightedSprite)
            } else if(this.shift.isDown) {
                // stamps are hard to clean...
                let found = false
                for (let xx = -4; xx < 4; xx++) {
                    for (let yy = -4; yy < 4; yy++) {
                        let b = this.blocks.clear("ashes.big", x - 1 + xx, y - 1 + xx, 0)
                        if(b) found = true
                    }
                }
                // clear ground
                if(!found) {
                    for (let xx = -4; xx < 4; xx++) {
                        for (let yy = -4; yy < 4; yy++) {
                            this.blocks.clear("grass", x - 1 + xx, y - 1 + xx, 0)
                        }
                    }
                }
            }
        }
    }

    startNewMap(type) {
        this.blocks.newMap(Config.MAP_SIZE, Config.MAP_SIZE, type)
    }
}
