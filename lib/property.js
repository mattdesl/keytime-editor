var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

function Property(property) {
	if (!(this instanceof Property))
		return new Property(property)
	this.property = property

	EventEmitter.call(this)

	this.element = null
}

inherits(Property, EventEmitter)

Object.defineProperty(Property.prototype, 'name', {
	get: function() {
		return this.property.name
	},
	set: function(val) {
		this.property.name = val
	}
})

Object.defineProperty(Property.prototype, 'keyframes', {
	get: function() {
		return this.property.keyframes
	},
	set: function(val) {
		this.property.keyframes = val
	}
})

Object.defineProperty(Property.prototype, 'value', {
	get: function() {
		return this.property.value
	},
	set: function(val) {
		this.property.value = val
	}
})

module.exports = Property