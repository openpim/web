var fs = require('fs')
const { generate } = require('build-number-generator')

console.log('Incrementing build revision...')
fs.readFile('public/version.js', function (err, content) {
  if (err) throw err

  let str = content.toString()
  const idx = str.indexOf('window.OPENPIM_VERSION = \'1.2.')
  const idx2 = str.indexOf('\'', idx + 30)
  const rev = generate()
  str = str.substring(0, idx + 30) + rev + str.substring(idx2)

  fs.writeFile('public/version.js', str, function (err) {
    if (err) throw err
    console.log('Current build revision: ' + rev)
  })
})
