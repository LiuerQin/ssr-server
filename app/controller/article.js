'use strict'

const BaseController = require('./base')
const marked = require('marked')

class ArticleController extends BaseController {
  async index() {
    const {
      ctx,
    } = this
    const articles = await ctx.model.Article.find().populate('author').sort({
      createdAt: -1,
    })
    this.success(articles)
  }
  async detail() {
    const { ctx } = this
    const { id } = ctx.params

    const res = await ctx.model.Article.findOneAndUpdate({
      _id: id,
    }, { $inc: { views: 1 } }).populate('author')
    console.log(res)
    if (res._id) {
      this.success(res)
    } else {
      this.error('文章获取失败')
    }
  }
  async create() {
    const {
      ctx,
    } = this
    const {
      userid: author,
    } = ctx.state
    const {
      content,
    } = ctx.request.body
    const title = content.split('\n').find(item => item.indexOf('#') === 0)
    if (!title) {
      this.error('缺少题目，请输入以#开头的题目')
      return
    }
    const res = await ctx.model.Article.create({
      title: title.replace('# ', ''),
      article: content,
      article_html: marked(content),
      author,
      views: 0,
      like: 0,
    })
    if (res._id) {
      this.success({
        id: res.id,
        title: res.title,
      })
    } else {
      this.error('创建失败')
    }
  }
}
module.exports = ArticleController
