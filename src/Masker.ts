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

// Country code to country mapping for prediction
const COUNTRY_CODE_MAP: Record<string, string> = {
  '1': 'us',      // US/Canada (we'll default to US)
  '7': 'russia',  // Russia/Kazakhstan
  '20': 'egypt',
  '27': 'southafrica',
  '31': 'netherlands',
  '32': 'belgium',
  '33': 'france',
  '34': 'spain',
  '39': 'italy',
  '41': 'switzerland',
  '43': 'austria',
  '44': 'uk',
  '45': 'denmark',
  '46': 'sweden',
  '47': 'norway',
  '48': 'poland',
  '49': 'germany',
  '51': 'peru',
  '52': 'mexico',
  '54': 'argentina',
  '55': 'brazil',
  '56': 'chile',
  '57': 'colombia',
  '58': 'venezuela',
  '60': 'malaysia',
  '61': 'australia',
  '62': 'indonesia',
  '63': 'philippines',
  '64': 'newzealand',
  '65': 'singapore',
  '66': 'thailand',
  '81': 'japan',
  '82': 'southkorea',
  '84': 'vietnam',
  '86': 'china',
  '90': 'turkey',
  '91': 'india',
  '212': 'morocco',
  '213': 'algeria',
  '234': 'nigeria',
  '351': 'portugal',
  '358': 'finland',
  '591': 'bolivia',
  '593': 'ecuador',
  '595': 'paraguay',
  '598': 'uruguay',
  '966': 'saudiarabia',
  '971': 'uae',
  '972': 'israel'
};

/**
 * Predicts the country based on the phone number's country code
 * @param phoneNumber - The phone number to analyze
 * @returns The predicted country name or null if not found
 */
const predictCountryFromPhoneNumber = (phoneNumber: string): string | null => {
  if (!phoneNumber) return null;
  
  // Remove all non-numeric characters
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Must have at least 10 digits (minimum international number length with country code)
  if (cleanNumber.length < 10) return null;
  
  // Check for country codes starting from longest to shortest
  const sortedCountryCodes = Object.keys(COUNTRY_CODE_MAP).sort((a, b) => b.length - a.length);
  
  for (const countryCode of sortedCountryCodes) {
    if (cleanNumber.startsWith(countryCode)) {
      // Additional validation: check if the number after removing country code
      // has a reasonable length for that country
      const remainingDigits = cleanNumber.slice(countryCode.length);
      const countryName = COUNTRY_CODE_MAP[countryCode];
      const config = PHONE_FORMATS[countryName];
      
      if (config) {
        const expectedCounts = Array.isArray(config.digitCount) ? config.digitCount : [config.digitCount];
        if (expectedCounts.includes(remainingDigits.length)) {
          // For single-digit country codes like "1" or "7", be more strict
          // Only accept if the total length is reasonable for international format
          if (countryCode.length === 1) {
            // For US/Canada (+1), total should be 11 digits minimum (1 + 10)
            // For Russia (+7), total should be 11 digits minimum (7 + 10)
            const totalLength = cleanNumber.length;
            if (countryCode === '1' && totalLength === 11 && remainingDigits.length === 10) {
              // Additional check for US/Canada: area code shouldn't start with 0 or 1
              const areaCode = remainingDigits.substring(0, 3);
              if (areaCode[0] !== '0' && areaCode[0] !== '1') {
                return countryName;
              }
            } else if (countryCode === '7' && totalLength === 11 && remainingDigits.length === 10) {
              return countryName;
            }
          } else {
            // For multi-digit country codes, use normal validation
            return countryName;
          }
        }
      }
    }
  }
  
  return null;
};

/**
 * Formats a phone number with country code based on the specified country
 * @param phoneNumber - The phone number to format (digits only)
 * @param country - The country code (e.g., 'brazil', 'us', 'spain') - optional, will be predicted if not provided
 * @param throwsErrorOnValidation - Whether to throw errors on validation failures (default: false)
 * @returns Formatted phone number with country code
 */
export const formatPhoneWithCountryCode = (phoneNumber: string, country?: string, throwsErrorOnValidation: boolean = false): string => {
  if (!phoneNumber) {
    if (throwsErrorOnValidation) {
      throw new Error('Phone number is required');
    }
    return masker('+55 (31) 99090-9090', DEFAULT_PHONE_MASK_WITH_DDI, true);
  }

  // If no country is provided, try to predict it from the phone number
  let finalCountry = country;
  if (!finalCountry) {
    const predictedCountry = predictCountryFromPhoneNumber(phoneNumber);
    if (predictedCountry) {
      finalCountry = predictedCountry;
    } else {
      if (throwsErrorOnValidation) {
        throw new Error('Could not predict country from phone number and no country was provided');
      }
      return masker('+55 (31) 99090-9090', DEFAULT_PHONE_MASK_WITH_DDI, true);
    }
  }

  const countryKey = finalCountry.toLowerCase();
  const config = PHONE_FORMATS[countryKey];
  
  if (!config) {
    if (throwsErrorOnValidation) {
      throw new Error(`Country '${finalCountry}' is not supported. Supported countries: ${Object.keys(PHONE_FORMATS).join(', ')}`);
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
    const validIndex = config.digitCount.findIndex((count: number) => cleanNumber.length === count);
    
    if (validIndex === -1) {
      if (throwsErrorOnValidation) {
        throw new Error(`Phone number for ${finalCountry} should have ${config.digitCount.join(' or ')} digits, but got ${cleanNumber.length}`);
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
        throw new Error(`Phone number for ${finalCountry} should have ${config.digitCount} digits, but got ${cleanNumber.length}`);
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
 * @param country - The country code (optional, will be predicted if not provided)
 * @returns True if valid, false otherwise
 */
export const isValidPhoneNumber = (phoneNumber: string, country?: string): boolean => {
  try {
    formatPhoneWithCountryCode(phoneNumber, country, true);
    return true;
  } catch {
    return false;
  }
};

/**
 * Predicts the country based on the phone number's country code
 * @param phoneNumber - The phone number to analyze
 * @returns The predicted country name or null if not found
 */
export const predictCountryFromPhone = (phoneNumber: string): string | null => {
  return predictCountryFromPhoneNumber(phoneNumber);
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
  getValidDigitCounts,
  predictCountryFromPhone
}