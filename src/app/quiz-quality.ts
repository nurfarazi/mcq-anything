import type { MCQ, MCQGenerationResponse } from '../llm';

export type QuizQualityIssueCode =
  | 'DUPLICATE_OR_NEAR_DUPLICATE_QUESTION'
  | 'OFF_TOPIC_QUESTION'
  | 'WEAK_EXPLANATION'
  | 'INCONSISTENT_ANSWER_OPTION_RELATIONSHIP';

export interface QuizQualityIssue {
  code: QuizQualityIssueCode;
  message: string;
  questionIndex: number;
}

interface TopicKeywordGroup {
  matchers: readonly string[];
  keywords: readonly string[];
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'because',
  'but',
  'by',
  'correct',
  'for',
  'from',
  'has',
  'have',
  'how',
  'if',
  'in',
  'is',
  'it',
  'its',
  'of',
  'on',
  'or',
  'question',
  'right',
  'so',
  'that',
  'the',
  'their',
  'there',
  'this',
  'to',
  'was',
  'were',
  'what',
  'when',
  'where',
  'which',
  'why',
  'with',
  'yes',
]);

const TOPIC_KEYWORD_GROUPS: readonly TopicKeywordGroup[] = [
  {
    matchers: ['science', 'sciences', 'scientific'],
    keywords: [
      'science',
      'scientific',
      'biology',
      'chemistry',
      'physics',
      'astronomy',
      'geology',
      'earth',
      'chemical',
      'chemicals',
      'formula',
      'formulas',
      'water',
      'h2o',
      'planet',
      'planets',
      'organism',
      'organisms',
      'cell',
      'cells',
      'molecule',
      'molecules',
      'atom',
      'atoms',
      'force',
      'energy',
      'matter',
      'space',
      'solar',
      'system',
    ],
  },
  {
    matchers: ['astronomy', 'space', 'planet', 'planets', 'solar system'],
    keywords: ['astronomy', 'space', 'planet', 'planets', 'sun', 'moon', 'star', 'stars', 'orbit', 'galaxy', 'galaxies', 'universe', 'solar', 'system', 'comet', 'asteroid', 'telescope', 'celestial'],
  },
  {
    matchers: ['biology', 'life science', 'life sciences', 'science of life'],
    keywords: ['biology', 'cell', 'cells', 'organism', 'organisms', 'dna', 'gene', 'genes', 'plant', 'plants', 'animal', 'animals', 'ecosystem', 'ecosystems', 'photosynthesis', 'evolution', 'species'],
  },
  {
    matchers: ['chemistry'],
    keywords: ['chemistry', 'atom', 'atoms', 'molecule', 'molecules', 'element', 'elements', 'compound', 'compounds', 'reaction', 'reactions', 'bond', 'bonds', 'mixture', 'solution', 'acid', 'base'],
  },
  {
    matchers: ['physics'],
    keywords: ['physics', 'force', 'forces', 'energy', 'motion', 'velocity', 'speed', 'acceleration', 'gravity', 'mass', 'work', 'power', 'wave', 'waves', 'light', 'electricity'],
  },
  {
    matchers: ['math', 'algebra', 'geometry', 'calculus', 'arithmetic'],
    keywords: ['math', 'mathematics', 'number', 'numbers', 'equation', 'equations', 'formula', 'formulas', 'fraction', 'fractions', 'angle', 'angles', 'shape', 'shapes', 'slope', 'derivative', 'integral', 'proof'],
  },
  {
    matchers: ['geography', 'earth science', 'earth sciences', 'world geography'],
    keywords: ['geography', 'country', 'countries', 'continent', 'continents', 'capital', 'city', 'cities', 'river', 'rivers', 'mountain', 'mountains', 'climate', 'map', 'maps', 'ocean', 'oceans', 'desert', 'deserts'],
  },
  {
    matchers: ['history'],
    keywords: ['history', 'war', 'wars', 'empire', 'empires', 'kingdom', 'kingdoms', 'revolution', 'revolutions', 'century', 'centuries', 'civilization', 'civilizations', 'era', 'events'],
  },
  {
    matchers: ['literature', 'english', 'reading', 'writing'],
    keywords: ['literature', 'novel', 'novels', 'poem', 'poems', 'author', 'authors', 'character', 'characters', 'theme', 'themes', 'metaphor', 'metaphors', 'plot', 'narrative'],
  },
  {
    matchers: ['government', 'civics', 'politics'],
    keywords: ['government', 'civic', 'civics', 'election', 'elections', 'law', 'laws', 'constitution', 'rights', 'citizen', 'citizens', 'parliament', 'congress', 'democracy'],
  },
  {
    matchers: ['computer science', 'programming', 'coding', 'software', 'technology'],
    keywords: ['computer', 'computing', 'program', 'programming', 'code', 'coding', 'algorithm', 'algorithms', 'data', 'software', 'hardware', 'network', 'networks', 'database', 'databases'],
  },
];

