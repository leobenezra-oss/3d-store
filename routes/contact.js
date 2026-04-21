const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  }
});

router.get('/', (req, res) => {
  res.sendFile(require('path').join(__dirname, '../views/contact.html'));
});

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `New message from ${name} — Fidget3D`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });
    res.redirect('/contact?sent=true');
  } catch (err) {
    console.error(err);
    res.redirect('/contact?sent=error');
  }
});

module.exports = router;