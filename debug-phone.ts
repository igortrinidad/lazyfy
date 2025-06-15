import { formatPhoneWithCountryCode, getValidDigitCounts } from './src/Masker';

console.log('=== Phone Number Formatting Examples ===\n');

// Brazilian examples
console.log('Brazilian Mobile (11 digits):', formatPhoneWithCountryCode('11987654321', 'brazil'));
console.log('Brazilian Landline (10 digits):', formatPhoneWithCountryCode('1134567890', 'brazil'));

// Other countries
console.log('US:', formatPhoneWithCountryCode('2125551234', 'us'));
console.log('Italy:', formatPhoneWithCountryCode('3201234567', 'italy'));
console.log('Mexico:', formatPhoneWithCountryCode('5512345678', 'mexico'));
console.log('Chile:', formatPhoneWithCountryCode('123456789', 'chile'));

console.log('\n=== Valid Digit Counts ===');
console.log('Brazil accepts:', getValidDigitCounts('brazil'), 'digits');
console.log('US accepts:', getValidDigitCounts('us'), 'digits');

console.log('\n=== Error Handling ===');
try {
  formatPhoneWithCountryCode('123', 'brazil');
} catch (error) {
  console.log('Error for invalid Brazilian number:', error.message);
}
