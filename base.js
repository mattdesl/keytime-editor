var Timeline = require('./lib/timeline-data')
var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

function indexOfName(list, name) {
	for (var i=0; i<list.length; i++)
		if (list[i].name === name)
			return i
	return -1
}

function EditorBase() {
	if (!(this instanceof EditorBase))
		return new EditorBase()
	EventEmitter.call(this)
	this.timelinesData = []
	this._playhead = 0
}

inherits(EditorBase, EventEmitter)

//Sets the playhead value and emits a playhead change event
EditorBase.prototype.playhead = function(time) {
	if (typeof time === 'number') {
		var old = this._playhead
		this._playhead = Math.max(0, time)
		if (old !== this._playhead)
			this.emit('playhead', this._playhead)
	} else 
		return this._playhead
}

EditorBase.prototype._generateName = function() {
	var count = this.timelinesData.length
	var base = 'timeline'
	var idx
	while ( (idx = indexOfName(this.timelinesData, base+count)) >= 0 ) 
		count++
	return base+count
}

//Creates a new timeline object which has { element, open, name, dispose }
EditorBase.prototype._createTimeline = function(timeline, name) {
	return Timeline(timeline, name)
}

EditorBase.prototype.timelineData = function(name) {
	var idx = typeof name === 'number' ? name : indexOfName(this.timelinesData, name)
	if (idx === -1)
		return null
	return this.timelinesData[idx]
}

//gets timeline by name or index
EditorBase.prototype.timeline = function(name) {
	var ret = this.timelineData(name)
	return ret ? ret.timeline : null
}

EditorBase.prototype.open = function(name, show) {
	show = show !== false
	var ret = this.timelineData(name)
	if (ret)
		ret.open = show
} 

EditorBase.prototype.add = function(timeline, name) {
	name = name||this._generateName()
	var data = this._createTimeline(timeline, name)
	this.timelinesData.push(data)
	this.emit('load')
	return data
}

module.exports = EditorBase