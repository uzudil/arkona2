import * as Config from "../config/Config"
import {BLOCKS} from "../config/Blocks"
import ImpreciseSort from "./ImpreciseSort"
import DAGSort from "./DAGSort"
import $ from "jquery"
import * as Filters from "./Filters"

function getBlendLevel(block) {
    return block && block.options && block.options["blendLevel"] ? block.options["blendLevel"] : Config.NO_BLEND
}

function _key(x, y, z) {
    return x + "." + y + "." + z
}

function _visit(name, worldX, worldY, fx) {
    let block = BLOCKS[name]
    for(let xx = worldX - block.size[0]; xx < worldX; xx++) {
        for (let yy = worldY - block.size[1]; yy < worldY; yy++) {
            fx(xx, yy)
        }
    }
}

// short-circuit version of _visit
function _visitSS(name, worldX, worldY, fx) {
    let block = BLOCKS[name]
    for(let xx = worldX - block.size[0]; xx < worldX; xx++) {
        for (let yy = worldY - block.size[1]; yy < worldY; yy++) {
            if(!fx(xx, yy)) return false
        }
    }
    return true
}

function _visit3(name, worldX, worldY, worldZ, fx) {
    let block = BLOCKS[name]
    _visit(name, worldX, worldY, (xx, yy) => {
        if(block.size[2] == 0) {
            fx(xx, yy, 0)
        } else {
            for (let zz = worldZ; zz < worldZ + block.size[2]; zz++) {
                fx(xx, yy, zz)
            }
        }
    })
}

// short-circuit version of _visit3
function _visit3SS(name, worldX, worldY, worldZ, fx) {
    let block = BLOCKS[name]
    for(let xx = worldX - block.size[0]; xx < worldX; xx++) {
        for (let yy = worldY - block.size[1]; yy < worldY; yy++) {
            if (block.size[2] == 0) {
                if (!fx(xx, yy, 0)) return false
            } else {
                for (let zz = worldZ; zz < worldZ + block.size[2]; zz++) {
                    if (!fx(xx, yy, zz)) return false
                }
            }
        }
    }
    return true
}

function _visit3d(worldX, worldY, worldZ, w, h, d, fx) {
    for(let xx = worldX - w; xx < worldX; xx++) {
        for (let yy = worldY - h; yy < worldY; yy++) {
            for (let zz = worldZ; zz < worldZ + d; zz++) {
                if(!fx(xx, yy, zz)) return false
            }
        }
    }
    return true
}

export function isFlat(sprite) {
    return sprite && isFlatByName(sprite.name)
}

function isFlatByName(name) {
    return BLOCKS[name].size[2] == 0
}

class ImageInfo {
    constructor(name, image) {
        this.name = name
        this.image = image
    }
}

class BlockInfo {
    constructor(x, y, z, imageInfo) {
        this.x = x
        this.y = y
        this.z = z
        this.imageInfos = [ imageInfo ]
        this.unstableFloor = false // computed
    }

    removeImage(image, destroyImage) {
        for (let i = 0; i < this.imageInfos.length; i++) {
            if (this.imageInfos[i].image == image) {
                this.imageInfos.splice(i, 1)
                if(destroyImage) image.destroy()
                break
            }
        }
        return this.imageInfos.length == 0
    }

}

class Layer {
    constructor(game, parentGroup, name, sorted, sortingStrategy) {
        this.game = game
        this.name = name
        this.sorted = sorted
        this.sortingStrategy = sortingStrategy || new ImpreciseSort()

        this.filterGroup = game.add.group(parentGroup)
        this.group = game.add.group(parentGroup)
        this.infos = {} // 3d space
        this.world = {} // origin space
    }

    destroy() {
        this.infos = {} // 3d space
        this.world = {} // origin space
        let toDestroy = []
        for(let c of this.filterGroup.children) {
            toDestroy.push(c)
        }
        for(let c of this.group.children) {
            toDestroy.push(c)
        }
        for(let c of toDestroy) c.destroy()
    }

    reset() {
        this.infos = {}
        this.world = {}
        while(this.filterGroup.children.length > 0) this.filterGroup.children[0].destroy()
        while(this.group.children.length > 0) this.group.children[0].destroy()
    }

    tint(color) {
        this.group.children.forEach(sprite => sprite.tint = color)
    }

    hasImage(name, x, y) {
        let key = _key(x, y, 0)
        let info = this.world[key]
        return info && info.imageInfos.find(i => i.name == name)
    }

    toggleHigherThan(z, visible) {
        for(let k in this.world) {
            for(let ii of this.world[k].imageInfos) {
                ii.image.visible = z > 0 && ii.image.gamePos[2] >= z ? visible : true
            }
        }
    }

    hasShapeAbove(worldX, worldY, worldZ) {
        for(let z = worldZ; z < Config.MAX_Z; z++) {
            if(this.infos[_key(worldX, worldY, z)] != null) return true
        }
        return false
    }

