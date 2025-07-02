import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
// Needed to simulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/api/save', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Missing username or password');
  }

  const filePath = path.resolve(__dirname, 'inputs.txt');
  const entry = `Username: ${username}, Password: ${password}\n`;

  fs.appendFile(filePath, entry, (err) => {
    if (err) {
      console.error('Write error:', err);
      return res.status(500).send('Server error');
    }
    console.log('Saved:', entry.trim());
    res.send('Saved successfully');
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Welcome to the server!');
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const filePath = path.resolve(__dirname, 'inputs.txt');

  if (!fs.existsSync(filePath)) {
    return res.status(401).send('Invalid username or password');
  }

  const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n');

  // Find the user by username
  const userLine = lines.find((line) =>
    line.startsWith(`Username: ${username},`)
  );

  if (!userLine) {
    return res.status(401).send('Invalid username or password');
  }

  const hashMatch = userLine.match(/PasswordHash: (.*)$/);
  const storedHash = hashMatch?.[1];

  if (!storedHash) {
    return res.status(500).send('Malformed user data');
  }

  const match = await bcrypt.compare(password, storedHash);

  if (match) {
    res.send('Login successful');
  } else {
    res.status(401).send('Invalid username or password');
  }
});




app.post('/api/create', async (req, res) => {
  const { username, password } = req.body;
  const filePath = path.resolve(__dirname, 'inputs.txt');

  const lines = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, 'utf8').trim().split('\n')
    : [];

  // Check if the username already exists
  const usernameExists = lines.some((line) =>
    line.startsWith(`Username: ${username},`)
  );

  if (usernameExists) {
    return res.status(400).send('Username already taken');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const entry = `Username: ${username}, PasswordHash: ${hashedPassword}`;

    fs.appendFileSync(filePath, entry + '\n');
    res.send('Account created successfully');
  } catch (err) {
    console.error('Hashing error:', err);
    res.status(500).send('Server error');
  }
});

