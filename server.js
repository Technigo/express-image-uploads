import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import cloudinary from 'cloudinary'
import multer from 'multer'
import cloudinaryStorage from 'multer-storage-cloudinary'
import mongoose from 'mongoose'

dotenv.config()

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/imageUploadsCodealong"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const Pet = mongoose.model('Pet', {
  name: String,
  imageUrl: String,
  imageId: String
})

cloudinary.config({
  cloud_name: 'dpem2z8y9',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'pets',
  allowedFormats: ["jpg", "png"],
  transformation: [{ width: 500, height: 500, crop: "limit" }]
})
const parser = multer({ storage: storage, onError: (err) => { console.error('caught error', err) } })
const port = process.env.PORT || 8080
const app = express()

app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello world')
})

app.post('/pets', parser.single('image'), async (req, res) => {
  console.log(req)
  try {
    const pet = await new Pet({ name: req.body.name, imageUrl: req.file.url, imageId: req.file.public_id }).save()
    res.json(pet)
  } catch (err) {
    res.status(400).json({ errors: err.errors })
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