    getBlendLevel(x, y) {
        let key = _key(x, y, 0)
        let info = this.world[key]
        return info && info.imageInfos && info.imageInfos.length > 0
            ? getBlendLevel(BLOCKS[info.imageInfos[0].name])
            : Config.NO_BLEND
    }

    getGroup(name) {
        let block = BLOCKS[name]
        return block.options && block.options.filter ? this.filterGroup : this.group
    }

    set(name, x, y, z, sprite, skipInfo) {
        this.getGroup(name).add(sprite) // ok to do even if already in group
        if(!skipInfo) {
            this.updateInfo(name, x, y, z, sprite)
        }
    }

    clear(name, x, y, z) {
        let key = _key(x, y, z)
        let info = this.world[key]
        if (info) {
            for (let imageInfo of info.imageInfos) imageInfo.image.destroy()
            delete this.world[key]
        }

        let block = BLOCKS[name]
        if(block.size[2] > 0) {
            _visit3(name, x, y, z, (xx, yy, zz) => {
                let key = _key(xx, yy, zz)
                let info = this.infos[key]
                if (info) {
                    delete this.infos[key]
                }
            })
        }

        return info != null
    }

    clearFirst(x, y, z) {
        let key = _key(x, y, z)
        let info = this.infos[key]
        if(!info) info = this.world[key]
        if (info) {
            // remove images and update the world
            let keyWorld = _key(info.x, info.y, info.z)
            let infoWorld = this.world[keyWorld]
            if (infoWorld) {
                for (let imageInfo of infoWorld.imageInfos) imageInfo.image.destroy()
                delete this.world[keyWorld]
            }

            // update infos
            for (let imageInfo of info.imageInfos) {
                _visit3(imageInfo.name, info.x, info.y, info.z, (xx, yy, zz) => {
                    let keyInfo = _key(xx, yy, zz)
                    let infoInfo = this.infos[keyInfo]
                    if (infoInfo) {
                        delete this.infos[keyInfo]
                    }
                })
            }

            return true
        }
        return false
    }

    updateInfo(name, x, y, z, image) {
        let key = _key(x, y, z)
        let info = this.world[key]
        if (info == null) {
            info = new BlockInfo(x, y, z, new ImageInfo(name, image))
            this.world[key] = info
        } else {
            info.imageInfos.push(new ImageInfo(name, image))
        }
        info.unstableFloor = info.imageInfos.find(ii => Config.UNSTABLE_FLOORS.indexOf(ii.name) >= 0)

        let block = BLOCKS[name]
        if(block.size[2] > 0) {
            _visit3(name, x, y, z, (xx, yy, zz) => {
                let key = _key(xx, yy, zz)
                let info = this.infos[key]
                if (info == null) {
                    info = new BlockInfo(x, y, z, new ImageInfo(name, image))
                    this.infos[key] = info
                } else {
                    // // sanity checking - maybe remove this when multiple items can be in the same location?
                    // for(let imageInfo of info.imageInfos) {
                    //     if(imageInfo.name == name) {
                    //         throw "Duplicate image: " + name + " at " + key + " - use arkona.blocks.checkWorld()"
                    //     }
                    // }
                    info.imageInfos.push(new ImageInfo(name, image))
                }
            })
        }
    }

    removeFromCurrentPos(image, destroyImage) {
        if(image && image.gamePos) {
            let key = _key(image.gamePos[0], image.gamePos[1], image.gamePos[2])
            let info = this.world[key]
            if (info && info.removeImage(image, destroyImage)) delete this.world[key]

            let block = BLOCKS[image.name]
            if(block.size[2] > 0) {
                _visit3(image.name, image.gamePos[0], image.gamePos[1], image.gamePos[2], (xx, yy, zz) => {
                    let key = _key(xx, yy, zz)
                    let info = this.infos[key]
                    if(info && info.removeImage(image)) delete this.infos[key]
                })
            }
        }
    }

    /**
     * The lowest empty z coordinate at this location.
     *
     * @param worldX
     * @param worldY
     * @param sprite
     * @param visibleHeight
     */
    getTopAt(worldX, worldY, sprite, visibleHeight) {
        let maxZ = 0
        if(sprite && !isFlat(sprite)) {
            _visit(sprite.name, worldX, worldY, (xx, yy) => {
                let fromZ = visibleHeight > 0 ? visibleHeight - 1 : Config.MAX_Z
                for (let z = fromZ; z >= 0; z--) {
                    let info = this.infos[_key(xx, yy, z)]
                    if (info) {
                        if (z + 1 > maxZ) maxZ = z + 1
                        break
                    }
                }
            })
        }
        return maxZ
    }

    canMoveTo(sprite, x, y, z, skipSupportCheck, blockers) {
        let fits = _visit3SS(sprite.name, x, y, z, (xx, yy, zz) => {
            let info = this.infos[_key(xx, yy, zz)]
            if(!info) return true
            let blocker = info.imageInfos.find((ii) => ii.image != sprite)
            if(!blocker) return true
            if(blockers != null) blockers.push(blocker.image)
            return false
        })
        // if it fits, make sure we're standing on something
        if(fits && z > 0 && !skipSupportCheck) {
            // tricky: we want to test that at least one shape below the player can be stood on
            // in order to work with the short-circuit eval, we return  true if a space can be used.
            // At the first such "false" the ss quits.
            // Todo: make this code more readable while still performant...
            let allNotFound = _visitSS(sprite.name, x, y, (xx, yy) => {
                let info = this.infos[_key(xx, yy, z - 1)]
                let canBeStoodOn = info && info.imageInfos.find((ii) => ii.image != sprite)
                return !canBeStoodOn;
            })
            if(allNotFound) fits = false
        }
        return fits
    }

