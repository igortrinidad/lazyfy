const { extractCountryCodeAndPhone } = require('./src/Masker');

// Test a few examples
console.log('Brazilian mobile:', extractCountryCodeAndPhone('+5511987654321'));
console.log('US number:', extractCountryCodeAndPhone('+12125551234'));
console.log('Spanish number:', extractCountryCodeAndPhone('+34612345678'));
console.log('Portuguese number:', extractCountryCodeAndPhone('+351912345678'));
console.log('Incomplete Brazilian:', extractCountryCodeAndPhone('+5511'));
