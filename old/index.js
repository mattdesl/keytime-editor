var createLayers = require('./layers')
var createAnimation = require('./animations')
var classes = require('dom-classes')
var EventEmitter = require('events').EventEmitter

function Timeline(data, opt) {
    if (!(this instanceof Timeline))
        return new Timeline(data, opt)
    EventEmitter.call(this)
    opt = opt||{}

    this.element = document.createElement("div")
    classes.add(this.element, 'main-container')

    this.layerManager = createLayers(opt)
    this.layerManager.create(data)

    this.animations = createAnimation(this.layerManager)

    this.element.appendChild(this.layerManager.element)
    this.element.appendChild(this.animations.element)
}

require('inherits')(Timeline, EventEmitter)

Timeline.prototype.open = function(index, val) {
    val = val !== false
    this.layerManager.layers[index].open = val
}

module.exports = Timeline