    isFree(worldX, worldY, worldZ, w, h, d) {
        return _visit3d(worldX, worldY, worldZ, w, h, d, (xx, yy, zz) => {
            return !(this.infos[_key(xx, yy, zz)])
        })
    }

    getFloorAt(worldX, worldY) {
        let info = this.world[_key(worldX, worldY, 0)]
        return info && info.imageInfos.length > 0 ? info.imageInfos[0].name : null
    }

    sort() {
        if(this.sorted) {
            this.sortingStrategy.prepareToSort(this.group.children)
            this.group.customSort(this.sortingStrategy.compareSprites)
        }
    }

    move(dx, dy) {
        this.filterGroup.x += dx
        this.filterGroup.y += dy
        this.group.x += dx
        this.group.y += dy
    }

    moveTo(x, y) {
        this.filterGroup.x = x
        this.filterGroup.y = y
        this.group.x = x
        this.group.y = y
    }

    findClosest(image, range, fx) {
        let found = false
        // todo: instead of -1, it should be -width/2
        _visit3d(image.gamePos[0] - 1 + (range/2)|0, image.gamePos[1] - 1 + (range/2)|0, image.gamePos[2], range, range, range, (xx, yy, zz) => {
            let info = this.infos[_key(xx, yy, zz)]
            if (info && info.imageInfos) {
                let imageInfo = info.imageInfos.find(ii => fx(ii.image))
                if (imageInfo) {
                    found = imageInfo.image
                    return false
                }
            }
            return true
        })
        return found
    }

    save() {
        return {
            name: this.name,
            world: Object.keys(this.world).
            filter(k => this.world[k].x >= 0 && this.world[k].x < Config.MAP_SIZE && this.world[k].y >= 0 && this.world[k].y < Config.MAP_SIZE).
            map(key => {
                let info = this.world[key]
                return {
                    x: info.x,
                    y: info.y,
                    z: info.z,
                    images: info.imageInfos.map(ii => ii.name)
                }
            })
        }
    }

    deleteMapImages(mapX, mapY) {
        let worldSize = Object.keys(this.world).length
        let infoSize = Object.keys(this.infos).length
        let toDelete = []
        for(let c of this.filterGroup.children) {
            if(c.mapX == mapX && c.mapY == mapY) {
                this.removeFromCurrentPos(c)
                toDelete.push(c)
            }
        }
        for(let c of this.group.children) {
            if(c.mapX == mapX && c.mapY == mapY) {
                this.removeFromCurrentPos(c)
                toDelete.push(c)
            }
        }
        for(let c of toDelete) c.destroy()
        console.warn("DELETED " + toDelete.length + " images " +
            "WORLD from=" + worldSize + " to=" + Object.keys(this.world).length + " " +
            "INFO from=" + infoSize + " to=" + Object.keys(this.infos).length);
    }

    load(layerInfo, blocks, mapX, mapY) {
        for(let info of layerInfo.world) {
            for (let image of info.images) {
                blocks.set(image,
                    info.x + mapX * Config.MAP_SIZE,
                    info.y + mapY * Config.MAP_SIZE,
                    info.z)
            }
        }
    }

    loadPerimeter(layerInfo, blocks, mapDx, mapDy) {
        for(let info of layerInfo.world) {
            for (let image of info.images) {
                let xsm = info.x < Config.BORDER_SIZE
                let xbg = info.x >= Config.MAP_SIZE - Config.BORDER_SIZE
                let ysm = info.y < Config.BORDER_SIZE
                let ybg = info.y >= Config.MAP_SIZE - Config.BORDER_SIZE
                if(
                    (mapDx == 1  && mapDy == 1  && xsm && ysm) ||
                    (mapDx == -1 && mapDy == 1  && xbg && ysm) ||
                    (mapDx == -1 && mapDy == -1 && xbg && ybg) ||
                    (mapDx == 1  && mapDy == -1 && xsm && ybg) ||
                    (mapDy == 0 && ((mapDx == 1 && xsm) || (mapDx == -1 && xbg))) ||
                    (mapDx == 0 && ((mapDy == 1 && ysm) || (mapDy == -1 && ybg)))
                ) {
                    blocks.set(image, info.x + mapDx * Config.MAP_SIZE, info.y + mapDy * Config.MAP_SIZE, info.z)
                }
            }
        }
    }
}


const EDGE_OFFSET = {
    n: [ -1, -3 ],
    s: [ -1, 1 ],
    e: [ 1, -1 ],
    w: [ -3, -1]
}

/**
 * A map section made of blocks.
 */
