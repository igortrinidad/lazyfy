const ArrayHelpers = require('./ArrayHelpers')
const ObjectHelpers = require('./ObjectHelpers')
const MathHelpers = require('./MathHelpers')

module.exports = {
  ArrayHelpers,
  ...ArrayHelpers,
  ObjectHelpers,
  ...ObjectHelpers,
  MathHelpers,
  ...MathHelpers
}
