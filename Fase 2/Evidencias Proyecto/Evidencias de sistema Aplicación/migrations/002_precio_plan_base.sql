-- Precio de la cuenta Premium. No cambia planes asignados ni compras registradas.
BEGIN;
INSERT INTO public.plan (plan_id,nombre_plan,precio_actual,limite_compra_max)
VALUES (2,'PLAN BASE DEMOSTRACION',5000,1)
ON CONFLICT (plan_id) DO UPDATE SET precio_actual=EXCLUDED.precio_actual;
SELECT setval(pg_get_serial_sequence('public.plan','plan_id'), (SELECT max(plan_id) FROM public.plan), true);

-- Un plan reserva su compra con cero cupos; los cupos se compran por separado.
ALTER TABLE public.reserva_cupos DROP CONSTRAINT IF EXISTS reserva_cupos_cupos_check;
ALTER TABLE public.reserva_cupos ADD CONSTRAINT reserva_cupos_cupos_check CHECK (cupos BETWEEN 0 AND 5);

CREATE OR REPLACE FUNCTION public.emergen_validar_reserva() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v_adquiridos integer; v_reservados integer; v_tipo varchar(10);
BEGIN
  IF TG_OP='UPDATE' AND (NEW.usuario_id<>OLD.usuario_id OR NEW.venta_id<>OLD.venta_id OR NEW.cupos<>OLD.cupos) THEN
    RAISE EXCEPTION 'La identidad de una reserva es inmutable' USING ERRCODE='23514';
  END IF;
  IF TG_OP='UPDATE' AND OLD.estado IN ('APLICADA','LIBERADA') AND NEW.estado<>OLD.estado THEN
    RAISE EXCEPTION 'Reserva terminal inmutable' USING ERRCODE='23514';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.venta WHERE venta_id=NEW.venta_id AND usuario_id=NEW.usuario_id) THEN
    RAISE EXCEPTION 'Reserva ajena al comprador' USING ERRCODE='23514';
  END IF;
  PERFORM public.emergen_bloquear_usuario(NEW.usuario_id);
  SELECT tipo_compra INTO v_tipo FROM public.detalle_venta WHERE venta_id=NEW.venta_id;
  IF v_tipo IS NULL OR (v_tipo='PLAN' AND NEW.cupos<>0) OR (v_tipo='CUPOS' AND NEW.cupos=0) THEN
    RAISE EXCEPTION 'Reserva incompatible con el tipo de compra' USING ERRCODE='23514';
  END IF;
  IF NEW.estado IN ('RESERVADA','CREANDO','CAPTURANDO','INCIERTA') THEN
    IF v_tipo='PLAN' THEN
      IF EXISTS (SELECT 1 FROM public.plan_usuario WHERE usuario_id=NEW.usuario_id) THEN
        RAISE EXCEPTION 'El comprador ya tiene plan' USING ERRCODE='23514';
      END IF;
      IF EXISTS (SELECT 1 FROM public.reserva_cupos r JOIN public.detalle_venta d USING(venta_id)
        WHERE r.usuario_id=NEW.usuario_id AND r.venta_id<>NEW.venta_id AND d.tipo_compra='PLAN'
          AND r.estado IN ('RESERVADA','CREANDO','CAPTURANDO','INCIERTA')) THEN
        RAISE EXCEPTION 'Ya existe una compra de plan pendiente' USING ERRCODE='23514';
      END IF;
      RETURN NEW;
    END IF;
    SELECT cupos_apadrinados_adq INTO v_adquiridos FROM public.plan_usuario WHERE usuario_id=NEW.usuario_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'La reserva requiere plan' USING ERRCODE='23514'; END IF;
    SELECT COALESCE(sum(cupos),0) INTO v_reservados FROM public.reserva_cupos
      WHERE usuario_id=NEW.usuario_id AND venta_id<>NEW.venta_id AND estado IN ('RESERVADA','CREANDO','CAPTURANDO','INCIERTA');
    IF v_adquiridos+v_reservados+NEW.cupos>5 THEN RAISE EXCEPTION 'Sin capacidad para reservar cupos' USING ERRCODE='23514'; END IF;
  END IF;
  RETURN NEW;
END $$;
COMMIT;