export default class {

    constructor(game, editorMode, zoom, mapperMode) {
        this.game = game
        this.group = game.add.group()
        this.editorMode = editorMode
        this.mapperMode = mapperMode
        this.zoom = zoom || (editorMode ? 1 : Config.GAME_ZOOM)
        this.group.scale.set(this.zoom)
        this.floorLayer = new Layer(game, this.group, "floor")
        this.edgeLayer = new Layer(game, this.group, "edge")
        this.stampLayer = new Layer(game, this.group, "stamp")
        this.objectLayer = new Layer(game, this.group, "object", true, new DAGSort())
        this.layers = [
            this.floorLayer, this.edgeLayer, this.stampLayer, this.objectLayer
        ]
        this.layersByName = {}
        for(let layer of this.layers) this.layersByName[layer.name] = layer
        this.roofVisible = true;
        this.visibleHeight = 0
        this.cache = {}
        this.cacheOrder = []
        this.loadPerimeter = editorMode && !mapperMode

        Filters.create(game)

        // cursor
        if(editorMode && !mapperMode) {
            this.anchorDebug = this.game.add.graphics(0, 0)
            this.anchorDebug.anchor.setTo(0.5, 0.5)
            this.anchorDebug.beginFill(0xFF33ff)
            this.anchorDebug.drawRect(0, 0, Config.GRID_SIZE, Config.GRID_SIZE)
            this.anchorDebug.endFill()
            this.groundDebug = this.game.add.graphics(0, 0)
            this.groundDebug.lineStyle(1, 0xFFFF33, 1);
            this.groundDebug.drawRect(0, 0, Config.GRID_SIZE * 6, Config.GRID_SIZE * 6)
            this.groundDebug.angle = 45

            // editor border
            this.border = this.game.add.graphics(0, 0, this.group)
            this.border.anchor.setTo(0, 0)
            this.border.lineStyle(1, 0xFF0000, 1);
            this.border.moveTo(...this.toScreenCoords(-4, -4, 0))
            this.border.lineTo(...this.toScreenCoords(Config.MAP_SIZE-4, -4, 0))
            this.border.lineTo(...this.toScreenCoords(Config.MAP_SIZE-4, Config.MAP_SIZE-4, 0))
            this.border.lineTo(...this.toScreenCoords(-4, Config.MAP_SIZE-4, 0))
            this.border.lineTo(...this.toScreenCoords(-4, -4, 0))

        }

        this.highlightedSprite = null
    }

    newMap(x, y, w, h, type) {
        for(let layer of this.layers) layer.reset()

        if(type == "grass") {
            for (let x = 0; x < w; x += 4) {
                for (let y = 0; y < h; y += 4) {
                    this.set("grass", x, y, 0)
                }
            }
        } else if(type == "water") {
            for (let x = 0; x < w; x += 4) {
                for (let y = 0; y < h; y += 4) {
                    this.set("water", x, y, 0)
                }
            }
        } else if(type == "dungeon") {
            for (let x = 0; x < w; x += 4) {
                for (let y = 0; y < h; y += 4) {
                    this.set("dungeon.floor.black", x, y, 0)
                }
            }
        }

        this.moveToPos(0, 0)

        this.save(x, y)
    }

    drawCursor(x, y, z) {
        let gx = (((x / 4)|0) - 1) * 4
        let gy = (((y / 4)|0) - 1) * 4
        let [gsx, gsy] = this.toScreenCoords(gx, gy, 0)
        this.groundDebug.x = gsx + this.floorLayer.group.x
        this.groundDebug.y = gsy + this.floorLayer.group.y

        let [sx, sy] = this.toScreenCoords(x, y, z)
        this.anchorDebug.x = sx + this.floorLayer.group.x
        this.anchorDebug.y = sy + this.floorLayer.group.y
    }

    isInBounds(x, y) {
        return x >= 0 && x < Config.MAP_SIZE && y >= 0 && y < Config.MAP_SIZE
    }

    getBlendLevel(x, y) {
        return this.isInBounds(x, y) ? this.floorLayer.getBlendLevel(x, y) : Config.NO_BLEND
    }

    toggleRoof(height) {
        if(height == this.visibleHeight) {
            this.roofVisible = !this.roofVisible
            if(this.roofVisible) this.visibleHeight = 0
        } else {
            this.visibleHeight = height
        }
        this.objectLayer.toggleHigherThan(this.visibleHeight, this.roofVisible)
    }

    getFloor(x, y) {
        return this.isInBounds(x, y) ? this.floorLayer.getFloorAt(x, y) : null
    }

    checkRoof(worldX, worldY, worldZ) {
        let roofHeight = worldZ < 6 ? 6 : (worldZ < 13 ? 13 : 19)
        let under = this.objectLayer.hasShapeAbove(worldX, worldY, roofHeight)
        if(under == this.roofVisible || roofHeight != this.visibleHeight) {
            this.visibleHeight = roofHeight
            this.roofVisible = !under
            this.objectLayer.toggleHigherThan(this.visibleHeight, this.roofVisible)
        }
    }

