#!/bin/bash
# convert-to-pdf.sh
# Converts all documentation .md files to PDF using pandoc
# Requires: pandoc, weasyprint (for HTML→PDF), or wkhtmltopdf

set -e

DOCS_DIR="docs"
OUTPUT_DIR="docs/pdf"
STYLES_CSS="docs/styles/pdf.css"

DOCS=(
    "QUICKSTART.md"
    "DEVELOPMENT.md"
    "DEPLOYMENT.md"
    "MAINTENANCE.md"
    "SUPPORT.md"
)

mkdir -p "$OUTPUT_DIR"

echo "📄 Converting documentation to PDF..."

# Check for pandoc
if ! command -v pandoc &> /dev/null; then
    echo "❌ pandoc not found. Install with:"
    echo "  macOS: brew install pandoc"
    echo "  Ubuntu: sudo apt install pandoc"
    echo "  Windows: choco install pandoc"
    exit 1
fi

# Check for PDF engine
if command -v weasyprint &> /dev/null; then
    PDF_ENGINE="weasyprint"
elif command -v wkhtmltopdf &> /dev/null; then
    PDF_ENGINE="wkhtmltopdf"
elif command -v prince &> /dev/null; then
    PDF_ENGINE="prince"
else
    echo "⚠️  No PDF engine found. Install one of:"
    echo "  weasyprint: pip install weasyprint"
    echo "  wkhtmltopdf: https://wkhtmltopdf.org/downloads.html"
    echo "  prince: https://www.princexml.com/download/"
    echo ""
    echo "Falling back to pandoc's built-in PDF (requires LaTeX)..."
    PDF_ENGINE="latex"
fi

for doc in "${DOCS[@]}"; do
    input_path="$DOCS_DIR/$doc"
    if [[ -f "$input_path" ]]; then
        output="${doc%.md}.pdf"
        echo "🔄 Converting $input_path → $OUTPUT_DIR/$output"
        
        if [[ "$PDF_ENGINE" == "latex" ]]; then
            pandoc "$input_path" -o "$OUTPUT_DIR/$output" \
                --pdf-engine=xelatex \
                -V geometry:margin=1in \
                -V fontsize=11pt \
                -V documentclass=article \
                --toc \
                --highlight-style=tango
        elif [[ "$PDF_ENGINE" == "weasyprint" ]]; then
            pandoc "$input_path" -o "$OUTPUT_DIR/$output" \
                --pdf-engine=weasyprint \
                --toc \
                --css="$STYLES_CSS"
        elif [[ "$PDF_ENGINE" == "wkhtmltopdf" ]]; then
            pandoc "$input_path" -o "$OUTPUT_DIR/$output" \
                --pdf-engine=wkhtmltopdf \
                --toc
        elif [[ "$PDF_ENGINE" == "prince" ]]; then
            pandoc "$input_path" -o "$OUTPUT_DIR/$output" \
                --pdf-engine=prince \
                --toc
        fi
        
        if [[ $? -eq 0 ]]; then
            echo "✅ Created $OUTPUT_DIR/$output"
        else
            echo "❌ Failed to convert $input_path"
        fi
    else
        echo "⚠️  $input_path not found, skipping"
    fi
done

echo ""
echo "✅ All conversions complete! PDFs in $OUTPUT_DIR/"
ls -la "$OUTPUT_DIR/"