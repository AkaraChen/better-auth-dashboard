import pinyin from 'pinyin'
import { slug as githubSlug } from 'github-slugger'

/**
 * Convert Chinese characters to pinyin and generate a URL-friendly slug
 * @param text - The text to convert to slug (can contain Chinese characters)
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  if (!text) return ''

  // Convert Chinese to pinyin
  const pinyinResult = pinyin(text, {
    style: pinyin.STYLE_NORMAL,
    heteronym: false, // Don't distinguish heteronyms
    segment: true, // Enable segment to better handle phrases
  })

  // Flatten the pinyin array and join with spaces
  const pinyinText = pinyinResult.flat().join(' ')

  // Use github-slugger to create the final slug
  return githubSlug(pinyinText)
}
