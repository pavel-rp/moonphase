import { render, screen } from '@testing-library/react'
import { CryptoIcon } from '../crypto-icon'

// Mock the crypto-icons utility
jest.mock('@/lib/utils/crypto-icons', () => ({
  isValidCryptoIcon: jest.fn(),
  getCryptoIconPath: jest.fn(),
}))

import { isValidCryptoIcon, getCryptoIconPath } from '@/lib/utils/crypto-icons'

const mockIsValidCryptoIcon = isValidCryptoIcon as jest.MockedFunction<typeof isValidCryptoIcon>
const mockGetCryptoIconPath = getCryptoIconPath as jest.MockedFunction<typeof getCryptoIconPath>

describe('CryptoIcon', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with valid crypto symbol', () => {
    mockIsValidCryptoIcon.mockReturnValue(true)
    mockGetCryptoIconPath.mockReturnValue('/path/to/btc.svg')

    render(<CryptoIcon symbol="BTC" size={30} />)

    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('alt', 'BTC Logo')
    expect(img).toHaveAttribute('src', '/path/to/btc.svg')
    expect(img).toHaveAttribute('width', '30')
    expect(img).toHaveAttribute('height', '30')
  })

  it('should render with custom name', () => {
    mockIsValidCryptoIcon.mockReturnValue(true)
    mockGetCryptoIconPath.mockReturnValue('/path/to/btc.svg')

    render(<CryptoIcon symbol="BTC" size={30} name="Bitcoin" />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'Bitcoin Logo')
  })

  it('should use generic icon for invalid crypto symbol', () => {
    mockIsValidCryptoIcon.mockReturnValue(false)
    mockGetCryptoIconPath.mockReturnValue('/path/to/generic.svg')

    render(<CryptoIcon symbol="INVALID" size={30} />)

    expect(mockIsValidCryptoIcon).toHaveBeenCalledWith('invalid')
    expect(mockGetCryptoIconPath).toHaveBeenCalledWith('generic', 'icon')
  })

  it('should convert symbol to lowercase', () => {
    mockIsValidCryptoIcon.mockReturnValue(true)
    mockGetCryptoIconPath.mockReturnValue('/path/to/btc.svg')

    render(<CryptoIcon symbol="BTC" size={30} />)

    expect(mockIsValidCryptoIcon).toHaveBeenCalledWith('btc')
    expect(mockGetCryptoIconPath).toHaveBeenCalledWith('btc', 'icon')
  })

  it('should handle different styles', () => {
    mockIsValidCryptoIcon.mockReturnValue(true)
    mockGetCryptoIconPath.mockReturnValue('/path/to/btc-color.svg')

    render(<CryptoIcon symbol="BTC" size={30} style="color" />)

    expect(mockGetCryptoIconPath).toHaveBeenCalledWith('btc', 'color')
  })

  it('should apply custom className', () => {
    mockIsValidCryptoIcon.mockReturnValue(true)
    mockGetCryptoIconPath.mockReturnValue('/path/to/btc.svg')

    render(<CryptoIcon symbol="BTC" size={30} className="custom-class" />)

    const img = screen.getByRole('img')
    expect(img).toHaveClass('custom-class')
  })

  it('should default to icon style when no style provided', () => {
    mockIsValidCryptoIcon.mockReturnValue(true)
    mockGetCryptoIconPath.mockReturnValue('/path/to/btc.svg')

    render(<CryptoIcon symbol="BTC" size={30} />)

    expect(mockGetCryptoIconPath).toHaveBeenCalledWith('btc', 'icon')
  })

  it('should handle different sizes', () => {
    mockIsValidCryptoIcon.mockReturnValue(true)
    mockGetCryptoIconPath.mockReturnValue('/path/to/btc.svg')

    render(<CryptoIcon symbol="BTC" size={50} />)

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('width', '50')
    expect(img).toHaveAttribute('height', '50')
  })
})