var css = require('fs').readFileSync(__dirname + '/dom/style.css', 'utf8')
require('insert-css')(css)

module.exports = require('./unstyled')