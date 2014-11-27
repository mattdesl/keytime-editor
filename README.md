# keytime-editor

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

[see here for details](https://github.com/mattdesl/keytime/)

This project is WIP. Currently the "low level" modules (eases, keytime, keyframes, etc) are stable, but the editor is only a rough proof of concept, and subject to major changes. 

## Usage

[![NPM](https://nodei.co/npm/keytime-editor.png)](https://nodei.co/npm/keytime-editor/)

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/keytime-editor/blob/master/LICENSE.md) for details.



# TODOS

the code is fairly messy right now. gotta outline necessary features and exposed API before another refactor

### API

Example setup for your project:

```js
//high level editor for CSS properties
//includes stuff like color editing, % px units, etc
var editor = require('keytime-css-editor')

editor.timelines.open(0)
editor.timelines.openAll()
editor.timelines.closeAll()
editor.timelines.closeAll()
editor.timelines.close(0)
```

breakdown

```
editor
	timeline(name)
		open = bool	
		property(name)
			keyframes
	playhead(val)
	hide()
	show()
	closeAll()
	openAll()
	load(data)
	addTimeline(timeline, name)
```

manipulating keyframes
"disable" keyframes
lock properties/timelines
shy properties/timelines
undo/redo
hokeys everything
interpolate timelines

controls
	number(s)
	css units (px/em/etc)
	color
	rgba (e.g [255, 255, 255, 0.5])
	string
	boolean
	select (i.e. from a list of icons)
	search-select (i.e. from a huge list of icons)


how to handle UI states?
e.g. buttons:

	idle/rest
	hover in (mouse comes in)
	click start
	click end
	hover out

How to blend from e.g. half way thru hover in to a click start timeline?
Lerping between timelines? What about adding "morph targets" where one timeline can morph X amount to another timeline. and then stack if needed

Procedural UI animation?
- define a few idle poses and blend between them ??

### nested reusable timelines

e.g. 
hamburger bars turning into an X

how do we represent this in a modular way? the problem is with styling and DOM.

but it will be useful to separate concerns. 

e.g. 
button position on page
button timeline
	> has all the button animations

basically the same as a layered group
but the important thing is being able to move that whole group


[
	{ name: 'effect-x-rotate', keyframes: [
		{ time: 0, value: [
			{ name: 'border-radius', value: 5 },
			{ name: 'border-radius', value: 5 },
		] }

	] }
]

