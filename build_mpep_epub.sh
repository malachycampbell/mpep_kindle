#!/usr/bin/env bash

set -euo pipefail

PDF_DIR="pdfs"
BUILD_DIR="mpep_build"
HTML_DIR="${BUILD_DIR}/chapters"
OUTPUT="MPEP.epub"

echo "========================================"
echo " Building MPEP EPUB"
echo "========================================"

# ------------------------------------------------------------
# 1. Check input
# ------------------------------------------------------------

if [ ! -d "$PDF_DIR" ]; then
    echo "ERROR: Could not find directory: $PDF_DIR"
    exit 1
fi

PDF_COUNT=$(find "$PDF_DIR" -maxdepth 1 -type f -iname '*.pdf' | wc -l)

if [ "$PDF_COUNT" -eq 0 ]; then
    echo "ERROR: No PDFs found in $PDF_DIR"
    exit 1
fi

echo "Found $PDF_COUNT PDF files."

# ------------------------------------------------------------
# 2. Install dependencies
# ------------------------------------------------------------

if command -v pdftotext >/dev/null 2>&1 && command -v pandoc >/dev/null 2>&1 && command -v python3 >/dev/null 2>&1; then
    echo
    echo "Dependencies already available (pdftotext, pandoc, python3) -- skipping install."
else
    echo
    echo "Installing dependencies..."

    sudo apt-get update
    sudo apt-get install -y \
        poppler-utils \
        pandoc \
        python3
fi

# ------------------------------------------------------------
# 3. Create build directories
# ------------------------------------------------------------

rm -rf "$BUILD_DIR"
mkdir -p "$HTML_DIR"

# ------------------------------------------------------------
# 4. Python converter
#
# Takes text extracted from each PDF and converts it into
# reasonably clean, reflowable HTML.
# ------------------------------------------------------------

cat > "${BUILD_DIR}/text_to_html.py" <<'PYTHON'
#!/usr/bin/env python3

import sys
import html
import re
from pathlib import Path


def clean_title(filename):
    """
    Turn a filename into a readable chapter title.

    Examples:
        mpep-0100.pdf -> MPEP 0100
        chapter_2100.pdf -> Chapter 2100
    """
    name = Path(filename).stem

    name = name.replace("_", " ")
    name = name.replace("-", " ")

    name = re.sub(r"\s+", " ", name).strip()

    # Capitalize normal words without mangling numbers.
    words = []
    for word in name.split():
        if word.lower() == "mpep":
            words.append("MPEP")
        else:
            words.append(word)

    return " ".join(words)


def looks_like_heading(text):
    """
    Conservative heading detection.

    We avoid aggressively guessing headings because MPEP text
    contains lots of numbered material that isn't necessarily
    a chapter heading.
    """

    stripped = text.strip()

    if not stripped:
        return False

    # MPEP section-like identifiers:
    # 2100, 2101, 2101.01, 2101.01(a), etc.
    if re.match(r"^\d{3,4}(?:\.\d+)?(?:\([a-zA-Z0-9]+\))?\s+\S+", stripped):
        if len(stripped) < 160:
            return True

    # ALL CAPS short headings
    letters = [c for c in stripped if c.isalpha()]

    if (
        letters
        and len(stripped) < 120
        and sum(c.isupper() for c in letters) / len(letters) > 0.85
    ):
        return True

    return False


def paragraphs_from_text(text):
    """
    Convert pdftotext output into logical paragraphs.
    """

    # Remove form-feed page separators.
    text = text.replace("\f", "\n\n")

    lines = text.splitlines()

    paragraphs = []
    current = []

    for line in lines:

        line = line.strip()

        if not line:
            if current:
                paragraphs.append(" ".join(current))
                current = []
            continue

        # Fix common PDF line-wrap hyphenation:
        # "exam-\nination" -> "examination"
        if current and current[-1].endswith("-") and re.match(r"^[a-z]", line):
            current[-1] = current[-1][:-1] + line
        else:
            current.append(line)

    if current:
        paragraphs.append(" ".join(current))

    return paragraphs


