"""Extrae texto plano de .docx y .xlsx usando solo la biblioteca estándar.

Uso: python -I extraer_office.py <archivo> [<archivo> ...]
Imprime el texto en stdout; para .xlsx imprime una fila por línea con celdas separadas por " | ".
"""
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
S = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"


def docx(path):
    with zipfile.ZipFile(path) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    for p in root.iter(W + "p"):
        txt = "".join(t.text or "" for t in p.iter(W + "t")).strip()
        if txt:
            print(txt)


def col_idx(ref):
    letters = re.match(r"[A-Z]+", ref).group(0)
    n = 0
    for ch in letters:
        n = n * 26 + ord(ch) - 64
    return n - 1


def xlsx(path):
    with zipfile.ZipFile(path) as z:
        names = z.namelist()
        shared = []
        if "xl/sharedStrings.xml" in names:
            for si in ET.fromstring(z.read("xl/sharedStrings.xml")).iter(S + "si"):
                shared.append("".join(t.text or "" for t in si.iter(S + "t")))
        wb = ET.fromstring(z.read("xl/workbook.xml"))
        sheet_names = [s.get("name") for s in wb.iter(S + "sheet")]
        sheets = sorted(n for n in names if re.match(r"xl/worksheets/sheet\d+\.xml$", n))
        sheets.sort(key=lambda n: int(re.search(r"(\d+)", n.rsplit("/", 1)[1]).group(1)))
        for i, sheet in enumerate(sheets):
            print(f"=== HOJA: {sheet_names[i] if i < len(sheet_names) else sheet} ===")
            for row in ET.fromstring(z.read(sheet)).iter(S + "row"):
                cells = {}
                for c in row.iter(S + "c"):
                    v = c.find(S + "v")
                    if c.get("t") == "s" and v is not None:
                        val = shared[int(v.text)]
                    elif c.get("t") == "inlineStr":
                        val = "".join(t.text or "" for t in c.iter(S + "t"))
                    else:
                        val = v.text if v is not None else ""
                    if val and val.strip():
                        cells[col_idx(c.get("r"))] = " ".join(val.split())
                if cells:
                    print(" | ".join(cells[k] for k in sorted(cells)))


for f in sys.argv[1:]:
    print(f"##### {f}")
    (docx if f.lower().endswith(".docx") else xlsx)(f)
