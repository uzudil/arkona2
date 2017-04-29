import Phaser from "phaser"
import Block, { isFlat } from "../world/Block"
import {BLOCKS} from "../config/Blocks"
import {getRandom} from "../utils"
import * as Config from "../config/Config"
import Palette from "../editor/Palette"
import $ from "jquery"

export default class extends Phaser.State {

    init() {
    }

    preload() {
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
        this.tree = this.game.input.keyboard.addKey(Phaser.Keyboard.T)
        this.tree2 = this.game.input.keyboard.addKey(Phaser.Keyboard.Y)
        this.mountain = this.game.input.keyboard.addKey(Phaser.Keyboard.M)
        this.delete = this.game.input.keyboard.addKey(Phaser.Keyboard.D)
        this.shift = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT)
        this.esc = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC)
        this.dungeon = this.game.input.keyboard.addKey(Phaser.Keyboard.N)
        this.undo = this.game.input.keyboard.addKey(Phaser.Keyboard.Z)
        this.flood = this.game.input.keyboard.addKey(Phaser.Keyboard.F)
        this.forrest = this.game.input.keyboard.addKey(Phaser.Keyboard.R)
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
            console.warn("Saving map: " + this.x + "," + this.y)
            this.blocks.fixEdges()
            this.blocks.save(this.x, this.y)
            this.blocks.destroy()
            this.blocks.checkWorld()
            this.x = x
            this.y = y
            console.warn("Loading map: " + x + "," + y)
            this.blocks.loadXY(x, y, () => console.warn("Success"),
                // eslint-disable-next-line no-unused-vars
                (_) => {
                    console.warn("Error: making new file")
                    this.blocks.newMap(x, y, Config.MAP_SIZE, Config.MAP_SIZE, x < Config.MAX_MAP_X && y < Config.MAX_MAP_Y ? "water" : "dungeon")
                })
        }
    }

    drawDungeon() {
        // find the starting point
        if (this.dungeon.justDown) {

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
            this._drawDungeonWalls()

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
                        this.blocks.set("dungeon.block.big", xx + Config.GROUND_TILE_W, yy + Config.GROUND_TILE_H, 0)
                    }
                }
            }
            for (let xx = 0; xx < Config.MAP_SIZE; xx += Config.GROUND_TILE_W) {
                for (let yy = 0; yy < Config.MAP_SIZE; yy += Config.GROUND_TILE_H) {
                    if(this.blocks.getFloor(xx, yy) == "dungeon.floor.black") {
                        this.blocks.clear("dungeon.floor.black", xx, yy, 0)
                        this.blocks.set("dungeon.block", xx, yy, 0)
                    }
                }
            }
            this.blocks.sort()
        }
    }

    _drawDungeonWalls() {
        for (let xx = 0; xx < Config.MAP_SIZE; xx += Config.GROUND_TILE_W) {
            for (let yy = 0; yy < Config.MAP_SIZE; yy += Config.GROUND_TILE_H) {
                if (this.blocks.getFloor(xx, yy) == "dungeon.floor") {
                    this._drawDungeonAt(xx, yy, {})
                    return
                }
            }
        }
    }

    _drawDungeonAt(x, y, seen) {
        if(!seen[x + "." + y]) {
            seen[x + "." + y] = true

            let dungeonFloorName = "dungeon.floor"
            for (let xx = x - Config.GROUND_TILE_W; xx < x; xx++) {
                for (let yy = y - Config.GROUND_TILE_H; yy < y; yy++) {
                    this.blocks.clear("dungeon.col.nw", xx + 1, yy + 1, 0)
                }
            }

            let w = this.blocks.getFloor(x - Config.GROUND_TILE_W, y) == dungeonFloorName
            let e = this.blocks.getFloor(x + Config.GROUND_TILE_W, y) == dungeonFloorName
            let n = this.blocks.getFloor(x, y - Config.GROUND_TILE_W) == dungeonFloorName
            let s = this.blocks.getFloor(x, y + Config.GROUND_TILE_W) == dungeonFloorName
            let nw = this.blocks.getFloor(x - Config.GROUND_TILE_W, y - Config.GROUND_TILE_W) == dungeonFloorName
            let ne = this.blocks.getFloor(x + Config.GROUND_TILE_W, y - Config.GROUND_TILE_W) == dungeonFloorName
            let sw = this.blocks.getFloor(x - Config.GROUND_TILE_W, y + Config.GROUND_TILE_W) == dungeonFloorName
            let se = this.blocks.getFloor(x + Config.GROUND_TILE_W, y + Config.GROUND_TILE_W) == dungeonFloorName

            // console.warn("pos=" + x + "," + y + " n=" + n + " s=" + s + " e=" + e + " w=" + w + " nw=" + nw + " ne=" + ne + " sw=" + sw + " se=" + se)

            if (w && e && n && s && nw && ne && sw && se) {
                // nada
            } else if (w && e && n && s && !nw && ne && sw && se) {
                this.blocks.set("dungeon.col.nw", x - Config.GROUND_TILE_W + 1, y - Config.GROUND_TILE_H + 1, 0)
            } else if (w && e && n && s && nw && !ne && sw && se) {
                this.blocks.set("dungeon.col.nw", x, y - Config.GROUND_TILE_H + 1, 0)
            } else if (w && e && n && s && nw && ne && sw && !se) {
                this.blocks.set("dungeon.col.nw", x, y, 0)
            } else if (w && e && n && s && nw && ne && !sw && se) {
                this.blocks.set("dungeon.col.nw", x - Config.GROUND_TILE_W + 1, y, 0)
            } else if (!w && n && s) {
                this.blocks.set("dungeon.w.4", x - Config.GROUND_TILE_W + 1, y, 0)
            } else if (!e && n && s) {
                this.blocks.set("dungeon.e.4", x, y, 0)
            } else if (w && e && !n) {
                this.blocks.set("dungeon.n.4", x, y - Config.GROUND_TILE_H + 1, 0)
            } else if (w && e && !s) {
                this.blocks.set("dungeon.s.4", x, y, 0)
            } else if (e && s) {
                this.blocks.set("dungeon.col.se", x - Config.GROUND_TILE_W + 1, y - Config.GROUND_TILE_H + 1, 0)
                this.blocks.set("dungeon.n.3", x, y - Config.GROUND_TILE_H + 1, 0)
                this.blocks.set("dungeon.w.3", x - Config.GROUND_TILE_W + 1, y, 0)
            } else if (e && n) {
                this.blocks.set("dungeon.col.se", x - Config.GROUND_TILE_W + 1, y, 0)
                this.blocks.set("dungeon.s.3", x, y, 0)
                this.blocks.set("dungeon.w.3", x - Config.GROUND_TILE_W + 1, y - 1, 0)
            } else if (w && n) {
                this.blocks.set("dungeon.col.se", x, y, 0)
                this.blocks.set("dungeon.s.3", x - 1, y, 0)
                this.blocks.set("dungeon.e.3", x, y - 1, 0)
            } else if (w && s) {
                this.blocks.set("dungeon.col.se", x, y - Config.GROUND_TILE_H + 1, 0)
                this.blocks.set("dungeon.n.3", x - 1, y - Config.GROUND_TILE_H + 1, 0)
                this.blocks.set("dungeon.e.3", x, y, 0)
            }

            if (w) this._drawDungeonAt(x - Config.GROUND_TILE_W, y, seen)
            if (e) this._drawDungeonAt(x + Config.GROUND_TILE_W, y, seen)
            if (n) this._drawDungeonAt(x, y - Config.GROUND_TILE_W, seen)
            if (s) this._drawDungeonAt(x, y + Config.GROUND_TILE_W, seen)
            if (nw) this._drawDungeonAt(x - Config.GROUND_TILE_W, y - Config.GROUND_TILE_W, seen)
            if (ne) this._drawDungeonAt(x + Config.GROUND_TILE_W, y - Config.GROUND_TILE_W, seen)
            if (sw) this._drawDungeonAt(x - Config.GROUND_TILE_W, y + Config.GROUND_TILE_W, seen)
            if (se) this._drawDungeonAt(x + Config.GROUND_TILE_W, y + Config.GROUND_TILE_W, seen)
        }
    }

    drawForrest() {
        if(this.forrest.justDown) {
            for(let x = 0; x < Config.MAP_SIZE; x++) {
                for(let y = 0; y < Config.MAP_SIZE; y++) {
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
            }
        }
    }

    drawFlood(x, y) {
        if(this.flood.justDown) {
            let gx = ((x / Config.GROUND_TILE_W) | 0) * Config.GROUND_TILE_W
            let gy = ((y / Config.GROUND_TILE_H) | 0) * Config.GROUND_TILE_H
            let check = this.blocks.getFloor(gx, gy)
            this._drawFlood(gx, gy, check, {}, this.flood.ctrlKey ? "grass" : "water")
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
        } else if (this.groundA.isDown) {
            ground = "dungeon.floor.black"
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
            if(unpassable) {
                this.blocks.clear("trunk.wide", x, y, 0)
                this.blocks.set("trunk.wide", x, y, 0)
            } else {
                this.blocks.clear("trunk", x, y, 0)
                this.blocks.set("trunk", x, y, 0)
            }

            let name = getRandom([...Array(4).fill("oak"), ...Array(3).fill("pine"), ...Array(3).fill("pine2"), "brown"])
            this.blocks.clear(name, x, y, 4)
            this.blocks.set(name, x, y, 4)
            this.blocks.sort()
        }
    }

    update() {
        this.blocks.update()

        if ($(".dialog").is(":visible")) {
            this.game.input.enabled = false;
            return
        } else {
            this.game.input.enabled = true;
        }

        if (this.undo.justDown && this.lastBlock) {
            this.blocks.clear(this.lastBlock.name, ...this.lastBlock.gamePos)
            this.lastBlock = null
        }

        if (this.esc.justDown && this.activeBlock) {
            this.setActiveBlock(null)
        }

        this.moveMap()
        this.moveCamera()

        // find the top object under the mouse
        this.blocks.highlight(this.blocks.getTopSpriteAt(this.game.input.x, this.game.input.y))

        // find new top z
        let [x, y, z] = this.blocks.toWorldCoords(this.game.input.x, this.game.input.y)
        z = this.blocks.getTopAt(x, y, this.activeBlock)

        this.drawForrest()
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
