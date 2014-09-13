var vec = require('./VecN')
var vec1 = vec.bind(this, 1)

module.exports = {
    'vec2': vec.bind(this, 2),
    'float': vec1,
    'default': vec1
}