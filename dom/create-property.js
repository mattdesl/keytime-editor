var fs = require('fs')
var html = fs.readFileSync(__dirname+'/html/property.html', 'utf8')
var hyperglue = require('hyperglue')
var $ = require('dom-select')
var classes = require('dom-classes')
var events = require('dom-events')
var domify = require('domify')

var BaseProperty = require('../lib/property-data')

//Builds a DOM element from a keytime property 
module.exports = function(editor, timelineData, property) {
	var ret = BaseProperty(timelineData, property)

    //the element which holds buttons, name, etc.
    var element = hyperglue(html, {
        '.name': property.name
    })
    ret.element = element

    var easeElement = $('.easing', element)
    ret.easingBox = editor.createEasingSelect({ element: easeElement })
    if (ret.easingBox) {
        ret.easingBox.on('change', function(ev) {
            editor.emit('select-easing', ret)
        })
    }

    var valueEditor = editor.createValueEditor(timelineData.timeline, property)
    var controlPanel = $('.control-editor', element)
    if (valueEditor && valueEditor.element) {
    	controlPanel.appendChild(valueEditor.element)
    	ret.valueEditor = valueEditor

        //set default property
        property.value = valueEditor.value

    	valueEditor.on('change', function() {
    		var current = property.keyframes.get( editor.playhead() )
	        if (current) { //adjust current keyframe
                property.value = valueEditor.value
	            current.value = valueEditor.value
	        } 
            // else if (property.keyframes.count === 0) { //no keyframes, adjust constant
            //     property.value = valueEditor.value
            // } 
            else {
                console.log("ADD")
                var key = ret._createKeyframe(timelineData.timeline, editor.playhead() )
                ret.addKeyframe(editor, key)
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
    