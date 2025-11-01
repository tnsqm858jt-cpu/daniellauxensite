import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { readData, writeData } from './storage.js';

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'storylab-secret';

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH']
  }
});

const onlineUsers = new Map();

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

function issueToken(user) {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token ausente' });
  }
  const [, token] = authHeader.split(' ');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = readData('users');
    const current = users.find((u) => u.id === decoded.sub);
    if (!current) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    req.user = current;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

function syncFriends(newUser) {
  const users = readData('users');
  const nextUsers = users.map((user) => {
    if (user.id === newUser.id) {
      return newUser;
    }
    const friends = new Set(user.friends || []);
    friends.add(newUser.id);
    return { ...user, friends: Array.from(friends) };
  });
  const updatedNewUser = {
    ...newUser,
    friends: nextUsers.filter((user) => user.id !== newUser.id).map((user) => user.id)
  };
  const finalUsers = nextUsers.map((user) => (user.id === updatedNewUser.id ? updatedNewUser : user));
  writeData('users', finalUsers);
  return updatedNewUser;
}

app.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Preencha todos os campos' });
  }
  const users = readData('users');
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ message: 'E-mail já cadastrado' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: uuid(),
    email,
    name,
    passwordHash,
    avatarUrl: '',
    bio: '',
    theme: {
      primaryColor: '#c3201f',
      mode: 'light',
      background: 'paper',
      fontFamily: 'Times New Roman',
      widgets: {
        recentFocos: true,
        metasStatus: true,
        friends: true,
        timeline: false,
        goalsChart: false,
        achievements: false,
        readingClock: false,
        importQueue: false
      }
    },
    friends: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  users.push(user);
  writeData('users', users);
  const syncedUser = syncFriends(user);
  const token = issueToken(syncedUser);
  res.json({ token, user: publicUser(syncedUser) });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Credenciais ausentes' });
  }
  const users = readData('users');
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Usuário não encontrado' });
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: 'Senha inválida' });
  }
  const token = issueToken(user);
  res.json({ token, user: publicUser(user) });
});

app.post('/auth/google', (req, res) => {
  const { email, name, avatarUrl } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'E-mail do Google é obrigatório' });
  }
  const users = readData('users');
  let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id: uuid(),
      email,
      name: name || email.split('@')[0],
      passwordHash: '',
      avatarUrl: avatarUrl || '',
      bio: '',
      theme: {
        primaryColor: '#c3201f',
        mode: 'light',
        background: 'paper',
        fontFamily: 'Times New Roman',
        widgets: {
          recentFocos: true,
          metasStatus: true,
          friends: true,
          timeline: false,
          goalsChart: false,
          achievements: false,
          readingClock: false,
          importQueue: false
        }
      },
      friends: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(user);
    writeData('users', users);
    user = syncFriends(user);
  }
  const token = issueToken(user);
  res.json({ token, user: publicUser(user) });
});