    _getLayer(name) {
        let block = BLOCKS[name]
        let size = block.size
        let layer
        if(this.isStamp(name)) {
            layer = this.stampLayer
        } else if(name.indexOf(".edge") > 0) {
            layer = this.edgeLayer
        } else if(size[2] > 0) {
            layer = this.objectLayer
        } else {
            layer = this.floorLayer
        }
        return layer
    }

    _getLayerAndXYZ(name, x, y, z) {
        let layer = this._getLayer(name)
        if(z == 0 && layer == this.floorLayer) {
            x = ((x / Config.GROUND_TILE_W)|0) * Config.GROUND_TILE_W
            y = ((y / Config.GROUND_TILE_H)|0) * Config.GROUND_TILE_H
        }
        let offsX = 0
        let offsY = 0
        if(layer == this.edgeLayer) {
            [offsX, offsY] = EDGE_OFFSET[name.substring(name.length - 1)]
        }
        return [layer, x, y, z, offsX, offsY]
    }

    clearSprite(sprite) {
        this.clear(sprite.name, ...sprite.gamePos)
    }

    clear(name, rx, ry, rz) {
        let [layer, x, y, z] = this._getLayerAndXYZ(name, rx, ry, rz)
        return layer.clear(name, x, y, z)
    }

    clearFirst(x, y) {
        let fromZ = this.visibleHeight > 0 ? this.visibleHeight - 1 : Config.MAX_Z
        for(let z = fromZ; z >= 0; z--){
            for(let layer of this.layers) {
                if(layer != this.floorLayer) {
                    if(layer.clearFirst(x, y, z)) return true
                }
            }
        }
        return false
    }

    centerOn(image) {
        this.centerOnPos(...image.floatPos)
    }

    centerOnPos(x, y, z) {
        let zz = z || 0
        let [ screenX, screenY ] = this.toScreenCoords(x, y, zz)
        screenX = -(screenX - Config.WIDTH / this.zoom / 2)
        screenY = -(screenY - Config.HEIGHT / this.zoom / 2)
        this.centerOnScreenPos(screenX, screenY)
    }

    centerOnScreenPos(screenX, screenY) {
        this.moveToPos(screenX, screenY)
    }

    _getSprites(name) {
        let b = BLOCKS[name]
        return b.options == null || b.options["sprites"] == null ? "sprites" : "sprites" + b.options.sprites
    }

    set(name, rx, ry, rz, skipInfo, loaderFx) {
        let [layer, x, y, z, offsX, offsY] = this._getLayerAndXYZ(name, rx, ry, rz)

        let screenX, screenY
        [ screenX, screenY ] = this.toScreenCoords(x + offsX, y + offsY, z)

        let block = BLOCKS[name]

        let sprite
        if(loaderFx) {
            sprite = loaderFx(screenX, screenY)
        } else {
            sprite = this.game.add.image(screenX, screenY, this._getSprites(name), name, layer.getGroup(name))
            // do not render out of bounds objects - fps boost
            // also set autoCull to true (even tho we're not using it) so world.camera.totalInView has a value
            sprite.checkWorldBounds = sprite.autoCull = true
            sprite.events.onOutOfBounds.add((sprite) => {
                sprite.renderable = sprite.alive = false
            }, this)
            sprite.events.onEnterBounds.add((sprite) => {
                sprite.renderable = sprite.alive = true
            }, this)
            if(block.options && block.options.filter && Filters.FILTERS[block.options.filter]) {
                sprite.filters = [ Filters.FILTERS[block.options.filter] ]
            }
        }

        this._saveInSprite(sprite, name, x, y, z)
        layer.sortingStrategy.spriteMovedTo(sprite, x, y, z)

        let anchorX = this.getAnchorX(block)
        sprite.anchor.setTo(anchorX, 1)

        if(Config.DEBUG_BLOCKS && layer == this.objectLayer) {
            let gfx = this.game.add.graphics(screenX + block.dim[0] * anchorX, screenY - block.dim[1], layer.group)
            gfx.lineStyle(1, 0xffffff, 1)
            gfx.drawRect(0, 0, block.dim[0], block.dim[1])
            sprite.debugGraphics = gfx
        } else {
            sprite.debugGraphics = null
        }

        layer.set(name, x, y, z, sprite, skipInfo)
        if(!skipInfo) this.drawEdges(layer, name, x, y)
        return sprite
    }

    getAnchorX(block) {
        let baseHeight = block.size[1] * Config.GRID_SIZE
        return 1 - baseHeight / block.dim[0]
    }

    _canSwapPlaces(sprite, blockerSprite) {
        // only the player and another creature
        if(sprite["userControlled"] && blockerSprite["npc"] && blockerSprite.npc.getMonster() == null) {
            let a = BLOCKS[sprite.name]
            let b = BLOCKS[blockerSprite.name]
            // they should be the same size
            return a.size[0] == b.size[0] && a.size[1] == b.size[1] && a.size[2] == b.size[2]
        }
        return false
    }

