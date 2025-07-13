import { cn } from '../utils'

describe('cn', () => {
  it('should combine class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('should handle conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
    expect(cn(null, undefined)).toBe('')
  })

  it('should merge conflicting Tailwind classes', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('should handle objects', () => {
    expect(cn({ 'class1': true, 'class2': false })).toBe('class1')
  })

  it('should handle arrays', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2')
  })
})