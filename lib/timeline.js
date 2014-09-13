var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

function Timeline(timeline, name) {
	if (!(this instanceof Timeline))
		return new Timeline(timeline, name)
	EventEmitter.call(this)
	this.timeline = timeline
	this.name = name
	this.element = null
	this._open = false
}

inherits(Timeline, EventEmitter)

Object.defineProperty(Timeline.prototype, "open", {
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

module.exports = Timeline