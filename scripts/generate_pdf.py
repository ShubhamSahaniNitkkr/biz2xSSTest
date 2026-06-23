"""Generate HOW_TO_RUN_AND_DEMO.pdf from markdown source."""
from __future__ import annotations

import re
import sys
from pathlib import Path

try:
    from fpdf import FPDF
except ImportError:
    import subprocess

    subprocess.check_call([sys.executable, "-m", "pip", "install", "fpdf2", "-q"])
    from fpdf import FPDF

ROOT = Path(__file__).resolve().parents[1]
MD_PATH = ROOT / "docs" / "HOW_TO_RUN_AND_DEMO.md"
PDF_PATH = ROOT / "docs" / "HOW_TO_RUN_AND_DEMO.pdf"


def clean(text: str) -> str:
    text = text.replace("\u2014", "-").replace("\u2013", "-")
    text = text.replace("\u20b9", "Rs.")
    text = text.replace("&", "and")
    text = re.sub(r"```[\s\S]*?```", "[see markdown for code blocks]", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    return text.encode("latin-1", errors="replace").decode("latin-1")


def main() -> None:
    md = clean(MD_PATH.read_text(encoding="utf-8"))
    pdf = FPDF()
    pdf.set_margins(18, 18, 18)
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    pdf.set_font("Helvetica", size=10)

    for raw_line in md.splitlines():
        line = raw_line.rstrip()
        if not line.strip():
            pdf.ln(4)
            continue
        if line.startswith("# "):
            pdf.ln(6)
            pdf.set_font("Helvetica", "B", 16)
            pdf.multi_cell(0, 8, line[2:].strip())
            pdf.set_font("Helvetica", size=10)
            continue
        if line.startswith("## "):
            pdf.ln(4)
            pdf.set_font("Helvetica", "B", 13)
            pdf.multi_cell(0, 7, line[3:].strip())
            pdf.set_font("Helvetica", size=10)
            continue
        if line.startswith("### "):
            pdf.ln(2)
            pdf.set_font("Helvetica", "B", 11)
            pdf.multi_cell(0, 6, line[4:].strip())
            pdf.set_font("Helvetica", size=10)
            continue
        if line.startswith("|"):
            continue
        if re.match(r"^[-=|]+$", line):
            continue
        if any(c in line for c in "┌┐└┘│─┬┴├┤▼▶"):
            continue
        if line.startswith("- "):
            pdf.set_x(pdf.l_margin)
            pdf.multi_cell(0, 5, "  - " + line[2:], new_x="LMARGIN", new_y="NEXT")
            continue
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(0, 5, line, new_x="LMARGIN", new_y="NEXT")

    PDF_PATH.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(PDF_PATH))
    print(f"Created {PDF_PATH}")


if __name__ == "__main__":
    main()
