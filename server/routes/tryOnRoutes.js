import express from 'express';
import multer from 'multer';
import Replicate from 'replicate';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

/**
 * POST /api/try-on-ai
 *
 * Uses Replicate cuuupid/idm-vton — real body-aware garment try-on.
 * The Replicate JS SDK automatically uploads Blob objects to CDN, 
 * so we don't need external image hosting.
 */
router.post('/', upload.fields([
  { name: 'user_image', maxCount: 1 },
  { name: 'dress_image', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('[TryOn] ===== API HIT: POST /api/try-on-ai =====');

    const userFile  = req.files?.user_image?.[0];
    const dressFile = req.files?.dress_image?.[0];

    if (!userFile || !dressFile) {
      return res.status(400).json({
        success: false,
        error: 'Both user_image and dress_image are required.'
      });
    }

    console.log('[TryOn] user_image :', userFile.originalname, userFile.size, 'bytes');
    console.log('[TryOn] dress_image:', dressFile.originalname, dressFile.size, 'bytes');

    const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
    if (!REPLICATE_TOKEN || REPLICATE_TOKEN.trim() === 'r8_your_replicate_token_here') {
      return res.status(400).json({
        success: false,
        error: 'REPLICATE_API_TOKEN is not configured. Add it to server/.env'
      });
    }

    const replicate = new Replicate({ auth: REPLICATE_TOKEN });

    // Convert buffers to Blob objects.
    // The Replicate SDK auto-uploads Blobs to their CDN and passes the URL to the model.
    // This avoids having to use Cloudinary or any external file host.
    const humanBlob = new Blob([userFile.buffer],  { type: userFile.mimetype });
    const garmBlob  = new Blob([dressFile.buffer], { type: dressFile.mimetype });

    console.log('[TryOn] Calling cuuupid/idm-vton on Replicate...');
    console.log('[TryOn] Version: 0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985');

    // Confirmed working version hash from replicate.com/cuuupid/idm-vton
    const output = await replicate.run(
      'cuuupid/idm-vton:0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985',
      {
        input: {
          human_img:   humanBlob,
          garm_img:    garmBlob,
          garment_des: 'elegant modest long dress',
          category:    'dresses',
          is_checked:      true,
          is_checked_crop: false,
          denoise_steps:   30,
          seed:            42
        }
      }
    );

    console.log('[TryOn] Raw Replicate output:', output);

    // output is a URL string or array of URL strings
    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (!imageUrl) {
      throw new Error('Replicate returned no output image URL.');
    }

    // Fetch the output image and return as base64 to the frontend
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) {
      throw new Error(`Failed to download output image (${imgResponse.status}): ${imageUrl}`);
    }
    const arrayBuffer = await imgResponse.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);
    const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

    console.log('[TryOn] ✅ Success — image size:', buffer.length, 'bytes');
    return res.json({ success: true, image: base64Image });

  } catch (err) {
    // Log full error details for debugging
    console.error('[TryOn] ❌ Error message :', err.message);
    console.error('[TryOn] ❌ Error stack   :', err.stack);
    if (err.response) {
      console.error('[TryOn] ❌ HTTP status  :', err.response.status);
      console.error('[TryOn] ❌ HTTP body    :', JSON.stringify(err.response.data));
    }

    return res.status(500).json({
      success: false,
      error: err.message || 'Virtual try-on failed. Check server logs.'
    });
  }
});

export default router;