    moveTo(sprite, fx, fy, fz, skipInfo, centerOnSuccess, onBlock) {
        let [rx, ry, rz] = [Math.round(fx), Math.round(fy), Math.round(fz)]
        let [layer, x, y, z, offsX, offsY] = this._getLayerAndXYZ(sprite.name, rx, ry, rz)
        let ok = false
        let blockers = []
        if(skipInfo) {
            // editor mode
            ok = layer.canMoveTo(sprite, x, y, z, true)
        } else {
            // game mode
            let floorOk = this.isFloorSafe(x, y)
            if(z > 0 || floorOk) {
                ok = layer.canMoveTo(sprite, x, y, z, false, blockers)
            }
            if(!ok) {
                // check one step higher
                [layer, x, y, z, offsX, offsY] = this._getLayerAndXYZ(sprite.name, rx, ry, rz + 1)
                ok = layer.canMoveTo(sprite, x, y, z, false, blockers)
                if(!ok && rz > 0 && floorOk) {
                    // check one step lower
                    [layer, x, y, z, offsX, offsY] = this._getLayerAndXYZ(sprite.name, rx, ry, rz - 1)
                    ok = layer.canMoveTo(sprite, x, y, z, false, blockers)
                }
            }
        }

        // swap places
        if(blockers.length > 0) {
            let blocker = blockers[0]; // ; needed here :-(
            if(this._canSwapPlaces(sprite, blocker)) {
                [x, y, z] = blocker.gamePos
                let [toX, toY, toZ] = sprite.gamePos
                this._moveSpriteTo(blocker, layer, offsX, offsY, toX, toY, toZ, skipInfo); // ; is needed...
                [fx, fy] = [x, y] // exact swap
                ok = true
            } else if(onBlock) {
                if(onBlock(blocker)) return true
            }
        }

        if(ok) {
            this._moveSpriteTo(sprite, layer, offsX, offsY, x, y, z, skipInfo, fx, fy)

            if(centerOnSuccess) {
                this.centerOn(sprite)
            }

            return true
        } else {
            return false
        }
    }

    _moveSpriteTo(sprite, layer, offsX, offsY, x, y, z, skipInfo, fx, fy) {
        layer.removeFromCurrentPos(sprite)

        // move to new position
        let screenX, screenY
        if(layer == this.objectLayer && fx != null && fy != null) {
            [screenX, screenY] = this.toScreenCoords(fx, fy, z)
        } else {
            [screenX, screenY] = this.toScreenCoords(x + offsX, y + offsY, z)
        }

        this._saveInSprite(sprite, null, x, y, z, fx, fy)
        layer.sortingStrategy.spriteMovedTo(sprite, x, y, z)

        sprite.x = screenX
        sprite.y = screenY

        if(sprite.debugGraphics) {
            sprite.debugGraphics.x = screenX
            sprite.debugGraphics.y = screenY
        }

        layer.set(sprite.name, x, y, z, sprite, skipInfo)
        if(!skipInfo) this.drawEdges(layer, sprite.name, x, y)
    }

    isFloorSafeForShape(worldX, worldY, name) {
        let safe = true
        _visit(name, worldX, worldY, (xx, yy) => {
            if(safe && !this.isFloorSafe(xx, yy)) safe = false
        })
        return safe
    }

    isFloorSafe(x, y) {
        let fx = (((x + 2) / Config.GROUND_TILE_W)|0) * Config.GROUND_TILE_W
        let fy = (((y + 2) / Config.GROUND_TILE_H)|0) * Config.GROUND_TILE_H
        let info = this.floorLayer.world[_key(fx, fy, 0)]
        return info && !info.unstableFloor
    }

    replace(sprite, name) {
        this.remove(sprite)
        this.set(name, sprite.gamePos[0], sprite.gamePos[1], sprite.gamePos[2])
    }

    remove(sprite) {
        let layer = this._getLayer(sprite.name)
        layer.removeFromCurrentPos(sprite, true)
    }

    drawEdges(layer, name, x, y) {
        if(layer == this.floorLayer) {
            let block = BLOCKS[name]
            if(getBlendLevel(block) == Config.NO_BLEND) {
                this.clearEdge(x, y)
            } else {
                for (let xx = -1; xx <= 1; xx++) {
                    for (let yy = -1; yy <= 1; yy++) {
                        this.drawGroundEdges(x + xx * Config.GROUND_TILE_W, y + yy * Config.GROUND_TILE_H)
                    }
                }
            }
        }
    }

    drawGroundEdges(gx, gy) {
        if(this.isInBounds(gx, gy)) {
            let blendLevel = this.getBlendLevel(gx, gy)
            if (blendLevel == Config.NO_BLEND) {
                this.clearEdge(gx, gy)
            } else {
                let n = blendLevel > this.getBlendLevel(gx, gy - Config.GROUND_TILE_H) && gy > 0
                let s = blendLevel > this.getBlendLevel(gx, gy + Config.GROUND_TILE_H) && gy < Config.MAP_SIZE - Config.GROUND_TILE_H - 1
                let w = blendLevel > this.getBlendLevel(gx - Config.GROUND_TILE_W, gy) && gx > 0
                let e = blendLevel > this.getBlendLevel(gx + Config.GROUND_TILE_W, gy) && gx < Config.MAP_SIZE - Config.GROUND_TILE_W - 1
                this.setEdge(gx, gy, { n: n, s: s, e: e, w: w })
            }
        }
    }

