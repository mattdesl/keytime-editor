var fs = require('fs')
var html = fs.readFileSync(__dirname+'/html/timeline.html', 'utf8')
var hyperglue = require('hyperglue')
var $ = require('dom-select')
var classes = require('dom-classes')
var events = require('dom-events')
var domify = require('domify')

var BaseTimeline = require('../lib/timeline-data')
var createProperty = require('./create-property')
var createAnimation = require('./create-animation')

//Builds a DOM element from a keytime instance 
module.exports = function(editor, timeline, name) {
	//the container for this row
	var ret = BaseTimeline(timeline, name)
	ret.propertyData = []

    //the element which holds buttons, name, etc.
    var element = hyperglue(html, {
        '.name': name
    })
    ret.element = element

    //the properties for this timeline
    var controlContainer = $('.controls', element)
    ;(timeline.properties||[]).forEach(function(p) {
        var prop = createProperty(editor, ret, p)
        controlContainer.appendChild(prop.element)
        ret.propertyData.push(prop)
    })

    //setup events
    var expand = $('.expand', element)
    events.on(expand, 'click', function(ev) {
        ev.preventDefault()
        ret.open = !ret.open
    })

    ret.on('opened', function() {
    	classes.remove(element, 'layer-open')
        classes.add(element, 'layer-open')
    })

    ret.on('closed', function() {
    	classes.remove(element, 'layer-open')
    })

	createAnimation(editor, ret)

    editor.leftPanel.appendChild(element)
    return ret
}
    