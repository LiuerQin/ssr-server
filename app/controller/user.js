const BaseController = require('./base')
const md5 = require('md5')

const HashSalt = 'mnit39fg30f63hsd474'
const createRule = {
  email: {type: 'email'},
  nickname: {type: 'string'},
  password: {type: 'string'},
  captcha: {type: 'string'},
}

class UserController extends BaseController{
  async login() {

  }
  async register() {
    const {ctx} = this
    try {
      ctx.validate(createRule)
    } catch(e) {
      console.log(e)
      return this.error('参数校验失败', -1, e.errors)
    }

    const {email, password, captcha, nickname} = ctx.request.body

    if (captcha.toUpperCase() === this.ctx.session.captcha.toUpperCase()) {
      // 邮箱是否重复
      if (await this.checkEmail(email)) {
        this.error('邮箱重复啦')
      } else {
        const ret = await ctx.model.User.create({
          email,
          password: md5(password + HashSalt),
          nickname
        })

        if (ret._id) {
          this.message('注册成功')
        }
      }
    } else {
      this.error('验证码错误')
    }
  }
  async checkEmail (email) {
    const user = await this.ctx.model.User.findOne({email})
    return user
  }
  async verify() {
    // 校验用户名是否存在
  }
  async info() {

  }
}

module.exports = UserController