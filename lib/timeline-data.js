var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

function TimelineData(timeline, name) {
	if (!(this instanceof TimelineData))
		return new TimelineData(timeline, name)
	EventEmitter.call(this)
	this.timeline = timeline
	this.propertyData = []
	this.name = name
	this.element = null
	this.animationContainer = null
	this._open = false
}

inherits(TimelineData, EventEmitter)

TimelineData.prototype.dispose = function() {
	this.propertyData.forEach(function(p) {
		p.dispose()
	})
	this.propertyData.length = 0
	this.timeline = null
	this.element = null
	this.animationContainer = null
}

Object.defineProperty(TimelineData.prototype, "name", {
	get: function() {
		return this.timeline.name
	},
	set: function(name) {
		this.timeline.name = name
	}
})

Object.defineProperty(TimelineData.prototype, "open", {
	get: function() {
		return this._open
	},
	set: function(open) {
		var old = this._open
		this._open = open
		if (old !== this._open) {
			if (this._open)
				this.emit('opened')
			else 
				this.emit('closed')
		}
	}
})

module.exports = TimelineData