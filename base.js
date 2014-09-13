var Timeline = require('./lib/timeline')
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
	this.timelines = []
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
	var count = this.timelines.length
	var base = 'timeline'
	var idx
	while ( (idx = indexOfName(this.timelines, base+count)) >= 0 ) 
		count++
	return base+count
}

//Creates a new timeline object which has { element, open, name, dispose }
EditorBase.prototype._createTimeline = function(timeline, name) {
	return Timeline(timeline, name)
}

EditorBase.prototype.add = function(timeline, name) {
	name = name||this._generateName()
	this.timelines.push(this._createTimeline(timeline, name))
}

module.exports = EditorBase