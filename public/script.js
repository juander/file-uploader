document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const fileInput = document.getElementById('file-input');
    if (!fileInput.files.length) return alert('Escolha um arquivo!');
  
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
  
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });
      const message = await response.text();
      document.getElementById('message').innerText = message;
      loadFiles();
    } catch (err) {
      console.error(err);
    }
  });
  
  async function loadFiles() {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = ''; // Limpa a lista de arquivos antes de recarregar
  
    try {
      const response = await fetch('/files'); // Faz a requisição à API
      if (!response.ok) throw new Error('Erro ao carregar arquivos');
  
      const files = await response.json(); // Converte a resposta para JSON
  
      files.forEach(file => {
        const li = document.createElement('li');
  
        // Adiciona um link para o arquivo
        const link = document.createElement('a');
        link.href = `/uploads/${file}`;
        link.textContent = file;
        link.target = '_blank'; // Abre o arquivo em uma nova aba
  
        li.appendChild(link);
        fileList.appendChild(li); // Adiciona o item à lista
      });
    } catch (err) {
      console.error('Erro ao carregar a lista de arquivos:', err);
    }
  }
  
  // Chama a função para carregar os arquivos ao abrir a página
  loadFiles();
  
  