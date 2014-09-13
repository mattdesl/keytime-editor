var numberEditor = require('number-editor')
var classes = require('dom-classes')
var lerp = require('lerp')
var EventEmitter = require('events').EventEmitter

function VecN(count, opt) {
    if (!(this instanceof VecN))
        return new VecN(count, opt)
    opt = opt||{}
    EventEmitter.call(this)
    

    this.element = document.createElement("div")
    classes.add(this.element, 'number-editor-group')
    this.editors = []
    count = count||1
    for (var i=0; i<count; i++) {
        var editor = numberEditor(opt)
        classes.add(editor.element, 'number-editor')

        editor.on('change', this.emit.bind(this, 'change'))
        this.editors.push( editor )
        this.element.appendChild(editor.element)
    }
}

require('inherits')(VecN, EventEmitter)

VecN.prototype.lerp = function(other, a) {
    for (var i=0; i<other.length; i++) {
        var e = this.editors[i]
        e.value = lerp(e.value, other[i], a)
    }
}

Object.defineProperty(VecN.prototype, "value", {
    get: function() {
        return this.editors.map(function(e) {
            return e.value
        })
    },
    set: function(array) {
        array.forEach(function(v, i) { 
            this.editors[i].value = v
        }.bind(this))
    }
})

module.exports = VecN