import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  const { file } = req.query;
  
  if (!file) {
    return res.status(400).json({ error: 'No file specified' });
  }

  // file viene como "/music/nombre.mp3"
  // Necesitamos buscar en ../backend/public/music/nombre.mp3
  const audioPath = path.join(process.cwd(), '..', 'backend', 'public', file);
  
  if (!fs.existsSync(audioPath)) {
    return res.status(404).json({ error: 'File not found', path: audioPath });
  }

  const stat = fs.statSync(audioPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(audioPath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/mpeg',
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
    });
    fs.createReadStream(audioPath).pipe(res);
  }
}