async function isPasswordLeaked(password) {
  try {
    const hash = await sha1(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5).toUpperCase();

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) throw new Error('Erro ao consultar API de senha vazada');

    const data = await response.text();
    return data.includes(suffix);
  } catch (error) {
    console.error('Erro ao verificar senha vazada:', error);
    return false;
  }
}

async function sha1(message) {
  if (!window.crypto || !crypto.subtle) {
    throw new Error('A API de criptografia não é suportada pelo navegador');
  }

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

  if (!username || !password) {
    showMessage('Por favor, preencha todos os campos.', 'error');
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

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Erro ao fazer login');
    }

    const data = await response.json();
    if (data.token) {
      sessionStorage.setItem('token', data.token);
      window.location.href = '/index.html';
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
