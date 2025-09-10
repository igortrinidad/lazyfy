import { getWhatsappJidAndNumberValidated } from '../../src'
describe('getWhatsappJidAndNumberValidated', () => {

  const knownNumbers = [
    {
      input: '5531981007753',
      expectedJid: '553181007753@s.whatsapp.net',
      expectedNumber: '553181007753'
    },
    {
      input: '5513991964962',
      expectedJid: '5513991964962@s.whatsapp.net',
      expectedNumber: '551391964962'
    },
    {
      input: '553189231495:14@s.whatsapp.net',
      expectedJid: '553189231495@s.whatsapp.net',
      expectedNumber: '553189231495'
    },

  ]
  
  // Basic phone number formatting tests
  test('should format basic US number', () => {
    for(const {input, expectedJid, expectedNumber} of knownNumbers) {
      const result = getWhatsappJidAndNumberValidated(input)
      expect(result.jid).toBe(expectedJid)
      expect(result.number).toBe(expectedNumber)
    }
  })
  

  test('should format US number with country code', () => {
    const result = getWhatsappJidAndNumberValidated('11234567890')
    expect(result.jid).toBe('11234567890@s.whatsapp.net')
    expect(result.number).toBe('11234567890')
  })

  test('should format number with plus sign', () => {
    const result = getWhatsappJidAndNumberValidated('+1234567890')
    expect(result.jid).toBe('1234567890@s.whatsapp.net')
    expect(result.number).toBe('1234567890')
  })

  test('should format number with spaces and parentheses', () => {
    const result = getWhatsappJidAndNumberValidated('+1 (234) 567-890')
    expect(result.jid).toBe('1234567890@s.whatsapp.net')
    expect(result.number).toBe('1234567890')
  })

  // Brazilian number formatting tests
  test('should format Brazilian mobile number correctly', () => {
    const result = getWhatsappJidAndNumberValidated('5511987654321')
    expect(result.jid).toBe('5511987654321@s.whatsapp.net')
    expect(result.number).toBe('551187654321')
  })

  test('should format Brazilian landline number correctly', () => {
    const result = getWhatsappJidAndNumberValidated('55113456789')
    expect(result.jid).toBe('55113456789@s.whatsapp.net')
    expect(result.number).toBe('55113456789')
  })

  test('should handle Brazilian number with low DDD', () => {
    const result = getWhatsappJidAndNumberValidated('5521987654321')
    expect(result.jid).toBe('5521987654321@s.whatsapp.net')
    expect(result.number).toBe('552187654321')
  })

  test('should handle Brazilian number with low joker digit', () => {
    const result = getWhatsappJidAndNumberValidated('5511687654321')
    expect(result.jid).toBe('5511687654321@s.whatsapp.net')
    expect(result.number).toBe('551187654321')
  })

  // Mexican number formatting tests
  test('should format Mexican number correctly (13 digits)', () => {
    const result = getWhatsappJidAndNumberValidated('5215512345678')
    expect(result.jid).toBe('525512345678@s.whatsapp.net')
    expect(result.number).toBe('525512345678')
  })

  test('should format Mexican number correctly (12 digits)', () => {
  const result = getWhatsappJidAndNumberValidated('521512345678')
  expect(result.jid).toBe('521512345678@s.whatsapp.net')
  expect(result.number).toBe('521512345678')
})

  // Argentine number formatting tests
  test('should format Argentine number correctly (13 digits)', () => {
    const result = getWhatsappJidAndNumberValidated('5491112345678')
    expect(result.jid).toBe('541112345678@s.whatsapp.net')
    expect(result.number).toBe('541112345678')
  })

  test('should format Argentine number correctly (12 digits)', () => {
  const result = getWhatsappJidAndNumberValidated('549112345678')
  expect(result.jid).toBe('549112345678@s.whatsapp.net')
  expect(result.number).toBe('549112345678')
  })

  // Group chat and special JID tests
  test('should handle group chat JID', () => {
    const groupJid = '123456789-123456789@g.us'
    const result = getWhatsappJidAndNumberValidated(groupJid)
    expect(result.jid).toBe(groupJid)
    expect(result.number).toBe('123456789123456789')
  })

  test('should handle existing s.whatsapp.net JID', () => {
    const existingJid = '1234567890@s.whatsapp.net'
    const result = getWhatsappJidAndNumberValidated(existingJid)
    expect(result.jid).toBe(existingJid)
    expect(result.number).toBe('1234567890')
  })

  test('should handle broadcast JID', () => {
    const broadcastJid = '1234567890@broadcast'
    const result = getWhatsappJidAndNumberValidated(broadcastJid)
    expect(result.jid).toBe(broadcastJid)
    expect(result.number).toBe('1234567890')
  })

  test('should handle lid JID', () => {
    const lidJid = '1234567890@lid'
    const result = getWhatsappJidAndNumberValidated(lidJid)
    expect(result.jid).toBe(lidJid)
    expect(result.number).toBe('1234567890')
  })

  // Long number tests (18+ digits for group)
  test('should format very long number as group chat', () => {
    const longNumber = '123456789012345678'
    const result = getWhatsappJidAndNumberValidated(longNumber)
    expect(result.jid).toBe(`${longNumber}@g.us`)
    expect(result.number).toBe(longNumber)
  })

  test('should format number with dashes as group chat (24+ chars)', () => {
    const numberWithDashes = '123456789-123456789-123456'
    const result = getWhatsappJidAndNumberValidated(numberWithDashes)
    expect(result.jid).toBe(`${numberWithDashes}@g.us`)
    expect(result.number).toBe('123456789123456789123456')
  })

  // JID with colon and @ splitting
  test('should handle JID with colon', () => {
    const jidWithColon = '1234567890:status@s.whatsapp.net'
    const result = getWhatsappJidAndNumberValidated(jidWithColon)
    expect(result.jid).toBe('1234567890:status@s.whatsapp.net')
    expect(result.number).toBe('1234567890')
  })

  test('should handle complex formatting with multiple symbols', () => {
    const complexNumber = '+55 (11) 9 8765-4321'
    const result = getWhatsappJidAndNumberValidated(complexNumber)
    expect(result.jid).toBe('5511987654321@s.whatsapp.net')
    expect(result.number).toBe('551187654321')
  })

  // Number type conversion test
  test('should handle number input type', () => {
    const result = getWhatsappJidAndNumberValidated('1234567890')
    expect(result.jid).toBe('1234567890@s.whatsapp.net')
    expect(result.number).toBe('1234567890')
  })

  // Edge cases and error handling
  test('should throw error for empty string', () => {
    expect(() => {
      getWhatsappJidAndNumberValidated('')
    }).toThrow('Invalid remote_jid @s.whatsapp.net | phone: ')
  })

  test('should throw error for null input', () => {
    expect(() => {
      getWhatsappJidAndNumberValidated(null as any)
    }).toThrow('Invalid remote_jid @s.whatsapp.net | phone: ')
  })

  test('should handle whitespace-only input', () => {
    expect(() => {
      getWhatsappJidAndNumberValidated('   ')
    }).toThrow('Invalid remote_jid @s.whatsapp.net | phone:    ')
  })

  // International numbers
  test('should format UK number', () => {
    const result = getWhatsappJidAndNumberValidated('447123456789')
    expect(result.jid).toBe('447123456789@s.whatsapp.net')
    expect(result.number).toBe('447123456789')
  })

  test('should format German number', () => {
    const result = getWhatsappJidAndNumberValidated('491234567890')
    expect(result.jid).toBe('491234567890@s.whatsapp.net')
    expect(result.number).toBe('491234567890')
  })

  test('should format Indian number', () => {
    const result = getWhatsappJidAndNumberValidated('919876543210')
    expect(result.jid).toBe('919876543210@s.whatsapp.net')
    expect(result.number).toBe('919876543210')
  })

  // Portuguese number formatting tests
  test('should format Portuguese mobile number correctly', () => {
    const result = getWhatsappJidAndNumberValidated('351912345678')
    expect(result.jid).toBe('351912345678@s.whatsapp.net')
    expect(result.number).toBe('351912345678')
  })

  test('should format Portuguese mobile number with 96 prefix', () => {
    const result = getWhatsappJidAndNumberValidated('351961234567')
    expect(result.jid).toBe('351961234567@s.whatsapp.net')
    expect(result.number).toBe('351961234567')
  })

  test('should format Portuguese mobile number with 93 prefix', () => {
    const result = getWhatsappJidAndNumberValidated('351931234567')
    expect(result.jid).toBe('351931234567@s.whatsapp.net')
    expect(result.number).toBe('351931234567')
  })

  test('should format Portuguese landline number (Lisbon)', () => {
    const result = getWhatsappJidAndNumberValidated('351211234567')
    expect(result.jid).toBe('351211234567@s.whatsapp.net')
    expect(result.number).toBe('351211234567')
  })

  test('should format Portuguese landline number (Porto)', () => {
    const result = getWhatsappJidAndNumberValidated('351221234567')
    expect(result.jid).toBe('351221234567@s.whatsapp.net')
    expect(result.number).toBe('351221234567')
  })

  test('should format Portuguese number with plus sign', () => {
    const result = getWhatsappJidAndNumberValidated('+351912345678')
    expect(result.jid).toBe('351912345678@s.whatsapp.net')
    expect(result.number).toBe('351912345678')
  })

  test('should format Portuguese number with formatting', () => {
    const result = getWhatsappJidAndNumberValidated('+351 91 234 5678')
    expect(result.jid).toBe('351912345678@s.whatsapp.net')
    expect(result.number).toBe('351912345678')
  })

  test('should format Portuguese number with parentheses and dashes', () => {
    const result = getWhatsappJidAndNumberValidated('+351 (91) 234-5678')
    expect(result.jid).toBe('351912345678@s.whatsapp.net')
    expect(result.number).toBe('351912345678')
  })

  test('should format Portuguese number with dots', () => {
    const result = getWhatsappJidAndNumberValidated('351.91.234.5678')
    expect(result.jid).toBe('351912345678@s.whatsapp.net')
    expect(result.number).toBe('351912345678')
  })

  test('should format Portuguese mobile with 92 prefix', () => {
    const result = getWhatsappJidAndNumberValidated('351921234567')
    expect(result.jid).toBe('351921234567@s.whatsapp.net')
    expect(result.number).toBe('351921234567')
  })

  test('should format Portuguese toll-free number', () => {
    const result = getWhatsappJidAndNumberValidated('351800123456')
    expect(result.jid).toBe('351800123456@s.whatsapp.net')
    expect(result.number).toBe('351800123456')
  })

    // Special characters and formatting
  test('should remove all non-digit characters except dashes in long numbers', () => {
    const specialNumber = '123-456-789-012-345-678-abc'
    const result = getWhatsappJidAndNumberValidated(specialNumber)
    expect(result.jid).toBe('123-456-789-012-345-678-@g.us')
    expect(result.number).toBe('123456789012345678')
  })

  test('should handle number with dots', () => {
    const result = getWhatsappJidAndNumberValidated('11.2345.67890')
    expect(result.jid).toBe('11234567890@s.whatsapp.net')
    expect(result.number).toBe('11234567890')
  })

  // Business account format
  test('should handle business account format', () => {
    const businessNumber = '123456789012345@g.us'
    const result = getWhatsappJidAndNumberValidated(businessNumber)
    expect(result.jid).toBe(businessNumber)
    expect(result.number).toBe('123456789012345')
  })

  // Boundary cases for country codes
  test('should not modify non-MX/AR country code with 13 digits', () => {
    const result = getWhatsappJidAndNumberValidated('5112345678901') // 51 = Peru
    expect(result.jid).toBe('5112345678901@s.whatsapp.net')
    expect(result.number).toBe('5112345678901')
  })

  test('should handle Mexican number edge case with different length', () => {
    const result = getWhatsappJidAndNumberValidated('52123456789') // 11 digits
    expect(result.jid).toBe('52123456789@s.whatsapp.net')
    expect(result.number).toBe('52123456789')
  })

  // Additional edge cases
  test('should handle undefined input', () => {
    expect(() => {
      getWhatsappJidAndNumberValidated(undefined as any)
    }).toThrow('Invalid remote_jid @s.whatsapp.net | phone: ')
  })

  test('should handle only special characters', () => {
    expect(() => {
      getWhatsappJidAndNumberValidated('+-().')
    }).toThrow('Invalid remote_jid @s.whatsapp.net | phone: +-().')
  })

  test('should handle already formatted group JID with letters', () => {
    const groupJid = '120363123456789012@g.us'
    const result = getWhatsappJidAndNumberValidated(groupJid)
    expect(result.jid).toBe(groupJid)
    expect(result.number).toBe('120363123456789012')
  })

  test('should handle number with multiple @ symbols', () => {
    const complexJid = '1234567890@test@s.whatsapp.net'
    const result = getWhatsappJidAndNumberValidated(complexJid)
    expect(result.jid).toBe(complexJid)
    expect(result.number).toBe('1234567890')
  })

  test('should format European number with country code', () => {
    const result = getWhatsappJidAndNumberValidated('33123456789') // France
    expect(result.jid).toBe('33123456789@s.whatsapp.net')
    expect(result.number).toBe('33123456789')
  })

  test('should handle number with leading zeros after country code', () => {
    const result = getWhatsappJidAndNumberValidated('44012345678') // UK with leading zero
    expect(result.jid).toBe('44012345678@s.whatsapp.net')
    expect(result.number).toBe('44012345678')
  })

  test('should handle Brazilian edge case with DDD 11 and mobile digit 9', () => {
    const result = getWhatsappJidAndNumberValidated('5511912345678')
    expect(result.jid).toBe('5511912345678@s.whatsapp.net')
    expect(result.number).toBe('551112345678')
  })

})
