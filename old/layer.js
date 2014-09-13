var fs = require('fs')
var html = fs.readFileSync(__dirname+'/html/layer.html', 'utf8')
var hyperglue = require('hyperglue')
var $ = require('dom-select')
var classes = require('dom-classes')
var events = require('dom-events')

var Control = require('./control')
var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')


function Layer(data, editors) {
    if (!(this instanceof Layer)) return new Layer(data, editors)
    EventEmitter.call(this)
    this.element = null
    this.timeline = null
    this._open = false

    if (data)
        this.create(data, editors)
}

inherits(Layer, EventEmitter)

Layer.prototype.dispose = function() {
    if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element)
        this.element = null
    }
    this.controls.length = 0
    this.open = false
}

Layer.prototype.create = function(data, editors) {  
    this.dispose()

    this.element = hyperglue(html, {
        '.name': data.name
    })

    var controlContainer = $('.controls', this.element)
    ;(data.controls||[]).forEach(function(c) {
        var control = new Control(c, editors)
        controlContainer.appendChild(control.element)
        this.controls.push(control)
    }.bind(this))

    //setup events
    var expand = $('.expand', this.element)
    events.on(expand, 'click', function(ev) {
        ev.preventDefault()
        this.open = !this.open
    }.bind(this))
}

Object.defineProperty(Layer.prototype, "open", {
    get: function() {
        return this._open
    },
    set: function(open) {
        var old = this._open
        this._open = open
        if (this.element) {
            classes.remove(this.element, 'layer-open')
            if (this._open)
                classes.add(this.element, 'layer-open')
        }

        if (old !== this._open) {
            // console.log("EMITTING", this._open)
            this.emit(this._open ? 'opened' : 'closed')
        }
    }
})

module.exports = Layer