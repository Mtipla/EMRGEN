"""Valida los archivos creados por check-tickets-reportes.cjs usando solo la biblioteca estándar."""
import json
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET

base = Path(__file__).resolve().parents[1] / "node_modules/.cache/tickets-reportes-verificacion"
expected = json.loads((base / "result.json").read_text(encoding="utf-8"))
ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
with ZipFile(base / "tickets-cerrados.xlsx") as archive:
    assert archive.testzip() is None
    strings = []
    if "xl/sharedStrings.xml" in archive.namelist():
        strings = ["".join(item.itertext()) for item in ET.fromstring(archive.read("xl/sharedStrings.xml")).findall("m:si", ns)]
    sheet = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
    assert not sheet.findall(".//m:f", ns), "El contenido de los tickets no debe convertirse en fórmulas"
    rows = []
    for row in sheet.findall("m:sheetData/m:row", ns):
        cells = {}
        for cell in row.findall("m:c", ns):
            value = cell.find("m:v", ns)
            inline = cell.find("m:is", ns)
            text = value.text if value is not None else "".join(inline.itertext()) if inline is not None else ""
            if cell.attrib.get("t") == "s":
                text = strings[int(text)]
            column = "".join(c for c in cell.attrib["r"] if c.isalpha())
            cells[column] = text
        rows.append(cells)
    assert rows[0]["G"] == "Descripción" and rows[0]["H"] == "Solución"
    assert rows[0]["J"] == "Trabajador que respondió"
    data = rows[1:]
    assert all(row["B"] == "CERRADO" for row in data)
    own = [row for row in data if row["C"] == str(expected["emisorId"])]
    assert len(own) == 22, "Debe exportar más de la página de 20 tickets"
    assert {int(row["A"]) for row in own} == set(expected["cerrados"])
    assert not any(int(row["A"]) in expected["excluidos"] for row in data)
    ticket = next(row for row in own if int(row["A"]) == expected["ticketId"])
    assert ticket["D"] == "Emisor <José>"
    assert ticket["G"] == "Descripción <especial> & con acentos\nSegunda línea"
    assert ticket["H"] == expected["solucion"]
    assert ticket["I"] == str(expected["trabajadorId"])
    assert ticket["J"] == "Soporte & María"
    assert (base / "tickets-cerrados.pdf").read_bytes().startswith(b"%PDF-")
print("Archivos OK: Excel íntegro, 22 cerrados completos, abiertos/en proceso excluidos, autor correcto y texto con saltos de línea sin fórmulas; firma PDF válida.")
