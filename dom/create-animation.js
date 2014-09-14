var fs = require('fs')

var timelineHTML = fs.readFileSync(__dirname + '/html/timeline-animation.html', 'utf8')
var propertyHTML = fs.readFileSync(__dirname + '/html/property-animation.html', 'utf8')

var hyperglue = require('hyperglue')
var $ = require('dom-select')
var classes = require('dom-classes')
var events = require('dom-events')
var domify = require('domify')

//DOM area to visualize/edit keyframes and shape timelines
module.exports = function(editor, timelineData) {
	var container = domify(timelineHTML)

	timelineData.propertyData.forEach(function(propData) {
		var prop = propData.property //the original keytime property object
		var propElement = domify(propertyHTML)
		propData.animationElement = propElement

		var frames = prop.keyframes.frames
		propData.keyframeData.length = 0 

		for (var i=0; i<frames.length; i++) {
			propData.addKeyframe(editor, frames[i], true)
		}

	    events.on(propElement, 'mousedown', function(ev) {
	    	editor.emit('highlight-property', propData)
	    })

		container.appendChild(propElement)
	})

	//show/hide this container along with the timeline element
    timelineData.on('opened', function() {
        classes.remove(container, 'layer-open')
        classes.add(container, 'layer-open')
    })
    timelineData.on('closed', function() {
        classes.remove(container, 'layer-open')
    })

	editor.rightPanel.appendChild(container)
	return container
}