    clearEdge(gx, gy) {
        this.clear("grass.edge1.n", gx, gy, 0)
    }

    setEdge(gx, gy, edges) {
        this.clearEdge(gx, gy)

        let ground = this.getFloor(gx, gy)
        for(let dir in EDGE_OFFSET) {
            if(edges[dir]) {
                let name
                if(ground && ground.indexOf("lava") >= 0) {
                    name = "scree.edge.bank"
                } else if(ground && ground.indexOf("water") >= 0) {
                    name = "grass.edge.bank"
                } else {
                    let index = 1 + ((Math.random() * 2) | 0)
                    name = "grass.edge" + index
                }
                this.set(name + "." + dir, gx, gy, 0)
            }
        }
    }

    isStamp(name) {
        let block = BLOCKS[name]
        return block.options && block.options["stamp"]
    }

    fixEdges() {
        this.edgeLayer.reset()
        for (let xx = 0; xx < Config.MAP_SIZE; xx += Config.GROUND_TILE_W) {
            for (let yy = 0; yy < Config.MAP_SIZE; yy += Config.GROUND_TILE_H) {
                this.drawGroundEdges(xx, yy)
            }
        }
    }

    _saveInSprite(sprite, name, x, y, z, fx, fy) {
        // set some calculated values
        if(name) sprite.name = name
        sprite.key = _key(x, y, z)
        sprite.gamePos = [x, y, z]
        sprite.floatPos = [fx || x, fy || y]
        sprite.mapX = (x / Config.MAP_SIZE)|0
        sprite.mapY = (y / Config.MAP_SIZE)|0
    }

    /**
     * The lowest empty z coordinate at this location.
     *
     * @param worldX
     * @param worldY
     * @param sprite
     */
    getTopAt(worldX, worldY, sprite) {
        return this.objectLayer.getTopAt(worldX, worldY, sprite, this.visibleHeight)
    }


    isFree(worldX, worldY, worldZ, w, h, d) {
        return this.objectLayer.isFree(worldX, worldY, worldZ, w, h, d)
    }

    sort() {
        for(let layer of this.layers) layer.sort()
    }

    toScreenCoords(worldX, worldY, worldZ) {
        return [
            ((worldX - worldY) * Config.GRID_SIZE + this.game.world.centerX),
            ((worldY + worldX - worldZ) + 10) * Config.GRID_SIZE
        ]
    }

    toAbsScreenCoords(worldX, worldY, worldZ) {
        let [screenX, screenY] = this.toScreenCoords(worldX, worldY, worldZ)
        return [(screenX + this.objectLayer.group.x) * this.zoom, (screenY + this.objectLayer.group.y) * this.zoom]
    }

    toWorldCoords(screenX, screenY) {
        let sx = (screenX - this.game.world.centerX - this.floorLayer.group.x) / Config.GRID_SIZE
        let sy = (screenY - this.floorLayer.group.y) / Config.GRID_SIZE
        let worldY = (sy - 10 - sx) / 2
        let worldX = sx + worldY
        return [
            (worldX)|0,
            (worldY)|0,
            0
        ]
    }

    move(dx, dy) {
        for(let layer of this.layers) layer.move(dx, dy)
        if(this.editorMode && !this.mapperMode) {
            this.border.x += dx
            this.border.y += dy
        }
    }

    moveToPos(x, y) {
        for(let layer of this.layers) layer.moveTo(x, y)
        if(this.editorMode && !this.mapperMode) {
            this.border.x = x
            this.border.y = y
        }
    }

    findClosestObject(image, range, fx) {
        return this.objectLayer.findClosest(image, range, fx)
    }

    destroy() {
        for(let layer of this.layers) layer.destroy()
    }

    prepareToDestroy() {
        for(let layer of this.layers) layer.prepareToDestroy()
    }

    completeDestroy() {
        for(let layer of this.layers) layer.completeDestroy()
    }

    save(x, y) {
        let name = this._name(x, y)
        let data = JSON.stringify({
            version: Config.MAP_VERSION,
            name: name,
            layers: this.layers.map(layer => layer.save())
        })
        $.ajax({
            type: "POST",
            url: "http://localhost:9090/cgi-bin/upload.py",
            data: "name=" + name + "&file=" + data,
            //success: ()=>{alert("Success!");},
            //error: (error)=>{console.log("Error:", error); alert("error: " + error);},
            dataType: "text/json"
        });
    }

    _name(x, y) {
        return ("00" + x.toString(16)).slice(-2) + ("00" + y.toString(16)).slice(-2)
    }

