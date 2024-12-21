export default function dynamicMask (maskit: any, masks: any[], tokens: any): any {
  masks = masks.sort((a, b) => a.length - b.length)
  return function (value: any, mask: any, masked = true) {
    var i = 0
    while (i < masks.length) {
      var currentMask = masks[i]
      i++
      var nextMask = masks[i]
      if (! (nextMask && maskit(value, nextMask, true, tokens).length > currentMask.length) ) {
        return maskit(value, currentMask, masked, tokens)
      }
    }
    return ''
  }
}