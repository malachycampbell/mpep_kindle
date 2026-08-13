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
