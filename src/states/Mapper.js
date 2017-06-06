import Phaser from "phaser"
import * as Config from "../config/Config"
import Transition from "../ui/Transition"
import Block from "../world/Block"
import $ from "jquery"

const MINX=0
const MINY=0
const MAXX=21
const MAXY=21

const ZOOM = 0.25

export default class extends Phaser.State {
    init() {
    }

    preload() {
    }

    create() {
        this.blocks = new Block(this, true, ZOOM, true)
        this.transition = new Transition()
        this.ready = false
        this.x = MINX
        this.y = MINY
        this.seen = {}
        this.game.world.rotation = Math.PI/-4
        window.game = this.game

        this.transition.fadeOut(() => {
            this.loadLevel()
        })
    }

    render() {
        if(this.ready) {
            this.ready = false
            this.savePicture()
        }
    }

    update() {
    }

    loadLevel() {
        console.warn("LOADING: " + this.x + "," + this.y)
        this.blocks.loadXY(this.x, this.y, () => this.mapLoaded(), () => this.mapLoaded)
    }

    mapLoaded() {
        this.blocks.moveToPos(Config.GRID_SIZE * Config.MAP_SIZE * ZOOM * -2, Config.GRID_SIZE * Config.MAP_SIZE * ZOOM / 2)
        this.blocks.group.position.set(-30, -20)
        this.ready = true
    }

    savePicture() {
        let mapName = this.blocks._name(this.x, this.y)

        // take picture
        let canvas = $("canvas").get(0)
        let dataUrl = canvas.toDataURL("image/png", 0.5)

        // clear picture
        this.blocks.destroy()

        // $("body").append("<img src='" + dataUrl + "'>")

        // console.warn(dataUrl)
        $.ajax({
            type: "POST",
            url: "http://localhost:9090/cgi-bin/upload.py",
            data: {
                type: "world",
                name: mapName,
                ext: "png",
                file: dataUrl
            },
            success: ()=>{
                console.warn("done")
                this.nextMap()
            },
            error: (error)=>{
                console.warn("Error:", error)
                this.nextMap()
            },
        });
    }

    nextMap() {
        this.x++
        if(this.x >= MAXX) {
            this.y++
            this.x = MINX
        }
        if(this.y < MAXY) {
            this.loadLevel()
        } else {
            this.game.world.removeAll()
        }
    }
}
