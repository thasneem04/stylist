import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/analyze-skin', async (req, res) => {
  try {
    // Forward the file/body to Python
    // For simplicity with multipart, we could just redirect or pipe, 
    // but here we expect the frontend might send data that we forward.
    // However, in a real scenario, Node handles the file upload then sends to Python.
    res.status(501).json({ message: "Proxying to Python AI. Please call Python API directly for this demo or configure Multer." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
