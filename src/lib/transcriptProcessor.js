/**
 * Browser-side quick transcript processing
 * Provides instant fixes: capitalization, contractions, punctuation
 * Deep processing happens server-side with LanguageTool API
 */

// Quick fixes that can be done in the browser
export const quickFixTranscript = (text) => {
  if (!text || !text.trim()) return text;

  let processed = text;

  // Basic capitalization fixes
  processed = processed
    // Capitalize first letter of sentences
    .replace(/(^|\.\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
    // Fix "i" to "I"
    .replace(/\bi\b/g, 'I')
    // Fix common contractions
    .replace(/\bim\b/gi, "I'm")
    .replace(/\bive\b/gi, "I've")
    .replace(/\bid\b/gi, "I'd")
    .replace(/\bwont\b/gi, "won't")
    .replace(/\bcant\b/gi, "can't")
    .replace(/\bdont\b/gi, "don't")
    .replace(/\bdidnt\b/gi, "didn't")
    .replace(/\bisnt\b/gi, "isn't")
    .replace(/\barent\b/gi, "aren't")
    .replace(/\bwasnt\b/gi, "wasn't")
    .replace(/\bwerent\b/gi, "weren't")
    .replace(/\bhavent\b/gi, "haven't")
    .replace(/\bhasnt\b/gi, "hasn't")
    .replace(/\bhadnt\b/gi, "hadn't")
    .replace(/\bwouldnt\b/gi, "wouldn't")
    .replace(/\bcouldnt\b/gi, "couldn't")
    .replace(/\bshouldnt\b/gi, "shouldn't")
    .replace(/\bmightnt\b/gi, "mightn't")
    .replace(/\bmustnt\b/gi, "mustn't")
    // Fix "its" vs "it's"
    .replace(/\bits\s+(?:a|an|the|is|was|will|would|can|could|should|might|must)\b/gi, "it's $1")
    // Fix "there" vs "their" vs "they're"
    .replace(/\bthere\s+(?:worried|happy|sad|angry|excited|tired|busy|here|going|coming)\b/gi, "they're $1")
    .replace(/\bthere\s+(?:house|car|home|family|friends|team)\b/gi, "their $1")
    // Fix "your" vs "you're"
    .replace(/\byour\s+(?:welcome|right|wrong|sure|kidding|joking)\b/gi, "you're $1")
    // Add periods at end of sentences
    .replace(/([^.!?])\s*$/g, '$1.')
    // Fix multiple spaces
    .replace(/\s+/g, ' ')
    .trim();

  return processed;
};

// Note: Compromise.js is optional and not installed
// Using basic fixes which work well for most cases
// Server-side processing with LanguageTool provides deeper improvements

