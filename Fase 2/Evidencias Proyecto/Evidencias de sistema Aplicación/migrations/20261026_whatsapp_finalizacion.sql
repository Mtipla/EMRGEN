-- Aplicar con NestJS y FastAPI detenidos. Conserva los envíos existentes.
BEGIN;

ALTER TABLE public.envio_alerta
    ADD COLUMN IF NOT EXISTS tipo_notificacion varchar(12) DEFAULT 'ACTIVACION' NOT NULL;
ALTER TABLE public.envio_alerta DROP CONSTRAINT IF EXISTS c_envio_alerta_01;
ALTER TABLE public.envio_alerta
    ADD CONSTRAINT c_envio_alerta_01 UNIQUE (alerta_id, contacto_emergencia_id, tipo_notificacion);
ALTER TABLE public.envio_alerta DROP CONSTRAINT IF EXISTS c_envio_alerta_03;
ALTER TABLE public.envio_alerta
    ADD CONSTRAINT c_envio_alerta_03 CHECK (tipo_notificacion IN ('ACTIVACION', 'FINALIZACION'));

CREATE OR REPLACE FUNCTION public.emergen_validar_envio() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE v_usuario integer;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF NEW.alerta_id IS DISTINCT FROM OLD.alerta_id
           OR NEW.tipo_notificacion IS DISTINCT FROM OLD.tipo_notificacion
           OR (NEW.contacto_emergencia_id IS DISTINCT FROM OLD.contacto_emergencia_id AND NEW.contacto_emergencia_id IS NOT NULL) THEN
            RAISE EXCEPTION 'No se reasigna un envío histórico' USING ERRCODE = '23514';
        END IF;
        IF OLD.estado_envio_id <> 1 AND NEW.estado_envio_id <> OLD.estado_envio_id THEN
            RAISE EXCEPTION 'Sin reintentos: un envío terminal no cambia de estado' USING ERRCODE = '23514';
        END IF;
    ELSE
        IF NEW.contacto_emergencia_id IS NULL THEN RAISE EXCEPTION 'Un envío nuevo requiere contacto' USING ERRCODE = '23514'; END IF;
        SELECT usuario_id INTO v_usuario FROM public.alerta WHERE alerta_id = NEW.alerta_id
          AND estado_alerta = CASE WHEN NEW.tipo_notificacion = 'ACTIVACION' THEN 'ACTIVA' ELSE 'FINALIZADA' END FOR UPDATE;
        IF NOT FOUND OR v_usuario IS NULL THEN RAISE EXCEPTION 'El estado de la alerta no permite este tipo de envío' USING ERRCODE = '23514'; END IF;
        IF NOT EXISTS (SELECT 1 FROM public.contacto_emergencia WHERE contacto_emergencia_id = NEW.contacto_emergencia_id AND usuario_id = v_usuario) THEN
            RAISE EXCEPTION 'Contacto ajeno al emisor de la alerta' USING ERRCODE = '23514';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.emergen_encolar_finalizacion() RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
    INSERT INTO public.envio_alerta(alerta_id, contacto_emergencia_id, tipo_notificacion)
    SELECT NEW.alerta_id, contacto_emergencia_id, 'FINALIZACION'
    FROM public.contacto_emergencia WHERE usuario_id = NEW.usuario_id
    ON CONFLICT (alerta_id, contacto_emergencia_id, tipo_notificacion) DO NOTHING;
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS emergen_alerta_notifica_cierre ON public.alerta;
CREATE TRIGGER emergen_alerta_notifica_cierre AFTER UPDATE OF estado_alerta ON public.alerta
FOR EACH ROW WHEN (OLD.estado_alerta = 'ACTIVA' AND NEW.estado_alerta = 'FINALIZADA' AND NEW.usuario_id IS NOT NULL)
EXECUTE FUNCTION public.emergen_encolar_finalizacion();

COMMIT;
