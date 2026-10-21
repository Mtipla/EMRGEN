-- Ejecutar con psql -v ON_ERROR_STOP=1 o node scripts/test-sql.cjs.
-- No sustituye las pruebas HTTP ni las carreras de dos conexiones.
BEGIN;
CREATE FUNCTION pg_temp.must_fail(statement text, expected text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE actual text;
BEGIN
  BEGIN EXECUTE statement;
  EXCEPTION WHEN OTHERS THEN GET STACKED DIAGNOSTICS actual = RETURNED_SQLSTATE;
  END;
  IF actual IS DISTINCT FROM expected THEN
    RAISE EXCEPTION 'Se esperaba SQLSTATE %, recibido %, SQL: %',expected,actual,statement;
  END IF;
END $$;
DO $$
DECLARE u int; child int; other int; loc int; detail int; alert int; sale int; ticket int; pinid int;
BEGIN
  IF (SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='bitacora_sistema') <> 11 THEN RAISE EXCEPTION 'Bitácora no tiene once columnas'; END IF;
  IF to_regclass('public.usuario_suscripcion') IS NOT NULL THEN RAISE EXCEPTION 'Suscripción redundante'; END IF;
  IF (SELECT string_agg(estado_envio_id||':'||estado_envio,',' ORDER BY estado_envio_id) FROM estado_envio) <> '1:PENDIENTE,2:ENVIADO,3:FALLIDO' THEN RAISE EXCEPTION 'Catálogo envío'; END IF;
  SELECT pin_id INTO pinid FROM usuario WHERE correo_usuario='admin@emergen.test';
  IF pinid IS NULL THEN RAISE EXCEPTION 'Ejecutar seed-dev antes de probar'; END IF;
  INSERT INTO usuario(nombre_usuario,correo_usuario,contra_usuario,pin_id) VALUES ('SQL Test','sql.init@emergen.test','test-no-login',pinid) RETURNING usuario_id INTO u;
  INSERT INTO usuario(nombre_usuario,correo_usuario,contra_usuario,estado_id) VALUES ('Sin plan','sql.other@emergen.test','test-no-login',2) RETURNING usuario_id INTO other;
  PERFORM pg_temp.must_fail(format('INSERT INTO usuario(nombre_usuario,correo_usuario,contra_usuario) VALUES (''Duplicate'',''SQL.INIT@emergen.test'',''x'')'),'23505');
  INSERT INTO plan_usuario(usuario_id,plan_id,cupos_apadrinados_adq) VALUES(u,2,1);
  INSERT INTO usuario(nombre_usuario,correo_usuario,contra_usuario,usuario_principal_id,estado_id) VALUES ('Child','sql.child@emergen.test','test-no-login',u,2) RETURNING usuario_id INTO child;
  PERFORM pg_temp.must_fail(format('INSERT INTO plan_usuario(usuario_id,plan_id) VALUES (%s,2)',child),'23514');
  PERFORM pg_temp.must_fail(format('UPDATE plan_usuario SET cupos_apadrinados_adq=0 WHERE usuario_id=%s',u),'23514');
  PERFORM pg_temp.must_fail(format('DELETE FROM usuario WHERE usuario_id=%s',u),'23503');
  PERFORM pg_temp.must_fail(format('INSERT INTO contacto_emergencia(usuario_id,num_emergencia,nombre_contacto) VALUES (%s,''91234'',''Contacto'')',u),'23514');
  INSERT INTO contacto_emergencia(usuario_id,num_emergencia,nombre_contacto) VALUES(u,'+56900000001','Ficticio SQL');
  PERFORM pg_temp.must_fail(format('DELETE FROM contacto_emergencia WHERE usuario_id=%s',u),'23514');
  INSERT INTO detalle_alerta(texto_mensaje) VALUES ('Snapshot SQL') RETURNING detalle_alerta_id INTO detail;
  PERFORM pg_temp.must_fail(format('INSERT INTO alerta(usuario_id,detalle_alerta_id,prioridad_id,clave_idempotencia,huella_solicitud) VALUES (%s,%s,3,gen_random_uuid(),repeat(''a'',64))',other,detail),'23514');
  INSERT INTO ubicacion_alerta(ubicacion) VALUES ('Ubicación ficticia') RETURNING ubicacion_alerta_id INTO loc;
  INSERT INTO alerta(usuario_id,detalle_alerta_id,ubicacion_alerta_id,prioridad_id,clave_idempotencia,huella_solicitud) VALUES(u,detail,loc,3,gen_random_uuid(),repeat('a',64)) RETURNING alerta_id INTO alert;
  INSERT INTO historial_alerta(alerta_id,detalle_alerta_id,estado_actual) VALUES(alert,detail,'ACTIVA');
  INSERT INTO enlace_medico(alerta_id,token_hash,fecha_expiracion) VALUES(alert,repeat('b',64),now()+interval '1 hour');
  INSERT INTO envio_alerta(alerta_id,contacto_emergencia_id) SELECT alert,contacto_emergencia_id FROM contacto_emergencia WHERE usuario_id=u;
  PERFORM pg_temp.must_fail(format('UPDATE detalle_alerta SET texto_mensaje=''Alterado'' WHERE detalle_alerta_id=%s',detail),'23514');
  INSERT INTO venta(usuario_id,metodo_pago_id,estado_pago_id,total_venta) VALUES(u,1,1,2000) RETURNING venta_id INTO sale;
  INSERT INTO detalle_venta(venta_id,plan_id,tipo_compra,cantidad,precio_uni,cupos_otorgados) VALUES(sale,2,'CUPOS',2,1000,2);
  SET CONSTRAINTS ALL IMMEDIATE;
  PERFORM pg_temp.must_fail(format('UPDATE venta SET total_venta=1999 WHERE venta_id=%s',sale),'23514');
  PERFORM pg_temp.must_fail(format('INSERT INTO venta(usuario_id,metodo_pago_id,estado_pago_id,total_venta) VALUES(%s,1,1,0)',u),'23514');
  SET CONSTRAINTS ALL DEFERRED;
  INSERT INTO ticket_soporte(desc_ticket,usuario_id,categoria_soporte_id) VALUES('Ticket SQL',u,1) RETURNING ticket_soporte_id INTO ticket;
  IF (SELECT estado_ticket_id FROM ticket_soporte WHERE ticket_soporte_id=ticket) <> 1 THEN RAISE EXCEPTION 'Estado inicial'; END IF;
  INSERT INTO soporte(ticket_soporte_id,desc_caso) VALUES(ticket,'Seguimiento');
  PERFORM pg_temp.must_fail(format('INSERT INTO soporte(ticket_soporte_id,desc_caso) VALUES(%s,''Duplicado'')',ticket),'23505');
  PERFORM pg_temp.must_fail(format('UPDATE soporte SET solucion_caso='''' WHERE ticket_soporte_id=%s',ticket),'23514');
  INSERT INTO bitacora_sistema(usuario_id,usuario_afectado_id,rol_actor_id,aplicacion_id,accion_realizada) VALUES(u,u,3,1,'Prueba de borrado');
  DELETE FROM usuario WHERE usuario_id=child;
  IF (SELECT cupos_apadrinados_adq FROM plan_usuario WHERE usuario_id=u)<>1 THEN RAISE EXCEPTION 'Borrar hijo cambió capacidad'; END IF;
  DELETE FROM usuario WHERE usuario_id=u;
  IF (SELECT estado_alerta FROM alerta WHERE alerta_id=alert)<>'FINALIZADA' THEN RAISE EXCEPTION 'Cierre por borrado'; END IF;
  IF (SELECT count(*) FROM historial_alerta WHERE alerta_id=alert)<>2 THEN RAISE EXCEPTION 'Historial duplicado'; END IF;
  IF (SELECT fecha_revocacion FROM enlace_medico WHERE alerta_id=alert) IS NULL THEN RAISE EXCEPTION 'Enlace activo'; END IF;
  IF (SELECT estado_envio_id FROM envio_alerta WHERE alerta_id=alert)<>3 THEN RAISE EXCEPTION 'Envío no fallido'; END IF;
  IF (SELECT texto_mensaje FROM detalle_alerta WHERE detalle_alerta_id=detail)<>'[Contenido eliminado]' THEN RAISE EXCEPTION 'Snapshot no depurado'; END IF;
  IF EXISTS(SELECT 1 FROM ubicacion_alerta WHERE ubicacion_alerta_id=loc) THEN RAISE EXCEPTION 'Ubicación no depurada'; END IF;
  IF NOT EXISTS(SELECT 1 FROM pin WHERE pin_id=pinid) THEN RAISE EXCEPTION 'PIN compartido eliminado'; END IF;
  IF NOT EXISTS(SELECT 1 FROM bitacora_sistema WHERE accion_realizada='Prueba de borrado' AND usuario_id IS NULL AND usuario_afectado_id IS NULL AND rol_actor_id=3) THEN RAISE EXCEPTION 'Auditoría perdida'; END IF;
  IF (SELECT usuario_id FROM venta WHERE venta_id=sale) IS NOT NULL THEN RAISE EXCEPTION 'Comprador histórico'; END IF;
END $$;
SET CONSTRAINTS ALL IMMEDIATE;
ROLLBACK;
