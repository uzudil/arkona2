import { centerGameObjects, loadSettings, saveSettings, restart, exit } from "../utils.js"
import * as Config from "../config/Config.js"
import * as Creatures from "../config/Creatures.js"
import * as Vehicles from "../config/Vehicles.js"
const $ = require("jquery")
import Transition from "../ui/Transition.js"
import Arkona from "./Arkona.js"
import ConvoEditor from "../editor/ConvoEditor.js"

const MENU_OPTIONS = Config.DEBUG_MODE ?
    ["New Game", "Load Game", "Options", "Exit", "Game Editor", "Convo Editor", "Mapper"] :
    ["New Game", "Load Game", "Options", "Exit"]
const MENU_STYLE = {font: "bold 20px " + Config.FONT_FAMILY, fill: "#888"}
const MENU_ACTIVE_STYLE = {font: "bold 22px " + Config.FONT_FAMILY, fill: "#6ac"}

export default class extends Phaser.State {
    init() {
    }

    preload() {
        this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, "loaderBg")
        this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, "loaderBar")
        centerGameObjects([this.loaderBg, this.loaderBar])

        this.load.setPreloadSprite(this.loaderBar)
        //
        // load your assets
        //
        this.atlas()
        this.atlas(2)
        this.atlas(3)
        this.atlas(4)
        this.atlas(5)

        this.load.image("logo", "./assets/images/logo.png")
        this.load.image("back", "./assets/images/back.png")

        for(let k in Creatures.CREATURES) {
            let c = Creatures.CREATURES[k]
            this.game.load.spritesheet(k, c.src + "?cb=" + Date.now(), ...c.dim)
        }
        for(let k in Vehicles.VEHICLES) {
            let c = Vehicles.VEHICLES[k]
            this.game.load.spritesheet(k, c.src + "?cb=" + Date.now(), ...c.dim)
        }

        this.load.atlas("device", "assets/images/device.png?cb=" + Date.now(), null, {
            frames: [
                {
                    filename: "device",
                    frame: { x: 0, y: 0, w: 418, h: 34 },
                    rotated: false,
                    trimmed: true,
                    sourceSize: { w: 418, h: 34 },
                    spriteSourceSize: {x: 0, y: 0, w: 418, h: 34 }
                },
                {
                    filename: "gem-purple",
                    frame: { x: 0, y: 40, w: 24, h: 24 },
                    rotated: false,
                    trimmed: true,
                    sourceSize: { w: 24, h: 24 },
                    spriteSourceSize: {x: 0, y: 0, w: 24, h: 24 }
                },
                {
                    filename: "gem-blue",
                    frame: { x: 64, y: 40, w: 24, h: 24 },
                    rotated: false,
                    trimmed: true,
                    sourceSize: { w: 24, h: 24 },
                    spriteSourceSize: {x: 0, y: 0, w: 24, h: 24 }
                },
                {
                    filename: "gem-green",
                    frame: { x: 128, y: 40, w: 24, h: 24 },
                    rotated: false,
                    trimmed: true,
                    sourceSize: { w: 24, h: 24 },
                    spriteSourceSize: {x: 0, y: 0, w: 24, h: 24 }
                },
                {
                    filename: "gem-red",
                    frame: { x: 192, y: 40, w: 24, h: 24 },
                    rotated: false,
                    trimmed: true,
                    sourceSize: { w: 24, h: 24 },
                    spriteSourceSize: {x: 0, y: 0, w: 24, h: 24 }
                },
                {
                    filename: "gem-yellow",
                    frame: { x: 256, y: 40, w: 24, h: 24 },
                    rotated: false,
                    trimmed: true,
                    sourceSize: { w: 24, h: 24 },
                    spriteSourceSize: {x: 0, y: 0, w: 24, h: 24 }
                },
            ],
            meta: {
                scale: "1",
                format: "RGBA8888",
                app: "http://www.codeandweb.com/texturepacker",
                version: "1.0",
                smartupdate: "$TexturePacker:SmartUpdate:b6887183d8c9d806808577d524d4a2b9:1e240ffed241fc58aca26b0e5d350d80:71eda69c52f7d9873cb6f00d13e1e2f8$",
                image: "arkona.png",
                size: {"h": 1024, "w": 1200}
            }
        }, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
    }

    atlas(n) {
        if(n == null) {
            this.load.atlas("sprites", "assets/images/arkona.png?cb=" + Date.now(), null, Config.toJson(), Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        } else {
            this.load.atlas("sprites" + n, "assets/images/arkona" + n + ".png?cb=" + Date.now(), null, Config.toJson(n), Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
        }
    }

    create() {
        $("#close-options").click(()=>{
            $(".dialog").hide()
            restart()
        });
        $("#use-webgl").click(()=>{
            let o = loadSettings()
            o["use_webgl"] = $("#use-webgl").is(":checked")
            saveSettings(o)
        });
        $("input[name='resolution']").click(() => {
            let o = loadSettings()
            o["resolution"] = $("input[name='resolution']:checked").attr("id")
            saveSettings(o)
        })

        this.loaderBg.kill()
        this.loaderBar.kill()
        this.game.stage.backgroundColor = "#000000";

        this.back = this.add.image(512, 400, "back")
        this.back.anchor.setTo(0.5, 0.5)

        this.logo = this.add.image(750, 100, "logo")
        this.logo.anchor.setTo(0.5, 0)

        var style = {font: "bold 20px " + Config.FONT_FAMILY, fill: "#888"};
        this.menu = []
        let y = 230
        for(let index = 0; index < MENU_OPTIONS.length; index++) {
            let s = MENU_OPTIONS[index]
            let m = this.game.add.text(750, y, s, style)
            m.anchor.setTo(0.5, 0.5)
            m.inputEnabled = true
            m.index = index

            m.events.onInputDown.add((sprite) => {
                this.menuAction(sprite.index)
            }, this)
            m.events.onInputOver.add((sprite) => {
                this.menuIndex = sprite.index
                this.updateMenu()
            }, this)

            this.menu.push(m)
            y += 35
        }
        style = {font: "bold 11px " + Config.FONT_FAMILY, fill: "#555"};
        this.copyright = this.game.add.text(this.game.world.centerX, 720, "MMXVII \u00A9 Gabor Torok", style);
        this.copyright.anchor.setTo(0.5, 0.5)

        this.menuIndex = 0
        this.updateMenu()

        this.cursors = this.game.input.keyboard.createCursorKeys()
        this.space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
        this.enter = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER)

        this.transition = new Transition()
    }

    updateMenu() {
        for(let i = 0; i < this.menu.length; i++) {
            this.menu[i].setStyle(i == this.menuIndex ? MENU_ACTIVE_STYLE : MENU_STYLE)
        }
    }

    update() {
        let oldMenu = this.menuIndex
        if (this.cursors.up.justDown) {
            this.menuIndex--
        } else if (this.cursors.down.justDown) {
            this.menuIndex++
        }
        if (this.menuIndex >= this.menu.length) this.menuIndex = 0
        else if (this.menuIndex < 0) this.menuIndex = this.menu.length - 1
        if (oldMenu != this.menuIndex) this.updateMenu()

        if(this.space.justDown || this.enter.justDown) {
            this.menuAction(this.menuIndex)
        }
    }

    menuAction(menuIndex) {
        switch(menuIndex) {
            case 0:
                // new game
                if(!Arkona.doesSaveGameExist() || confirm("Delete saved game?")) {
                    this.transition.fadeIn(() => {
                        this.state.start("Intro")
                    })
                }
                break
            case 1:
                // load game
                this.transition.fadeIn(() => {
                    this.state.start("Arkona", true, false, { loadGame: true })
                })
                break
            case 2:
                this.constructor.updateSettings(loadSettings())
                $("#options").show();
                break
            case 3:
                if(confirm("Exit game?")) exit()
                break
            case 4:
                $("#right-menu").show()
                this.state.start("Editor")
                break
            case 5:
                new ConvoEditor();
                break
            case 6:
                this.state.start("Mapper")
                break
        }
    }

    static updateSettings(o) {
        $("#use-webgl").attr("checked", o["use_webgl"])
        let res = o["resolution"] || "res-1024"
        $("input[name='resolution']").attr("checked", false)
        $("#" + res).attr("checked", true)
    }
}
