var fs = require('fs')
var html = fs.readFileSync(__dirname+'/html/property.html', 'utf8')
var hyperglue = require('hyperglue')
var $ = require('dom-select')
var classes = require('dom-classes')
var events = require('dom-events')

var BaseProperty = require('../lib/property')

//Builds a DOM element from a keytime property 
module.exports = function(editor, property) {
	var ret = BaseProperty(property)

    //the element which holds buttons, name, etc.
    var element = hyperglue(html, {
        '.name': property.name
    })
    ret.element = element

    return ret
}
    