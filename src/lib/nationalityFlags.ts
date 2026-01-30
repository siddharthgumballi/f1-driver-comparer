// Nationality to country code mapping for F1 drivers
// Used to display country flags next to driver names

const nationalityToCode: Record<string, string> = {
  // Current and recent F1 nationalities
  'Dutch': 'NL',
  'British': 'GB',
  'Spanish': 'ES',
  'German': 'DE',
  'Finnish': 'FI',
  'French': 'FR',
  'Mexican': 'MX',
  'Australian': 'AU',
  'Monegasque': 'MC',
  'Canadian': 'CA',
  'Japanese': 'JP',
  'Chinese': 'CN',
  'Thai': 'TH',
  'Danish': 'DK',
  'American': 'US',
  'Italian': 'IT',
  'Brazilian': 'BR',
  'Austrian': 'AT',
  'Belgian': 'BE',
  'Swiss': 'CH',
  'Polish': 'PL',
  'Russian': 'RU',
  'Swedish': 'SE',
  'New Zealander': 'NZ',
  'Argentine': 'AR',
  'South African': 'ZA',
  'Venezuelan': 'VE',
  'Colombian': 'CO',
  'Indian': 'IN',
  'Indonesian': 'ID',
  'Portuguese': 'PT',
  'Irish': 'IE',
  'Hungarian': 'HU',
  'Czech': 'CZ',
  'Malaysian': 'MY',
  // Historic nationalities
  'Rhodesian': 'ZW', // Zimbabwe now
  'East German': 'DE',
  'Uruguayan': 'UY',
  'Chilean': 'CL',
  'Liechtensteiner': 'LI',
}

// Convert country code to flag emoji
export function countryCodeToFlag(code: string): string {
  // Regional indicator symbols start at 0x1F1E6 for 'A'
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65)
  return String.fromCodePoint(...codePoints)
}

// Get flag emoji from nationality string
export function getNationalityFlag(nationality: string | undefined): string {
  if (!nationality) return ''
  const code = nationalityToCode[nationality]
  return code ? countryCodeToFlag(code) : ''
}

// Get country code from nationality
export function getNationalityCode(nationality: string | undefined): string | null {
  if (!nationality) return null
  return nationalityToCode[nationality] || null
}

// Get a flag image URL (for higher quality than emoji)
export function getFlagImageUrl(nationality: string | undefined, size: 'sm' | 'md' | 'lg' = 'md'): string | null {
  const code = getNationalityCode(nationality)
  if (!code) return null

  const sizeMap = {
    sm: '16x12',
    md: '24x18',
    lg: '32x24',
  }

  // Using flagcdn.com for high-quality flags
  return `https://flagcdn.com/${sizeMap[size]}/${code.toLowerCase()}.png`
}
