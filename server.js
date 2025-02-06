require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Necessário para verificar e criar o diretório

const app = express();
const port = process.env.PORT || 3000; // Usa a porta configurada no Render ou 3000 localmente

// Caminho para a pasta 'uploads'
const uploadsDir = path.join(__dirname, 'uploads');

// Verifica se a pasta 'uploads' existe, se não, cria
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(cors());
app.use(express.static('public'));

// Configurar armazenamento de arquivos com Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Define o diretório de destino como 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Nome do arquivo com timestamp
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
app.get('/files', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao listar arquivos.' });
    }
    res.json(files);
  });
});

// Rota para deletar arquivo
app.delete('/delete/:filename', (req, res) => {
  const filename = req.params.filename;
  fs.unlink(path.join(uploadsDir, filename), (err) => {
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
