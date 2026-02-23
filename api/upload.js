import formidable from 'formidable';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = req.headers['x-api-key'];
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    try {
      const fd = new FormData();
      fd.append('request', fields.request[0] || fields.request);
      const file = files.fileContent[0] || files.fileContent;
      fd.append('fileContent', fs.createReadStream(file.filepath), file.originalFilename);

      const response = await fetch('https://apis.roblox.com/assets/v1/assets', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, ...fd.getHeaders() },
        body: fd
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch(e) {
      res.status(500).json({ error: e.message });
    }
  });
}
