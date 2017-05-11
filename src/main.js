import "pixi"
import "p2"
import Phaser from "phaser"
import { loadSettings, flatten } from "./utils"

import {LEVELS} from "./config/Levels"
import BootState from "./states/Boot"
import SplashState from "./states/Splash"
import EditorState from "./states/Editor"
import ArkonaState from "./states/Arkona"
import IntroState from "./states/Intro"
import MapperState from "./states/Mapper"

import * as Config from "./config/Config"

// electron has to be included like this: https://github.com/electron/electron/issues/7300
const electron = window.require("electron")

class Game extends Phaser.Game {

    constructor() {
        let o = loadSettings()

        // set the electron window size
        let win = electron.remote.getCurrentWindow()
        win.setFullScreen(o["resolution"] == "res-full")
        let w = Config.WIDTH, h = Config.HEIGHT
        if(o["resolution"] == "res-800") {
            w = 800
            h = 600
        }
        win.setSize(w, h)

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
        flatten(Object.keys(LEVELS).map(k => LEVELS[k]).filter(level => level["npcs"]).map(level => level.npcs))
            .filter(npc => npc["options"] && npc.options["convo"])
            .map(npc => npc.options.convo)
            .forEach(convo => convo.validate())
    }
}

class InitState extends Phaser.State {
    init() {
        // get the actual size (fullscreen doesn't respect set size)
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
