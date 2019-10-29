import { loadSettings, flatten } from "./utils.js"

import {WORLD} from "./config/World.js"
import BootState from "./states/Boot.js"
import SplashState from "./states/Splash.js"
import EditorState from "./states/Editor.js"
import ArkonaState from "./states/Arkona.js"
import IntroState from "./states/Intro.js"
import MapperState from "./states/Mapper.js"
import {getLogger, toggleAll} from "./config/Logger.js"

import * as Config from "./config/Config.js"

const electron = require("electron")

class Game extends Phaser.Game {

    constructor() {
        // only enable some loggers
        toggleAll(false)
        getLogger("SECTION").enabled = true

        let o = loadSettings()

        // set the electron window size
        let win = electron.remote.getCurrentWindow()

        // set fullscreen mode if requested or as the default for a packaged app
        let fullscreen = o["resolution"] == "res-full" || (o["resolution"] == null && !Config.DEBUG_MODE)
        win.setFullScreen(fullscreen)

        // 800x600 windowed mode
        let w = Config.WIDTH, h = Config.HEIGHT
        if(o["resolution"] == "res-800") {
            w = 800
            h = 600
        } else if(o["resolution"] == "res-400") {
            w = 400
            h = 300
        }
        win.setSize(w, h)

        // in fullscreen mode, adjust width to fit the screen
        // this will change the aspect ratio of the game a little
        if(fullscreen) {
            let [w, h] = electron.remote.getCurrentWindow().getSize()
            Config.WIDTH = (w * Config.HEIGHT) / h
        }
        // set to Phaser.AUTO for webgl (this will result in more fan noise)
        super(Config.WIDTH, Config.HEIGHT, o["use_webgl"] ? Phaser.AUTO : Phaser.CANVAS, "content", null)

        try {
            this.checkConvos()
        } catch(exc) {
            console.error(exc);
        }

        this.state.add("Init", InitState, false)
        this.state.add("Boot", BootState, false)
        this.state.add("Splash", SplashState, false)
        this.state.add("Editor", EditorState, false)
        this.state.add("Intro", IntroState, false)
        this.state.add("Arkona", ArkonaState, false)
        this.state.add("Mapper", MapperState, false)

        this.state.start("Init")
    }

    // some basic sanity checking of the convos
    checkConvos() {
        flatten(Object.keys(WORLD).map(k => WORLD[k]).filter(level => level["npcs"]).map(level => level.npcs))
            .filter(npc => npc["options"] && npc.options["convo"])
            .map(npc => npc.options.convo)
            .forEach(convo => convo.validate())
    }
}

class InitState extends Phaser.State {
    init() {
        // get the actual size (fullscreen doesn't respect set size, it will return something like 1900x1200)
        let [w, h] = electron.remote.getCurrentWindow().getSize()

        // adjust game size and scale to electron window
        this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE
        if(w > h) {
            this.game.scale.setUserScale(h/Config.HEIGHT, h/Config.HEIGHT)
        } else {
            this.game.scale.setUserScale(w/Config.WIDTH, w/Config.WIDTH)
        }
    }

    render() {
        this.state.start("Boot")
    }
}

window.game = new Game()
