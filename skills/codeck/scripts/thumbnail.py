#!/usr/bin/env python3
"""
[INPUT]: Depends on PDF/PPTX/HTML export files plus pdftoppm and, for non-PDF input, LibreOffice.
[OUTPUT]: Writes per-page PNG thumbnails for visual QA and prints their directory.
[POS]: skills/codeck/scripts export QA helper; makes PDF/PPTX review inspectable.
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import tempfile
from pathlib import Path


def require_tool(name: str) -> str:
    tool = shutil.which(name)
    if not tool:
        raise SystemExit(f"ERROR: required tool not found on PATH: {name}")
    return tool


def to_pdf(source: Path, workdir: Path) -> Path:
    if source.suffix.lower() == ".pdf":
        return source
    soffice = Path(__file__).with_name("office") / "soffice.py"
    cmd = [
        "python3",
        str(soffice),
        "--headless",
        "--convert-to",
        "pdf",
        "--outdir",
        str(workdir),
        str(source),
    ]
    subprocess.run(cmd, check=True)
    pdf = workdir / f"{source.stem}.pdf"
    if not pdf.exists():
        raise SystemExit(f"ERROR: PDF conversion did not produce {pdf}")
    return pdf


def render_pdf(pdf: Path, outdir: Path, resolution: int) -> None:
    pdftoppm = require_tool("pdftoppm")
    outdir.mkdir(parents=True, exist_ok=True)
    prefix = outdir / f"{pdf.stem}-page"
    subprocess.run(
        [pdftoppm, "-png", "-r", str(resolution), str(pdf), str(prefix)],
        check=True,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Render export thumbnails for QA.")
    parser.add_argument("--outdir", default=None, help="Thumbnail output directory.")
    parser.add_argument("--resolution", type=int, default=150, help="Render DPI.")
    parser.add_argument("files", nargs="+", help="PDF/PPTX/HTML exports.")
    args = parser.parse_args()

    with tempfile.TemporaryDirectory(prefix="codeck-thumb-") as tmp:
        workdir = Path(tmp)
        for file_name in args.files:
            source = Path(file_name).resolve()
            if not source.exists():
                raise SystemExit(f"ERROR: source not found: {source}")
            outdir = Path(args.outdir).resolve() if args.outdir else source.with_suffix("").with_name(f"{source.stem}-thumbs")
            pdf = to_pdf(source, workdir)
            render_pdf(pdf, outdir, args.resolution)
            print(outdir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
