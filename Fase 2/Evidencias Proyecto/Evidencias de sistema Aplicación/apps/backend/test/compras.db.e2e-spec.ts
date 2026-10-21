import './load-root-env';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { ComprasService } from '../src/compras/compras.service';
import { PaypalService } from '../src/integrations/paypal/paypal.service';
import { MindicadorService } from '../src/integrations/mindicador/mindicador.service';

const db=process.env.DB_E2E==='1'?describe:describe.skip;
db('Compras: reservas durables y conciliación con PostgreSQL real / PayPal simulado',()=>{
  jest.setTimeout(60_000);
  let app:INestApplication, source:DataSource, id:number, token:string;
  const suffix=randomUUID().slice(0,8),email='buy.'+suffix+'@emergen.test';
  let orderNumber=0;
  const paypal={createOrder:jest.fn(),captureOrder:jest.fn(),getOrder:jest.fn()};
  const http=()=>request(app.getHttpServer());
  const auth=()=>({Authorization:'Bearer '+token});
  const create=(cantidad=1)=>http().post('/compras/apadrinados/ordenes').set(auth()).send({cantidad});
  const capture=(order:string)=>http().post('/compras/apadrinados/ordenes/'+order+'/captura').set(auth());
  const reconcile=(sale:number)=>http().post('/compras/apadrinados/ventas/'+sale+'/conciliar').set(auth());
  const ok=(order:string,value='1.06',captureStatus='COMPLETED')=>({orderId:order,status:captureStatus==='COMPLETED'?'COMPLETED':'APPROVED',captureId:'CAP'+order,captureStatus,amount:{value,currency:'USD'}});
  const acquired=async()=>(await source.query('SELECT cupos_apadrinados_adq AS n FROM plan_usuario WHERE usuario_id=$1',[id]))[0].n;
  beforeAll(async()=>{
    const module=await Test.createTestingModule({imports:[AppModule]})
      .overrideProvider(PaypalService).useValue(paypal)
      .overrideProvider(MindicadorService).useValue({get:async()=>({series:[{value:950}]})}).compile();
    app=module.createNestApplication({logger:false});
    app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true}));
    await app.init();source=app.get(DataSource);
    const hash=await bcrypt.hash('CompraTest123!',12);
    const [row]=await source.query("INSERT INTO usuario(nombre_usuario,correo_usuario,contra_usuario,estado_id,pin_id) SELECT 'Compra Test',$1,$2,1,pin_id FROM usuario WHERE correo_usuario='admin@emergen.test' RETURNING usuario_id",[email,hash]);
    id=row.usuario_id;
    token=(await http().post('/usuarios/login').send({correo_usuario:email,password:'CompraTest123!'}).expect(201)).body.access_token;
    await source.query('INSERT INTO plan_usuario(usuario_id,plan_id,cupos_apadrinados_adq) VALUES ($1,2,0)',[id]);
  });
  beforeEach(async()=>{
    paypal.createOrder.mockReset().mockImplementation(async()=>({id:'TEST'+suffix+(++orderNumber),status:'CREATED'}));
    paypal.captureOrder.mockReset();paypal.getOrder.mockReset();
    // Venta DELETE cascada detalle/reserva: nunca deja una cabecera sin detalle.
    await source.query('DELETE FROM venta WHERE usuario_id=$1',[id]);
    await source.query('UPDATE plan_usuario SET cupos_apadrinados_adq=0 WHERE usuario_id=$1',[id]);
  });
  afterAll(async()=>{
    if(source?.isInitialized&&id){await source.query('DELETE FROM venta WHERE usuario_id=$1',[id]);await source.query('DELETE FROM usuario WHERE usuario_id=$1',[id]);}
    await app?.close();
  });
  it('requiere sesión y plan; valida cantidad y referencia el plan real, no producto1',async()=>{
    await http().get('/compras/apadrinados').expect(401);
    await create(0).expect(400);
    const r=await create().expect(201);
    const [line]=await source.query('SELECT * FROM detalle_venta WHERE venta_id=$1',[r.body.ventaId]);
    expect(line).toMatchObject({plan_id:2,tipo_compra:'CUPOS',cantidad:1,cupos_otorgados:1,precio_uni:1000});
    expect((await http().get('/compras/apadrinados').set(auth()).expect(200)).body.maxCantidad).toBe(4);
  });
  it('dos órdenes distintas compiten por el último cupo antes de llamar a PayPal',async()=>{
    await source.query('UPDATE plan_usuario SET cupos_apadrinados_adq=4 WHERE usuario_id=$1',[id]);
    const results=await Promise.all([create(),create()]);
    expect(results.map(r=>r.status).sort()).toEqual([201,409]);
    expect(paypal.createOrder).toHaveBeenCalledTimes(1);
    const r=results.find(x=>x.status===201)!.body;
    paypal.captureOrder.mockResolvedValue(ok(r.orderId));
    await capture(r.orderId).expect(200);
    expect(await acquired()).toBe(5);
  });
  it('capturas concurrentes y repetidas conceden una sola vez',async()=>{
    const r=(await create().expect(201)).body;
    paypal.captureOrder.mockImplementation(async()=>{await new Promise(r=>setTimeout(r,100));return ok(r.orderId);});
    const responses=await Promise.all([capture(r.orderId),capture(r.orderId)]);
    expect(responses.every(x=>x.status===200)).toBe(true);
    await capture(r.orderId).expect(200);
    expect(paypal.captureOrder).toHaveBeenCalledTimes(1);expect(await acquired()).toBe(1);
  });
  it('timeout después del cobro retiene capacidad y concilia por GET sin volver a capturar',async()=>{
    const r=(await create().expect(201)).body;
    paypal.captureOrder.mockRejectedValue(new Error('timeout after remote capture'));
    await capture(r.orderId).expect(502);
    expect((await source.query('SELECT estado FROM reserva_cupos WHERE venta_id=$1',[r.ventaId]))[0].estado).toBe('INCIERTA');
    await http().post('/compras/apadrinados/ordenes/'+r.orderId+'/cancelar').set(auth()).expect(409);
    paypal.getOrder.mockResolvedValue(ok(r.orderId));
    const result=await reconcile(r.ventaId).expect(200);
    expect(result.body.estado).toBe('PAGADO');expect(await acquired()).toBe(1);expect(paypal.captureOrder).toHaveBeenCalledTimes(1);
  });
  it('pending/revisión no conceden derechos; comprobación final sí',async()=>{
    const r=(await create().expect(201)).body;
    paypal.captureOrder.mockResolvedValue(ok(r.orderId,'1.06','PENDING'));
    expect((await capture(r.orderId).expect(200)).body.estado).toBe('PENDIENTE');expect(await acquired()).toBe(0);
    paypal.getOrder.mockResolvedValue(ok(r.orderId,'9.99'));
    expect((await reconcile(r.ventaId).expect(200)).body.estado).toBe('REVISION');expect(await acquired()).toBe(0);
    paypal.getOrder.mockResolvedValue(ok(r.orderId));
    expect((await reconcile(r.ventaId).expect(200)).body.estado).toBe('PAGADO');expect(await acquired()).toBe(1);
  });
  it('rechazo definitivo libera reserva; cancelación de orden sin captura también',async()=>{
    const r=(await create().expect(201)).body;
    paypal.captureOrder.mockResolvedValue(ok(r.orderId,'1.06','DECLINED'));
    expect((await capture(r.orderId).expect(200)).body.estado).toBe('RECHAZADO');
    const r2=(await create().expect(201)).body;
    await http().post('/compras/apadrinados/ordenes/'+r2.orderId+'/cancelar').set(auth()).expect(200);
    expect((await http().get('/compras/apadrinados').set(auth()).expect(200)).body.maxCantidad).toBe(5);
  });
  it('timeout de creación reutiliza clave estable y no pierde la reserva',async()=>{
    paypal.createOrder.mockRejectedValueOnce(new Error('unknown create'));
    await create().expect(502);
    const [sale]=await source.query('SELECT venta_id FROM venta WHERE usuario_id=$1',[id]);
    await reconcile(sale.venta_id).expect(200);
    expect(paypal.createOrder.mock.calls[0][1]).toBe(paypal.createOrder.mock.calls[1][1]);
    expect((await source.query('SELECT count(*)::int n FROM reserva_cupos WHERE usuario_id=$1',[id]))[0].n).toBe(1);
  });
  it('lease persistida recupera caída de proceso sin volver a capturar',async()=>{
    const r=(await create().expect(201)).body;
    await source.query("UPDATE reserva_cupos SET estado='CAPTURANDO',actualizada_en=now()-interval '2 minutes' WHERE venta_id=$1",[r.ventaId]);
    paypal.getOrder.mockResolvedValue(ok(r.orderId));
    await reconcile(r.ventaId).expect(200);expect(paypal.captureOrder).not.toHaveBeenCalled();expect(await acquired()).toBe(1);
  });
  it('fallo local después de captura conserva evidencia y se recupera sin doble concesión',async()=>{
    const r=(await create().expect(201)).body;
    paypal.captureOrder.mockResolvedValue(ok(r.orderId));
    const service=app.get(ComprasService);
    const failure=jest.spyOn(service as any,'aplicarRespuesta').mockRejectedValueOnce(new Error('fallo local simulado'));
    await capture(r.orderId).expect(500);
    failure.mockRestore();
    const [saved]=await source.query('SELECT v.captura_paypal_id,r.estado FROM venta v JOIN reserva_cupos r USING(venta_id) WHERE venta_id=$1',[r.ventaId]);
    expect(saved).toMatchObject({captura_paypal_id:'CAP'+r.orderId,estado:'INCIERTA'});expect(await acquired()).toBe(0);
    const pending=await http().get('/compras/apadrinados/ventas/pendientes').set(auth()).expect(200);
    expect(pending.body).toEqual([expect.objectContaining({ventaId:r.ventaId,puedeRetomar:false})]);
    paypal.getOrder.mockResolvedValue(ok(r.orderId));
    await reconcile(r.ventaId).expect(200);expect(await acquired()).toBe(1);expect(paypal.captureOrder).toHaveBeenCalledTimes(1);
    expect((await http().get('/compras/apadrinados/ventas/pendientes').set(auth()).expect(200)).body).toEqual([]);
  });

});
