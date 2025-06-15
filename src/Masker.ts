import { masker } from './mask/masker'
import { DEFAULT_PHONE_DDI, DEFAULT_PHONE_MASK, DEFAULT_PHONE_MASK_WITH_DDI} from './mask/enums'

// Phone number formats by country
interface PhoneFormatConfig {
  countryCode: string;
  mask: string | string[];
  digitCount: number | number[];
}

const PHONE_FORMATS: Record<string, PhoneFormatConfig> = {
  brazil: { 
    countryCode: '+55', 
    mask: ['(##) #####-####', '(##) ####-####'], 
    digitCount: [11, 10] 
  },
  us: { countryCode: '+1', mask: '(###) ###-####', digitCount: 10 },
  usa: { countryCode: '+1', mask: '(###) ###-####', digitCount: 10 },
  spain: { countryCode: '+34', mask: '### ### ###', digitCount: 9 },
  portugal: { countryCode: '+351', mask: '### ### ###', digitCount: 9 },
  argentina: { countryCode: '+54', mask: '(##) ####-####', digitCount: 10 },
  italy: { countryCode: '+39', mask: '### ### ####', digitCount: 10 },
  switzerland: { countryCode: '+41', mask: '## ### ## ##', digitCount: 9 },
  swiss: { countryCode: '+41', mask: '## ### ## ##', digitCount: 9 },
  france: { countryCode: '+33', mask: '# ## ## ## ##', digitCount: 9 },
  china: { countryCode: '+86', mask: '### #### ####', digitCount: 11 },
  russia: { countryCode: '+7', mask: '(###) ###-##-##', digitCount: 10 },
  canada: { countryCode: '+1', mask: '(###) ###-####', digitCount: 10 },
  mexico: { countryCode: '+52', mask: '(##) ####-####', digitCount: 10 },
  chile: { countryCode: '+56', mask: '# #### ####', digitCount: 9 },
  // Major European countries
  germany: { countryCode: '+49', mask: '#### ########', digitCount: 11 },
  uk: { countryCode: '+44', mask: '#### ### ####', digitCount: 10 },
  unitedkingdom: { countryCode: '+44', mask: '#### ### ####', digitCount: 10 },
  netherlands: { countryCode: '+31', mask: '# ########', digitCount: 9 },
  belgium: { countryCode: '+32', mask: '### ## ## ##', digitCount: 9 },
  austria: { countryCode: '+43', mask: '### #######', digitCount: 10 },
  poland: { countryCode: '+48', mask: '### ### ###', digitCount: 9 },
  sweden: { countryCode: '+46', mask: '## ### ## ##', digitCount: 9 },
  norway: { countryCode: '+47', mask: '### ## ###', digitCount: 8 },
  denmark: { countryCode: '+45', mask: '## ## ## ##', digitCount: 8 },
  finland: { countryCode: '+358', mask: '## ### ####', digitCount: 9 },
  // Major Asian countries
  japan: { countryCode: '+81', mask: '##-####-####', digitCount: 10 },
  southkorea: { countryCode: '+82', mask: '##-####-####', digitCount: 10 },
  korea: { countryCode: '+82', mask: '##-####-####', digitCount: 10 },
  india: { countryCode: '+91', mask: '##### #####', digitCount: 10 },
  singapore: { countryCode: '+65', mask: '#### ####', digitCount: 8 },
  malaysia: { countryCode: '+60', mask: '##-### ####', digitCount: 9 },
  thailand: { countryCode: '+66', mask: '##-###-####', digitCount: 9 },
  vietnam: { countryCode: '+84', mask: '##-#### ####', digitCount: 9 },
  philippines: { countryCode: '+63', mask: '###-###-####', digitCount: 10 },
  indonesia: { countryCode: '+62', mask: '##-####-####', digitCount: 10 },
  // Major countries in Americas
  colombia: { countryCode: '+57', mask: '### ### ####', digitCount: 10 },
  venezuela: { countryCode: '+58', mask: '###-#######', digitCount: 10 },
  peru: { countryCode: '+51', mask: '### ### ###', digitCount: 9 },
  ecuador: { countryCode: '+593', mask: '##-### ####', digitCount: 9 },
  uruguay: { countryCode: '+598', mask: '## ### ###', digitCount: 8 },
  paraguay: { countryCode: '+595', mask: '### ######', digitCount: 9 },
  bolivia: { countryCode: '+591', mask: '########', digitCount: 8 },
  // Major African countries
  southafrica: { countryCode: '+27', mask: '## ### ####', digitCount: 9 },
  nigeria: { countryCode: '+234', mask: '### ### ####', digitCount: 10 },
  egypt: { countryCode: '+20', mask: '### ### ####', digitCount: 10 },
  morocco: { countryCode: '+212', mask: '###-######', digitCount: 9 },
  algeria: { countryCode: '+213', mask: '### ## ## ##', digitCount: 9 },
  // Major Oceania countries
  australia: { countryCode: '+61', mask: '### ### ###', digitCount: 9 },
  newzealand: { countryCode: '+64', mask: '##-### ####', digitCount: 9 },
  // Middle East
  israel: { countryCode: '+972', mask: '##-###-####', digitCount: 9 },
  uae: { countryCode: '+971', mask: '##-### ####', digitCount: 9 },
  unitedarabemirates: { countryCode: '+971', mask: '##-### ####', digitCount: 9 },
  saudiarabia: { countryCode: '+966', mask: '##-###-####', digitCount: 9 },
  turkey: { countryCode: '+90', mask: '### ### ## ##', digitCount: 10 }
};

