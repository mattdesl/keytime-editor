var fs = require('fs')

var timelineHTML = fs.readFileSync(__dirname + '/html/timeline-animation.html', 'utf8')
var propertyHTML = fs.readFileSync(__dirname + '/html/property-animation.html', 'utf8')

var hyperglue = require('hyperglue')
var $ = require('dom-select')
var classes = require('dom-classes')
var events = require('dom-events')
var domify = require('domify')

//DOM area to visualize/edit keyframes and shape timelines
module.exports = function(editor, timeline) {
	var container = domify(timelineHTML)

	timeline.properties.forEach(function(prop) {
		var propElement = domify(propertyHTML)

		var frames = prop.keyframes.frames
		for (var i=0; i<frames.length; i++) {
			var key = editor._createKeyframe(timeline, prop, frames[i])
			propElement.appendChild(key.element)
		}

		container.appendChild(propElement)
	})

	//show/hide this container along with the timeline element
    timeline.on('opened', function() {
        console.log("LAYER OPEN")
        classes.remove(container, 'layer-open')
        classes.add(container, 'layer-open')
    })
    timeline.on('closed', function() {
        classes.remove(container, 'layer-open')
    })

	editor.rightPanel.appendChild(container)
	return container
}