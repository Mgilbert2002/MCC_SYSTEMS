import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadDir = path.join(__dirname, 'uploads')

// Create uploads directory if it does not exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },

  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1E9)

    cb(
      null,
      'profile-' +
        uniqueSuffix +
        path.extname(file.originalname)
    )
  }
})

const upload = multer({
  storage,

  limits: {
    fileSize: 500 * 1024
  },

  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/

    const ext = allowed.test(
      path.extname(file.originalname).toLowerCase()
    )

    const mime = allowed.test(file.mimetype)

    if (ext && mime) {
      return cb(null, true)
    }

    cb(new Error('Only image files are allowed'))
  }
})

export default upload