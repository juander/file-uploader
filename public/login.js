async function isPasswordLeaked(password) {
  const hash = await sha1(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5).toUpperCase();

  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const data = await response.text();
    return data.includes(suffix);
  } catch (error) {
    console.error('Erro ao verificar senha vazada:', error);
    return false; // Ignora erros na verificação de senhas vazadas
  }
}

async function sha1(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Checa se o token existe no sessionStorage ao carregar a página
(function checkToken() {
  const token = sessionStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html'; // Redireciona para a página de login se não houver token
  }
})();

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  console.log('Tentativa de login:', { username, password });

  if (!username || !password) {
    showMessage('Por favor, preencha todos os campos.', 'error');
    return;
  }

  const loginButton = document.getElementById('login-button');
  loginButton.disabled = true;
  loginButton.textContent = 'Carregando...';

  try {
    // Verifica se a senha foi vazada (com timeout)
    const isLeaked = await Promise.race([
      isPasswordLeaked(password),
      new Promise((resolve) => setTimeout(() => resolve(false), 3000)),
    ]);

    if (isLeaked) {
      showMessage('Esta senha foi vazada em violações de dados. Escolha uma senha mais segura.', 'error');
      return;
    }

    // Envia a requisição de login
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    console.log('Resposta do servidor:', response);

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Erro ao fazer login');
    }

    const data = await response.json();
    console.log('Dados recebidos:', data);

    if (data.token) {
      sessionStorage.setItem('token', data.token); // Armazena o token no sessionStorage
      console.log('Token armazenado:', data.token);
      window.location.href = '/index.html'; // Redireciona para a página inicial
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
