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
app.post('/api/send-email', async (req, res) => {
  const { email, fullname } = req.body;
  if (!email || !fullname) return res.status(400).json({ error: 'Falta email o fullname' });
  try {
    await transporter.sendMail({
      from: '"Atlas Cobros" <no-reply@payfastsolutions.com>',
      to: email,
      subject: 'Atlas Cobros – Próximos pasos de tu proceso',
      html: `<h2>Hola ${fullname},</h2>
      <p>Has completado exitosamente la etapa de herramienta.</p>
      <p>Tu capacitación se realizará con personas de la empresa a través de <strong>Google Meet</strong>.</p>
      <p>En breve recibirás el horario asignado para tu sesión.</p>
      <br><p>Equipo Atlas Cobros</p>`
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar el correo' });
  }
});
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
