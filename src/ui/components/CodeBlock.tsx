import type { CodeLanguage } from '@core/domain/schema.ts';

/**
 * Monospace code with light syntax highlighting.
 *
 * Highlighting is a small hand-rolled tokeniser rather than a library: the
 * snippets are short, the bundle stays dependency-free, and the token colours
 * come from the design tokens so they work in both themes. Formatting is
 * preserved exactly and long lines scroll horizontally instead of wrapping,
 * which matters for code questions where indentation is the answer.
 */
export function CodeBlock({
  code,
  language = 'text',
  framed = false,
}: {
  code: string;
  language?: CodeLanguage;
  framed?: boolean;
}) {
  const content = (
    <pre className={framed ? undefined : 'code-block'} tabIndex={0}>
      <code>{tokenize(code, language).map((token, i) => renderToken(token, i))}</code>
    </pre>
  );

  if (!framed) return content;
  return (
    <div className="blueprint code-frame">
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
      <div className="code-frame-bar text-muted">{language}</div>
      {content}
    </div>
  );
}

type TokenKind = 'keyword' | 'string' | 'comment' | 'number' | 'plain';
interface Token {
  text: string;
  kind: TokenKind;
}

const KEYWORDS: Record<string, string[]> = {
  python: [
    'def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 'import', 'from',
    'class', 'try', 'except', 'finally', 'with', 'as', 'lambda', 'global', 'nonlocal', 'pass', 'break',
    'continue', 'yield', 'None', 'True', 'False', 'print', 'del', 'is',
  ],
  typescript: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'interface', 'type',
    'extends', 'implements', 'class', 'new', 'import', 'export', 'from', 'as', 'async', 'await',
    'switch', 'case', 'default', 'break', 'continue', 'typeof', 'keyof', 'in', 'of', 'null',
    'undefined', 'true', 'false', 'readonly', 'never', 'unknown', 'any', 'string', 'number', 'boolean',
  ],
};
KEYWORDS.javascript = KEYWORDS.typescript ?? [];

/**
 * One pass, longest-match-first. Comments and strings win over everything so a
 * keyword inside a string is not coloured as code.
 */
function tokenize(code: string, language: CodeLanguage): Token[] {
  const keywords = new Set(KEYWORDS[language] ?? []);
  if (keywords.size === 0) return [{ text: code, kind: 'plain' }];

  const commentStart = language === 'python' ? '#' : '//';
  const tokens: Token[] = [];
  let buffer = '';

  const flush = () => {
    if (buffer) tokens.push({ text: buffer, kind: 'plain' });
    buffer = '';
  };

  let i = 0;
  while (i < code.length) {
    const rest = code.slice(i);

    if (rest.startsWith(commentStart)) {
      flush();
      const end = code.indexOf('\n', i);
      const stop = end === -1 ? code.length : end;
      tokens.push({ text: code.slice(i, stop), kind: 'comment' });
      i = stop;
      continue;
    }

    const quote = rest[0];
    if (quote === '"' || quote === "'" || quote === '`') {
      const closing = findClosingQuote(code, i, quote);
      flush();
      tokens.push({ text: code.slice(i, closing + 1), kind: 'string' });
      i = closing + 1;
      continue;
    }

    const word = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest)?.[0];
    if (word) {
      flush();
      tokens.push({ text: word, kind: keywords.has(word) ? 'keyword' : 'plain' });
      i += word.length;
      continue;
    }

    const number = /^\d+(?:\.\d+)?/.exec(rest)?.[0];
    if (number) {
      flush();
      tokens.push({ text: number, kind: 'number' });
      i += number.length;
      continue;
    }

    buffer += code[i];
    i += 1;
  }
  flush();
  return tokens;
}

function findClosingQuote(code: string, start: number, quote: string): number {
  for (let i = start + 1; i < code.length; i += 1) {
    if (code[i] === '\\') {
      i += 1;
      continue;
    }
    if (code[i] === quote) return i;
    if (code[i] === '\n') return i - 1;
  }
  return code.length - 1;
}

function renderToken(token: Token, key: number) {
  if (token.kind === 'plain') return <span key={key}>{token.text}</span>;
  return (
    <span key={key} className={`code-token-${token.kind}`}>
      {token.text}
    </span>
  );
}
