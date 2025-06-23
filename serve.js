const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;
const server = http.createServer((req, res) => {
    // 获取请求的文件路径
    let filePath = '.' + req.url;
    
    // 如果URL是'/'，则返回index.html
    if (filePath === './') {
        filePath = './index.html';
    }
    
    // 获取文件扩展名
    const extname = path.extname(filePath);
    
    // 默认内容类型
    let contentType = 'text/html';
    
    // 根据扩展名设置内容类型
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
    }
    
    // 读取文件
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // 文件不存在
                fs.readFile('./404.html', (error, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                // 服务器错误
                res.writeHead(500);
                res.end(`服务器错误: ${error.code}`);
            }
        } else {
            // 成功响应
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// 启动服务器
server.listen(port, () => {
    console.log(`服务器运行于 http://localhost:${port}/`);
});

// 如果是Windows系统，创建一个简单的404页面
if (!fs.existsSync('./404.html')) {
    const html404 = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>404 - 页面未找到</title>
        <style>
            body {
                background-color: #000;
                color: #00ff00;
                font-family: 'Courier New', monospace;
                text-align: center;
                padding-top: 50px;
            }
            h1 {
                font-size: 3em;
            }
            p {
                font-size: 1.2em;
            }
            a {
                color: #00ff00;
                text-decoration: none;
                border-bottom: 1px solid #00ff00;
            }
            a:hover {
                border-bottom: 2px solid #00ff00;
            }
        </style>
    </head>
    <body>
        <h1>404 - 页面未找到</h1>
        <p>你进入了未知领域...</p>
        <p><a href="/">返回主页</a></p>
    </body>
    </html>
    `;
    fs.writeFileSync('./404.html', html404);
} 