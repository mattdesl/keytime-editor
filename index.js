var fs = require('fs')
var css = fs.readFileSync(__dirname + '/dom/style.css', 'utf8')
var icons = fs.readFileSync(__dirname + '/dom/icons.css', 'utf8')
require('insert-css')(css+'\n'+icons)

module.exports = require('./unstyled')