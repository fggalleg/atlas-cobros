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

  const body = JSON.stringify({
    from: 'Atlas Cobros <onboarding@resend.dev>',
    to: email,
    subject: 'Atlas Cobros - Proximos pasos de tu proceso',
    html: `<h2>Hola ${fullname},</h2><p>Has completado exitosamente la etapa de herramienta.</p><p>Tu capacitacion se realizara con personas de la empresa a traves de <strong>Google Meet</strong>.</p><p>En breve recibiras el horario asignado para tu sesion.</p><br><p>Equipo Atlas Cobros</p>`
  });

  const options = {
    hostname: 'api.resend.com',
    path: '/emails',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      const parsed = JSON.parse(data);
      if (parsed.id) {
        console.log('CORREO ENVIADO:', parsed.id);
        res.json({ success: true });
      } else {
        console.error('ERROR CORREO:', JSON.stringify(parsed));
        res.status(500).json({ error: parsed });
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

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
