var keycode = require('keycode')
var offset = require('mouse-event-offset')
var events = require('dom-events')
var classes = require('dom-classes')
var $ = require('dom-select')
var domify = require('domify')
var fs = require('fs')
var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

var layerHTML = fs.readFileSync(__dirname + '/html/layer-animation.html', 'utf8')
var controlHTML = fs.readFileSync(__dirname + '/html/control-animation.html', 'utf8')

function Animations(layerManager) {
    if (!(this instanceof Animations))
        return new Animations(layerManager)
    EventEmitter.call(this)

    this.layerManager = layerManager
    this.element = document.createElement("div")
    classes.add(this.element, 'animations-container')

    this.create()

    this.playheadElement = document.createElement("div")
    classes.add(this.playheadElement, 'playhead')
    this.element.appendChild(this.playheadElement)

    this.playhead = 0
    this.dragging = null
    
    

}

inherits(Animations, EventEmitter)

Animations.prototype._createKeyframe = function(control, parent, x) {
    var keyframe = document.createElement("figure")
    classes.add(keyframe, 'keyframe')
    keyframe.style.left = Math.round(x)+'px'
    parent.appendChild(keyframe)

    control.addKeyframe(x, keyframe)
}

Animations.prototype._updateProperties = function() {
    var curTime = this.playhead
    this.layerManager.layers.forEach(function(layer) {
        layer.controls.forEach(function(c) {
            c.update(curTime)

            var highlight = c.keyframes.get(curTime)
            c.keyframes.frames.forEach(function(k) {
                k.element.style.borderColor = k===highlight ? 'green' : 'red'
            })
        })
    })
}

Animations.prototype.setTime = function(time) {
    this.playhead = time
    this.playheadElement.style.left = Math.round(time)+'px'
}

Animations.prototype._setupControlEvents = function(control, row) {
    events.on(row, 'mousedown', function(ev) {
        var rect = row.getBoundingClientRect()
        var x = offset(ev, { clientRect: rect }).x

        this.setTime(x)

        this.dragging = ev.button||ev.which
        this._updateProperties()
        this.emit('set-playhead')
    }.bind(this))

    events.on(row, 'mousemove', function(ev) {
        if (this.dragging !== null && this.dragging === (ev.button||ev.which)) {
            var rect = row.getBoundingClientRect()
            var x = offset(ev, { clientRect: rect }).x

            this.setTime(x)
            this._updateProperties()
            this.emit('set-playhead')
        }
    }.bind(this))

    events.on(row, 'mouseup', function(ev) {
        this.dragging = null
    }.bind(this))

    control.on('toggle-keyframe', function() {
        var current = control.keyframes.getIndex( this.playhead )
        if (current !== -1)  {
            var currentKey = control.keyframes.frames[current]
            control.keyframes.splice(current, 1)
            currentKey.element.parentNode.removeChild(currentKey.element)
        }
        else
            this._createKeyframe(control, row, this.playhead)
        this._updateProperties()
    }.bind(this))

    control.on('keyframe-next', function() {
        var next = control.keyframes.next( this.playhead )
        if (next) {
            this.setTime(next.time)
            this._updateProperties()
            this.emit('set-playhead')
        }
    }.bind(this))

    control.on('keyframe-previous', function() {
        var previous = control.keyframes.previous( this.playhead )
        if (previous) {
            this.setTime(previous.time)
            this._updateProperties()
            this.emit('set-playhead')
        }
    }.bind(this))

    control.on('change', function() {
        var current = control.keyframes.get( this.playhead )

        if (current) {
            current.value = control.value
        }
    }.bind(this))

    // events.on(row, 'keydown', function(ev) {
    //     console.log(keycode(ev)
    //     if (keycode(ev) === 'k') {
    //         ev.preventDefault()
    //         var x = offset(ev).x
    //         this._createKeyframe(control, row, x)
    //         this.emit('add-keyframe', x)
    //     }
    // }.bind(this))
}

Animations.prototype.create = function() {
    this.layerManager.layers.forEach(function(layer) {
        var container = domify(layerHTML)

        layer.on('opened', function() {
            console.log("LAYER OPEN")
            classes.remove(container, 'layer-open')
            classes.add(container, 'layer-open')
        }.bind(this, container))
        layer.on('closed', function() {
            classes.remove(container, 'layer-open')
        }.bind(this, container))

        layer.controls.forEach(function(c) {
            var controlRow = domify(controlHTML)

            this._setupControlEvents(c, controlRow)

            container.appendChild( controlRow )
        }.bind(this))


        this.element.appendChild( container )
    }.bind(this))
}

module.exports = Animations