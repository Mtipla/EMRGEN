const { readFileSync }=require('node:fs');
const { resolve }=require('node:path');
const { client }=require('./db-dev.cjs');
const sql=readFileSync(resolve(__dirname,'../init.sql'),'utf8');
const normalize=s=>s.replace(/\s+/g,' ').trim();
(async()=>{
 const db=client();await db.connect();
 try {
  const expected=new Map([...sql.matchAll(/CREATE TABLE public\.(\w+) \(([\s\S]*?)^\);/gm)].map(m=>[m[1],[...m[2].matchAll(/^    (\w+) (?!KEY|CHECK|UNIQUE)(?:integer|varchar|text|boolean|timestamptz|numeric|char|uuid|jsonb)\b/gm)].map(x=>x[1])]));
  const columns=(await db.query("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position")).rows;
  const actual=new Map();for(const r of columns)actual.set(r.table_name,[...(actual.get(r.table_name)??[]),r.column_name]);
  if(JSON.stringify([...expected.keys()].sort())!==JSON.stringify([...actual.keys()].sort()))throw new Error('Tablas difieren');
  for(const [name,fields] of expected)if(JSON.stringify(fields)!==JSON.stringify(actual.get(name)))throw new Error('Columnas difieren: '+name);
  const functions=(await db.query("SELECT proname,prosrc FROM pg_proc WHERE pronamespace='public'::regnamespace")).rows;
  const bodies=new Map([...sql.matchAll(/CREATE FUNCTION public\.(\w+)\([\s\S]*?AS \$\$([\s\S]*?)\$\$/g)].map(m=>[m[1],normalize(m[2])]));
  if(functions.length!==bodies.size)throw new Error('Cantidad de funciones difiere');
  for(const f of functions)if(normalize(f.prosrc)!==bodies.get(f.proname))throw new Error('Función instalada difiere: '+f.proname);
  const triggers=(await db.query("SELECT tgname FROM pg_trigger WHERE NOT tgisinternal AND tgrelid IN (SELECT oid FROM pg_class WHERE relnamespace='public'::regnamespace)")).rows.map(r=>r.tgname).sort();
  const names=[...sql.matchAll(/CREATE (?:CONSTRAINT )?TRIGGER (\w+)/g)].map(m=>m[1]).sort();
  if(JSON.stringify(triggers)!==JSON.stringify(names))throw new Error('Triggers difieren');
  console.log(JSON.stringify({tables:actual.size,columns:columns.length,functions:functions.length,triggers:triggers.length,comparison:'init.sql e instalación coinciden en columnas ordenadas, cuerpos de funciones y nombres de triggers'}));
 } finally {await db.end();}
})().catch(e=>{console.error(e.message);process.exitCode=1});
