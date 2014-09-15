var Base = require('./base')
var inherits = require('inherits')
var classes = require('dom-classes')
var domify = require('domify')
var clickdrag = require('clickdrag')
var events = require('dom-events')
var keycode = require('keycode')
var getMouseOffset = require('mouse-event-offset')
var xtend = require('xtend')

var NumberEditors = require('./dom/number-editors')
var createTimeline = require('./dom/create-timeline')
var SelectBox = require('./dom/select-box')
var eases = require('eases')

var noop = function() { return null }

var SCALE = 100

function Editor() {
	if (!(this instanceof Editor))
		return new Editor()

	Base.call(this)
	
	this.defaultConstraint = { decimals: 1 }
	this.easings = Object.keys(eases)
	this.easings = this.easings.filter(function(e) {
		return 'linear'
	})
	this.easings.unshift({ disabled: true, name: '—' })
	this.easings.unshift('linear')

	this.constraints = {}
	this.editors = {}
	this.shyNames = []
	this.keyEvents = true
	// this.editable = true

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
    this.on('load', this._updateShyLayers.bind(this))

    this.draggable = clickdrag(this.rightPanel)
    this.propertyDrag = null
    this.draggable.on('start', this._onDragStart.bind(this))
    this.draggable.on('move', this._onDrag.bind(this))
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

    this.on('select-easing', function(propertyData) {
    	var ease = propertyData.easingBox.selected()
    	if (propertyData.currentKeyframe) {
    		propertyData.currentKeyframe.ease = ease
    	}
    }.bind(this))

    events.on(document, 'keydown', handleKey.bind(this), true)

}

inherits(Editor, Base)

function handleKey(ev) {
	if (!this.keyEvents)
		return

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
	} else if (key === 'delete' || key === 'backspace') {
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

Editor.prototype._onDragStart = function(ev, offset, delta) {
	if (this.draggingKeyframe)
		this.propertyDrag = this.draggingKeyframe.element.parentNode
	else
		this.propertyDrag = ev.target
	this._onDrag(ev, offset, delta)
}

Editor.prototype._onDrag = function(ev, offset, delta) {
	ev.preventDefault()	

	if (!this.propertyDrag)
		return

	var rect = this.propertyDrag.getBoundingClientRect()
    offset = getMouseOffset(ev, { clientRect: rect })
    offset.x = Math.max(0, offset.x)

	if (this.draggingKeyframe) {
		this.draggingKeyframe.element.style.left = Math.round(offset.x)+'px'
		this.draggingKeyframe.keyframe.time = offset.x/SCALE
		this.draggingKeyframe.propertyData.updateKeyframes()
		this._updateProperties()
	} else {
		this.playhead(offset.x / SCALE)
	}
}

function onDragEnd(ev, offset, delta) {
	this.draggingKeyframe = null
	this.propertyDrag = null
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

            var highlightIdx = prop.keyframes.getIndex(curTime)
            var highlight = prop.keyframes.frames[highlightIdx]
            var hasKeyframe = highlightIdx > 0
            propData.keyframeData.forEach(function(k) {
            	classes.remove(k.element, 'highlight')
            	if (k.keyframe===highlight) {
	                classes.add(k.element, 'highlight')
	            }
            })


            classes.remove(propData.element, 'has-easing')
            if (hasKeyframe) 
            	classes.add(propData.element, 'has-easing')

            if (propData.easingBox) {
            	var box = propData.easingBox.element
            	if (hasKeyframe) {
	            	box.removeAttribute('disabled')
	            	propData.easingBox.select(highlight.ease || 'linear')
	            } else
	            	box.setAttribute('disabled', 'disabled')
	        }
            propData.currentKeyframe = highlight
        })
    })
	this.emit('update')
}

Editor.prototype.createEasingSelect = function(options) {
	return new SelectBox(xtend(options||{}, { data: this.easings }))
}

Editor.prototype.valueEditor = function(name, func) {
	if (!func)
		this.editors[name] = undefined
	else
		this.editors[name] = func
	return this
}

