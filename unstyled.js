var Base = require('./base')
var inherits = require('inherits')
var classes = require('dom-classes')
var domify = require('domify')
var clickdrag = require('clickdrag')
var events = require('dom-events')
var keycode = require('keycode')

var NumberEditors = require('./dom/number-editors')
var createTimeline = require('./dom/create-timeline')

var SCALE = 100

function Editor() {
	if (!(this instanceof Editor))
		return new Editor()

	Base.call(this)
	
	this.constraints = {}

    this.element = domify('<div class="keytime-editor-container">')
    this.leftPanel = domify('<div class="timeline-container">')
    this.rightPanel = domify('<div class="animations-container">')
    this.element.appendChild(this.leftPanel)
    this.element.appendChild(this.rightPanel)

    this.playheadElement = domify('<div class="playhead">')
    this.rightPanel.appendChild(this.playheadElement)

    this.on('playhead', handlePlayhead.bind(this))
    this.on('keyframe-toggle', this._toggleKeyframe.bind(this))
    this.on('keyframe-next', keyframeNext.bind(this, true))
    this.on('keyframe-previous', keyframeNext.bind(this, false))
    this.on('keyframe-remove', this._removeKeyframe.bind(this))

    this.on('load', handlePlayhead.bind(this))
    

    this.draggable = clickdrag(this.rightPanel)
    this.draggable.on('start', onDrag.bind(this))
    this.draggable.on('move', onDrag.bind(this))
    this.draggable.on('end', onDragEnd.bind(this))
    this.draggingKeyframe = null

    this.highlightProperty = null
    this.on('highlight-property', function(prop) {
    	if (this.highlightProperty && prop !== this.highlightProperty) {
    		var old = this.highlightProperty
    		classes.remove(old.element, 'highlight')
    		classes.remove(old.animationElement, 'highlight')
    	}
    	this.highlightProperty = prop
    	classes.add(prop.element, 'highlight')
    	classes.add(prop.animationElement, 'highlight')
    }.bind(this))

    events.on(this.element, 'keydown', handleKey.bind(this))
    
}

inherits(Editor, Base)

function handleKey(ev) {
	console.log("EVENT", ev)
	var key = keycode(ev)
	if (key === 'left') {
		ev.preventDefault()
		if (this.highlightProperty) 
			this.emit('keyframe-previous', this.highlightProperty)
	} else if (key === 'right') {
		ev.preventDefault()
		if (this.highlightProperty) 
			this.emit('keyframe-next', this.highlightProperty)
	} else if (key === 'k') {
		ev.preventDefault()
		if (this.highlightProperty) 
			this.emit('keyframe-toggle', this.highlightProperty.timelineData, this.highlightProperty)
	} else if (key === 'del') {
		ev.preventDefault()
		if (this.highlightProperty) 
			this.emit('keyframe-remove', this.highlightProperty.timelineData, this.highlightProperty)
	}
}

function keyframeNext(goNext, propertyData) {
	var keyframes = propertyData.property.keyframes
	var time = this.playhead()
    var next = goNext ? keyframes.next(time) : keyframes.previous(time)
    if (next) {
        this.playhead(next.time)
    }
}

function onDrag(ev, offset, delta) {
	ev.preventDefault()
	ev.stopPropagation()
	if (this.draggingKeyframe) {
		this.draggingKeyframe.element.style.left = Math.round(offset.x)+'px'
		this.draggingKeyframe.keyframe.time = offset.x/SCALE
		this.draggingKeyframe.propertyData.updateKeyframes()
	} else {
		this.playhead(offset.x / SCALE)
	}
}

function onDragEnd(ev, offset, delta) {
	this.draggingKeyframe = null
}

function handlePlayhead(time) {
	this.playheadElement.style.left = Math.round(time*SCALE)+'px'
	this._updateProperties()
}



//Creates a new timeline object which has { element, open, name, dispose }
Editor.prototype._createTimeline = function(timeline, name) {
	return createTimeline(this, timeline, name)
}

Editor.prototype._updateProperties = function() {
    var curTime = this.playhead()
    this.timelinesData.forEach(function(tData) {
    	var timeline = tData.timeline

        tData.propertyData.forEach(function(propData) {
        	var prop = propData.property
			var curVal = timeline.valueOf(curTime, prop)	
			propData.updateEditor(curVal)

            var highlight = prop.keyframes.get(curTime)
            propData.keyframeData.forEach(function(k) {
                k.element.style.borderColor = k.keyframe===highlight ? 'green' : 'red'
            })
        })
    })
}

Editor.prototype.createValueEditor = function(timeline, property) {
	var value = timeline.valueOf(0, property)
	
	var opt = null
	if (property.name in this.constraints)
		opt = this.constraints[property.name]
	if (typeof value === 'number') {
		return NumberEditors(1, opt)
	} else if (Array.isArray(value)) {
		return NumberEditors(value.length, opt)
	}
	return null
}

Editor.prototype._toggleKeyframe = function(timelineData, propertyData) {
	var time = this.playhead()
	propertyData.toggleKeyframe(this, timelineData.timeline, time)
	this._updateProperties()
}

Editor.prototype._removeKeyframe = function(timelineData, propertyData) {
	var time = this.playhead()
	propertyData.removeKeyframe(this, timelineData.timeline, time)
	this._updateProperties()		
}

Editor.prototype._createKeyframe = function(propertyData, keyframe) {
	//TODO: use keyframe-data here
	var ret = {
		element: domify('<figure class="keyframe">'),
		keyframe: keyframe,
		propertyData: propertyData
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

Editor.prototype.constraint = function(name, constraints) {
	this.constraints[name] = constraints
}

module.exports = Editor