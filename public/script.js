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
  
      // Reseta o campo de arquivo
      fileInput.value = ''; // Faz com que o texto volte a ser "Nenhum arquivo escolhido"
  
      loadFiles(); // Atualiza a lista de arquivos disponíveis
    } catch (err) {
      console.error(err);
    }
  });
  
  async function loadFiles() {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = ''; // Limpa a lista de arquivos antes de recarregar
  
    try {
      const response = await fetch('/files'); // Faz a requisição à API para obter a lista de arquivos
      if (!response.ok) throw new Error('Erro ao carregar arquivos');
  
      const files = await response.json(); // Converte a resposta para JSON
  
      files.forEach(file => {
        const li = document.createElement('li');
  
        // Adiciona um link para o arquivo
        const link = document.createElement('a');
        link.href = `/uploads/${file}`;
        link.textContent = file;
        link.target = '_blank'; // Abre o arquivo em uma nova aba
  
        // Adiciona o botão de deletar com classe específica
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.classList.add('delete-btn'); // Adiciona a classe específica para o botão de deletar
        deleteButton.addEventListener('click', async () => {
          try {
            const deleteResponse = await fetch(`/delete/${file}`, {
              method: 'DELETE',
            });
            const deleteMessage = await deleteResponse.text();
            alert(deleteMessage);
            loadFiles(); // Recarrega a lista após exclusão
          } catch (err) {
            console.error('Erro ao excluir arquivo:', err);
          }
        });
  
        li.appendChild(link); // Adiciona o link na lista
        li.appendChild(deleteButton); // Adiciona o botão de exclusão na lista
        fileList.appendChild(li); // Adiciona o item à lista
      });
    } catch (err) {
      console.error('Erro ao carregar a lista de arquivos:', err);
    }
  }
  
  // Chama a função para carregar os arquivos ao abrir a página
  loadFiles();
  