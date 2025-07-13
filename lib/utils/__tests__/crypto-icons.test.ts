import { isValidCryptoIcon, getCryptoIconPath } from '../crypto-icons'

describe('isValidCryptoIcon', () => {
  it('should return true for valid crypto icons', () => {
    expect(isValidCryptoIcon('btc')).toBe(true)
    expect(isValidCryptoIcon('eth')).toBe(true)
    expect(isValidCryptoIcon('ada')).toBe(true)
    expect(isValidCryptoIcon('bnb')).toBe(true)
  })

  it('should return false for invalid crypto icons', () => {
    expect(isValidCryptoIcon('invalid')).toBe(false)
    expect(isValidCryptoIcon('notacrypto')).toBe(false)
    expect(isValidCryptoIcon('')).toBe(false)
  })

  it('should be case sensitive', () => {
    expect(isValidCryptoIcon('BTC')).toBe(false)
    expect(isValidCryptoIcon('Btc')).toBe(false)
    expect(isValidCryptoIcon('btc')).toBe(true)
  })
})

describe('getCryptoIconPath', () => {
  it('should return correct path for icon variant', () => {
    const path = getCryptoIconPath('btc', 'icon')
    expect(path).toBe('/node_modules/cryptocurrency-icons/svg/icon/btc.svg')
  })

  it('should return correct path for color variant', () => {
    const path = getCryptoIconPath('eth', 'color')
    expect(path).toBe('/node_modules/cryptocurrency-icons/svg/color/eth.svg')
  })

  it('should return correct path for white variant', () => {
    const path = getCryptoIconPath('ada', 'white')
    expect(path).toBe('/node_modules/cryptocurrency-icons/svg/white/ada.svg')
  })

  it('should return correct path for black variant', () => {
    const path = getCryptoIconPath('bnb', 'black')
    expect(path).toBe('/node_modules/cryptocurrency-icons/svg/black/bnb.svg')
  })

  it('should default to icon variant when no variant specified', () => {
    const path = getCryptoIconPath('btc')
    expect(path).toBe('/node_modules/cryptocurrency-icons/svg/icon/btc.svg')
  })

  it('should handle generic icon', () => {
    const path = getCryptoIconPath('generic', 'icon')
    expect(path).toBe('/node_modules/cryptocurrency-icons/svg/icon/generic.svg')
  })

  it('should handle different crypto symbols', () => {
    const btcPath = getCryptoIconPath('btc', 'color')
    const ethPath = getCryptoIconPath('eth', 'color')
    
    expect(btcPath).toBe('/node_modules/cryptocurrency-icons/svg/color/btc.svg')
    expect(ethPath).toBe('/node_modules/cryptocurrency-icons/svg/color/eth.svg')
  })
})