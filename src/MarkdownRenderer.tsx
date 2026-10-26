import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { MermaidChart } from './MermaidChart';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Parse blocks: handle headings, code blocks, tables, lists, text, mermaid
  // We can do a robust block-level split to preserve exact formatting and enable custom features like copy button
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inCode = false;
  let codeLang = '';
  let codeBuffer: string[] = [];
  let currentKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeLang = line.replace('```', '').trim();
        codeBuffer = [];
      } else {
        inCode = false;
        const codeText = codeBuffer.join('\n');
        const lang = codeLang;
        const key = `code-${currentKey++}`;

        if (lang === 'mermaid') {
          elements.push(
            <div key={key} className="my-4">
              <div className="diagram-header">
                <span className="diagram-tag">Architecture Diagram</span>
              </div>
              <MermaidChart chart={codeText} />
            </div>
          );
        } else {
          elements.push(
            <CodeBlock key={key} code={codeText} language={lang} />
          );
        }
        codeBuffer = [];
        codeLang = '';
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    // Normal markdown parsing
    // Headings
    if (line.startsWith('### ')) {
      const headingText = line.substring(4);
      const headingId = makeId(headingText);
      elements.push(
        <h3 key={`h3-${currentKey++}`} id={headingId} className="doc-h3">
          {headingText}
        </h3>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      const headingText = line.substring(3);
      const headingId = makeId(headingText);
      elements.push(
        <h2 key={`h2-${currentKey++}`} id={headingId} className="doc-h2">
          {headingText}
        </h2>
      );
      continue;
    }

    if (line.startsWith('# ')) {
      const headingText = line.substring(2);
      const headingId = makeId(headingText);
      elements.push(
        <h1 key={`h1-${currentKey++}`} id={headingId} className="doc-h1">
          {headingText}
        </h1>
      );
      continue;
    }

    // Dividers
    if (line.trim() === '---') {
      elements.push(<hr key={`hr-${currentKey++}`} className="doc-divider" />);
      continue;
    }

    // Blockquote or notes
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={`bq-${currentKey++}`} className="doc-blockquote">
          {formatInline(line.substring(2))}
        </blockquote>
      );
      continue;
    }

    // Table rows
    if (line.startsWith('|')) {
      // Collect table lines
      const tableLines = [line];
      while (i + 1 < lines.length && lines[i + 1].startsWith('|')) {
        i++;
        tableLines.push(lines[i]);
      }
      elements.push(renderTable(tableLines, `table-${currentKey++}`));
      continue;
    }

    // Lists (unordered / ordered)
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const isOrdered = /^\s*\d+\.\s+/.test(line);
      const listItems: { text: string; indent: number }[] = [];
      
      const getIndent = (str: string) => str.search(/\S/);
      let listIdx = i;

      while (listIdx < lines.length && (/^\s*[-*]\s+/.test(lines[listIdx]) || /^\s*\d+\.\s+/.test(lines[listIdx]))) {
        const itemLine = lines[listIdx];
        const indent = getIndent(itemLine);
        const itemText = itemLine.replace(/^\s*([-*]|\d+\.)\s+/, '');
        listItems.push({ text: itemText, indent });
        listIdx++;
      }
      i = listIdx - 1;

      elements.push(
        <div key={`list-${currentKey++}`} className="doc-list-wrapper">
          {isOrdered ? (
            <ol className="doc-ol">
              {listItems.map((item, idx) => (
                <li key={idx} style={{ marginLeft: `${item.indent * 12}px` }}>
                  {formatInline(item.text)}
                </li>
              ))}
            </ol>
          ) : (
            <ul className="doc-ul">
              {listItems.map((item, idx) => (
                <li key={idx} style={{ marginLeft: `${item.indent * 12}px` }}>
                  {formatInline(item.text)}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
      continue;
    }

    // Plain text / paragraph
    if (line.trim().length > 0) {
      elements.push(
        <p key={`p-${currentKey++}`} className="doc-p">
          {formatInline(line)}
        </p>
      );
    }
  }

  return <div className="doc-content-body">{elements}</div>;
};

// Component for code block with copy button
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let highlighted = code;
  if (language && hljs.getLanguage(language)) {
    try {
      highlighted = hljs.highlight(code, { language }).value;
    } catch {
      highlighted = code;
    }
  } else {
    try {
      highlighted = hljs.highlightAuto(code).value;
    } catch {
      highlighted = code;
    }
  }

  const lineCount = code.split('\n').length;

  return (
    <div className="code-block-card">
      <div className="code-block-header">
        <div className="code-block-info">
          <span className="code-lang-badge">{language || 'text'}</span>
          <span className="code-line-badge">{lineCount} lines</span>
        </div>
        <button
          onClick={handleCopy}
          className={`copy-btn ${copied ? 'copied' : ''}`}
          title="Copy to clipboard"
          type="button"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="code-pre">
        <code
          className={`hljs ${language}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}

// Table renderer
function renderTable(tableLines: string[], key: string) {
  if (tableLines.length < 2) return null;
  const parseRow = (line: string) => {
    return line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
  };

  const headerCells = parseRow(tableLines[0]);
  const bodyRows = tableLines.slice(2).map(parseRow);

  return (
    <div key={key} className="table-responsive-wrapper">
      <table className="doc-table">
        <thead>
          <tr>
            {headerCells.map((cell, idx) => (
              <th key={idx}>{formatInline(cell)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td key={cIdx}>{formatInline(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper to format inline markdown (bold, code, links)
function formatInline(text: string): React.ReactNode {
  // Replace inline bold, code, links
  // Split tokens safely
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let idx = 0;

  // Regex for **bold**, `code`, [link](url)
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b-${idx++}`} className="font-semibold text-slate-900 dark:text-slate-100">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={`c-${idx++}`} className="inline-code">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const linkUrl = linkMatch[2];
        parts.push(
          <a
            key={`a-${idx++}`}
            href={linkUrl}
            className="doc-link"
            target={linkUrl.startsWith('http') ? '_blank' : undefined}
            rel={linkUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {linkText}
          </a>
        );
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : remaining;
}

function makeId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\u0E00-\u0E7Fa-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
