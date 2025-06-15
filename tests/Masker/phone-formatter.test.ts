import { 
  formatPhoneWithCountryCode, 
  getCountryCode, 
  getSupportedCountries, 
  isValidPhoneNumber,
  getValidDigitCounts
} from '../../src/Masker';

describe('Phone Number Formatting with Country Codes', () => {
  
  describe('formatPhoneWithCountryCode', () => {
    test('should format Brazilian mobile phone number correctly (11 digits)', () => {
      const result = formatPhoneWithCountryCode('11987654321', 'brazil');
      expect(result).toBe('+55 (11) 98765-4321');
    });

    test('should format Brazilian landline phone number correctly (10 digits)', () => {
      const result = formatPhoneWithCountryCode('1134567890', 'brazil');
      expect(result).toBe('+55 (11) 3456-7890');
    });

    test('should format US phone number correctly', () => {
      const result = formatPhoneWithCountryCode('2125551234', 'us');
      expect(result).toBe('+1 (212) 555-1234');
    });

    test('should format Spanish phone number correctly', () => {
      const result = formatPhoneWithCountryCode('612345678', 'spain');
      expect(result).toBe('+34 612 345 678');
    });

    test('should format Portuguese phone number correctly', () => {
      const result = formatPhoneWithCountryCode('912345678', 'portugal');
      expect(result).toBe('+351 912 345 678');
    });

    test('should format Argentinian phone number correctly', () => {
      const result = formatPhoneWithCountryCode('1123456789', 'argentina');
      expect(result).toBe('+54 (11) 2345-6789');
    });

    test('should format Italian phone number correctly', () => {
      const result = formatPhoneWithCountryCode('3201234567', 'italy');
      expect(result).toBe('+39 320 123 4567');
    });

    test('should format Swiss phone number correctly', () => {
      const result = formatPhoneWithCountryCode('791234567', 'switzerland');
      expect(result).toBe('+41 79 123 45 67');
    });

    test('should format French phone number correctly', () => {
      const result = formatPhoneWithCountryCode('123456789', 'france');
      expect(result).toBe('+33 1 23 45 67 89');
    });

    test('should format Chinese phone number correctly', () => {
      const result = formatPhoneWithCountryCode('13812345678', 'china');
      expect(result).toBe('+86 138 1234 5678');
    });

    test('should format Russian phone number correctly', () => {
      const result = formatPhoneWithCountryCode('9123456789', 'russia');
      expect(result).toBe('+7 (912) 345-67-89');
    });

    test('should format Canadian phone number correctly', () => {
      const result = formatPhoneWithCountryCode('4165551234', 'canada');
      expect(result).toBe('+1 (416) 555-1234');
    });

    test('should format Mexican phone number correctly', () => {
      const result = formatPhoneWithCountryCode('5512345678', 'mexico');
      expect(result).toBe('+52 (55) 1234-5678');
    });

    test('should format Chilean phone number correctly', () => {
      const result = formatPhoneWithCountryCode('123456789', 'chile');
      expect(result).toBe('+56 1 2345 6789');
    });

    test('should handle swiss as alias for switzerland', () => {
      const result = formatPhoneWithCountryCode('791234567', 'swiss');
      expect(result).toBe('+41 79 123 45 67');
    });

    test('should handle usa as alias for us', () => {
      const result = formatPhoneWithCountryCode('2125551234', 'usa');
      expect(result).toBe('+1 (212) 555-1234');
    });

    test('should handle case insensitive country names', () => {
      const result = formatPhoneWithCountryCode('11987654321', 'BRAZIL');
      expect(result).toBe('+55 (11) 98765-4321');
    });

    test('should clean input phone number with non-numeric characters', () => {
      const result = formatPhoneWithCountryCode('(11) 98765-4321', 'brazil');
      expect(result).toBe('+55 (11) 98765-4321');
    });

    test('should throw error for unsupported country', () => {
      expect(() => {
        formatPhoneWithCountryCode('1234567890', 'invalid-country');
      }).toThrow('Country \'invalid-country\' is not supported');
    });

    test('should throw error for empty phone number', () => {
      expect(() => {
        formatPhoneWithCountryCode('', 'brazil');
      }).toThrow('Phone number is required');
    });

    test('should throw error for wrong digit count', () => {
      expect(() => {
        formatPhoneWithCountryCode('123', 'brazil');
      }).toThrow('Phone number for brazil should have 11 or 10 digits, but got 3');
    });

    test('should handle already formatted Brazilian mobile number', () => {
      const result = formatPhoneWithCountryCode('(11) 98765-4321', 'brazil');
      expect(result).toBe('+55 (11) 98765-4321');
    });

    test('should handle already formatted Brazilian landline number', () => {
      const result = formatPhoneWithCountryCode('(11) 3456-7890', 'brazil');
      expect(result).toBe('+55 (11) 3456-7890');
    });

    test('should handle already formatted US number', () => {
      const result = formatPhoneWithCountryCode('(212) 555-1234', 'us');
      expect(result).toBe('+1 (212) 555-1234');
    });

    test('should handle already formatted Spanish number', () => {
      const result = formatPhoneWithCountryCode('612 345 678', 'spain');
      expect(result).toBe('+34 612 345 678');
    });

    test('should handle number with dashes and spaces', () => {
      const result = formatPhoneWithCountryCode('320-123-4567', 'italy');
      expect(result).toBe('+39 320 123 4567');
    });

    test('should handle number with dots', () => {
      const result = formatPhoneWithCountryCode('320.123.4567', 'italy');
      expect(result).toBe('+39 320 123 4567');
    });

    test('should handle number with mixed formatting', () => {
      const result = formatPhoneWithCountryCode('+55 (11) 98765-4321', 'brazil');
      expect(result).toBe('+55 (11) 98765-4321');
    });

    test('should handle number with country code prefix', () => {
      const result = formatPhoneWithCountryCode('55 11 987654321', 'brazil');
      expect(result).toBe('+55 (11) 98765-4321');
    });

    test('should handle Mexican number with formatting', () => {
      const result = formatPhoneWithCountryCode('(55) 1234-5678', 'mexico');
      expect(result).toBe('+52 (55) 1234-5678');
    });

    test('should handle Swiss number with formatting', () => {
      const result = formatPhoneWithCountryCode('79 123 45 67', 'switzerland');
      expect(result).toBe('+41 79 123 45 67');
    });

    test('should handle Russian number with formatting', () => {
      const result = formatPhoneWithCountryCode('(912) 345-67-89', 'russia');
      expect(result).toBe('+7 (912) 345-67-89');
    });

    test('should handle Chinese number with formatting', () => {
      const result = formatPhoneWithCountryCode('138 1234 5678', 'china');
      expect(result).toBe('+86 138 1234 5678');
    });
  });

  describe('getCountryCode', () => {
    test('should return correct country code for Brazil', () => {
      expect(getCountryCode('brazil')).toBe('+55');
    });

    test('should return correct country code for US', () => {
      expect(getCountryCode('us')).toBe('+1');
    });

    test('should return correct country code for Spain', () => {
      expect(getCountryCode('spain')).toBe('+34');
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
    test('should return true for valid phone numbers', () => {
      expect(isValidPhoneNumber('11987654321', 'brazil')).toBe(true);
      expect(isValidPhoneNumber('1134567890', 'brazil')).toBe(true);
      expect(isValidPhoneNumber('2125551234', 'us')).toBe(true);
      expect(isValidPhoneNumber('612345678', 'spain')).toBe(true);
    });

    test('should return false for invalid phone numbers', () => {
      expect(isValidPhoneNumber('123', 'brazil')).toBe(false);
      expect(isValidPhoneNumber('1234567890', 'invalid-country')).toBe(false);
      expect(isValidPhoneNumber('', 'brazil')).toBe(false);
    });

    test('should return true for valid formatted phone numbers', () => {
      expect(isValidPhoneNumber('(11) 98765-4321', 'brazil')).toBe(true);
      expect(isValidPhoneNumber('(11) 3456-7890', 'brazil')).toBe(true);
      expect(isValidPhoneNumber('(212) 555-1234', 'us')).toBe(true);
      expect(isValidPhoneNumber('612 345 678', 'spain')).toBe(true);
      expect(isValidPhoneNumber('320-123-4567', 'italy')).toBe(true);
      expect(isValidPhoneNumber('79 123 45 67', 'switzerland')).toBe(true);
    });

    test('should return true for numbers with country code prefix', () => {
      expect(isValidPhoneNumber('+55 11 987654321', 'brazil')).toBe(true);
      expect(isValidPhoneNumber('55 11 34567890', 'brazil')).toBe(true);
      expect(isValidPhoneNumber('+1 212 555 1234', 'us')).toBe(true);
    });

    test('should return true for numbers with mixed formatting', () => {
      expect(isValidPhoneNumber('+55(11)98765-4321', 'brazil')).toBe(true);
      expect(isValidPhoneNumber('320.123.4567', 'italy')).toBe(true);
      expect(isValidPhoneNumber('(55) 1234-5678', 'mexico')).toBe(true);
    });
  });

  describe('getValidDigitCounts', () => {
    test('should return multiple digit counts for Brazil', () => {
      const counts = getValidDigitCounts('brazil');
      expect(counts).toEqual([11, 10]);
    });

    test('should return single digit count for other countries', () => {
      expect(getValidDigitCounts('us')).toEqual([10]);
      expect(getValidDigitCounts('spain')).toEqual([9]);
    });

    test('should throw error for unsupported country', () => {
      expect(() => {
        getValidDigitCounts('invalid-country');
      }).toThrow('Country \'invalid-country\' is not supported');
    });
  });
});
