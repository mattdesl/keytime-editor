var Base = require('./base')
var inherits = require('inherits')
var classes = require('dom-classes')
var domify = require('domify')
var clickdrag = require('clickdrag')
var events = require('dom-events')

var createTimeline = require('./dom/create-timeline')

var SCALE = 100

function Editor() {
	if (!(this instanceof Editor))
		return new Editor()

	Base.call(this)
	
    this.element = domify('<div class="keytime-editor-container">')
    this.leftPanel = domify('<div class="timeline-container">')
    this.rightPanel = domify('<div class="animations-container">')
    this.element.appendChild(this.leftPanel)
    this.element.appendChild(this.rightPanel)


    this.playheadElement = domify('<div class="playhead">')
    this.rightPanel.appendChild(this.playheadElement)

    this.on('playhead', handlePlayhead.bind(this))

    this.draggable = clickdrag(this.rightPanel)
    this.draggable.on('start', onDrag.bind(this))
    this.draggable.on('move', onDrag.bind(this))
    this.draggable.on('end', onDragEnd.bind(this))
    this.draggingKeyframe = null
}

inherits(Editor, Base)

function onDrag(ev, offset, delta) {
	ev.preventDefault()
	ev.stopPropagation()
	if (this.draggingKeyframe) {
		this.draggingKeyframe.element.style.left = Math.round(offset.x)+'px'
		this.draggingKeyframe.keyframe.time = offset.x/SCALE
		this.draggingKeyframe.property.keyframes.sort()
	} else {
		this.playhead(offset.x / SCALE)
	}
}

function onDragEnd(ev, offset, delta) {
	this.draggingKeyframe = null
}

function handlePlayhead(time) {
	this.playheadElement.style.left = Math.round(time*SCALE)+'px'
}

//Creates a new timeline object which has { element, open, name, dispose }
Editor.prototype._createTimeline = function(timeline, name) {
	return createTimeline(this, timeline, name)
}

Editor.prototype._createKeyframe = function(timeline, property, keyframe) {
	//TODO: set this up so we can dispose them a little better
	var ret = {
		element: domify('<figure class="keyframe">'),
		keyframe: keyframe,
		property: property
	}

	ret.element.style.left = Math.round(keyframe.time*SCALE)+'px'
	events.on(ret.element, 'mousedown', function(ev) {
		this.draggingKeyframe = ret
	}.bind(this))
	return ret
}

Editor.prototype.appendTo = function(element) {
	element.appendChild(this.element)
}

module.exports = Editor