/**
 * Formats a phone number with country code based on the specified country
 * @param phoneNumber - The phone number to format (digits only)
 * @param country - The country code (e.g., 'brazil', 'us', 'spain') - optional, will be predicted if not provided
 * @param throwsErrorOnValidation - Whether to throw errors on validation failures (default: false)
 * @returns Formatted phone number with country code
 */
export declare const formatPhoneWithCountryCode: (phoneNumber: string, country?: string, throwsErrorOnValidation?: boolean) => string;
/**
 * Gets the country code for a specific country
 * @param country - The country name
 * @returns The country code (e.g., '+55' for Brazil)
 */
export declare const getCountryCode: (country: string) => string;
/**
 * Gets all supported countries for phone formatting
 * @returns Array of supported country names
 */
export declare const getSupportedCountries: () => string[];
/**
 * Validates if a phone number is valid for a specific country
 * @param phoneNumber - The phone number to validate
 * @param country - The country code (optional, will be predicted if not provided)
 * @returns True if valid, false otherwise
 */
export declare const isValidPhoneNumber: (phoneNumber: string, country?: string) => boolean;
/**
 * Predicts the country based on the phone number's country code
 * @param phoneNumber - The phone number to analyze
 * @returns The predicted country name or null if not found
 */
export declare const predictCountryFromPhone: (phoneNumber: string) => string | null;
/**
 * Gets the valid digit counts for a specific country
 * @param country - The country name
 * @returns Array of valid digit counts
 */
export declare const getValidDigitCounts: (country: string) => number[];
/**
 * Extracts the country code and phone number from a formatted phone number
 * @param phoneNumber - The phone number to extract from (can be formatted or unformatted)
 * @returns Object containing countryCode, phoneNumber (if complete), country, and mask, or only countryCode and country (if incomplete), or null if extraction fails
 */
export declare const extractCountryCodeAndPhone: (phoneNumber: string) => {
    countryCode: string;
    phoneNumber?: string;
    country?: string;
    mask?: string | string[];
};
export declare const mask: (value: any, mask: any) => any;
export declare const unmask: (value: any, mask: any) => any;
export declare const Masker: {
    mask: (value: any, mask: any) => any;
    unmask: (value: any, mask: any) => any;
    DEFAULT_PHONE_DDI: string[];
    DEFAULT_PHONE_MASK: string[];
    DEFAULT_PHONE_MASK_WITH_DDI: string[];
    formatPhoneWithCountryCode: (phoneNumber: string, country?: string, throwsErrorOnValidation?: boolean) => string;
    getCountryCode: (country: string) => string;
    getSupportedCountries: () => string[];
    isValidPhoneNumber: (phoneNumber: string, country?: string) => boolean;
    getValidDigitCounts: (country: string) => number[];
    predictCountryFromPhone: (phoneNumber: string) => string | null;
    extractCountryCodeAndPhone: (phoneNumber: string) => {
        countryCode: string;
        phoneNumber?: string;
        country?: string;
        mask?: string | string[];
    };
};
