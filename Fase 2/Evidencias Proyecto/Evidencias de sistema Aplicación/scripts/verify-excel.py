"""Compara las nueve hojas del modelo Excel con PostgreSQL; no modifica archivos ni datos."""
import hashlib
import re
import sys
import unicodedata
import xml.etree.ElementTree as E
import zipfile
from pathlib import Path

root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/"services/internal-api"))
from app.core.config import settings
from app.core.db import connect
if settings.db_host=="db":
    settings.db_host,settings.db_port="localhost",5433
path=Path(sys.argv[1])
ns={"m":"http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
model={}
def physical(s):
    return "".join(c for c in unicodedata.normalize("NFD",s.strip().split("(")[0]) if not unicodedata.combining(c)).strip().lower()
with zipfile.ZipFile(path) as z:
    strings=["".join(x.itertext()) for x in E.fromstring(z.read("xl/sharedStrings.xml")).findall("m:si",ns)]
    for sheet in range(1,10):  # Las dos hojas finales están expresamente fuera de alcance.
        cells={}
        for cell in E.fromstring(z.read(f"xl/worksheets/sheet{sheet}.xml")).findall(".//m:c",ns):
            value=cell.find("m:v",ns)
            text=value.text if value is not None else "".join(cell.itertext())
            if cell.attrib.get("t")=="s": text=strings[int(text)]
            cells[cell.attrib["r"]]=text or ""
        for address,label in cells.items():
            if label!="Nombre Variable": continue
            col,row=re.fullmatch(r"([A-Z]+)(\d+)",address).groups()
            row=int(row);table=physical(cells[col+str(row-1)])
            for n in range(row+1,row+30):
                name=cells.get(col+str(n),"").strip()
                if not name: break
                rawtype=cells.get(chr(ord(col)+1)+str(n),"").lower()
                dtype=re.match(r"(integer|varchar\s*\(\d+\)|numeric\(\d+,\d+\)|timestamptz|boolean|text|uuid|jsonb)",rawtype).group(0).replace(" ","")
                model[(table,physical(name))]=(dtype,cells.get(chr(ord(col)+2)+str(n))=="NULL","identity" in rawtype,"(pk" in rawtype,"(fk" in rawtype,"unique" in rawtype)
# Excepciones explícitas del prompt consolidado.
model[("pin","pin_hash")]=("varchar(255)",False,False,False,False,False)
del model[("pin","pin")]
model[("bitacora_sistema","usuario_id")]=("integer",True,False,False,True,False)
extras={("venta",n) for n in ("orden_paypal_id","captura_paypal_id","monto_cobrado","moneda_cobrada")}
extras|={("pin","intentos_fallidos"),("pin","bloqueado_hasta"),("alerta","huella_solicitud")}
with connect() as db:
    columns=db.execute("""SELECT table_name,column_name,data_type,character_maximum_length,numeric_precision,numeric_scale,is_nullable,is_identity
        FROM information_schema.columns WHERE table_schema='public'""").fetchall()
    constraints=db.execute("""SELECT c.relname table_name,a.attname column_name,k.contype
        FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid
        JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum=ANY(k.conkey)
        WHERE c.relnamespace='public'::regnamespace AND k.contype IN ('p','f','u')""").fetchall()
    flags={}
    for r in constraints:flags.setdefault((r["table_name"],r["column_name"]),set()).add(r["contype"])
    actual={}
    for r in columns:
        dtype=r["data_type"]
        if dtype=="character varying":dtype=f'varchar({r["character_maximum_length"]})'
        if dtype=="numeric":dtype=f'numeric({r["numeric_precision"]},{r["numeric_scale"]})'
        if dtype=="timestamp with time zone":dtype="timestamptz"
        key=(r["table_name"],r["column_name"]);fl=flags.get(key,set())
        actual[key]=(dtype,r["is_nullable"]=="YES",r["is_identity"]=="YES","p" in fl,"f" in fl,"u" in fl)
    failures=[]
    for key,expected in model.items():
        found=actual.get(key)
        # UNIQUE puede reforzarse además del Excel; los UNIQUE explícitos sí deben existir.
        if not found or found[:5]!=expected[:5] or (expected[5] and not found[5]):
            failures.append((key,expected,found))
    unplanned=[k for k in actual if k not in model and k not in extras and k[0]!="reserva_cupos"]
    if failures or unplanned:
        print("DIFERENCIAS",failures,unplanned);sys.exit(1)
    print(f"Excel OK: {len(model)} columnas, {len(set(t for t,c in model))} tablas; tipos/nulabilidad/identity/PK/FK y UNIQUE explícitos.")
    print("Excepciones: PIN hasheado, actor nullable; adicionales PayPal, límites PIN, huella SOS y reserva durable.")
    print("SHA256",hashlib.sha256(path.read_bytes()).hexdigest())
