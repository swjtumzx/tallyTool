/**
 * tallytool-express 主入口文件
 * 这是一个基于Express的Web服务器，提供计数器API和微信小程序接口
 */

const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { init: initDB, Counter } = require('./db');

const logger = morgan('tiny');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

/**
 * 首页路由
 * 返回静态HTML页面
 */
app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * 更新计数API
 * POST请求，根据action参数执行不同操作：
 * - inc: 创建一条新记录，增加计数
 * - clear: 清空所有记录，重置计数
 * 返回当前计数值
 */
app.post('/api/count', async (req, res) => {
  const { action } = req.body;
  if (action === 'inc') {
    /**
     * 创建一条新记录，默认count值为1
     */
    await Counter.create();
  } else if (action === 'clear') {
    /**
     * 清空Counter表中的所有记录
     */
    await Counter.destroy({
      truncate: true,
    });
  }
  /**
   * 返回操作后的总计数（即表中记录的总数）
   */
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

/**
 * 获取计数API
 * GET请求，返回当前计数值
 */
app.get('/api/count', async (req, res) => {
  /**
   * 查询Counter表中的记录总数
   */
  const result = await Counter.count();
  /**
   * 返回计数结果
   */
  res.send({
    code: 0,
    data: result,
  });
});

/**
 * 微信小程序OpenID获取API
 * 从请求头中获取微信小程序用户的OpenID
 * 仅在微信云托管环境中有效
 */
app.get('/api/wx_openid', async (req, res) => {
  if (req.headers['x-wx-source']) {
    /**
     * 当请求来自微信环境时，返回用户的OpenID
     */
    res.send(req.headers['x-wx-openid']);
  }
});

const port = process.env.PORT || 80;

/**
 * 启动函数
 * 初始化数据库并启动Web服务器
 */
async function bootstrap() {
  /**
   * 初始化数据库，确保表结构正确
   */
  await initDB();
  /**
   * 启动Web服务器
   */
  app.listen(port, () => {
    console.log('启动成功', port);
  });
}

/**
 * 执行启动函数
 */
bootstrap();