function stripDiacritics(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeQuizText(value: string): string {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function tokenize(value: string): string[] {
  return normalizeQuizText(value)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length > 0 && !STOP_WORDS.has(token));
}

function uniqueTokens(tokens: readonly string[]): string[] {
  return [...new Set(tokens)];
}

function buildTopicKeywords(topic: string): string[] {
  const normalizedTopic = normalizeQuizText(topic);
  const keywords = new Set<string>(tokenize(topic));

  for (const group of TOPIC_KEYWORD_GROUPS) {
    if (group.matchers.some((matcher) => normalizedTopic.includes(normalizeQuizText(matcher)))) {
      for (const keyword of group.keywords) {
        keywords.add(keyword);
      }
    }
  }

  return uniqueTokens([...keywords]);
}

function questionSimilarityScore(left: string, right: string): number {
  const normalizedLeft = normalizeQuizText(left);
  const normalizedRight = normalizeQuizText(right);

  if (!normalizedLeft || !normalizedRight) {
    return 0;
  }

  if (normalizedLeft === normalizedRight) {
    return 1;
  }

  if (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft)) {
    return 0.95;
  }

  const leftCharacters = normalizedLeft.replace(/\s+/g, '');
  const rightCharacters = normalizedRight.replace(/\s+/g, '');

  if (leftCharacters === rightCharacters) {
    return 1;
  }

  const rows = leftCharacters.length + 1;
  const cols = rightCharacters.length + 1;
  const distances: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let row = 0; row < rows; row += 1) {
    distances[row]![0] = row;
  }

  for (let col = 0; col < cols; col += 1) {
    distances[0]![col] = col;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const substitutionCost = leftCharacters[row - 1] === rightCharacters[col - 1] ? 0 : 1;
      distances[row]![col] = Math.min(
        distances[row - 1]![col] + 1,
        distances[row]![col - 1] + 1,
        distances[row - 1]![col - 1] + substitutionCost,
      );
    }
  }

  const editDistance = distances[rows - 1]![cols - 1]!;
  const maxLength = Math.max(leftCharacters.length, rightCharacters.length);

  if (maxLength === 0) {
    return 0;
  }

  const editSimilarity = 1 - editDistance / maxLength;

  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));
  const union = new Set<string>([...leftTokens, ...rightTokens]);

  if (union.size === 0) {
    return editSimilarity;
  }

  let intersectionSize = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      intersectionSize += 1;
    }
  }

  const tokenSimilarity = intersectionSize / union.size;

  return Math.max(editSimilarity, tokenSimilarity);
}

export function areQuestionsNearDuplicate(left: string, right: string): boolean {
  return questionSimilarityScore(left, right) >= 0.72;
}

export function isExplanationWeak(explanation: string): boolean {
  const trimmed = explanation.trim();
  const tokens = tokenize(trimmed);

  if (trimmed.length < 18) {
    return true;
  }

  if (tokens.length < 4) {
    return true;
  }

  const meaningfulTokens = tokens.filter((token) => !['answer', 'because', 'correct', 'right', 'true', 'simple', 'obvious'].includes(token));

  return meaningfulTokens.length < 3;
}

export function hasConsistentAnswerOptionRelationship(question: MCQ): boolean {
  const normalizedOptions = question.options.map((option) => normalizeQuizText(option));
  const uniqueOptionCount = new Set(normalizedOptions).size;

  if (uniqueOptionCount !== normalizedOptions.length) {
    return false;
  }

  const correctOption = question.options[question.correctAnswer];

  return normalizeQuizText(correctOption).length > 0;
}

function questionText(question: MCQ): string {
  return [question.question, question.explanation, ...question.options].join(' ');
}

export function isQuestionSufficientlyOnTopic(question: MCQ, topic: string): boolean {
  const normalizedHaystack = normalizeQuizText(questionText(question));
  const keywords = buildTopicKeywords(topic);

  if (keywords.length === 0) {
    return true;
  }

  if (keywords.some((keyword) => normalizedHaystack.includes(keyword))) {
    return true;
  }

  if (tokenize(topic).includes('science')) {
    return [
      'biology',
      'chemistry',
      'physics',
      'astronomy',
      'geology',
      'earth',
      'chemical',
      'chemicals',
      'formula',
      'formulas',
      'water',
      'h2o',
      'planet',
      'organism',
      'cell',
      'atom',
      'molecule',
      'energy',
      'force',
      'solar',
      'system',
      'scientific',
    ].some((keyword) => normalizedHaystack.includes(keyword));
  }

  return false;
}

export function findQuizQualityIssue(
  response: MCQGenerationResponse,
  topic: string,
): QuizQualityIssue | null {
  const seenQuestions: Array<{ question: string; index: number }> = [];

  for (let index = 0; index < response.questions.length; index += 1) {
    const question = response.questions[index];

    if (!hasConsistentAnswerOptionRelationship(question)) {
      return {
        code: 'INCONSISTENT_ANSWER_OPTION_RELATIONSHIP',
        message: 'Returned questions contain inconsistent answer or option relationships.',
        questionIndex: index,
      };
    }

    if (isExplanationWeak(question.explanation)) {
      return {
        code: 'WEAK_EXPLANATION',
        message: 'Returned questions contain weak or non-informative explanations.',
        questionIndex: index,
      };
    }

    if (!isQuestionSufficientlyOnTopic(question, topic)) {
      return {
        code: 'OFF_TOPIC_QUESTION',
        message: 'Returned questions are not sufficiently related to the requested topic.',
        questionIndex: index,
      };
    }

    for (const previous of seenQuestions) {
      if (areQuestionsNearDuplicate(previous.question, question.question)) {
        return {
          code: 'DUPLICATE_OR_NEAR_DUPLICATE_QUESTION',
          message: 'Returned questions contain duplicate or near-duplicate wording.',
          questionIndex: index,
        };
      }
    }

    seenQuestions.push({ question: question.question, index });
  }

  return null;
}
