// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EmergenApi } from './emergen-api';
import { loadScript } from './load-script';
import { renderPaypalButtons } from './paypal-sdk';

vi.mock('./load-script', () => ({
  loadScript: vi.fn().mockResolvedValue(undefined),
}));

interface ButtonsOptions {
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
}

describe('renderPaypalButtons', () => {
  afterEach(() => {
    delete (window as { paypal?: unknown }).paypal;
    vi.clearAllMocks();
  });

  const setup = () => {
    let options!: ButtonsOptions;
    const render = vi.fn().mockResolvedValue(undefined);
    (window as { paypal?: unknown }).paypal = {
      Buttons: (opts: ButtonsOptions) => {
        options = opts;
        return { render, close: vi.fn() };
      },
    };
    const api = {
      paypal: {
        createOrder: vi.fn().mockResolvedValue({ id: 'ORDER1', status: 'CREATED' }),
        captureOrder: vi.fn().mockResolvedValue({ orderId: 'ORDER1', status: 'COMPLETED' }),
      },
    } as unknown as EmergenApi;
    return { api, render, options: () => options };
  };

  it('crea y captura la orden a través del backend', async () => {
    const { api, render, options } = setup();
    const onPaid = vi.fn();
    const container = document.createElement('div');

    await renderPaypalButtons(container, {
      api,
      clientId: 'client-id',
      order: { amount: '9.99', currency: 'USD' },
      onPaid,
    });

    expect(loadScript).toHaveBeenCalledWith(
      'https://www.paypal.com/sdk/js?client-id=client-id&currency=USD&intent=capture',
    );
    expect(render).toHaveBeenCalledWith(container);

    await expect(options().createOrder()).resolves.toBe('ORDER1');
    expect(api.paypal.createOrder).toHaveBeenCalledWith({
      amount: '9.99',
      currency: 'USD',
    });

    await options().onApprove({ orderID: 'ORDER1' });
    expect(api.paypal.captureOrder).toHaveBeenCalledWith('ORDER1');
    expect(onPaid).toHaveBeenCalledWith({
      orderId: 'ORDER1',
      status: 'COMPLETED',
    });
  });

  it('falla con un mensaje claro si el SDK no se inicializa', async () => {
    await expect(
      renderPaypalButtons(document.createElement('div'), {
        api: {} as EmergenApi,
        clientId: '',
        order: { amount: '1.00' },
        onPaid: vi.fn(),
      }),
    ).rejects.toThrow('PayPal SDK no se inicializó');
  });
});
