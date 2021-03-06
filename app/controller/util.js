'use strict'

const svgCaptcha = require('svg-captcha')
const BaseController = require('./base')
const fse = require('fs-extra')
const path = require('path')

class UtilController extends BaseController {
  async captcha() {
    const captcha = svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 40,
      noise: 3,
    })

    this.ctx.session.captcha = captcha.text
    console.log('captcha => ', captcha.text)
    this.ctx.response.type = 'image/svg+xml'
    this.ctx.body = captcha.data
  }
  async sendcode() {
    const { ctx } = this
    const email = ctx.query.email
    const code = Math.random().toString().slice(2, 6)
    console.log(`邮箱${email}验证码-->${code}`)
    ctx.session.emailcode = code

    const subject = '小刘的ssr项目-验证码'
    const text = ''
    const html = `<h2>小刘社区</h2><p>验证码：${code}</p>`

    const hasSend = await this.service.tools.sendMail(email, subject, text, html)
    if (hasSend) {
      this.message('发送成功')
    } else {
      this.error('发送失败')
    }
  }
  async uploadfile() {
    // /public/hash/(hash+index)
    // 报错
    // if(Math.random()>0.3){
    //   return this.ctx.status = 500
    // }
    const { ctx } = this
    const file = ctx.request.files[0]
    const { hash, name } = ctx.request.body
    const chunkPath = path.resolve(this.config.UPLOAD_DIR, hash)
    if (!fse.existsSync(chunkPath)) {
      await fse.mkdir(chunkPath)
    }
    const targetDir = chunkPath + `/${name}`
    await fse.move(file.filepath, targetDir)

    this.message('文件切片上传成功')
  }
  async mergefile() {
    const { ext, hash, size } = this.ctx.request.body
    const newFilePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
    await this.ctx.service.tools.mergeFile(hash, newFilePath, size)
    this.success({
      url: `/public/${hash}.${ext}`,
    })
  }
  async checkfile() {
    const { hash, ext } = this.ctx.request.body
    // 查看文件是否存在
    const fileExist = fse.existsSync(path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`))
    if (fileExist) {
      return this.success({
        uploaded: true,
        uploadedList: [],
      })
    }
    const existDir = fse.existsSync(path.resolve(this.config.UPLOAD_DIR, hash))
    let uploadedList = []
    if (existDir) {
      uploadedList = await fse.readdir(path.resolve(this.config.UPLOAD_DIR, hash))
    }
    return this.success({
      uploaded: false,
      uploadedList,
    })


  }
}

module.exports = UtilController
