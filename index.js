//https://blog.csdn.net/weixin_41305441/article/details/107108429?utm_medium=distribute.pc_relevant.none-task-blog-searchFromBaidu-3.control&depth_1-utm_source=distribute.pc_relevant.none-task-blog-searchFromBaidu-3.control
// 引入scp2库
const scpClient = require("scp2");
// node模块 - node.js 命令行环境的 loading效果和显示各种状态的图标
const ora = require("ora");
// node模块 - node终端样式库
const chalk = require("chalk");
const read = require("read");
const path = require("path");
const fs = require("fs")

//1.从zeploy获取配置
const rcPath = path.resolve("zeploy.config.js");
let oldConfig = require(rcPath);
let serverZeploy =
  oldConfig[process.env.NODE_ENV === "production" ? "production" : "test"];
let server = {
  name: process.env.NODE_ENV,
  username: serverZeploy.ssh.username,
  password: serverZeploy.ssh.password,
  host: serverZeploy.ssh.host,
  path: serverZeploy.targetPath + "/" + serverZeploy.distPath
};

function upload(){
  
  console.log(chalk.green("Scp2发布模式-->请确认发布信息："));
  console.log(chalk.green("> 环境：" + server.name));
  console.log(chalk.green("> 服务器：" + server.username + "@" + server.host));
  console.log(chalk.green("> 服务器发布路径：" + server.path));
  read({
    prompt: "确定执行发布操作吗？(yes/no)"
  },
  async (err, text) => {
    const spinner = ora(
      "正在发布到" +
      (process.env.NODE_ENV === "prod" ? "生产" : "测试") +
      "服务器..."
    );
    // loading
    spinner.start();
    if (text == "yes") {
      // 执行scp2库，上传文件
      // 第一个参数：要上传到服务器的文件
      // 第二个参数：服务器配置
      // 第三个参数：上传回调函数
      scpClient.scp(
        "./dist/", {
          host: server.host,
          username: server.username,
          password: server.password,
          path: server.path
        },
        function (err) {
          spinner.stop();
          if (err) {
            console.log(chalk.red("发布失败.\n"));
            throw err;
          } else {
            console.log(
              chalk.green(
                (process.env.NODE_ENV === "production" ? "生产" : "测试") +
                "服务器部署完成！\n"
              )
            );
          }
        }
      );
    } else {
      spinner.stop();
    }
  }
);
}



upload();
// fs.exists(server.path, function (exists) {
//   console.log(exists ? "创建成功" : "创建失败");
//   // 2.从config服务器配置
//   // let server = require('./config')[(process.env.NODE_ENV === 'production' ? 'production' : 'test')];

//   if (!exists){
//     fs.mkdir(server.path, { recursive: true }, (err) => {
//       // => [Error: EPERM: operation not permitted, mkdir 'C:\']
//       if (err) throw err;
//         upload(server);
//     });
//   }else{
//     upload(server);
//   }
// });



module.exports = { upload }