const express = require('express');
const { writeFile } = require('fs');
const crypto = require('crypto');
const r = require('rethinkdbdash')({ db: 'imgen' });

/* Express Middleware */
const upload = require('multer')();

/* Routers/Handlers */
const app = express();

/* Config */
const currDir = __dirname;
const port = 80;

const supportedFormats = ['png', 'bmp', 'webp', 'gif', 'jpg', 'jpeg'];
const defaultFormat = 'png';

app.use('/*', express.static('i'));

app.post('/upload', upload.any(), async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const auth = req.header.authorization || '';
  const keyExists = await r.table('keys').get(auth).coerceTo('bool');

  if (!keyExists) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const originalFormat = req.files[0].originalname.split('.').pop() || defaultFormat;

  if (!supportedFormats.includes(originalFormat)) {
    return res.status(400).json({ error: 'Unsupported file format' });
  }

  const fileName = `${crypto.randomBytes(5).toString('hex')  }.${  originalFormat}`;

  writeFile(`${currDir}/i/${fileName}`, req.files[0].buffer, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Internal error occurred while writing the image data' });
    }

    res.json({ filename });
  });
});

app.use((_, res, __) => {
  res.status(404).json({ error: 'Resource not found' });
});

app.listen(port, () => {
  console.log('Express Image-Server online');
});

/**
 * TODO:
 *   • 1 hour file sweeping
 */
