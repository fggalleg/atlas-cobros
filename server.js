const express = require('express');
const { Resend } = require('resend');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/api/send-email', async (req, res) => {
  const { email, fullname } = req.body;
  if (!email || !fullname) return res.status(400).json({ error: 'Falta email o fullname' });
  try {
    const data = await resend.emails.send({
      from: 'Atlas Cobros <onboarding@resend.dev>',
      to: email,
      subject: 'Atlas Cobros - Proximos pasos de tu proceso',
      html: `<h2>Hola ${fullname},</h2>
      <p>Has completado exitosamente la etapa de herramienta.</p>
      <p>Tu capacitacion se realizara con personas de la empresa a traves de <strong>Google Meet</strong>.</p>
      <p>En breve recibiras el horario asignado para tu sesion.</p>
      <br><p>Equipo Atlas Cobros</p>`
    });
    if (data.error) {
      console.error('ERROR CORREO:', JSON.stringify(data.error));
      return res.status(500).json({ error: data.error });
    }
    console.log('CORREO ENVIADO:', data.data && data.data.id);
    res.json({ success: true });
  } catch (error) {
    console.error('ERROR CORREO:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
