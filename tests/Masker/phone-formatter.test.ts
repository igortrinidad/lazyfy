import { 
  formatPhoneWithCountryCode, 
  getCountryCode, 
  getSupportedCountries, 
  isValidPhoneNumber,
  getValidDigitCounts
} from '../../src/Masker';

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
          formatPhoneWithCountryCode(input, country);
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
});
