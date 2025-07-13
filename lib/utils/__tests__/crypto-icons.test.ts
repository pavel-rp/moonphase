import { isValidCryptoIcon, getCryptoIconPath } from '../crypto-icons'

describe('isValidCryptoIcon', () => {
  it('should return true for valid crypto icons', () => {
    expect(isValidCryptoIcon('btc')).toBe(true)
    expect(isValidCryptoIcon('eth')).toBe(true)
    expect(isValidCryptoIcon('ada')).toBe(true)
  })

  it('should return false for invalid crypto icons', () => {
    expect(isValidCryptoIcon('invalid')).toBe(false)
    expect(isValidCryptoIcon('xyz')).toBe(false)
    expect(isValidCryptoIcon('')).toBe(false)
  })

  it('should be case sensitive', () => {
    expect(isValidCryptoIcon('BTC')).toBe(false)
    expect(isValidCryptoIcon('ETH')).toBe(false)
  })
})

describe('getCryptoIconPath', () => {
  it('should return correct path for icon variant', () => {
    const path = getCryptoIconPath('btc', 'icon')
    expect(path).toBe('/crypto-icons/icon/btc.svg')
  })

  it('should return correct path for color variant', () => {
    const path = getCryptoIconPath('eth', 'color')
    expect(path).toBe('/crypto-icons/color/eth.svg')
  })

  it('should return correct path for white variant', () => {
    const path = getCryptoIconPath('ada', 'white')
    expect(path).toBe('/crypto-icons/white/ada.svg')
  })

  it('should return correct path for black variant', () => {
    const path = getCryptoIconPath('bnb', 'black')
    expect(path).toBe('/crypto-icons/black/bnb.svg')
  })

  it('should default to icon variant when no variant specified', () => {
    const path = getCryptoIconPath('btc')
    expect(path).toBe('/crypto-icons/icon/btc.svg')
  })

  it('should throw error for invalid crypto icon', () => {
    expect(() => getCryptoIconPath('invalid', 'icon')).toThrow('Invalid crypto icon name: invalid')
  })

  it('should handle different crypto symbols', () => {
    const btcPath = getCryptoIconPath('btc', 'color')
    const ethPath = getCryptoIconPath('eth', 'color')
    
    expect(btcPath).toBe('/crypto-icons/color/btc.svg')
    expect(ethPath).toBe('/crypto-icons/color/eth.svg')
  })
})