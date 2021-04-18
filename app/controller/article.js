const BaseController = require('./base')

class ArticleController extends BaseController {
    async index() {
        const {
            ctx
        } = this
        const articles = await ctx.model.Article.find().populate('author').sort({
            createdAt: -1
        })
        this.success(articles)
    }
    async create() {
        const {
            ctx
        } = this
        const {
            userid: author
        } = ctx.state
        const {
            content,
            compiledContent
        } = ctx.request.body
        const ret = await ctx.model.Article.create({
            title: 'test',
            article: content,
            article_html: compiledContent,
            author,
            views: 0,
            like: 0
        })
        this.message('发布成功')
    }
}
module.exports = ArticleController