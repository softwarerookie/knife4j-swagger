const express = require("express");
const { knife4jSetup } = require("node-knife4j");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const options = { host: "", target: "/", changeOrigin: true };

knife4jSetup(app, [
  // {
  //   name: "刘灿",
  //   url: `/api-json?host=192.168.136.50:38928&t=${Date.now()}`,
  // },
  {
    name: "knife4j-swagger",
    url: `/api-json`,
  },
]);

app.listen(2000, () => {
  console.log("服务已启动, Please visit http://localhost:2000/doc");
});

const loadPage = (req, res) => {
  if (req.method === "GET") {
    if (req.query.host) {
      try {
        options.host = req.query.host;
        options.target = `http://${req.query.host}`;
        const filePath = path.join(__dirname, "public", "doc.html"); // HTML 文件的路径
        res.setHeader("Content-Type", "text/html");
        fs.readFile(filePath, "utf8", (err, data) => {
          if (err) {
            console.error("Error reading HTML file:", err);
            return res.status(500).send("Internal Server Error");
          }
          res.send(data);
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      res.send("<html>请指定host参数!<br/>格式为：?host=ip:port</html>");
    }
  }
};

const getJSON = (req, response) => {
  if (req.method === "GET") {
    const url = `http://${options.host}/v3/api-docs`;
    const request = http.get(url, (res) => {
      let data = "";
      // 设置编码，防止中文乱码
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          // 尝试将响应数据解析为JSON对象
          const jsonData = JSON.parse(data);
          response.send(jsonData);
        } catch (error) {
          // 如果解析失败，输出原始数据
          console.log("Error parsing JSON:", error);
        }
      });
    });

    request.on("error", (e) => {
      console.log("请求目标主机出错:", e);
      response.status(500).send("Error");
    });

    request.setTimeout(30000, () => {
      console.error("请求目标主机超时！");
      response.status(504).send("504 Gateway Timeout");
    });

    request.end();
  }
};

app.use("/", (req, res, next) => {
  if (req.url.includes("/doc")) {
    loadPage(req, res);
  } else if (req.url.includes("/api-json")) {
    getJSON(req, res);
  } else {
    next();
  }
});

const proxyMiddleware = createProxyMiddleware(options);

//转发接口请求
app.use("/", proxyMiddleware);
