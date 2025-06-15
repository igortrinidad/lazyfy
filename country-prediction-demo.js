// Demo script to show the new country prediction functionality
const { formatPhoneWithCountryCode, predictCountryFromPhone, isValidPhoneNumber } = require('./dist/index.js');

console.log('🔮 Country Prediction Demo\n');

// Test cases with country codes
const testCases = [
  { number: '5511987654321', description: 'Brazilian mobile with country code' },
  { number: '12125551234', description: 'US number with country code' },
  { number: '34612345678', description: 'Spanish number with country code' },
  { number: '351912345678', description: 'Portuguese number with country code' },
  { number: '4917012345678', description: 'German number with country code' },
  { number: '8613812345678', description: 'Chinese number with country code' },
  { number: '+55 (11) 98765-4321', description: 'Formatted Brazilian number' },
];

// Test cases without country codes (should fail prediction)
const noPredictionCases = [
  { number: '11987654321', description: 'Brazilian mobile WITHOUT country code' },
  { number: '987654321', description: 'Random 9-digit number' },
  { number: '123456789', description: 'Random 9-digit number' },
];

console.log('✅ Numbers WITH country codes (should predict successfully):');
testCases.forEach(({ number, description }) => {
  const predictedCountry = predictCountryFromPhone(number);
  const formattedNumber = formatPhoneWithCountryCode(number);
  const isValid = isValidPhoneNumber(number);
  
  console.log(`📱 ${description}`);
  console.log(`   Input: ${number}`);
  console.log(`   Predicted Country: ${predictedCountry || 'None'}`);
  console.log(`   Formatted: ${formattedNumber}`);
  console.log(`   Valid: ${isValid}`);
  console.log('');
});

console.log('❌ Numbers WITHOUT country codes (should fail prediction):');
noPredictionCases.forEach(({ number, description }) => {
  const predictedCountry = predictCountryFromPhone(number);
  const formattedNumber = formatPhoneWithCountryCode(number);
  const isValid = isValidPhoneNumber(number);
  
  console.log(`📱 ${description}`);
  console.log(`   Input: ${number}`);
  console.log(`   Predicted Country: ${predictedCountry || 'None'}`);
  console.log(`   Formatted: ${formattedNumber}`);
  console.log(`   Valid: ${isValid}`);
  console.log('');
});

console.log('🔄 Backward Compatibility (explicit country still works):');
console.log('📱 Brazilian number with explicit country');
console.log(`   formatPhoneWithCountryCode('11987654321', 'brazil'): ${formatPhoneWithCountryCode('11987654321', 'brazil')}`);
console.log(`   isValidPhoneNumber('11987654321', 'brazil'): ${isValidPhoneNumber('11987654321', 'brazil')}`);
