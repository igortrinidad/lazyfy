
export const getWhatsappJidAndNumberValidated = (phone: string ): { jid: string, number: string } => {
  let jid = formatPhoneNumberToWhatsappRemoteJid(phone)


  if(typeof jid === 'string') {
    jid = jid.replace(/:\d+(?=@)/, '')
  }
  validateRemoteJid(jid, phone)
  let number = jid.replace(/\D/g, '')
  
  // Remove character at index 4 for Brazilian numbers with more than 12 digits
  if (number.length > 12 && number.startsWith('55')) {
    number = number.slice(0, 4) + number.slice(5)
  }
  
  return {
    jid,
    number
  }
}

const formatPhoneNumberToWhatsappRemoteJid = (number: string) => {
  number = String(number)
  if (number.includes('@g.us') || number.includes('@s.whatsapp.net') || number.includes('@lid')) {
    return number
  }

  if (number.includes('@broadcast')) {
    return number
  }

  number = number
    ?.replace(/\s/g, '')
    .replace(/\+/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .split(':')[0]
    .split('@')[0]

  if (number.includes('-') && number.length >= 24) {
    number = number.replace(/[^\d-]/g, '')
    return `${number}@g.us`
  }

  number = number.replace(/\D/g, '')

  if (number.length >= 18) {
    number = number.replace(/[^\d-]/g, '')
    return `${number}@g.us`
  }

  number = formatMXOrARNumber(number)

  number = formatBRNumber(number)

  return `${number}@s.whatsapp.net`
}

const formatMXOrARNumber = (jid: string): string => {
  const countryCode = jid.substring(0, 2)

  if (Number(countryCode) === 52 || Number(countryCode) === 54) {
    if (jid.length === 13) {
      const number = countryCode + jid.substring(3)
      return number
    }

    return jid
  }
  return jid
}

// Check if the number is br
const formatBRNumber = (jid: string): string => {
  const regexp = new RegExp(/^(\d{2})(\d{2})\d{1}(\d{8})$/)
  if (regexp.test(jid)) {
    const match = regexp.exec(jid)
    if (match && match[1] === '55') {
      const joker = Number.parseInt(match[3][0])
      const ddd = Number.parseInt(match[2])
      if (joker < 7 || ddd < 31) {
        return match[0]
      }
      return match[1] + match[2] + match[3]
    }
    return jid
  } else {
    return jid
  }
}

const validateRemoteJid = (remote_jid: string, phone?: string | number) => {
  const invalids = [null, '', '@s.whatsapp.net']
  const isInvalidRemoteJid = invalids.some(invalid => remote_jid === invalid)
  if(isInvalidRemoteJid) {
    throw new Error(`Invalid remote_jid ${ remote_jid } | phone: ${ phone ?? '' }`)
  }
}