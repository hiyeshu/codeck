#!/usr/bin/env python3
"""
[INPUT]: Depends on a local LibreOffice/soffice executable and source document paths.
[OUTPUT]: Converts inputs to the requested office format and prints produced paths.
[POS]: skills/codeck/scripts/office export bridge; keeps PDF/PPTX conversion deterministic.
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path


def find_soffice() -> str:
    candidates = [
        shutil.which("soffice"),
        shutil.which("libreoffice"),
        "/Applications/LibreOffice.app/Contents/MacOS/soffice",
    ]
    errors: list[str] = []
    for candidate in candidates:
        if not candidate or not Path(candidate).exists():
            continue
        probe = subprocess.run(
            [str(candidate), "--version"],
            text=True,
            capture_output=True,
            timeout=15,
        )
        if probe.returncode == 0:
            return str(candidate)
        errors.append(f"{candidate}: {(probe.stderr or probe.stdout).strip()[:300]}")
    detail = "\n".join(errors)
    if detail:
        detail = f"\nChecked candidates:\n{detail}"
    raise SystemExit(
        "ERROR: no working LibreOffice/soffice found. Install LibreOffice or fix soffice on PATH."
        + detail
    )


def expected_output(source: Path, outdir: Path, fmt: str) -> Path:
    ext = fmt.split(":", 1)[0].lower()
    return outdir / f"{source.stem}.{ext}"


def convert(soffice: str, source: Path, outdir: Path, fmt: str, headless: bool) -> Path:
    if not source.exists():
        raise SystemExit(f"ERROR: source not found: {source}")
    outdir.mkdir(parents=True, exist_ok=True)
    before = expected_output(source, outdir, fmt)
    cmd = [soffice]
    if headless:
        cmd.append("--headless")
    cmd += ["--convert-to", fmt, "--outdir", str(outdir), str(source)]
    result = subprocess.run(cmd, text=True, capture_output=True)
    if result.returncode != 0:
        sys.stderr.write(result.stdout)
        sys.stderr.write(result.stderr)
        raise SystemExit(result.returncode)
    if before.exists():
        return before
    matches = sorted(outdir.glob(f"{source.stem}.*"), key=lambda p: p.stat().st_mtime)
    if matches:
        return matches[-1]
    raise SystemExit(f"ERROR: conversion finished but output was not found for {source}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Convert files through LibreOffice.")
    parser.add_argument("--headless", action="store_true", help="Run LibreOffice headlessly.")
    parser.add_argument("--convert-to", required=True, dest="fmt", help="Output format, e.g. pdf or pptx.")
    parser.add_argument("--outdir", default=".", help="Output directory.")
    parser.add_argument("files", nargs="+", help="Files to convert.")
    args = parser.parse_args()

    soffice = find_soffice()
    outdir = Path(args.outdir).resolve()
    for item in args.files:
        produced = convert(soffice, Path(item).resolve(), outdir, args.fmt, args.headless)
        print(produced)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
