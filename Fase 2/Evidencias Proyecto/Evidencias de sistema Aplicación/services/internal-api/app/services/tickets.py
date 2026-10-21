"""TICKET_SOPORTE identifica el caso y su estado; SOPORTE es seguimiento opcional 0..1."""
import psycopg
from fastapi import HTTPException

_SELECT = """
 SELECT t.ticket_soporte_id AS ticket_id,t.usuario_id,t.desc_ticket AS descripcion,
        e.estado_ticket AS estado,s.solucion_caso AS solucion,
        t.categoria_soporte_id AS categoria_id,c.nombre_categoria AS categoria
 FROM ticket_soporte t
 JOIN estado_ticket e USING(estado_ticket_id)
 JOIN categoria_soporte c USING(categoria_soporte_id)
 LEFT JOIN soporte s USING(ticket_soporte_id)
"""

def categorias(conn: psycopg.Connection) -> list[dict]:
    return conn.execute("SELECT categoria_soporte_id AS categoria_id,nombre_categoria AS nombre FROM categoria_soporte ORDER BY 1").fetchall()

def estados(conn: psycopg.Connection) -> list[dict]:
    return conn.execute("SELECT estado_ticket_id AS estado_id,estado_ticket AS nombre FROM estado_ticket ORDER BY 1").fetchall()

def existe_categoria(conn: psycopg.Connection, categoria_id: int) -> bool:
    return conn.execute("SELECT 1 FROM categoria_soporte WHERE categoria_soporte_id=%s", (categoria_id,)).fetchone() is not None

def estado_canonico(conn: psycopg.Connection, nombre: str) -> int | None:
    row = conn.execute("SELECT estado_ticket_id FROM estado_ticket WHERE UPPER(estado_ticket)=UPPER(%s)", (nombre,)).fetchone()
    return row["estado_ticket_id"] if row else None

def crear(conn: psycopg.Connection, usuario_id: int, descripcion: str, categoria_id: int) -> dict:
    ticket = conn.execute("""INSERT INTO ticket_soporte(usuario_id,desc_ticket,categoria_soporte_id)
        VALUES (%s,%s,%s) RETURNING ticket_soporte_id""", (usuario_id,descripcion,categoria_id)).fetchone()
    return obtener(conn, ticket["ticket_soporte_id"])

def listar(conn: psycopg.Connection, usuario_id: int | None, estado: str | None, limit: int, offset: int) -> list[dict]:
    return conn.execute(_SELECT + """ WHERE (%(u)s::int IS NULL OR t.usuario_id=%(u)s)
        AND (%(e)s::text IS NULL OR UPPER(e.estado_ticket)=UPPER(%(e)s))
        ORDER BY t.ticket_soporte_id DESC LIMIT %(l)s OFFSET %(o)s""", {"u":usuario_id,"e":estado,"l":limit,"o":offset}).fetchall()

def obtener(conn: psycopg.Connection, ticket_id: int) -> dict | None:
    return conn.execute(_SELECT + " WHERE t.ticket_soporte_id=%s", (ticket_id,)).fetchone()

def actualizar(conn: psycopg.Connection, ticket_id: int, estado: str | None, solucion: str | None) -> dict:
    row = conn.execute("SELECT * FROM ticket_soporte WHERE ticket_soporte_id=%s FOR UPDATE", (ticket_id,)).fetchone()
    if not row:
        raise HTTPException(404, "El ticket no existe")
    if estado is not None:
        state = estado_canonico(conn, estado)
        if state is None:
            raise HTTPException(400, "El estado no existe en ESTADO_TICKET")
        conn.execute("UPDATE ticket_soporte SET estado_ticket_id=%s WHERE ticket_soporte_id=%s", (state,ticket_id))
    if solucion is not None:
        conn.execute("""INSERT INTO soporte(ticket_soporte_id,desc_caso,solucion_caso) VALUES (%s,%s,%s)
            ON CONFLICT(ticket_soporte_id) DO UPDATE SET solucion_caso=excluded.solucion_caso""", (ticket_id,row["desc_ticket"],solucion))
    return obtener(conn, ticket_id)