def convert(input_txt, output_html, source_pdf):

    title = clean_title(source_pdf)

    text = Path(input_txt).read_text(
        encoding="utf-8",
        errors="replace"
    )

    paragraphs = paragraphs_from_text(text)

    with open(output_html, "w", encoding="utf-8") as out:

        out.write("""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>

body {
    font-family: serif;
    line-height: 1.45;
}

h1 {
    page-break-before: always;
}

h2 {
    margin-top: 1.5em;
}

p {
    text-align: left;
    margin-top: 0.6em;
    margin-bottom: 0.6em;
}

</style>
</head>
<body>
""")

        # Chapter-level title used by Pandoc for navigation
        out.write(f"<h1>{html.escape(title)}</h1>\n")

        for paragraph in paragraphs:

            paragraph = re.sub(r"\s+", " ", paragraph).strip()

            if not paragraph:
                continue

            escaped = html.escape(paragraph)

            if looks_like_heading(paragraph):
                out.write(f"<h2>{escaped}</h2>\n")
            else:
                out.write(f"<p>{escaped}</p>\n")

        out.write("</body>\n</html>\n")


if __name__ == "__main__":

    if len(sys.argv) != 4:
        print(
            "Usage: text_to_html.py "
            "input.txt output.html source.pdf"
        )
        sys.exit(1)

    convert(
        sys.argv[1],
        sys.argv[2],
        sys.argv[3]
    )
PYTHON

chmod +x "${BUILD_DIR}/text_to_html.py"

# ------------------------------------------------------------
# 5. Get PDFs in natural numeric order
#
# sort -V handles:
#
#   chapter_100.pdf
#   chapter_200.pdf
#   chapter_1000.pdf
#
# correctly.
# ------------------------------------------------------------

mapfile -d '' PDFS < <(
    find "$PDF_DIR" \
        -maxdepth 1 \
        -type f \
        -iname '*.pdf' \
        -print0 |
    sort -zV
)

# ------------------------------------------------------------
# 6. Extract and convert each PDF
# ------------------------------------------------------------

HTML_FILES=()

INDEX=0

for PDF in "${PDFS[@]}"; do

    INDEX=$((INDEX + 1))

    BASENAME=$(basename "$PDF" .pdf)

    printf -v NUM "%03d" "$INDEX"

    TXT="${BUILD_DIR}/${NUM}_${BASENAME}.txt"
    HTML="${HTML_DIR}/${NUM}_${BASENAME}.html"

    echo
    echo "[$INDEX/$PDF_COUNT] Processing:"
    echo "  $PDF"

    # -nopgbrk prevents form-feed characters between every page
    # -enc UTF-8 explicitly requests Unicode output
    pdftotext \
        -enc UTF-8 \
        -nopgbrk \
        "$PDF" \
        "$TXT"

    # Catch scanned/image-only PDFs
    CHAR_COUNT=$(tr -d '[:space:]' < "$TXT" | wc -c)

    if [ "$CHAR_COUNT" -lt 100 ]; then
        echo
        echo "WARNING:"
        echo "Very little text was extracted from:"
        echo "  $PDF"
        echo
        echo "This PDF may be scanned/image-based."
    fi

    python3 "${BUILD_DIR}/text_to_html.py" \
        "$TXT" \
        "$HTML" \
        "$PDF"

    HTML_FILES+=("$HTML")

done

# ------------------------------------------------------------
# 7. Create CSS for Kindle/EPUB
# ------------------------------------------------------------

cat > "${BUILD_DIR}/mpep.css" <<'CSS'

body {
    font-family: serif;
    line-height: 1.4;
}

h1 {
    page-break-before: always;
    margin-top: 1em;
    margin-bottom: 1em;
}

h2 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
}

p {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
}

CSS

# ------------------------------------------------------------
# 8. Build EPUB
# ------------------------------------------------------------

echo
echo "========================================"
echo " Creating EPUB"
echo "========================================"

pandoc \
    "${HTML_FILES[@]}" \
    --from=html \
    --to=epub3 \
    --output="$OUTPUT" \
    --metadata title="Manual of Patent Examining Procedure (MPEP)" \
    --metadata author="United States Patent and Trademark Office" \
    --metadata lang="en-US" \
    --toc \
    --toc-depth=2 \
    --css="${BUILD_DIR}/mpep.css"

# ------------------------------------------------------------
# 9. Report result
# ------------------------------------------------------------

echo
echo "========================================"
echo " DONE"
echo "========================================"
echo
echo "Created:"
echo
ls -lh "$OUTPUT"
echo
echo "EPUB:"
echo "  $OUTPUT"
echo
echo "Intermediate files:"
echo "  $BUILD_DIR/"
echo
echo "You can now download $OUTPUT from the"
echo "Codespaces Explorer and send it to Kindle."
echo