    loadXY(x, y, onLoad, onError) {
        if(x < 0 || y < 0 || x >= Config.MAX_MAP_X + 4 || y >= Config.MAX_MAP_Y + 4) return

        let name = this._name(x, y)
        if(this.editorMode) {
            this._load(name, x, y, () => {
                if(onLoad) onLoad()
            }, onError)
        } else {
            if (this.cache[name] == null) {

                // delete oldest maps
                if (!this.editorMode) {
                    while (this.cacheOrder.length >= Config.MAX_MAP_CACHE_SIZE) {
                        let oldestName = this.cacheOrder.splice(0, 1)
                        console.warn("Freeing map: " + oldestName)
                        this.game.mapUnloaded(...this.cache[oldestName])
                        let pos = this.cache[oldestName]
                        delete this.cache[oldestName]
                        this.layers.forEach(layer => layer.deleteMapImages(...pos))
                    }
                }

                // keep this map
                let n = this.cacheOrder.indexOf(name)
                if (n > -1) this.cacheOrder.splice(n, 1)
                this.cacheOrder.push(name)
                this.cache[name] = [x, y]

                console.warn("MAP LOAD: name=" + name + " cacheOrder=", this.cacheOrder)

                this._load(name, x, y, () => {
                    if (onLoad) onLoad()
                }, onError)
            } else {
                // move to back of cache
                let n = this.cacheOrder.indexOf(name)
                this.cacheOrder.splice(n, 1)
                this.cacheOrder.push(name)

                console.warn("MAP TOUCH: name=" + name + " cacheOrder=", this.cacheOrder)

                if (onLoad) onLoad()
            }
        }
    }

    checkWorld() {
        for(let key in this.objectLayer.world) {
            for(let imageInfo of this.objectLayer.world[key].imageInfos) {
                if(imageInfo.image.mapX == null || imageInfo.image.mapY == null) {
                    console.warn("No mapXY set on image: " + imageInfo.name + " key=" + key + " map=" + imageInfo.image.mapX + "," + imageInfo.image.mapY)
                } else {
                    let name = this._name(imageInfo.image.mapX, imageInfo.image.mapY)
                    if (this.cache[name] == null) {
                        throw "Uncached image at " + key + " name=" + imageInfo.name + " map=" + name
                    }
                }
            }
        }
    }

    _load(name, x, y, onLoad, onError) {
        $.ajax({
            url: "/assets/maps/" + name + ".json",
            dataType: "json",
            success: (data) => {
                if(this.editorMode) {
                    data.layers.forEach(layerInfo => this.layersByName[layerInfo.name].load(layerInfo, this, 0, 0))
                    // load perimeter data
                    if(this.loadPerimeter) {
                        for (let xx = -1; xx <= 1; xx++) {
                            for (let yy = -1; yy <= 1; yy++) {
                                if (xx == 0 && yy == 0) continue;

                                $.ajax({
                                    url: "/assets/maps/" + this._name(x + xx, y + yy) + ".json",
                                    dataType: "json",
                                    success: (data) => {
                                        data.layers.forEach(layerInfo =>
                                            this.layersByName[layerInfo.name].loadPerimeter(layerInfo, this, xx, yy))
                                    }
                                })
                            }
                        }
                    }
                    this.sort()
                } else {
                    data.layers.forEach(layerInfo => this.layersByName[layerInfo.name].load(layerInfo, this, x, y))
                }

                if (onLoad) onLoad()
            },
            error: (error) => {
                console.warn("Error loading " + name + ":", error)
                if (onError) onError(error)
            }
        })

    }

    update() {
        Filters.update()
    }

    getTopSpriteAt(screenX, screenY) {
        // try the object layer
        let fromZ = this.visibleHeight > 0 ? this.visibleHeight - 1 : Config.MAX_Z
        for(let z = fromZ; z >= 0; z--) {
            let [worldX, worldY, worldZ] = this.toWorldCoords(screenX / this.zoom, (screenY + z * Config.GRID_SIZE) / this.zoom)
            worldZ = z
            let info = this.objectLayer.infos[_key(worldX, worldY, worldZ)]
            if(info && info["imageInfos"] && info.imageInfos.length > 0) return info.imageInfos[0].image
        }
        return null
    }

    highlight(sprite) {
        if(sprite != this.highlightedSprite) {
            if(this.highlightedSprite) {
                this.highlightedSprite.tint = 0xffffff
            }
            this.highlightedSprite = sprite
            if(this.highlightedSprite) {
                this.highlightedSprite.tint = 0x888888
            }
        }
    }

    moveNear(sprite, x, y, z, range) {
        return !_visit3d(x + (range/2)|0, y + (range/2)|0, z, range, range, 1, (xx, yy, zz) => {
            if(this.moveTo(sprite, xx, yy, zz)) {
                // return false so the SS loop quits
                return false
            }
            // keep looking
            return true
        })
    }

    // todo: not sure if this works right
    isOnScreen(worldX, worldY, worldZ) {
        let [screenX, screenY] = this.toAbsScreenCoords(worldX, worldY, worldZ)
        return screenX >= 0 && screenX < Config.WIDTH && screenY >= 0 && screenY < Config.HEIGHT
    }

    tint(color) {
        this.layers.forEach(layer => layer.tint(color))
    }
}
