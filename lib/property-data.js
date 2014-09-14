var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

function PropertyData(timelineData, property) {
	if (!(this instanceof PropertyData))
		return new PropertyData(timelineData, property)
	this.property = property
	this.timelineData = timelineData
	this.keyframeData = []
	this.animationElement = null
	this.valueEditor = null

	EventEmitter.call(this)

	this.element = null
}

inherits(PropertyData, EventEmitter)

PropertyData.prototype.updateKeyframes = function() {
	this.property.keyframes.sort()
}

PropertyData.prototype.updateEditor = function(value) {
	if (this.valueEditor) {
		this.valueEditor.value = value
	}
}

PropertyData.prototype.getKeyframeData = function(keyframe) {
	for (var i=0; i<this.keyframeData.length; i++) {
		var k = this.keyframeData[i]
		if (k.keyframe === keyframe)
			return k
	}
	return null
}

PropertyData.prototype._createKeyframe = function(timeline, time) {
	var value
	if (this.valueEditor)
		value = this.valueEditor.value
	else
		value = timeline.valueOf(time, this.property)
	return { time: time, value: value }
}


PropertyData.prototype.removeKeyframe = function(editor, timeline, time) {
	var property = this.property
	var current = property.keyframes.getIndex(time)
	    
	//determine the keyframe at that time stamp..
	if (current !== -1) {
        var currentKey = property.keyframes.frames[current]
        property.keyframes.splice(current, 1)

        var keyData = this.getKeyframeData(currentKey)
        if (keyData) {
        	keyData.element.parentNode.removeChild(keyData.element)
        }
    }
}

PropertyData.prototype.toggleKeyframe = function(editor, timeline, time) {
	var property = this.property
	var current = property.keyframes.getIndex(time)
	    
	//determine the keyframe at that time stamp..
	if (current !== -1) {
        var currentKey = property.keyframes.frames[current]
        property.keyframes.splice(current, 1)

        var keyData = this.getKeyframeData(currentKey)
        if (keyData) {
        	keyData.element.parentNode.removeChild(keyData.element)
        }
    } else {
    	this.addKeyframe(editor, this._createKeyframe(timeline, time))
    }
}

PropertyData.prototype.addKeyframe = function(editor, keyframe, domOnly) {
	var key = editor._createKeyframe(this, keyframe)
	if (!domOnly)
		this.property.keyframes.add(keyframe)
	this.animationElement.appendChild(key.element)
	this.keyframeData.push(key) 
}

module.exports = PropertyData