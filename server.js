require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('public'));

// Configurar armazenamento de arquivos com Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Rota para servir a página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para upload de arquivos
app.post('/upload', upload.array('file'), (req, res) => {
  res.json({ message: 'Arquivos enviados com sucesso!', files: req.files });
});

// Rota para listar arquivos disponíveis
const fs = require('fs');
app.get('/files', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao listar arquivos.' });
    }
    res.json(files);
  });
});

// Rota para deletar arquivo
app.delete('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  fs.unlink(path.join('uploads', filename), (err) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao excluir arquivo.' });
    }
    res.json({ message: `Arquivo ${filename} excluído com sucesso.` });
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
