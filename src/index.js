const ArrayHelpers = require('./ArrayHelpers')
const ObjectHelpers = require('./ObjectHelpers')
const MathHelpers = require('./MathHelpers')
const CommonHelpers = require('./CommonHelpers')
const StringHelpers = require('./StringHelpers')
const NumberHelpers = require('./NumberHelpers')

module.exports = {
  ArrayHelpers,
  ...ArrayHelpers,
  ObjectHelpers,
  ...ObjectHelpers,
  MathHelpers,
  ...MathHelpers,
  CommonHelpers,
  ...CommonHelpers,
  StringHelpers,
  ...StringHelpers,
  NumberHelpers,
  ...NumberHelpers
}
