const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Configurar a pasta de uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para upload de arquivos
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nenhum arquivo enviado!');
  }
  res.send(`Arquivo enviado com sucesso: ${req.file.originalname}`);
});

// Rota para listar arquivos disponíveis
app.get('/files', (req, res) => {
  const fs = require('fs');
  const files = fs.readdirSync(path.join(__dirname, 'uploads'));
  res.json(files);
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