app.get('/auth/me', authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.put('/profile', authenticate, (req, res) => {
  const users = readData('users');
  const index = users.findIndex((u) => u.id === req.user.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }
  const { name, avatarUrl, bio, theme } = req.body;
  const updated = {
    ...users[index],
    name: name ?? users[index].name,
    avatarUrl: avatarUrl ?? users[index].avatarUrl,
    bio: bio ?? users[index].bio,
    theme: theme ? { ...users[index].theme, ...theme } : users[index].theme,
    updatedAt: new Date().toISOString()
  };
  users[index] = updated;
  writeData('users', users);
  res.json({ user: publicUser(updated) });
});

app.get('/users', authenticate, (req, res) => {
  const users = readData('users').map(publicUser);
  res.json({ users });
});

function calculateReadingTime(content) {
  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordsPerMinute = 238;
  return Math.max(1, Math.ceil(words.length / wordsPerMinute));
}

function extractReadableText(body, attachments = []) {
  const base = body || '';
  const extras = (attachments || [])
    .filter((attachment) => {
      if (!attachment) return false;
      if (attachment.type === 'text') return true;
      if (attachment.mimeType && attachment.mimeType.startsWith('text/')) return true;
      return false;
    })
    .map((attachment) => attachment.content || '');
  return [base, ...extras].join('\n');
}

function focusPublic(focus, userId) {
  const ratings = focus.ratings || [];
  const ratingSummary = ratings.length
    ? ratings.reduce((acc, rating) => {
        acc.total += rating.value;
        acc.count += 1;
        return acc;
      }, { total: 0, count: 0 })
    : { total: 0, count: 0 };
  const average = ratingSummary.count ? ratingSummary.total / ratingSummary.count : 0;
  return {
    ...focus,
    canEdit: focus.createdBy === userId,
    ratingSummary: {
      average,
      count: ratingSummary.count
    },
    ratings: undefined
  };
}

app.get('/focos', authenticate, (req, res) => {
  const { board, status, category, subcategory, allowReviews, allowResenha } = req.query;
  const focos = readData('focos').filter((focus) => {
    if (board && focus.board !== board) return false;
    if (status && focus.status !== status) return false;
    if (category && focus.category !== category) return false;
    if (subcategory && !focus.subcategories.includes(subcategory)) return false;
    if (allowReviews !== undefined) {
      const allow = allowReviews === 'true';
      if (focus.allowReviews !== allow) return false;
    }
    if (allowResenha !== undefined) {
      const allow = allowResenha === 'true';
      if (focus.allowResenha !== allow) return false;
    }
    return true;
  });
  res.json({ focos: focos.map((focus) => focusPublic(focus, req.user.id)) });
});

app.post('/focos', authenticate, (req, res) => {
  const focos = readData('focos');
  const {
    title,
    board,
    category,
    subcategories = [],
    status = 'in-progress',
    allowComments = false,
    allowReviews = false,
    allowResenha = false,
    requestRating = false,
    body = '',
    attachments = [],
    coverImage = ''
  } = req.body;
  if (!title || !board) {
    return res.status(400).json({ message: 'Título e aba são obrigatórios' });
  }
  const now = new Date().toISOString();
  const focus = {
    id: uuid(),
    createdBy: req.user.id,
    title,
    board,
    category: category || '',
    subcategories,
    status,
    allowComments,
    allowReviews,
    allowResenha,
    requestRating,
    body,
    attachments,
    coverImage,
    readingTimeMinutes:
      status === 'completed' ? calculateReadingTime(extractReadableText(body, attachments)) : null,
    ratings: [],
    createdAt: now,
    updatedAt: now
  };
  focos.push(focus);
  writeData('focos', focos);
  res.status(201).json({ focus: focusPublic(focus, req.user.id) });
});

app.put('/focos/:id', authenticate, (req, res) => {
  const focos = readData('focos');
  const index = focos.findIndex((focus) => focus.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Foco não encontrado' });
  }
  if (focos[index].createdBy !== req.user.id) {
    return res.status(403).json({ message: 'Você não pode editar este foco' });
  }
  const updated = { ...focos[index], ...req.body };
  if (updated.status === 'completed') {
    const textContent = extractReadableText(
      updated.body || focos[index].body,
      updated.attachments || focos[index].attachments
    );
    updated.readingTimeMinutes = calculateReadingTime(textContent);
  } else {
    updated.readingTimeMinutes = null;
  }
  updated.updatedAt = new Date().toISOString();
  focos[index] = updated;
  writeData('focos', focos);
  res.json({ focus: focusPublic(updated, req.user.id) });
});

app.post('/focos/:id/rating', authenticate, (req, res) => {
  const focos = readData('focos');
  const index = focos.findIndex((focus) => focus.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Foco não encontrado' });
  }
  const focus = focos[index];
  if (!focus.requestRating) {
    return res.status(403).json({ message: 'O autor não está aceitando avaliações' });
  }
  if (focus.createdBy === req.user.id) {
    return res.status(400).json({ message: 'Autores não podem avaliar o próprio foco' });
  }
  const { value, note } = req.body;
  if (!value || value < 1 || value > 5) {
    return res.status(400).json({ message: 'Avaliação inválida' });
  }
  const existing = focus.ratings.find((rating) => rating.userId === req.user.id);
  if (existing) {
    existing.value = value;
    existing.note = note || '';
    existing.updatedAt = new Date().toISOString();
  } else {
    focus.ratings.push({
      id: uuid(),
      userId: req.user.id,
      value,
      note: note || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  focos[index] = focus;
  writeData('focos', focos);
  res.json({ focus: focusPublic(focus, req.user.id) });
});

app.get('/metas', authenticate, (req, res) => {
  const metas = readData('metas');
  res.json({ metas: metas.map((meta) => ({
    ...meta,
    canEdit: meta.participants.includes(req.user.id)
  })) });
});

app.post('/metas', authenticate, (req, res) => {
  const metas = readData('metas');
  const {
    title,
    description = '',
    category = '',
    subcategories = [],
    dueDate = null,
    isJoint = false,
    checklist = []
  } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Título é obrigatório' });
  }
  const participants = isJoint ? Array.from(new Set([req.user.id, ...(req.body.participants || [])])) : [req.user.id];
  const now = new Date().toISOString();
  const meta = {
    id: uuid(),
    title,
    description,
    category,
    subcategories,
    dueDate,
    isJoint,
    checklist: checklist.map((item) => ({
      id: item.id || uuid(),
      text: item.text,
      completed: Boolean(item.completed)
    })),
    participants,
    createdBy: req.user.id,
    status: 'in-progress',
    createdAt: now,
    updatedAt: now
  };
  metas.push(meta);
  writeData('metas', metas);
  res.status(201).json({ meta: { ...meta, canEdit: true } });
});

app.put('/metas/:id', authenticate, (req, res) => {
  const metas = readData('metas');
  const index = metas.findIndex((meta) => meta.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Meta não encontrada' });
  }
  const meta = metas[index];
  if (!meta.participants.includes(req.user.id)) {
    return res.status(403).json({ message: 'Você não pode editar esta meta' });
  }
  const updatedChecklist = (req.body.checklist || meta.checklist).map((item) => ({
    id: item.id || uuid(),
    text: item.text,
    completed: Boolean(item.completed)
  }));
  const updated = {
    ...meta,
    ...req.body,
    checklist: updatedChecklist,
    participants: req.body.participants ? Array.from(new Set(req.body.participants)) : meta.participants,
    status: updatedChecklist.every((item) => item.completed) ? 'completed' : 'in-progress',
    updatedAt: new Date().toISOString()
  };
  metas[index] = updated;
  writeData('metas', metas);
  res.json({ meta: { ...updated, canEdit: true } });
});

app.get('/presence/online', authenticate, (req, res) => {
  const users = readData('users');
  const list = Array.from(onlineUsers.entries()).map(([userId, socketId]) => {
    const user = users.find((u) => u.id === userId);
    return user ? publicUser(user) : null;
  }).filter(Boolean);
  res.json({ users: list });
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Token ausente'));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.sub;
    next();
  } catch (error) {
    next(new Error('Token inválido'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  onlineUsers.set(userId, socket.id);
  emitPresence();

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    emitPresence();
  });
});

function emitPresence() {
  const users = readData('users');
  const payload = Array.from(onlineUsers.keys())
    .map((userId) => users.find((u) => u.id === userId))
    .filter(Boolean)
    .map(publicUser);
  io.emit('presence:update', payload);
}

httpServer.listen(PORT, () => {
  console.log(`Servidor StoryLab rodando na porta ${PORT}`);
});
