'use strict'

const { Service } = require('egg')
const nodemailer = require('nodemailer')
const path = require('path')
const fse = require('fs-extra')

const userEmail = 'liuqin20132017@126.com'
const transporter = nodemailer.createTransport({
  service: '126',
  secureConnection: true,
  auth: {
    user: userEmail,
    pass: 'GFJXWETRKLCUTUPK',
  },
})

class ToolService extends Service {
  async sendMail(email, subject, text, html) {
    const mailOptions = {
      from: userEmail,
      cc: userEmail, // 抄送
      to: email,
      subject,
      text,
      html,
    }
    try {
      await transporter.sendMail(mailOptions)
      return true
    } catch (err) {
      console.log('email error --->', err)
      return false
    }
  }
  async mergeFile(hash, newFilePath, size) {
    const chunkDir = path.resolve(this.config.UPLOAD_DIR, hash)
    let chunks = await fse.readdir(chunkDir)
    chunks.sort((a, b) => a.split('-')[1] - b.split('-')[1])
    chunks = chunks.map(chunk => {
      return path.resolve(chunkDir, chunk)
    })
    await this.mergeChunks(chunks, newFilePath, size)
  }
  async mergeChunks(chunks, newFilePath, size) {
    const pipeStream = (chunkPath, writeStream) => {
      return new Promise(resolve => {
        const reader = fse.createReadStream(chunkPath)
        reader.on('end', () => {
          fse.unlinkSync(chunkPath)
          resolve()
        })
        reader.pipe(writeStream)
      })
    }
    await Promise.all(
      chunks.map((chunkPath, index) => {
        return pipeStream(chunkPath, fse.createWriteStream(newFilePath, {
          start: index * size,
          end: (index + 1) * size,
        }))
      })
    )
  }
}

module.exports = ToolService
