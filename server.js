const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/api/send-email', async (req, res) => {
  const { email, fullname } = req.body;
  if (!email || !fullname) return res.status(400).json({ error: 'Falta email o fullname' });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <div style="background-color: #1a1a2e; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Atlas Cobros</h1>
      </div>
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
        <h2 style="color: #1a1a2e;">Hola ${fullname},</h2>
        <p>Has completado exitosamente la etapa de postulacion. Bienvenido/a al equipo.</p>
        
        <h3 style="color: #1a1a2e; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">Siguiente paso: Numero mexicano</h3>
        <p>Para operar en el mercado mexicano es <strong>requisito obligatorio</strong> contar con un numero telefonico de Mexico.</p>
        
        <p><strong>Proveedor recomendado:</strong></p>
        <p style="margin: 15px 0;">
          <a href="https://global-numbers.com" style="background-color: #1a1a2e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Comprar numero en Global Numbers</a>
        </p>
        <p style="font-size: 14px; color: #666;">Tambien puedes adquirir tu numero mexicano con otro proveedor de tu preferencia, siempre que sea un numero real de Mexico.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1a1a2e;">
          <p style="margin: 0 0 8px 0;"><strong>Codigo de confirmacion de compra:</strong></p>
          <p style="margin: 0; font-size: 13px;">Si compras a traves de <strong>Global Numbers</strong>, tu codigo de confirmacion es el <strong>nombre de la aplicacion</strong> que aparece al momento de la compra del chip.</p>
          <p style="margin: 8px 0 0 0; font-size: 13px;">Si compras por tu cuenta con otro proveedor, debes <strong>validar tu numero con tu supervisor</strong> antes de comenzar a operar.</p>
        </div>
        
        <h3 style="color: #1a1a2e; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">Capacitacion</h3>
        <p>Tu capacitacion se realizara con personas de la empresa a traves de <strong>Google Meet</strong>. En breve recibiras el horario asignado para tu sesion.</p>
        
        <br>
        <p>Cualquier duda, contacta a tu supervisor asignado.</p>
        <p style="margin-top: 30px; color: #1a1a2e;"><strong>Equipo Atlas Cobros</strong></p>
      </div>
      <div style="text-align: center; padding: 15px; font-size: 12px; color: #999;">
        <p>Este es un correo automatico, por favor no respondas a este mensaje.</p>
      </div>
    </div>
  `;

  const body = JSON.stringify({
    from: 'Atlas Cobros <noreply@payfastsolutions.com>',
    to: email,
    subject: 'Atlas Cobros - Bienvenido/a al equipo - Proximos pasos',
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

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.id) {
          console.log('CORREO ENVIADO:', parsed.id);
          res.json({ success: true });
        } else {
          console.error('ERROR CORREO:', JSON.stringify(parsed));
          res.status(500).json({ error: parsed });
        }
      } catch (e) {
        console.error('ERROR CORREO PARSE:', data);
        res.status(500).json({ error: data });
      }
    });
  });

  request.on('error', (e) => {
    console.error('ERROR CORREO:', e.message);
    res.status(500).json({ error: e.message });
  });

  request.write(body);
  request.end();
});

app.listen(PORT, () => console.log('Servidor corriendo en puerto ' + PORT));
