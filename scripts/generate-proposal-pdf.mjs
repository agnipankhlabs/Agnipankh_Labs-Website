import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const mdPath = path.resolve('docs/project/startup-proposal.md');
const htmlPath = path.resolve('docs/pdf/startup-proposal.html');
const pdfPath = path.resolve('docs/pdf/startup-proposal.pdf');

if (!fs.existsSync(mdPath)) {
  console.error("startup-proposal.md not found!");
  process.exit(1);
}

const mdContent = fs.readFileSync(mdPath, 'utf8');

// Basic Markdown to HTML conversion
function markdownToHtml(md) {
  let html = md;

  // Code blocks ``` ... ```
  const codeBlocks = [];
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    const id = `___CODEBLOCK_${codeBlocks.length}___`;
    codeBlocks.push(code.trim());
    return id;
  });

  // Inline code `...`
  const inlineCodes = [];
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const id = `___INLINECODE_${inlineCodes.length}___`;
    inlineCodes.push(code);
    return id;
  });

  // Headers
  html = html.replace(/^# (.*$)/gim, '<h1 class="doc-title">$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="section-title">$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="subsection-title">$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Horizontal Rules
  html = html.replace(/^---$/gim, '<hr />');

  // Bold & Italic
  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Checkboxes
  html = html.replace(/- \[ \] (.*$)/gim, '<li class="task-item"><span class="checkbox">☐</span> $1</li>');
  html = html.replace(/- \[x\] (.*$)/gim, '<li class="task-item task-done"><span class="checkbox">☑</span> $1</li>');

  // Tables
  html = html.replace(/^\|(.+)\|$/gim, (match) => {
    return `TR_LINE:${match}`;
  });

  const lines = html.split('\n');
  const processedLines = [];
  let inTable = false;
  let tableRows = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (line.startsWith('TR_LINE:')) {
      const rawRow = line.replace('TR_LINE:', '').trim();
      if (rawRow.includes('---')) {
        // Skip delimiter line
        continue;
      }
      const cells = rawRow.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      tableRows.push(cells);
      inTable = true;
      continue;
    } else if (inTable) {
      // End of table
      let tableHtml = '<div class="table-container"><table>';
      if (tableRows.length > 0) {
        tableHtml += '<thead><tr>';
        tableRows[0].forEach(cell => {
          tableHtml += `<th>${cell}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';

        for (let r = 1; r < tableRows.length; r++) {
          tableHtml += '<tr>';
          tableRows[r].forEach(cell => {
            tableHtml += `<td>${cell}</td>`;
          });
          tableHtml += '</tr>';
        }
        tableHtml += '</tbody>';
      }
      tableHtml += '</table></div>';
      processedLines.push(tableHtml);
      inTable = false;
      tableRows = [];
    }

    // Unordered lists
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      const itemContent = line.trim().substring(2);
      processedLines.push(`<li>${itemContent}</li>`);
      continue;
    } else if (inList && !line.trim().startsWith('- ') && !line.trim().startsWith('* ') && !line.startsWith('<li')) {
      processedLines.push('</ul>');
      inList = false;
    }

    // Paragraphs
    if (line.trim() !== '' && !line.startsWith('<h') && !line.startsWith('<blockquote') && !line.startsWith('<hr') && !line.startsWith('<ul') && !line.startsWith('<li')) {
      processedLines.push(`<p>${line}</p>`);
    } else {
      processedLines.push(line);
    }
  }

  if (inTable) {
    let tableHtml = '<div class="table-container"><table>';
    if (tableRows.length > 0) {
      tableHtml += '<thead><tr>';
      tableRows[0].forEach(cell => {
        tableHtml += `<th>${cell}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';
      for (let r = 1; r < tableRows.length; r++) {
        tableHtml += '<tr>';
        tableRows[r].forEach(cell => {
          tableHtml += `<td>${cell}</td>`;
        });
        tableHtml += '</tr>';
      }
      tableHtml += '</tbody>';
    }
    tableHtml += '</table></div>';
    processedLines.push(tableHtml);
  }

  if (inList) {
    processedLines.push('</ul>');
  }

  let resultHtml = processedLines.join('\n');

  // Restore Code blocks
  resultHtml = resultHtml.replace(/___CODEBLOCK_(\d+)___/g, (match, idx) => {
    const code = codeBlocks[parseInt(idx, 10)];
    return `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  });

  // Restore Inline code
  resultHtml = resultHtml.replace(/___INLINECODE_(\d+)___/g, (match, idx) => {
    const code = inlineCodes[parseInt(idx, 10)];
    return `<code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`;
  });

  return resultHtml;
}

const bodyHtml = markdownToHtml(mdContent);

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Agnipankh Labs — Startup Proposal</title>
<style>
  @page {
    size: A4;
    margin: 20mm 15mm 20mm 15mm;
  }

  body {
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
    color: #0F172A;
    background: #FFFFFF;
    line-height: 1.6;
    font-size: 10.5pt;
    margin: 0;
    padding: 0;
  }

  /* Typography */
  h1.doc-title {
    color: #B35100;
    font-size: 24pt;
    font-weight: 800;
    margin-top: 0;
    margin-bottom: 12px;
    border-bottom: 3px solid #B35100;
    padding-bottom: 8px;
    letter-spacing: -0.5px;
  }

  h2.section-title {
    color: #0F172A;
    font-size: 15pt;
    font-weight: 700;
    margin-top: 24px;
    margin-bottom: 10px;
    border-bottom: 1.5px solid #E2E8F0;
    padding-bottom: 4px;
    page-break-after: avoid;
    break-after: avoid;
  }

  h3.subsection-title {
    color: #B35100;
    font-size: 12pt;
    font-weight: 600;
    margin-top: 16px;
    margin-bottom: 6px;
    page-break-after: avoid;
    break-after: avoid;
  }

  p {
    margin-top: 0;
    margin-bottom: 10px;
    text-align: justify;
  }

  strong {
    color: #0F172A;
  }

  /* Blockquotes */
  blockquote {
    background: #FFF7ED;
    border-left: 4px solid #B35100;
    margin: 12px 0;
    padding: 10px 16px;
    font-style: italic;
    color: #475569;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  blockquote p {
    margin: 4px 0;
  }

  /* Lists */
  ul, ol {
    margin-top: 4px;
    margin-bottom: 12px;
    padding-left: 20px;
  }

  li {
    margin-bottom: 4px;
  }

  li.task-item {
    list-style-type: none;
    margin-left: -15px;
  }

  .checkbox {
    font-weight: bold;
    color: #B35100;
    margin-right: 6px;
  }

  /* Tables */
  .table-container {
    width: 100%;
    margin: 14px 0;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9.5pt;
  }

  th {
    background-color: #0F172A;
    color: #FFFFFF;
    font-weight: 600;
    text-align: left;
    padding: 8px 10px;
    border: 1px solid #0F172A;
  }

  td {
    padding: 7px 10px;
    border: 1px solid #CBD5E1;
    vertical-align: top;
  }

  tr:nth-child(even) {
    background-color: #F8FAFC;
  }

  /* Code & Pre */
  code {
    font-family: 'Consolas', 'Courier New', monospace;
    background: #F1F5F9;
    color: #B35100;
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 9pt;
  }

  pre {
    background: #0F172A;
    color: #F8FAFC;
    padding: 12px 16px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 9pt;
    font-family: 'Consolas', 'Courier New', monospace;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  pre code {
    background: transparent;
    color: inherit;
    padding: 0;
  }

  hr {
    border: none;
    border-top: 1px solid #E2E8F0;
    margin: 20px 0;
  }

  /* Print specific */
  @media print {
    body {
      padding: 0;
    }
    .section-title {
      page-break-after: avoid;
    }
    table {
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
  }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

fs.writeFileSync(htmlPath, fullHtml, 'utf8');
console.log(`Generated HTML: ${htmlPath}`);

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const edgeCmd = `"${edgePath}" --headless --disable-gpu --print-to-pdf="${pdfPath}" "${htmlPath}"`;

console.log("Converting HTML to PDF via MS Edge...");
try {
  execSync(edgeCmd, { stdio: 'inherit' });
  if (fs.existsSync(pdfPath)) {
    const stats = fs.statSync(pdfPath);
    console.log(`Successfully created PDF: ${pdfPath} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.error("PDF file was not generated.");
  }
} catch (err) {
  console.error("Failed to run MS Edge headless print:", err);
}
