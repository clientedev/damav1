const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { get, run } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'g11_jwt_super_secure_secret_2026';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido ou inválido.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sessão expirada ou token inválido. Faça login novamente.' });
  }
}

async function loginHandler(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
  }

  try {
    const user = await get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login realizado com sucesso.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erro interno ao realizar autenticação.' });
  }
}

async function meHandler(req, res) {
  try {
    const user = await get('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao obter dados do usuário.' });
  }
}

async function changePasswordHandler(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres.' });
  }

  try {
    const user = await get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);
    await run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    res.json({ message: 'Senha atualizada com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao alterar senha.' });
  }
}

module.exports = {
  authMiddleware,
  loginHandler,
  meHandler,
  changePasswordHandler,
  JWT_SECRET
};
