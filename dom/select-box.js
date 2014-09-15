var domval = require('dom-value')
var events = require('dom-events')
var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

function Select(opt) {
	if (!(this instanceof Select))
		return new Select(opt)
	opt = opt||{}
	if (Array.isArray(opt))
		opt = { data: opt }
	this.element = opt.element || document.createElement("select")
	this.data = []

	if (opt.data) 
		this.set(opt.data)
}

inherits(Select, EventEmitter)

Select.prototype.select = function(value) {
	this.data.forEach(function(f) {
		if (f.value === value)
			f.element.setAttribute('selected', 'selected')
		else
			f.element.removeAttribute('selected')
	})
}

Select.prototype.clear = function() {
	this.data.length = 0
	while (this.element.firstChild) 
	    this.element.removeChild(this.element.firstChild);	
}

Select.prototype.set = function(data) {
	this.clear()
	this.add(data)
}

Select.prototype.add = function(data) {
	this.data.length = 0
	data.forEach(function(f) {
		var opt = document.createElement('option');
		var settings = f
		if (typeof f === 'string')  {
			settings = {}
			settings.name = f
			settings.value = f
		}
		
		opt.setAttribute('value', settings.value)
		if (settings.disabled)
			opt.setAttribute('disabled', 'disabled')
		if (settings.selected)
			opt.setAttribute('selected', 'selected')

		opt.innerHTML = settings.name

		settings.element = opt
		this.data.push(settings)
	    this.element.appendChild(opt);	
	}.bind(this))
} 

module.exports = Select