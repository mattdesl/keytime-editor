var fs = require('fs')
var html = fs.readFileSync(__dirname+'/html/property.html', 'utf8')
var hyperglue = require('hyperglue')
var $ = require('dom-select')
var classes = require('dom-classes')
var events = require('dom-events')

var BaseProperty = require('../lib/property-data')

//Builds a DOM element from a keytime property 
module.exports = function(editor, timelineData, property) {
	var ret = BaseProperty(timelineData, property)

    //the element which holds buttons, name, etc.
    var element = hyperglue(html, {
        '.name': property.name
    })
    ret.element = element

    var valueEditor = editor.createValueEditor(timelineData.timeline, property)
    if (valueEditor && valueEditor.element) {
    	$('.control-editor', element).appendChild(valueEditor.element)
    	ret.valueEditor = valueEditor

    	valueEditor.on('change', function() {
    		var current = property.keyframes.get( editor.playhead() )
	        if (current) {
	            current.value = valueEditor.value
	        }
    	})
    }

    var toggle = $('.keyframe-toggle', element)
    events.on(toggle, 'click', function(ev) {
        editor.emit('keyframe-toggle', timelineData, ret)
    })

    var next = $('.keyframe-next', element)
    events.on(next, 'click', function(ev) {
        editor.emit('keyframe-next', ret)
    })

    var previous = $('.keyframe-previous', element)
    events.on(previous, 'click', function(ev) {
        editor.emit('keyframe-previous', ret)
    })

    events.on(element, 'click', function(ev) {
    	editor.emit('highlight-property', ret)
    })

    return ret
}
    