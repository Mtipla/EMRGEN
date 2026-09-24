import { useEffect, useRef, useState } from "react";
import { renderPaypalButtons, type RenderPaypalButtonsOptions } from "@repo/api-client";

type PaypalButtonProps = RenderPaypalButtonsOptions;

/** Botones de pago de PayPal: la orden se crea y se captura a través del backend. */
export const PaypalButton = ({ api, clientId, order, onPaid, onCancel, onError }: PaypalButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>();
  // Los callbacks se leen desde una ref para no recrear los botones en cada render.
  const callbacks = useRef({ onPaid, onCancel, onError });
  callbacks.current = { onPaid, onCancel, onError };

  const { amount, currency, description, referenceId } = order;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let closed = false;
    const rendering = renderPaypalButtons(container, {
      api,
      clientId,
      order: { amount, currency, description, referenceId },
      onPaid: (result) => callbacks.current.onPaid(result),
      onCancel: () => callbacks.current.onCancel?.(),
      onError: (err) => callbacks.current.onError?.(err),
    });
    rendering.catch((err: unknown) => {
      if (!closed) setError(err instanceof Error ? err.message : String(err));
    });

    return () => {
      closed = true;
      void rendering.then((buttons) => buttons.close()).catch(() => undefined);
    };
  }, [api, clientId, amount, currency, description, referenceId]);

  if (error) return <p role="alert">No se pudo cargar PayPal: {error}</p>;
  return <div ref={containerRef} />;
};
