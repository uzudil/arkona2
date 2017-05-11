export const centerGameObjects = (objects) => {
	objects.forEach(function (object) {
		object.anchor.setTo(0.5)
	})
}

export const setResponsiveWidth = (sprite, percent, parent) => {
	let percentWidth = (sprite.texture.width - (parent.width / (100 / percent))) * 100 / sprite.texture.width
	sprite.width = parent.width / (100 / percent)
	sprite.height = sprite.texture.height - (sprite.texture.height * percentWidth / 100)
}

export const getRandom = (list) => list[(Math.random() * list.length) | 0]

export const range = (start, end) => { return [...Array(end-start).keys()].map(v => start+v) }

export const dist3d = (ax, ay, az, bx, by, bz) => {
	let dx = ax - bx
	let dy = ay - by
	let dz = az - bz
	return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export const inRect = (x, y, rx, ry, rw, rh) => {
	return x >= rx && x < rx + rw && y >= ry && y < ry + rh
}

const fs = window.require("fs")
const path = window.require("path")
const os = window.require("os")
const electron = window.require("electron")
import {WIDTH, HEIGHT} from "./config/Config"

function settingsFile() {
    let dir = path.join(os.homedir(), ".arkona")
    if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
    return path.join(dir, "settings.json")
}

export function loadSettings() {
    try {
        let str = fs.readFileSync(settingsFile())
        return str ? JSON.parse(str) : {}
    } catch(exc) {
        console.warn(exc)
        return {}
    }
}

export function saveSettings(o) {
    fs.writeFileSync(settingsFile(), JSON.stringify(o))
}

export function exit() {
    electron.remote.app.quit(0)
}

export function restart(hard) {
    if(hard) {
        electron.remote.app.relaunch()
        electron.remote.app.quit(0)
    } else {
        document.location.reload()
    }
}

export function scaleGame(game) {
    // adjust game size and scale to electron window
    let [w, h] = electron.remote.getCurrentWindow().getSize()
    // scale game to window size
    game.scale.scaleMode = 4
    if(w > h) {
        game.scale.setUserScale(h/HEIGHT, h/HEIGHT)
    } else {
        game.scale.setUserScale(w/WIDTH, w/WIDTH)
    }
}

export const flatten = list => list.reduce(
	(a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);