Editor.prototype.createValueEditor = function(timeline, property) {
	var value = timeline.valueOf(0, property)
	

	var opt = this.defaultConstraint
	var editor = null
	var name = property.name
	if (name in this.constraints)
		opt = xtend(opt, this.constraints[name])

	//custom editor
	if (name in this.editors &&
			typeof this.editors[name] === 'function') {
		return this.editors[name](timeline, property, value, opt) 
	}

	if (typeof value === 'number') {
		editor = NumberEditors(1, opt)
	} else if (Array.isArray(value)) {
		editor = NumberEditors(value.length, opt)
	}
	if (editor)
		editor.value = value
	return editor
}

function setVisible(timelineData, vis) {
	if (vis) {
		classes.remove(timelineData.animationContainer, 'hide')
		classes.remove(timelineData.element, 'hide')
	} else {
		classes.add(timelineData.animationContainer, 'hide')
		classes.add(timelineData.element, 'hide')
	}

}

Editor.prototype.hideAll = function() {
	this.timelinesData.forEach(function(t) {
		setVisible(t, false)
	})
}

Editor.prototype.showAll = function() {
	this.timelinesData.forEach(function(t) {
		setVisible(t, true)
	})
}

Editor.prototype.hide = function(name) {
	var ret = this.timelineData(name)
	if (ret)
		setVisible(ret, false)
}

Editor.prototype.show = function(name) {
	var ret = this.timelineData(name)
	if (ret)
		setVisible(ret, true)
}

Editor.prototype._toggleKeyframe = function(timelineData, propertyData) {
	var time = this.playhead()
	propertyData.toggleKeyframe(this, timelineData.timeline, time)
	this._updateProperties()
}

Editor.prototype._removeKeyframeAt = function(timelineData, propertyData, frame) {
	var idx = propertyData.property.keyframes.frames.indexOf(frame)
	if (idx !== -1) {
		propertyData.removeKeyframeAt(this, timelineData.timeline, idx)
		this._updateProperties()		
	}
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
	events.on(ret.element, 'dblclick', function(ev) {
		ev.stopPropagation()
    	ev.preventDefault()

		if (ev.shiftKey) {
			this.draggingKeyframe = null
			this._removeKeyframeAt(propertyData.timelineData, propertyData, keyframe)
		}
	}.bind(this))
	return ret
}

Editor.prototype.appendTo = function(element) {
	element.appendChild(this.element)
}

Editor.prototype.timelines = function() {
	return this.timelinesData.map(function(t) {
		return { name: t.name, timeline: t.timeline.export() }
	})
}

Editor.prototype.constraint = function(name, constraints) {
	if (Array.isArray(name)) {
		name.forEach(function(n) {
			this.constraints[n] = constraints
		}.bind(this))
	}
	else
		this.constraints[name] = constraints
}

Editor.prototype.clear = function() {
	this.timelinesData.forEach(function(t) {
		t.dispose()
	})
	this.timelinesData.length = 0
}

Editor.prototype.shy = function(names) {
	names = typeof names === 'string' ? [names] : names
	names.forEach(function(n) {
		if (this.shyNames.indexOf(n) === -1)
			this.shyNames.push(n)
	}.bind(this))
	this._updateShyLayers()
	return this
}

Editor.prototype._updateShyLayers = function() {
	var shyNames = this.shyNames
	this.timelinesData.forEach(function(t) {
		t.propertyData.forEach(function(p) {
			var shy = shyNames.indexOf(p.property.name) !== -1
			classes.remove(p.element, 'shy')
			classes.remove(p.animationElement, 'shy')
			if (shy) {
				classes.add(p.element, 'shy')
				classes.add(p.animationElement, 'shy')
			}
		})
	})
}

Editor.prototype.add = function(timeline, name) {
	var ret = Base.prototype.add.call(this, timeline, name)
	var dur = timeline.duration()
	ret.animationContainer.style.minWidth = Math.round((dur+1.0)*SCALE)+'px'
	return ret
}

module.exports = Editor