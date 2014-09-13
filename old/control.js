var fs = require('fs')
var html = fs.readFileSync(__dirname+'/html/control.html', 'utf8')
var hyperglue = require('hyperglue')
var $ = require('dom-select')
var classes = require('dom-classes')
var events = require('dom-events')
var Keyframes = require('keyframes')

var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

function sort(a, b) {
    return a.time - b.time
}
function range(min, max, value) {
  return (value - min) / (max - min)
}

function Control(data, editors) {
    if (!(this instanceof Control)) return new Control(data, editors)
    EventEmitter.call(this)
    this.element = null
    this.enabled = true
    this.editor = null
    this.keyframes = new Keyframes()

    if (data)
        this.create(data, editors)
}

inherits(Control, EventEmitter)

Control.prototype.dispose = function() {
    if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element)
        this.element = null
    }
    this.keyframes.frames.length = 0
}

Control.prototype.update = function(time) {
    //no keyframes..
    if (this.keyframes.count === 0)
        return

    this.value = this.keyframes.value(time).slice(0)
}

Control.prototype.addKeyframe = function(time, element) {
    this.keyframes.add({ time: time, element: element, value: this.value })
}



Control.prototype.create = function(data, editors) {
    this.dispose()
    
    this.element = hyperglue(html, {
        '.name': data.name
    })  
    this.name = data.name

    this.keyframes.frames = data.keyframes || []
    this.keyframes.sort()

    if (!data.type)
        data.type = 'default'

    if (data.type in editors) {
        this.editor = editors[data.type](data.options)
        $('.control-editor', this.element).appendChild(this.editor.element)
    } else
        throw new Error("no editor "+data.type+" for control: "+data)

    //TODO: eventually make a "skeleton" of everything that
    //doesn't actually depend on the DOM
    var toggle = $('.keyframe-toggle', this.element)
    events.on(toggle, 'click', function(ev) {
        this.emit('toggle-keyframe')
    }.bind(this))

    var next = $('.keyframe-next', this.element)
    events.on(next, 'click', function(ev) {
        this.emit('keyframe-next')
    }.bind(this))

    var previous = $('.keyframe-previous', this.element)
    events.on(previous, 'click', function(ev) {
        this.emit('keyframe-previous')
    }.bind(this))

    this.editor.on('change', function() {
        this.emit('change')
    }.bind(this))
}

Object.defineProperty(Control.prototype, "value", {
    get: function() {
        if (!this.editor)
            throw new Error("value can only be accessed after create()")
        return this.editor.value
    },
    set: function(value) {
        if (!this.editor)
            throw new Error("value can only be set after create()")
        this.editor.value = value
    }
})

module.exports = Control