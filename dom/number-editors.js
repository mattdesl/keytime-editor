var numberEditor = require('number-editor')
var classes = require('dom-classes')
var lerp = require('lerp')
var EventEmitter = require('events').EventEmitter

function NumberEditors(count, opt) {
    if (!(this instanceof NumberEditors))
        return new NumberEditors(count, opt)
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

require('inherits')(NumberEditors, EventEmitter)

NumberEditors.prototype.lerp = function(other, a) {
    for (var i=0; i<other.length; i++) {
        var e = this.editors[i]
        e.value = lerp(e.value, other[i], a)
    }
}

Object.defineProperty(NumberEditors.prototype, "value", {
    get: function() {
        if (this.editors.length === 1) {
            return this.editors[0].value
        } else {
            return this.editors.map(function(e) {
                return e.value
            })
        }
    },
    set: function(array) {
        if (typeof array === 'number' && this.editors.length === 1) {
            this.editors[0].value = array
        } else {
            if (!array)
                debugger
            array.forEach(function(v, i) { 
                this.editors[i].value = v
            }.bind(this))
        }
    }
})

module.exports = NumberEditors