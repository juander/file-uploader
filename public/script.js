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
    fileList.innerHTML = '';
  
    try {
      const response = await fetch('/files');
      const files = await response.json();
  
      files.forEach(file => {
        const li = document.createElement('li');
        li.textContent = file;
        fileList.appendChild(li);
      });
    } catch (err) {
      console.error(err);
    }
  }
  
  loadFiles();
  