import { Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Reminder from '../models/Reminder';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Audio directory setup
const audioDir = path.join(__dirname, '../data/audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Multer configuration
export const upload = multer({
  dest: audioDir,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio file type'));
    }
  },
});

export const processVoiceCommand = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Audio file required', text: '' });
    }

    const audioFilePath = req.file.path;
    const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

    if (!ASSEMBLYAI_API_KEY) {
      console.error('AssemblyAI API key not found');
      return res.status(500).json({ message: 'AssemblyAI API key not configured', text: '' });
    }

    // Upload to AssemblyAI
    const audioBuffer = fs.readFileSync(audioFilePath);
    const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: { authorization: ASSEMBLYAI_API_KEY },
      body: audioBuffer,
    });

    if (!uploadRes.ok) {
      throw new Error(`Upload failed: ${uploadRes.statusText}`);
    }

    const uploadData = await uploadRes.json();
    const uploadUrl = uploadData.upload_url;

    // Request transcription
    const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ audio_url: uploadUrl }),
    });

    if (!transcriptRes.ok) {
      throw new Error(`Transcript request failed: ${transcriptRes.statusText}`);
    }

    const transcript = await transcriptRes.json();

    // Poll for completion
    let status = transcript.status;
    let text = '';
    let pollCount = 0;
    const maxPolls = 30;

    while (status !== 'completed' && status !== 'error' && pollCount < maxPolls) {
      await new Promise(r => setTimeout(r, 3000));

      const checkRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcript.id}`, {
        headers: { authorization: ASSEMBLYAI_API_KEY },
      });

      if (!checkRes.ok) {
        throw new Error(`Poll failed: ${checkRes.statusText}`);
      }

      const data = await checkRes.json();
      status = data.status;
      text = data.text || '';
      pollCount++;
    }

    // Clean up audio file
    try {
      fs.unlinkSync(audioFilePath);
    } catch (err) {
      console.error('Error deleting audio file:', err);
    }

    if (status === 'error') {
      throw new Error('Transcription failed');
    }

    res.json({ text });
  } catch (error: any) {
    console.error('Error processing voice command:', error);
    res.status(500).json({ message: 'Failed to process voice command', text: '' });
  }
};

