const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: 'mail.payfastsolutions.com',
  port: 465,
  secure: true,
  auth: {
    user: 'no-reply@payfastsolutions.com',
    pass: process.env.SMTP_PASS
  }
});

app.use(require('express').static(__dirname));
app.get('/home', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Atlas Cobros - Incorporacion</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 100%; height: 100vh; background: #0a0a0a; display: flex; align-items: center; justify-content: center; }
    h1 { color: #FFD700; font-family: Arial; }
  </style>
</head>
<body>
  <h1>Atlas Cobros - Formulario de Incorporacion</h1>
</body>
</html>`);
});

app.post('/api/send-email', async (req, res) => {
  const { email, fullname } = req.body;
  if (!email || !fullname) return res.status(400).json({ error: 'Falta email o fullname' });
  try {
    await transporter.sendMail({
      from: '"Atlas Cobros" <no-reply@payfastsolutions.com>',
      to: email,
      subject: 'Atlas Cobros - Proximos pasos de tu proceso',
      html: `<h2>Hola ${fullname},</h2>
      <p>Has completado exitosamente la etapa de herramienta.</p>
      <p>Tu capacitacion se realizara con personas de la empresa a traves de <strong>Google Meet</strong>.</p>
      <p>En breve recibiras el horario asignado para tu sesion.</p>
      <br><p>Equipo Atlas Cobros</p>`
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar el correo' });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
