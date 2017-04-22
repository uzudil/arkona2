import Phaser from "phaser"
import * as Config from "../config/Config"
import {LEVELS} from "../config/Levels"
import Transition from "../ui/Transition"
import Block from "../world/Block"
import Level from "../models/Level"
import $ from "jquery"

const ZOOM = 0.25
export default class extends Phaser.State {
    init() {
    }

    preload() {
    }

    create() {
        this.level = null
        this.blocks = new Block(this, false, ZOOM)
        this.transition = new Transition()
        this.ready = false

        this.seen = {}
        this.maps = []
        this.mapsIndex = 0
        this.listMaps(Config.START_MAP)
        console.warn(this.maps)

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
        let mapName = this.maps[this.mapsIndex]
        console.warn("LOADING: " + mapName)
        this.level = new Level(mapName)
        this.level.start(this, () => {
            // this.blocks.centerOnPos((this.blocks.w/2)|0, (this.blocks.h/2)|0, 0)
            // this.blocks.centerOnPos((this.blocks.w*(1-ZOOM))|0, (this.blocks.h*(1-ZOOM))|0, 0)
            this.game.world.rotation = 0
            this.blocks.centerOnScreenPos(
                (this.blocks.h * Config.GRID_SIZE * ZOOM - Config.WIDTH/2)/2,
                (this.blocks.w * Config.GRID_SIZE * ZOOM + Config.HEIGHT)/2
            )
            this.game.world.rotation = Math.PI/-4

            this.ready = true
        })
    }

    savePicture() {
        let mapName = this.maps[this.mapsIndex]

        // take picture
        let canvas = $("canvas").get(0)
        let dataUrl = canvas.toDataURL("image/png", 0.5)

        // clear picture
        this.blocks.destroy()
        this.level.destroy()

        $("body").append("<img src='" + dataUrl + "'>")

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
        if(this.mapsIndex < this.maps.length - 1) {
            this.mapsIndex++
            this.loadLevel()
        } else {
            this.game.world.removeAll()
        }
    }

    listMaps(mapName) {
        if(mapName && !this.seen[mapName]) {
            this.seen[mapName] = true
            this.maps.push(mapName)
            let lvl = LEVELS[mapName]
            if(lvl.connect) lvl.connect.forEach(c => {
                if(c && c.dst) this.listMaps(c.dst.map)
            })
        }
    }
}
