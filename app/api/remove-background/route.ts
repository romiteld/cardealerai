import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import fetch from 'node-fetch'
import { pipeline } from 'stream/promises'

// Initialize SAM2 model path
const SAM2_PATH = path.join(process.cwd(), 'sam2')

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir)
    }

    // Download image to temp file
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) throw new Error('Failed to fetch image')
    
    const tempImagePath = path.join(tempDir, 'input.jpg')
    const writeStream = fs.createWriteStream(tempImagePath)
    await pipeline(imageResponse.body!, writeStream)

    // Process image with SAM2
    const outputPath = path.join(tempDir, 'output.png')
    await new Promise((resolve, reject) => {
      const sam2Process = spawn('python', [
        path.join(SAM2_PATH, 'segment.py'),
        '--input', tempImagePath,
        '--output', outputPath,
        '--model', path.join(SAM2_PATH, 'sam2_b.pth'),
      ])

      sam2Process.stderr.on('data', (data) => {
        console.error(`SAM2 Error: ${data}`)
      })

      sam2Process.on('close', (code) => {
        if (code === 0) {
          resolve(null)
        } else {
          reject(new Error(`SAM2 process exited with code ${code}`))
        }
      })
    })

    // Upload processed image to Cloudinary
    const result = await cloudinary.uploader.upload(outputPath, {
      folder: 'processed-images',
    })

    // Clean up temp files
    fs.unlinkSync(tempImagePath)
    fs.unlinkSync(outputPath)

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    })
  } catch (error) {
    console.error('Background removal error:', error)
    return NextResponse.json(
      { error: 'Failed to remove background' },
      { status: 500 }
    )
  }
} 