/**
 * Formats a phone number with country code based on the specified country
 * @param phoneNumber - The phone number to format (digits only)
 * @param country - The country code (e.g., 'brazil', 'us', 'spain')
 * @param throwsErrorOnValidation - Whether to throw errors on validation failures (default: false)
 * @returns Formatted phone number with country code
 */
export const formatPhoneWithCountryCode = (phoneNumber: string, country: string, throwsErrorOnValidation: boolean = false): string => {
  if (!phoneNumber) {
    if (throwsErrorOnValidation) {
      throw new Error('Phone number is required');
    }
    return masker('+55 (31) 99090-9090', DEFAULT_PHONE_MASK_WITH_DDI, true);
  }

  const countryKey = country.toLowerCase();
  const config = PHONE_FORMATS[countryKey];
  
  if (!config) {
    if (throwsErrorOnValidation) {
      throw new Error(`Country '${country}' is not supported. Supported countries: ${Object.keys(PHONE_FORMATS).join(', ')}`);
    }
    return masker('+55 (31) 99090-9090', DEFAULT_PHONE_MASK_WITH_DDI, true);
  }

  // Remove all non-numeric characters
  let cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Handle cases where country code is already included in the input
  const countryCodeDigits = config.countryCode.replace(/\D/g, '');
  if (cleanNumber.startsWith(countryCodeDigits)) {
    cleanNumber = cleanNumber.slice(countryCodeDigits.length);
  }
  
  // Handle multiple formats (like Brazil with both mobile and landline)
  if (Array.isArray(config.digitCount)) {
    const validIndex = config.digitCount.findIndex(count => cleanNumber.length === count);
    
    if (validIndex === -1) {
      if (throwsErrorOnValidation) {
        throw new Error(`Phone number for ${country} should have ${config.digitCount.join(' or ')} digits, but got ${cleanNumber.length}`);
      }
      return masker('+55 (31) 99090-9090', DEFAULT_PHONE_MASK_WITH_DDI, true);
    }
    
    const selectedMask = Array.isArray(config.mask) ? config.mask[validIndex] : config.mask;
    const maskedNumber = masker(cleanNumber, selectedMask, true);
    return `${config.countryCode} ${maskedNumber}`;
  } else {
    // Handle single format countries
    if (cleanNumber.length !== config.digitCount) {
      if (throwsErrorOnValidation) {
        throw new Error(`Phone number for ${country} should have ${config.digitCount} digits, but got ${cleanNumber.length}`);
      }
      return masker('+55 (31) 99090-9090', DEFAULT_PHONE_MASK_WITH_DDI, true);
    }
    
    const selectedMask = Array.isArray(config.mask) ? config.mask[0] : config.mask;
    const maskedNumber = masker(cleanNumber, selectedMask, true);
    return `${config.countryCode} ${maskedNumber}`;
  }
};

/**
 * Gets the country code for a specific country
 * @param country - The country name
 * @returns The country code (e.g., '+55' for Brazil)
 */
export const getCountryCode = (country: string): string => {
  const countryKey = country.toLowerCase();
  const config = PHONE_FORMATS[countryKey];
  
  if (!config) {
    throw new Error(`Country '${country}' is not supported. Supported countries: ${Object.keys(PHONE_FORMATS).join(', ')}`);
  }
  
  return config.countryCode;
};

/**
 * Gets all supported countries for phone formatting
 * @returns Array of supported country names
 */
export const getSupportedCountries = (): string[] => {
  return Object.keys(PHONE_FORMATS);
};

/**
 * Validates if a phone number is valid for a specific country
 * @param phoneNumber - The phone number to validate
 * @param country - The country code
 * @returns True if valid, false otherwise
 */
export const isValidPhoneNumber = (phoneNumber: string, country: string): boolean => {
  try {
    formatPhoneWithCountryCode(phoneNumber, country, true);
    return true;
  } catch {
    return false;
  }
};

/**
 * Gets the valid digit counts for a specific country
 * @param country - The country name
 * @returns Array of valid digit counts
 */
export const getValidDigitCounts = (country: string): number[] => {
  const countryKey = country.toLowerCase();
  const config = PHONE_FORMATS[countryKey];
  
  if (!config) {
    throw new Error(`Country '${country}' is not supported. Supported countries: ${Object.keys(PHONE_FORMATS).join(', ')}`);
  }
  
  return Array.isArray(config.digitCount) ? config.digitCount : [config.digitCount];
};

export const mask = (value: any, mask: any) => {
  return masker(value, mask, true)
}

export const unmask = (value: any, mask: any) => {
  return masker(value, mask, false)
}

export const Masker = {
  mask,
  unmask,
  DEFAULT_PHONE_DDI,
  DEFAULT_PHONE_MASK,
  DEFAULT_PHONE_MASK_WITH_DDI,
  formatPhoneWithCountryCode,
  getCountryCode,
  getSupportedCountries,
  isValidPhoneNumber,
  getValidDigitCounts
}