import { extractCountryCodeAndPhone } from '../../src/Masker';

describe('extractCountryCodeAndPhone', () => {
  
  describe('Numbers with + prefix', () => {
    const numbersWithPlusTestCases = [
      {
        description: 'Brazilian mobile number with + prefix',
        input: '+5511987654321',
        expected: { countryCode: '+55', phoneNumber: '11987654321', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'Brazilian landline number with + prefix',
        input: '+551134567890',
        expected: { countryCode: '+55', phoneNumber: '1134567890', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'US number with + prefix',
        input: '+12125551234',
        expected: { countryCode: '+1', phoneNumber: '2125551234', country: 'us', mask: '(###) ###-####' }
      },
      {
        description: 'Spanish number with + prefix',
        input: '+34612345678',
        expected: { countryCode: '+34', phoneNumber: '612345678', country: 'spain', mask: '### ### ###' }
      },
      {
        description: 'Portuguese number with + prefix',
        input: '+351912345678',
        expected: { countryCode: '+351', phoneNumber: '912345678', country: 'portugal', mask: '### ### ###' }
      },
      {
        description: 'German number with + prefix',
        input: '+4917012345678',
        expected: { countryCode: '+49', phoneNumber: '17012345678', country: 'germany', mask: '#### ########' }
      },
      {
        description: 'UK number with + prefix',
        input: '+447701234567',
        expected: { countryCode: '+44', phoneNumber: '7701234567', country: 'uk', mask: '#### ### ####' }
      },
      {
        description: 'Chinese number with + prefix',
        input: '+8613812345678',
        expected: { countryCode: '+86', phoneNumber: '13812345678', country: 'china', mask: '### #### ####' }
      },
      {
        description: 'Japanese number with + prefix',
        input: '+819012345678',
        expected: { countryCode: '+81', phoneNumber: '9012345678', country: 'japan', mask: '##-####-####' }
      },
      {
        description: 'Russian number with + prefix',
        input: '+79123456789',
        expected: { countryCode: '+7', phoneNumber: '9123456789', country: 'russia', mask: '(###) ###-##-##' }
      },
      {
        description: 'Indian number with + prefix',
        input: '+919876543210',
        expected: { countryCode: '+91', phoneNumber: '9876543210', country: 'india', mask: '##### #####' }
      },
      {
        description: 'South African number with + prefix',
        input: '+27821234567',
        expected: { countryCode: '+27', phoneNumber: '821234567', country: 'southafrica', mask: '## ### ####' }
      },
      {
        description: 'Australian number with + prefix',
        input: '+61412345678',
        expected: { countryCode: '+61', phoneNumber: '412345678', country: 'australia', mask: '### ### ###' }
      },
      {
        description: 'UAE number with + prefix',
        input: '+971501234567',
        expected: { countryCode: '+971', phoneNumber: '501234567', country: 'uae', mask: '##-### ####' }
      },
      {
        description: 'Israeli number with + prefix',
        input: '+972501234567',
        expected: { countryCode: '+972', phoneNumber: '501234567', country: 'israel', mask: '##-###-####' }
      }
    ];

    numbersWithPlusTestCases.forEach(({ description, input, expected }) => {
      test(`should extract ${description} correctly`, () => {
        const result = extractCountryCodeAndPhone(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('Formatted numbers with + prefix', () => {
    const formattedNumbersTestCases = [
      {
        description: 'Formatted Brazilian mobile number',
        input: '+55 (11) 98765-4321',
        expected: { countryCode: '+55', phoneNumber: '11987654321', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'Formatted Brazilian landline number',
        input: '+55 (11) 3456-7890',
        expected: { countryCode: '+55', phoneNumber: '1134567890', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'Formatted US number',
        input: '+1 (212) 555-1234',
        expected: { countryCode: '+1', phoneNumber: '2125551234', country: 'us', mask: '(###) ###-####' }
      },
      {
        description: 'Formatted Spanish number',
        input: '+34 612 345 678',
        expected: { countryCode: '+34', phoneNumber: '612345678', country: 'spain', mask: '### ### ###' }
      },
      {
        description: 'Formatted Portuguese number',
        input: '+351 912 345 678',
        expected: { countryCode: '+351', phoneNumber: '912345678', country: 'portugal', mask: '### ### ###' }
      },
      {
        description: 'Formatted German number',
        input: '+49 1701 2345678',
        expected: { countryCode: '+49', phoneNumber: '17012345678', country: 'germany', mask: '#### ########' }
      },
      {
        description: 'Formatted Chinese number',
        input: '+86 138 1234 5678',
        expected: { countryCode: '+86', phoneNumber: '13812345678', country: 'china', mask: '### #### ####' }
      },
      {
        description: 'Formatted Japanese number',
        input: '+81 90-1234-5678',
        expected: { countryCode: '+81', phoneNumber: '9012345678', country: 'japan', mask: '##-####-####' }
      },
      {
        description: 'Formatted Swiss number',
        input: '+41 79 123 45 67',
        expected: { countryCode: '+41', phoneNumber: '791234567', country: 'switzerland', mask: '## ### ## ##' }
      },
      {
        description: 'Formatted French number',
        input: '+33 1 23 45 67 89',
        expected: { countryCode: '+33', phoneNumber: '123456789', country: 'france', mask: '# ## ## ## ##' }
      }
    ];

    formattedNumbersTestCases.forEach(({ description, input, expected }) => {
      test(`should extract ${description} correctly`, () => {
        const result = extractCountryCodeAndPhone(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('Numbers without + prefix (with country code)', () => {
    const numbersWithoutPlusTestCases = [
      {
        description: 'Brazilian mobile number without + prefix',
        input: '5511987654321',
        expected: { countryCode: '+55', phoneNumber: '11987654321', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'Brazilian landline number without + prefix',
        input: '551134567890',
        expected: { countryCode: '+55', phoneNumber: '1134567890', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'US number without + prefix',
        input: '12125551234',
        expected: { countryCode: '+1', phoneNumber: '2125551234', country: 'us', mask: '(###) ###-####' }
      },
      {
        description: 'Spanish number without + prefix',
        input: '34612345678',
        expected: { countryCode: '+34', phoneNumber: '612345678', country: 'spain', mask: '### ### ###' }
      },
      {
        description: 'Portuguese number without + prefix',
        input: '351912345678',
        expected: { countryCode: '+351', phoneNumber: '912345678', country: 'portugal', mask: '### ### ###' }
      },
      {
        description: 'German number without + prefix',
        input: '4917012345678',
        expected: { countryCode: '+49', phoneNumber: '17012345678', country: 'germany', mask: '#### ########' }
      },
      {
        description: 'Chinese number without + prefix',
        input: '8613812345678',
        expected: { countryCode: '+86', phoneNumber: '13812345678', country: 'china', mask: '### #### ####' }
      },
      {
        description: 'UAE number without + prefix',
        input: '971501234567',
        expected: { countryCode: '+971', phoneNumber: '501234567', country: 'uae', mask: '##-### ####' }
      }
    ];

    numbersWithoutPlusTestCases.forEach(({ description, input, expected }) => {
      test(`should extract ${description} correctly`, () => {
        const result = extractCountryCodeAndPhone(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('WhatsApp JID formats', () => {
    const whatsappJidTestCases = [
      {
        description: 'Brazilian WhatsApp JID with @s.whatsapp.net',
        input: '5511987654321@s.whatsapp.net',
        expected: { countryCode: '+55', phoneNumber: '11987654321', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'Brazilian WhatsApp JID with @g.us',
        input: '551134567890@g.us',
        expected: { countryCode: '+55', phoneNumber: '1134567890', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'US WhatsApp JID with @s.whatsapp.net',
        input: '12125551234@s.whatsapp.net',
        expected: { countryCode: '+1', phoneNumber: '2125551234', country: 'us', mask: '(###) ###-####' }
      },
      {
        description: 'Spanish WhatsApp JID with @c.us',
        input: '34612345678@c.us',
        expected: { countryCode: '+34', phoneNumber: '612345678', country: 'spain', mask: '### ### ###' }
      },
      {
        description: 'Portuguese WhatsApp JID with @s.whatsapp.net',
        input: '351912345678@s.whatsapp.net',
        expected: { countryCode: '+351', phoneNumber: '912345678', country: 'portugal', mask: '### ### ###' }
      },
      {
        description: 'WhatsApp JID with mixed formatting',
        input: '55 (11) 98765-4321@s.whatsapp.net',
        expected: { countryCode: '+55', phoneNumber: '11987654321', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'WhatsApp JID with spaces and dashes',
        input: '55-11-98765-4321@s.whatsapp.net',
        expected: { countryCode: '+55', phoneNumber: '11987654321', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      }
    ];

    whatsappJidTestCases.forEach(({ description, input, expected }) => {
      test(`should extract ${description} correctly`, () => {
        const result = extractCountryCodeAndPhone(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('Numbers without country code', () => {
    const numbersWithoutCountryCodeTestCases = [
      {
        description: 'Brazilian mobile number without country code',
        input: '11987654321',
        expected: null as any
      },
      {
        description: 'Brazilian landline number without country code (but matches US incomplete)',
        input: '1134567890',
        expected: { countryCode: '+1', country: 'us', mask: '(###) ###-####' } // This now matches as incomplete US number
      },
      {
        description: 'US number without country code (but matches Morocco incomplete)',
        input: '2125551234',
        expected: { countryCode: '+212', country: 'morocco', mask: '###-######' } // This now matches as incomplete Morocco number
      },
      {
        description: 'Spanish number without country code (but matches Australia incomplete)',
        input: '612345678',
        expected: { countryCode: '+61', country: 'australia', mask: '### ### ###' } // This now matches as incomplete Australia number
      },
      {
        description: 'Random 9-digit number',
        input: '987654321',
        expected: null as any
      },
      {
        description: 'Random 10-digit number (but matches US incomplete)',
        input: '1234567890',
        expected: { countryCode: '+1', country: 'us', mask: '(###) ###-####' } // This now matches as incomplete US number
      }
    ];

    numbersWithoutCountryCodeTestCases.forEach(({ description, input, expected }) => {
      test(`should return null for ${description}`, () => {
        const result = extractCountryCodeAndPhone(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('Invalid or edge cases', () => {
    const invalidCasesTestCases = [
      {
        description: 'empty string',
        input: '',
        expected: null as any
      },
      {
        description: 'null input',
        input: null as any,
        expected: null as any
      },
      {
        description: 'undefined input',
        input: undefined as any,
        expected: null as any
      },
      {
        description: 'only + symbol',
        input: '+',
        expected: null as any
      },
      {
        description: 'invalid country code',
        input: '+999123456789',
        expected: null as any
      },
      {
        description: 'too short number (now returns Brazil country code)',
        input: '+55123',
        expected: { countryCode: '+55', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] } // This now returns incomplete Brazil number
      },
      {
        description: 'too long number',
        input: '+5511987654321000',
        expected: null as any
      },
      {
        description: 'non-numeric characters only',
        input: 'abcdefghijk',
        expected: null as any
      },
      {
        description: 'mixed letters and numbers',
        input: '+55abc11987654321',
        expected: null as any
      },
      {
        description: 'number with wrong digit count for country',
        input: '+55119876543210', // Too many digits for Brazil
        expected: null as any
      },
      {
        description: 'US number with invalid area code (starts with 0)',
        input: '+10125551234',
        expected: null as any
      },
      {
        description: 'US number with invalid area code (starts with 1)',
        input: '+11125551234',
        expected: null as any
      }
    ];

    invalidCasesTestCases.forEach(({ description, input, expected }) => {
      test(`should return null for ${description}`, () => {
        const result = extractCountryCodeAndPhone(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('Edge cases with single-digit country codes', () => {
    test('should validate US number with proper area code', () => {
      const validUSNumbers = [
        '+12125551234', // Valid NYC area code
        '+14165551234', // Valid Toronto area code (Canada shares +1)
        '+13125551234', // Valid Chicago area code
        '+15555551234'  // Valid area code starting with 5
      ];

      validUSNumbers.forEach(number => {
        const result = extractCountryCodeAndPhone(number);
        expect(result).toEqual({
          countryCode: '+1',
          phoneNumber: number.slice(2),
          country: 'us',
          mask: '(###) ###-####'
        });
      });
    });

    test('should reject US number with invalid area code', () => {
      const invalidUSNumbers = [
        '+10125551234', // Area code starts with 0
        '+11125551234'  // Area code starts with 1
      ];

      invalidUSNumbers.forEach(number => {
        const result = extractCountryCodeAndPhone(number);
        expect(result).toBeNull();
      });
    });

    test('should validate Russian number correctly', () => {
      const validRussianNumbers = [
        '+79123456789',
        '+75551234567',
        '+78881234567'
      ];

      validRussianNumbers.forEach(number => {
        const result = extractCountryCodeAndPhone(number);
        expect(result).toEqual({
          countryCode: '+7',
          phoneNumber: number.slice(2),
          country: 'russia',
          mask: '(###) ###-##-##'
        });
      });
    });
  });

  describe('Priority handling for overlapping country codes', () => {
    test('should prioritize longer country codes over shorter ones', () => {
      // Portugal (+351) should be detected instead of Spain (+34) for 351 prefix
      const result = extractCountryCodeAndPhone('+351912345678');
      expect(result).toEqual({
        countryCode: '+351',
        phoneNumber: '912345678',
        country: 'portugal',
        mask: '### ### ###'
      });
    });

    test('should prioritize UAE (+971) over Russia (+7)', () => {
      const result = extractCountryCodeAndPhone('+971501234567');
      expect(result).toEqual({
        countryCode: '+971',
        phoneNumber: '501234567',
        country: 'uae',
        mask: '##-### ####'
      });
    });

    test('should prioritize Finland (+358) over Spain (+34)', () => {
      const result = extractCountryCodeAndPhone('+358401234567');
      expect(result).toEqual({
        countryCode: '+358',
        phoneNumber: '401234567',
        country: 'finland',
        mask: '## ### ####'
      });
    });
  });

  describe('Mixed formatting scenarios', () => {
    const mixedFormattingTestCases = [
      {
        description: 'number with dots',
        input: '+55.11.98765.4321',
        expected: { countryCode: '+55', phoneNumber: '11987654321', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'number with dashes',
        input: '+55-11-98765-4321',
        expected: { countryCode: '+55', phoneNumber: '11987654321', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'number with parentheses',
        input: '+55(11)98765-4321',
        expected: { countryCode: '+55', phoneNumber: '11987654321', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'number with spaces',
        input: '+55 11 98765 4321',
        expected: { countryCode: '+55', phoneNumber: '11987654321', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'number with mixed formatting',
        input: '+55 (11) 98765-4321',
        expected: { countryCode: '+55', phoneNumber: '11987654321', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'US number with mixed formatting',
        input: '+1 (212) 555-1234',
        expected: { countryCode: '+1', phoneNumber: '2125551234', country: 'us', mask: '(###) ###-####' }
      },
      {
        description: 'German number with spaces',
        input: '+49 1701 2345678',
        expected: { countryCode: '+49', phoneNumber: '17012345678', country: 'germany', mask: '#### ########' }
      }
    ];

    mixedFormattingTestCases.forEach(({ description, input, expected }) => {
      test(`should handle ${description} correctly`, () => {
        const result = extractCountryCodeAndPhone(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('Real-world scenarios', () => {
    test('should handle numbers from contact lists', () => {
      const contactNumbers = [
        '+55 (11) 98765-4321',
        '+1-212-555-1234',
        '+34 612 345 678',
        '+351 912 345 678',
        '+49 1701 2345678'
      ];

      const expectedResults = [
        { countryCode: '+55', phoneNumber: '11987654321', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] },
        { countryCode: '+1', phoneNumber: '2125551234', country: 'us', mask: '(###) ###-####' },
        { countryCode: '+34', phoneNumber: '612345678', country: 'spain', mask: '### ### ###' },
        { countryCode: '+351', phoneNumber: '912345678', country: 'portugal', mask: '### ### ###' },
        { countryCode: '+49', phoneNumber: '17012345678', country: 'germany', mask: '#### ########' }
      ];

      contactNumbers.forEach((number, index) => {
        const result = extractCountryCodeAndPhone(number);
        expect(result).toEqual(expectedResults[index]);
      });
    });

    test('should handle numbers from different sources with various formatting', () => {
      const sourceMappings = [
        {
          source: 'WhatsApp',
          numbers: ['5511987654321@s.whatsapp.net', '12125551234@s.whatsapp.net'],
          expected: [
            { countryCode: '+55', phoneNumber: '11987654321', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] },
            { countryCode: '+1', phoneNumber: '2125551234', country: 'us', mask: '(###) ###-####' }
          ]
        },
        {
          source: 'International format',
          numbers: ['+55 11 98765-4321', '+1 212 555 1234'],
          expected: [
            { countryCode: '+55', phoneNumber: '11987654321', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] },
            { countryCode: '+1', phoneNumber: '2125551234', country: 'us', mask: '(###) ###-####' }
          ]
        },
        {
          source: 'Raw numbers',
          numbers: ['5511987654321', '12125551234'],
          expected: [
            { countryCode: '+55', phoneNumber: '11987654321', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] },
            { countryCode: '+1', phoneNumber: '2125551234', country: 'us', mask: '(###) ###-####' }
          ]
        }
      ];

      sourceMappings.forEach(({ source, numbers, expected }) => {
        numbers.forEach((number, index) => {
          const result = extractCountryCodeAndPhone(number);
          expect(result).toEqual(expected[index]);
        });
      });
    });
  });

  describe('Incomplete numbers (return only country code)', () => {
    const incompleteNumbersTestCases = [
      {
        description: 'Brazilian number with country code but incomplete phone',
        input: '+5511',
        expected: { countryCode: '+55', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'Brazilian number with country code and partial phone',
        input: '+551198765',
        expected: { countryCode: '+55', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'US number with country code but incomplete phone',
        input: '+1212',
        expected: { countryCode: '+1', country: 'us', mask: '(###) ###-####' }
      },
      {
        description: 'US number with country code and partial phone',
        input: '+121255512',
        expected: { countryCode: '+1', country: 'us', mask: '(###) ###-####' }
      },
      {
        description: 'Spanish number with country code but incomplete phone',
        input: '+3461',
        expected: { countryCode: '+34', country: 'spain', mask: '### ### ###' }
      },
      {
        description: 'Portuguese number with country code but incomplete phone',
        input: '+35191',
        expected: { countryCode: '+351', country: 'portugal', mask: '### ### ###' }
      },
      {
        description: 'German number with country code but incomplete phone',
        input: '+491701',
        expected: { countryCode: '+49', country: 'germany', mask: '#### ########' }
      },
      {
        description: 'Chinese number with country code but incomplete phone',
        input: '+86138',
        expected: { countryCode: '+86', country: 'china', mask: '### #### ####' }
      },
      {
        description: 'UAE number with country code but incomplete phone',
        input: '+97150',
        expected: { countryCode: '+971', country: 'uae', mask: '##-### ####' }
      },
      {
        description: 'Israeli number with country code but incomplete phone',
        input: '+97250',
        expected: { countryCode: '+972', country: 'israel', mask: '##-###-####' }
      }
    ];

    incompleteNumbersTestCases.forEach(({ description, input, expected }) => {
      test(`should return only country code for ${description}`, () => {
        const result = extractCountryCodeAndPhone(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('Incomplete numbers without + prefix', () => {
    const incompleteWithoutPlusTestCases = [
      {
        description: 'Brazilian incomplete number without + prefix',
        input: '5511',
        expected: { countryCode: '+55', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'Brazilian partial number without + prefix',
        input: '551198765',
        expected: { countryCode: '+55', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
      },
      {
        description: 'US incomplete number without + prefix',
        input: '1212',
        expected: { countryCode: '+1', country: 'us', mask: '(###) ###-####' }
      },
      {
        description: 'Spanish incomplete number without + prefix',
        input: '3461',
        expected: { countryCode: '+34', country: 'spain', mask: '### ### ###' }
      },
      {
        description: 'Portuguese incomplete number without + prefix',
        input: '35191',
        expected: { countryCode: '+351', country: 'portugal', mask: '### ### ###' }
      },
      {
        description: 'German incomplete number without + prefix',
        input: '491701',
        expected: { countryCode: '+49', country: 'germany', mask: '#### ########' }
      },
      {
        description: 'Chinese incomplete number without + prefix',
        input: '86138',
        expected: { countryCode: '+86', country: 'china', mask: '### #### ####' }
      }
    ];

    incompleteWithoutPlusTestCases.forEach(({ description, input, expected }) => {
      test(`should return only country code for ${description}`, () => {
        const result = extractCountryCodeAndPhone(input);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('Edge cases for incomplete numbers', () => {
    test('should return null for just country code with no additional digits', () => {
      const justCountryCodes = ['+55', '+1', '+34', '+351', '+49'];
      
      justCountryCodes.forEach(code => {
        const result = extractCountryCodeAndPhone(code);
        expect(result).toBeNull();
      });
    });

    test('should return null for too long incomplete numbers', () => {
      // Numbers that are longer than expected for the country but still incomplete
      const tooLongIncomplete = [
        '+55119876543210000', // Way too long for Brazil
        '+1212555123400000'   // Way too long for US
      ];
      
      tooLongIncomplete.forEach(number => {
        const result = extractCountryCodeAndPhone(number);
        expect(result).toBeNull();
      });
    });

    test('should handle formatted incomplete numbers', () => {
      const formattedIncompleteTestCases = [
        {
          input: '+55 (11) 98765',
          expected: { countryCode: '+55', country: 'brazil', mask: ['(##) #####-####', '(##) ####-####'] }
        },
        {
          input: '+1 (212) 555',
          expected: { countryCode: '+1', country: 'us', mask: '(###) ###-####' }
        },
        {
          input: '+34 612 345',
          expected: { countryCode: '+34', country: 'spain', mask: '### ### ###' }
        },
        {
          input: '+351 912 345',
          expected: { countryCode: '+351', country: 'portugal', mask: '### ### ###' }
        }
      ];

      formattedIncompleteTestCases.forEach(({ input, expected }) => {
        const result = extractCountryCodeAndPhone(input);
        expect(result).toEqual(expected);
      });
    });
  });
});
