var data = require('./data')
var rgba = require('color-style')

var timeline = require('keytime')(data) //require('keytime')

require('canvas-testbed')(render, start, { once: false })

var time = 0
var endDelay = 1
var dur = timeline.duration()

var widget = {}
var editor = require('../')()

function render(ctx, width, height, dt) {
	ctx.clearRect(0,0, width, height)

	//For each property in our timeline, store it in the widget object
	timeline.values(time, widget)

	//now draw stuff with our values
	ctx.fillStyle = rgba(widget.fill)
	ctx.globalAlpha = widget.alpha
	ctx.fillRect(widget.position[0], widget.position[1], widget.shape[0], widget.shape[1])
}

function start() {
	editor.constraint('alpha', { min: 0, max: 1, step: 0.05, decimals: 2 })
	editor.constraint('fill', { min: 0, max: 255, decimals: 0 })
	editor.add(timeline, 'shape')
	// editor.add(timeline, 'shape2')


	process.nextTick(function() {
		editor.appendTo(document.body)
	})

	editor.on('playhead', function(t) {
		time = t
	})

	editor.open(0)
}