/**
 * Server-side transcript processing
 * Uses LanguageTool API (free) for grammar checking
 * Natural.js is optional for advanced NLP features
 */

// Natural.js is optional - import will be handled dynamically if needed

// LanguageTool API endpoint (free public API)
const LANGUAGETOOL_API = 'https://api.languagetool.org/v2/check';

/**
 * Check grammar and get suggestions using LanguageTool (free API)
 */
const checkGrammar = async (text) => {
  try {
    const response = await fetch(LANGUAGETOOL_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        language: 'en-US',
        enabledOnly: 'false',
      }),
    });

    if (!response.ok) {
      throw new Error('LanguageTool API error');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('LanguageTool error:', error);
    return null;
  }
};

/**
 * Apply grammar corrections from LanguageTool
 */
const applyGrammarCorrections = (text, matches) => {
  if (!matches || matches.length === 0) return text;

  let corrected = text;
  let offset = 0;

  // Sort matches by offset (descending) to apply from end to start
  const sortedMatches = [...matches].sort((a, b) => b.offset - a.offset);

  for (const match of sortedMatches) {
    if (match.replacements && match.replacements.length > 0) {
      const replacement = match.replacements[0].value;
      const start = match.offset;
      const end = start + match.length;

      corrected = corrected.slice(0, start) + replacement + corrected.slice(end);
    }
  }

  return corrected;
};

/**
 * Lemmatize text using natural.js (optional - currently not used in final output)
 * Kept for potential future use in analysis
 */
const lemmatizeText = async (text) => {
  try {
    const natural = await import('natural');
    if (!natural || !natural.default) return text;
    
    const tokenizer = new natural.default.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());

    if (!tokens) return text;

    // Lemmatization is useful for analysis but we keep original text for readability
    // This function is available if needed for future features
    return text;
  } catch (error) {
    // Natural.js not available - that's okay, we use LanguageTool for processing
    return text;
  }
};

/**
 * Improve sentence flow and clarity
 */
const improveFlow = (text) => {
  let improved = text;

  // Fix common flow issues
  improved = improved
    // Remove filler words at start
    .replace(/^(um|uh|er|ah|like|you know|i mean)\s+/gi, '')
    // Fix run-on sentences (add periods before conjunctions at sentence start)
    .replace(/\.\s+(and|but|or|so|because|since|although)\s+([A-Z])/g, '. $2')
    // Fix double spaces
    .replace(/\s{2,}/g, ' ')
    // Ensure proper spacing after punctuation
    .replace(/([.!?])([A-Za-z])/g, '$1 $2')
    // Fix spacing before punctuation
    .replace(/\s+([,.!?;:])/g, '$1')
    // Capitalize after sentence endings
    .replace(/([.!?])\s+([a-z])/g, (match, p1, p2) => p1 + ' ' + p2.toUpperCase())
    .trim();

  return improved;
};

/**
 * Full transcript processing pipeline
 */
export const processTranscript = async (rawText) => {
  if (!rawText || !rawText.trim()) {
    return {
      original: rawText,
      processed: rawText,
      corrections: [],
      improvements: [],
    };
  }

  let processed = rawText.trim();
  const corrections = [];
  const improvements = [];

  // Step 1: Basic cleanup
  processed = processed
    .replace(/\s+/g, ' ')
    .replace(/([.!?])\s*([A-Za-z])/g, '$1 $2')
    .trim();

  // Step 2: Grammar checking with LanguageTool
  try {
    const grammarCheck = await checkGrammar(processed);
    if (grammarCheck && grammarCheck.matches) {
      const beforeGrammar = processed;
      processed = applyGrammarCorrections(processed, grammarCheck.matches);
      
      if (processed !== beforeGrammar) {
        corrections.push({
          type: 'grammar',
          count: grammarCheck.matches.length,
        });
      }

      // Store individual corrections for preview
      grammarCheck.matches.forEach(match => {
        if (match.replacements && match.replacements.length > 0) {
          corrections.push({
            type: 'grammar',
            original: processed.substring(match.offset, match.offset + match.length),
            suggestion: match.replacements[0].value,
            message: match.message,
            context: processed.substring(Math.max(0, match.offset - 20), Math.min(processed.length, match.offset + match.length + 20)),
          });
        }
      });
    }
  } catch (error) {
    console.error('Grammar check error:', error);
  }

  // Step 3: Improve flow and clarity
  const beforeFlow = processed;
  processed = improveFlow(processed);
  
  if (processed !== beforeFlow) {
    improvements.push({
      type: 'flow',
      description: 'Improved sentence structure and clarity',
    });
  }

  // Step 4: Final polish
  processed = processed
    // Ensure first letter is capitalized
    .replace(/^([a-z])/, (match) => match.toUpperCase())
    // Fix spacing
    .replace(/\s+/g, ' ')
    .trim();

  return {
    original: rawText,
    processed: processed,
    corrections: corrections,
    improvements: improvements,
    changed: processed !== rawText.trim(),
  };
};

