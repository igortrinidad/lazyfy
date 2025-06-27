import { 
  formatPhoneWithCountryCode, 
  getCountryCode, 
  getSupportedCountries, 
  isValidPhoneNumber,
  getValidDigitCounts,
  predictCountryFromPhone,
  mask
} from '../../src/Masker';
import { DEFAULT_PHONE_DDI, DEFAULT_PHONE_MASK, DEFAULT_PHONE_MASK_WITH_DDI } from '../../src/mask/enums'


describe('Phone Number Formatting with Country Codes', () => {
  
  describe('formatPhoneWithCountryCode', () => {
    const phoneFormattingTestCases = [
      {
        description: 'Brazilian mobile phone number (11 digits)',
        input: '11987654321',
        country: 'brazil',
        expected: '+55 (11) 98765-4321'
      },
      {
        description: 'Brazilian landline phone number (10 digits)',
        input: '1134567890',
        country: 'brazil',
        expected: '+55 (11) 3456-7890'
      },
      {
        description: 'US phone number',
        input: '2125551234',
        country: 'us',
        expected: '+1 (212) 555-1234'
      },
      {
        description: 'Spanish phone number',
        input: '612345678',
        country: 'spain',
        expected: '+34 612 345 678'
      },
      {
        description: 'Portuguese phone number',
        input: '912345678',
        country: 'portugal',
        expected: '+351 912 345 678'
      },
      {
        description: 'Argentinian phone number',
        input: '1123456789',
        country: 'argentina',
        expected: '+54 (11) 2345-6789'
      },
      {
        description: 'Italian phone number',
        input: '3201234567',
        country: 'italy',
        expected: '+39 320 123 4567'
      },
      {
        description: 'Swiss phone number',
        input: '791234567',
        country: 'switzerland',
        expected: '+41 79 123 45 67'
      },
      {
        description: 'French phone number',
        input: '123456789',
        country: 'france',
        expected: '+33 1 23 45 67 89'
      },
      {
        description: 'Chinese phone number',
        input: '13812345678',
        country: 'china',
        expected: '+86 138 1234 5678'
      },
      {
        description: 'Russian phone number',
        input: '9123456789',
        country: 'russia',
        expected: '+7 (912) 345-67-89'
      },
      {
        description: 'Canadian phone number',
        input: '4165551234',
        country: 'canada',
        expected: '+1 (416) 555-1234'
      },
      {
        description: 'Mexican phone number',
        input: '5512345678',
        country: 'mexico',
        expected: '+52 (55) 1234-5678'
      },
      {
        description: 'Chilean phone number',
        input: '123456789',
        country: 'chile',
        expected: '+56 1 2345 6789'
      }
    ];

    phoneFormattingTestCases.forEach(({ description, input, country, expected }) => {
      test(`should format ${description} correctly`, () => {
        const result = formatPhoneWithCountryCode(input, country);
        expect(result).toBe(expected);
      });
    });

    const aliasTestCases = [
      {
        description: 'swiss as alias for switzerland',
        input: '791234567',
        country: 'swiss',
        expected: '+41 79 123 45 67'
      },
      {
        description: 'usa as alias for us',
        input: '2125551234',
        country: 'usa',
        expected: '+1 (212) 555-1234'
      }
    ];

    aliasTestCases.forEach(({ description, input, country, expected }) => {
      test(`should handle ${description}`, () => {
        const result = formatPhoneWithCountryCode(input, country);
        expect(result).toBe(expected);
      });
    });

    test('should handle case insensitive country names', () => {
      const result = formatPhoneWithCountryCode('11987654321', 'BRAZIL');
      expect(result).toBe('+55 (11) 98765-4321');
    });

    test('should clean input phone number with non-numeric characters', () => {
      const result = formatPhoneWithCountryCode('(11) 98765-4321', 'brazil');
      expect(result).toBe('+55 (11) 98765-4321');
    });

    const errorTestCases = [
      {
        description: 'unsupported country',
        input: '1234567890',
        country: 'invalid-country',
        expectedError: 'Country \'invalid-country\' is not supported'
      },
      {
        description: 'empty phone number',
        input: '',
        country: 'brazil',
        expectedError: 'Phone number is required'
      },
      {
        description: 'wrong digit count',
        input: '123',
        country: 'brazil',
        expectedError: 'Phone number for brazil should have 11 or 10 digits, but got 3'
      }
    ];

    errorTestCases.forEach(({ description, input, country, expectedError }) => {
      test(`should throw error for ${description}`, () => {
        expect(() => {
          formatPhoneWithCountryCode(input, country, true);
        }).toThrow(expectedError);
      });
    });

    const preFormattedTestCases = [
      {
        description: 'already formatted Brazilian mobile number',
        input: '(11) 98765-4321',
        country: 'brazil',
        expected: '+55 (11) 98765-4321'
      },
      {
        description: 'already formatted Brazilian landline number',
        input: '(11) 3456-7890',
        country: 'brazil',
        expected: '+55 (11) 3456-7890'
      },
      {
        description: 'already formatted US number',
        input: '(212) 555-1234',
        country: 'us',
        expected: '+1 (212) 555-1234'
      },
      {
        description: 'already formatted Spanish number',
        input: '612 345 678',
        country: 'spain',
        expected: '+34 612 345 678'
      },
      {
        description: 'number with dashes and spaces',
        input: '320-123-4567',
        country: 'italy',
        expected: '+39 320 123 4567'
      },
      {
        description: 'number with dots',
        input: '320.123.4567',
        country: 'italy',
        expected: '+39 320 123 4567'
      },
      {
        description: 'number with mixed formatting',
        input: '+55 (11) 98765-4321',
        country: 'brazil',
        expected: '+55 (11) 98765-4321'
      },
      {
        description: 'number with country code prefix',
        input: '55 11 987654321',
        country: 'brazil',
        expected: '+55 (11) 98765-4321'
      },
      {
        description: 'Mexican number with formatting',
        input: '(55) 1234-5678',
        country: 'mexico',
        expected: '+52 (55) 1234-5678'
      },
      {
        description: 'Swiss number with formatting',
        input: '79 123 45 67',
        country: 'switzerland',
        expected: '+41 79 123 45 67'
      },
      {
        description: 'Russian number with formatting',
        input: '(912) 345-67-89',
        country: 'russia',
        expected: '+7 (912) 345-67-89'
      },
      {
        description: 'Chinese number with formatting',
        input: '138 1234 5678',
        country: 'china',
        expected: '+86 138 1234 5678'
      }
    ];

    preFormattedTestCases.forEach(({ description, input, country, expected }) => {
      test(`should handle ${description}`, () => {
        const result = formatPhoneWithCountryCode(input, country);
        expect(result).toBe(expected);
      });
    });
  });

  describe('formatPhoneWithCountryCode with throwsErrorOnValidation parameter', () => {
    test('should return default formatting when throwsErrorOnValidation is false (default) for invalid phone', () => {
      const result = formatPhoneWithCountryCode('123', 'brazil');
      expect(result).toBe(mask('123', DEFAULT_PHONE_MASK_WITH_DDI));
    });

    test('should return default formatting when throwsErrorOnValidation is false for unsupported country', () => {
      const result = formatPhoneWithCountryCode('1234567890', 'invalidcountry');
      expect(result).toBe(mask('1234567890', DEFAULT_PHONE_MASK_WITH_DDI));
    });

    test('should return default formatting when throwsErrorOnValidation is false for empty phone', () => {
      const result = formatPhoneWithCountryCode('', 'brazil');
      expect(result).toBe(mask('', DEFAULT_PHONE_MASK_WITH_DDI));
    });

    test('should throw error when throwsErrorOnValidation is true for invalid phone', () => {
      expect(() => {
        formatPhoneWithCountryCode('123', 'brazil', true);
      }).toThrow('Phone number for brazil should have 11 or 10 digits, but got 3');
    });

    test('should throw error when throwsErrorOnValidation is true for unsupported country', () => {
      expect(() => {
        formatPhoneWithCountryCode('1234567890', 'invalidcountry', true);
      }).toThrow("Country 'invalidcountry' is not supported");
    });

    test('should throw error when throwsErrorOnValidation is true for empty phone', () => {
      expect(() => {
        formatPhoneWithCountryCode('', 'brazil', true);
      }).toThrow('Phone number is required');
    });

    test('should format valid phone correctly regardless of throwsErrorOnValidation parameter', () => {
      const phoneNumber = '11987654321';
      const country = 'brazil';
      const expected = '+55 (11) 98765-4321';
      
      expect(formatPhoneWithCountryCode(phoneNumber, country, false)).toBe(expected);
      expect(formatPhoneWithCountryCode(phoneNumber, country, true)).toBe(expected);
      expect(formatPhoneWithCountryCode(phoneNumber, country)).toBe(expected); // default parameter
    });
  });

  describe('New major countries support', () => {
    const newCountriesTestCases = [
      // Major European countries
      {
        description: 'German phone number',
        input: '17012345678',
        country: 'germany',
        expected: '+49 1701 2345678'
      },
      {
        description: 'UK phone number',
        input: '7700123456',
        country: 'uk',
        expected: '+44 7700 123 456'
      },
      {
        description: 'Netherlands phone number',
        input: '612345678',
        country: 'netherlands',
        expected: '+31 6 12345678'
      },
      {
        description: 'Swedish phone number',
        input: '701234567',
        country: 'sweden',
        expected: '+46 70 123 45 67'
      },
      // Major Asian countries
      {
        description: 'Japanese phone number',
        input: '9012345678',
        country: 'japan',
        expected: '+81 90-1234-5678'
      },
      {
        description: 'South Korean phone number',
        input: '1012345678',
        country: 'southkorea',
        expected: '+82 10-1234-5678'
      },
      {
        description: 'Indian phone number',
        input: '9876543210',
        country: 'india',
        expected: '+91 98765 43210'
      },
      {
        description: 'Singapore phone number',
        input: '81234567',
        country: 'singapore',
        expected: '+65 8123 4567'
      },
      // Major countries in Americas
      {
        description: 'Colombian phone number',
        input: '3001234567',
        country: 'colombia',
        expected: '+57 300 123 4567'
      },
      {
        description: 'Peruvian phone number',
        input: '987654321',
        country: 'peru',
        expected: '+51 987 654 321'
      },
      // Major African countries
      {
        description: 'South African phone number',
        input: '821234567',
        country: 'southafrica',
        expected: '+27 82 123 4567'
      },
      {
        description: 'Nigerian phone number',
        input: '8031234567',
        country: 'nigeria',
        expected: '+234 803 123 4567'
      },
      // Oceania
      {
        description: 'Australian phone number',
        input: '412345678',
        country: 'australia',
        expected: '+61 412 345 678'
      },
      {
        description: 'New Zealand phone number',
        input: '211234567',
        country: 'newzealand',
        expected: '+64 21-123 4567'
      },
      // Middle East
      {
        description: 'Israeli phone number',
        input: '501234567',
        country: 'israel',
        expected: '+972 50-123-4567'
      },
      {
        description: 'UAE phone number',
        input: '501234567',
        country: 'uae',
        expected: '+971 50-123 4567'
      }
    ];

    newCountriesTestCases.forEach(({ description, input, country, expected }) => {
      test(`should format ${description} correctly`, () => {
        const result = formatPhoneWithCountryCode(input, country);
        expect(result).toBe(expected);
      });
    });
  });

  describe('getCountryCode', () => {
    const countryCodeTestCases = [
      { country: 'brazil', expected: '+55' },
      { country: 'us', expected: '+1' },
      { country: 'spain', expected: '+34' }
    ];

    countryCodeTestCases.forEach(({ country, expected }) => {
      test(`should return correct country code for ${country}`, () => {
        expect(getCountryCode(country)).toBe(expected);
      });
    });

    test('should throw error for unsupported country', () => {
      expect(() => {
        getCountryCode('invalid-country');
      }).toThrow('Country \'invalid-country\' is not supported');
    });
  });

  describe('getSupportedCountries', () => {
    test('should return array of supported countries', () => {
      const countries = getSupportedCountries();
      expect(Array.isArray(countries)).toBe(true);
      expect(countries).toContain('brazil');
      expect(countries).toContain('us');
      expect(countries).toContain('spain');
      expect(countries).toContain('portugal');
      expect(countries).toContain('argentina');
      expect(countries).toContain('italy');
      expect(countries).toContain('switzerland');
      expect(countries).toContain('swiss');
      expect(countries).toContain('france');
      expect(countries).toContain('china');
      expect(countries).toContain('russia');
      expect(countries).toContain('canada');
      expect(countries).toContain('mexico');
      expect(countries).toContain('chile');
    });
  });

  describe('isValidPhoneNumber', () => {
    const validPhoneTestCases = [
      { input: '11987654321', country: 'brazil', description: 'Brazilian mobile' },
      { input: '1134567890', country: 'brazil', description: 'Brazilian landline' },
      { input: '2125551234', country: 'us', description: 'US number' },
      { input: '612345678', country: 'spain', description: 'Spanish number' }
    ];

    validPhoneTestCases.forEach(({ input, country, description }) => {
      test(`should return true for valid ${description}`, () => {
        expect(isValidPhoneNumber(input, country)).toBe(true);
      });
    });

    const invalidPhoneTestCases = [
      { input: '123', country: 'brazil', description: 'too short number' },
      { input: '1234567890', country: 'invalid-country', description: 'invalid country' },
      { input: '', country: 'brazil', description: 'empty number' }
    ];

    invalidPhoneTestCases.forEach(({ input, country, description }) => {
      test(`should return false for ${description}`, () => {
        expect(isValidPhoneNumber(input, country)).toBe(false);
      });
    });

    const validFormattedTestCases = [
      { input: '(11) 98765-4321', country: 'brazil', description: 'Brazilian formatted mobile' },
      { input: '(11) 3456-7890', country: 'brazil', description: 'Brazilian formatted landline' },
      { input: '(212) 555-1234', country: 'us', description: 'US formatted' },
      { input: '612 345 678', country: 'spain', description: 'Spanish formatted' },
      { input: '320-123-4567', country: 'italy', description: 'Italian with dashes' },
      { input: '79 123 45 67', country: 'switzerland', description: 'Swiss with spaces' }
    ];

    validFormattedTestCases.forEach(({ input, country, description }) => {
      test(`should return true for ${description}`, () => {
        expect(isValidPhoneNumber(input, country)).toBe(true);
      });
    });

    const validCountryCodeTestCases = [
      { input: '+55 11 987654321', country: 'brazil', description: 'Brazilian with country code' },
      { input: '55 11 34567890', country: 'brazil', description: 'Brazilian without plus' },
      { input: '+1 212 555 1234', country: 'us', description: 'US with country code' }
    ];

    validCountryCodeTestCases.forEach(({ input, country, description }) => {
      test(`should return true for ${description}`, () => {
        expect(isValidPhoneNumber(input, country)).toBe(true);
      });
    });

    const validMixedFormattingTestCases = [
      { input: '+55(11)98765-4321', country: 'brazil', description: 'Brazilian mixed formatting' },
      { input: '320.123.4567', country: 'italy', description: 'Italian with dots' },
      { input: '(55) 1234-5678', country: 'mexico', description: 'Mexican formatted' }
    ];

    validMixedFormattingTestCases.forEach(({ input, country, description }) => {
      test(`should return true for ${description}`, () => {
        expect(isValidPhoneNumber(input, country)).toBe(true);
      });
    });
  });

  describe('getValidDigitCounts', () => {
    const digitCountTestCases = [
      { country: 'brazil', expected: [11, 10], description: 'multiple digit counts for Brazil' },
      { country: 'us', expected: [10], description: 'single digit count for US' },
      { country: 'spain', expected: [9], description: 'single digit count for Spain' }
    ];

    digitCountTestCases.forEach(({ country, expected, description }) => {
      test(`should return ${description}`, () => {
        const counts = getValidDigitCounts(country);
        expect(counts).toEqual(expected);
      });
    });

    test('should throw error for unsupported country', () => {
      expect(() => {
        getValidDigitCounts('invalid-country');
      }).toThrow('Country \'invalid-country\' is not supported');
    });
  });

  describe('formatPhoneWithCountryCode with WhatsApp Remote JID formats', () => {
    const whatsappJidTestCases = [
      {
        description: 'WhatsApp JID with @s.whatsapp.net suffix (individual chat)',
        input: '5511987654321@s.whatsapp.net',
        country: 'brazil',
        expected: '+55 (11) 98765-4321'
      },
      {
        description: 'WhatsApp JID with @g.us suffix (group chat)',
        input: '5511987654321@g.us',
        country: 'brazil',
        expected: '+55 (11) 98765-4321'
      },
      {
        description: 'WhatsApp JID with @c.us suffix (contact)',
        input: '5511987654321@c.us',
        country: 'brazil',
        expected: '+55 (11) 98765-4321'
      },
      {
        description: 'US WhatsApp JID with @s.whatsapp.net',
        input: '12125551234@s.whatsapp.net',
        country: 'us',
        expected: '+1 (212) 555-1234'
      },
      {
        description: 'Spanish WhatsApp JID with @s.whatsapp.net',
        input: '34612345678@s.whatsapp.net',
        country: 'spain',
        expected: '+34 612 345 678'
      },
      {
        description: 'WhatsApp JID with multiple @ symbols (malformed but should handle gracefully)',
        input: '5511987654321@test@s.whatsapp.net',
        country: 'brazil',
        expected: '+55 (11) 98765-4321'
      },
      {
        description: 'WhatsApp JID with country code already included',
        input: '5511987654321@s.whatsapp.net',
        country: 'brazil',
        expected: '+55 (11) 98765-4321'
      },
      {
        description: 'WhatsApp JID without country code in number',
        input: '11987654321@s.whatsapp.net',
        country: 'brazil',
        expected: '+55 (11) 98765-4321'
      },
      {
        description: 'WhatsApp JID with landline number (10 digits)',
        input: '551134567890@s.whatsapp.net',
        country: 'brazil',
        expected: '+55 (11) 3456-7890'
      },
      {
        description: 'WhatsApp JID with landline number (10 digits)',
        input: '553181007753@s.whatsapp.net',
        country: 'brazil',
        expected: '+55 (31) 8100-7753'
      },
      {
        description: 'WhatsApp JID with invalid suffix but valid number',
        input: '5511987654321@invalid.suffix',
        country: 'brazil',
        expected: '+55 (11) 98765-4321'
      },
      {
        description: 'WhatsApp JID with extra characters and spaces',
        input: ' 55 11 98765-4321 @s.whatsapp.net ',
        country: 'brazil',
        expected: '+55 (11) 98765-4321'
      }
    ];

    whatsappJidTestCases.forEach(({ description, input, country, expected }) => {
      test(description, () => {
        const result = formatPhoneWithCountryCode(input, country);
        expect(result).toBe(expected);
      });
    });

    test('Should handle WhatsApp JID with throwsErrorOnValidation=true for valid numbers', () => {
      const validJid = '5511987654321@s.whatsapp.net';
      const result = formatPhoneWithCountryCode(validJid, 'brazil', true);
      expect(result).toBe('+55 (11) 98765-4321');
    });

    test('Should handle invalid WhatsApp JID gracefully with throwsErrorOnValidation=false', () => {
      const invalidJid = '5511987654321000@s.whatsapp.net'; // Too many digits
      const result = formatPhoneWithCountryCode(invalidJid, 'brazil', false);
      expect(result).toBe(mask(invalidJid, DEFAULT_PHONE_MASK_WITH_DDI)); // Default fallback
    });

    test('Should throw error for invalid WhatsApp JID with throwsErrorOnValidation=true', () => {
      const invalidJid = '5511987654321000@s.whatsapp.net'; // Too many digits
      expect(() => {
        formatPhoneWithCountryCode(invalidJid, 'brazil', true);
      }).toThrow('Phone number for brazil should have 11 or 10 digits, but got 14');
    });

    test('Should handle empty WhatsApp JID suffix', () => {
      const jidWithEmptySuffix = '5511987654321@';
      const result = formatPhoneWithCountryCode(jidWithEmptySuffix, 'brazil');
      expect(result).toBe('+55 (11) 98765-4321');
    });

    test('Should handle WhatsApp JID with only @ symbol', () => {
      const jidWithOnlyAt = '5511987654321@';
      const result = formatPhoneWithCountryCode(jidWithOnlyAt, 'brazil');
      expect(result).toBe('+55 (11) 98765-4321');
    });

    test('Should handle multiple countries with WhatsApp JIDs', () => {
      const multiCountryTests = [
        { jid: '12125551234@s.whatsapp.net', country: 'us', expected: '+1 (212) 555-1234' },
        { jid: '34612345678@s.whatsapp.net', country: 'spain', expected: '+34 612 345 678' },
        { jid: '351912345678@s.whatsapp.net', country: 'portugal', expected: '+351 912 345 678' },
        { jid: '541123456789@s.whatsapp.net', country: 'argentina', expected: '+54 (11) 2345-6789' },
        { jid: '391234567890@s.whatsapp.net', country: 'italy', expected: '+39 123 456 7890' }
      ];

      multiCountryTests.forEach(({ jid, country, expected }) => {
        const result = formatPhoneWithCountryCode(jid, country);
        expect(result).toBe(expected);
      });
    });
  });

  describe('predictCountryFromPhone', () => {
    const countryPredictionTestCases = [
      { phoneNumber: '5511987654321', expectedCountry: 'brazil', description: 'Brazilian number with country code' },
      { phoneNumber: '+55 11 987654321', expectedCountry: 'brazil', description: 'Brazilian number with formatted country code' },
      { phoneNumber: '12125551234', expectedCountry: 'us', description: 'US number with country code' },
      { phoneNumber: '+1 212 555 1234', expectedCountry: 'us', description: 'US number with formatted country code' },
      { phoneNumber: '34612345678', expectedCountry: 'spain', description: 'Spanish number with country code' },
      { phoneNumber: '+34 612 345 678', expectedCountry: 'spain', description: 'Spanish number with formatted country code' },
      { phoneNumber: '351912345678', expectedCountry: 'portugal', description: 'Portuguese number with country code' },
      { phoneNumber: '4979123456789', expectedCountry: 'germany', description: 'German number with country code' },
      { phoneNumber: '447701234567', expectedCountry: 'uk', description: 'UK number with country code' },
      { phoneNumber: '8613812345678', expectedCountry: 'china', description: 'Chinese number with country code' },
      { phoneNumber: '819012345678', expectedCountry: 'japan', description: 'Japanese number with country code' },
      { phoneNumber: '919876543210', expectedCountry: 'india', description: 'Indian number with country code' },
      { phoneNumber: '27821234567', expectedCountry: 'southafrica', description: 'South African number with country code' },
      { phoneNumber: '61412345678', expectedCountry: 'australia', description: 'Australian number with country code' }
    ];

    countryPredictionTestCases.forEach(({ phoneNumber, expectedCountry, description }) => {
      test(`should predict ${expectedCountry} for ${description}`, () => {
        const result = predictCountryFromPhone(phoneNumber);
        expect(result).toBe(expectedCountry);
      });
    });

    test('should return null for invalid or unpredictable phone numbers', () => {
      const invalidNumbers = [
        '',
        '123',
        '99999999999999',
        '000000000000',
        'abcdefghijk'
      ];

      invalidNumbers.forEach(number => {
        expect(predictCountryFromPhone(number)).toBeNull();
      });
    });

    test('should handle numbers without country codes', () => {
      // Numbers without country codes should return null
      expect(predictCountryFromPhone('11987654321')).toBeNull(); // Brazilian without country code (starts with 1 but not US format)
      expect(predictCountryFromPhone('987654321')).toBeNull(); // Random 9-digit number
      expect(predictCountryFromPhone('123456789')).toBeNull(); // Random 9-digit number
    });

    test('should prioritize longer country codes', () => {
      // Portugal (+351) should be detected instead of Spain (+34) for 351 prefix
      expect(predictCountryFromPhone('351912345678')).toBe('portugal');
      
      // UAE (+971) should be detected instead of Russia (+7) for 971 prefix
      expect(predictCountryFromPhone('971501234567')).toBe('uae');
    });
  });

  describe('formatPhoneWithCountryCode with automatic country prediction', () => {
    const autoPredictionTestCases = [
      {
        description: 'Brazilian number with country code (no country provided)',
        input: '5511987654321',
        expected: '+55 (11) 98765-4321'
      },
      {
        description: 'Brazilian number with country code (no country provided)',
        input: '553181007753',
        expected: '+55 (31) 8100-7753'
      },
      {
        description: 'Brazilian number with country code (no country provided)',
        input: '5531981007753',
        expected: '+55 (31) 98100-7753'
      },
      {
        description: 'US number with country code (no country provided)',
        input: '12125551234',
        expected: '+1 (212) 555-1234'
      },
      {
        description: 'Spanish number with country code (no country provided)',
        input: '34612345678',
        expected: '+34 612 345 678'
      },
      {
        description: 'German number with country code (no country provided)',
        input: '4917012345678',
        expected: '+49 1701 2345678'
      },
      {
        description: 'Chinese number with country code (no country provided)',
        input: '8613812345678',
        expected: '+86 138 1234 5678'
      },
      {
        description: 'Portuguese number with country code (no country provided)',
        input: '351912345678',
        expected: '+351 912 345 678'
      },
      {
        description: 'Portuguese number with country code (no country provided)',
        input: '351 926 247 229',
        expected: '+351 926 247 229'
      },
      {
        description: 'Portuguese number with country code (no country provided)',
        input: '351 918 176 655',
        expected: '+351 918 176 655'
      },
      {
        description: 'Formatted Brazilian number with country code (no country provided)',
        input: '+55 (11) 98765-4321',
        expected: '+55 (11) 98765-4321'
      },
      {
        description: 'Brazilian landline with country code (no country provided)',
        input: '551134567890',
        expected: '+55 (11) 3456-7890'
      }
    ];

    autoPredictionTestCases.forEach(({ description, input, expected }) => {
      test(`should auto-predict and format ${description}`, () => {
        const result = formatPhoneWithCountryCode(input);
        expect(result).toBe(expected);
      });
    });

    test('should return default formatting when prediction fails and throwsErrorOnValidation is false', () => {
      const unpredictableNumbers = [
        '987654321',  // Random number without country code
        '123456789',  // Random number without country code
        '99987654321' // Random number that doesn't match any country pattern
      ];

      unpredictableNumbers.forEach(number => {
        const result = formatPhoneWithCountryCode(number);
        expect(result).toBe(mask(number, DEFAULT_PHONE_MASK_WITH_DDI));
      });
    });

    test('should throw error when prediction fails and throwsErrorOnValidation is true', () => {
      expect(() => {
        formatPhoneWithCountryCode('987654321', undefined, true);
      }).toThrow('Could not predict country from phone number and no country was provided');

      expect(() => {
        formatPhoneWithCountryCode('123456789', undefined, true);
      }).toThrow('Could not predict country from phone number and no country was provided');
    });

    test('should work when country is explicitly provided (backward compatibility)', () => {
      // Should work the same as before when country is provided
      expect(formatPhoneWithCountryCode('11987654321', 'brazil')).toBe('+55 (11) 98765-4321');
      expect(formatPhoneWithCountryCode('2125551234', 'us')).toBe('+1 (212) 555-1234');
    });

    test('should prioritize explicit country over prediction', () => {
      // Even if the number has a country code, explicit country should take precedence
      const result = formatPhoneWithCountryCode('5511987654321', 'us', false);
      // Should fail validation for US but return default since throwsErrorOnValidation is false
      expect(result).toBe(mask('5511987654321', DEFAULT_PHONE_MASK_WITH_DDI));
    });
  });

  describe('isValidPhoneNumber with automatic country prediction', () => {
    test('should validate numbers with automatic country prediction', () => {
      const validNumbers = [
        '553181007753',  // Brazilian mobile
        '553175439236',  // Brazilian mobile
        '5511987654321',  // Brazilian mobile
        '551134567890',   // Brazilian landline
        '12125551234',    // US
        '34612345678',    // Spanish
        '351912345678',   // Portuguese
        '351918176655',   // Portuguese
        '351926247229',   // Portuguese
        '4917012345678'   // German
      ];

      validNumbers.forEach(number => {
        expect(isValidPhoneNumber(number)).toBe(true);
      });
    });

    test('should return false for unpredictable or invalid numbers', () => {
      const invalidNumbers = [
        '987654321',     // Random number without country code
        '123456789',     // Random number without country code  
        '123',           // Too short
        '99999999999999', // Too long
        '',              // Empty
        'abcdefg'        // Non-numeric
      ];

      invalidNumbers.forEach(number => {
        expect(isValidPhoneNumber(number)).toBe(false);
      });
    });

    test('should work with explicit country (backward compatibility)', () => {
      expect(isValidPhoneNumber('11987654321', 'brazil')).toBe(true);
      expect(isValidPhoneNumber('2125551234', 'us')).toBe(true);
      expect(isValidPhoneNumber('123', 'brazil')).toBe(false);
    });
  });
});
