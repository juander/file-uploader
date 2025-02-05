async function isPasswordLeaked(password) {
  const hash = await sha1(password); // Gera o hash SHA-1 da senha
  const prefix = hash.slice(0, 5); // Pega os primeiros 5 caracteres do hash
  const suffix = hash.slice(5).toUpperCase();

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const data = await response.text();

  return data.includes(suffix);
}

async function sha1(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  console.log('Tentativa de login:', { username, password }); // Log da tentativa de login

  if (!username || !password) {
    showMessage('Por favor, preencha todos os campos.', 'error');
    return;
  }

  // Verifica se a senha foi vazada
  const isLeaked = await isPasswordLeaked(password);
  if (isLeaked) {
    showMessage('Esta senha foi vazada em violações de dados. Escolha uma senha mais segura.', 'error');
    return;
  }

  const loginButton = document.getElementById('login-button');
  loginButton.disabled = true;
  loginButton.textContent = 'Carregando...';

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    console.log('Resposta do servidor:', response); // Log da resposta

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Erro ao fazer login');
    }

    const data = await response.json();
    if (data.token) {
      sessionStorage.setItem('token', data.token); // Armazena o token no sessionStorage
      console.log('Token armazenado:', data.token); // Log do token armazenado
      window.location.href = 'index.html';
    } else {
      throw new Error('Token não recebido do servidor');
    }
  } catch (err) {
    console.error('Erro no login:', err);
    showMessage(err.message || 'Erro ao fazer login', 'error');
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = 'Login';
  }
});

function showMessage(message, type = 'info') {
  const messageElement = document.getElementById('message');
  messageElement.textContent = message;
  messageElement.className = `alert alert-${type}`;
  messageElement.style.display = 'block';

  setTimeout(() => {
    messageElement.style.display = 'none';
  }, 5000);
}