使用前 请先使用 npm install 来安装 node_modules
或者直接下载现成的。

LevelExp-v3 群主服同步插件

本插件服务端和客户端共同使用

使用服务端：IsParentServer: true [默认]

使用客户端 IsParentServer: false 需要设置

默认端口：5211

吧服务端放在主要的服务器

吧客户端放在次要的服务器【无数个】


客户端配置文件
WsClient: {
    Name: "S1" 修改这个是什么客户端【不建议重复】
    uuid: "xxx"  不需要修改，如果你知道的话[随机生成]
    WsURL: "ws://localhost:5211"  服务器端口。例如ws://域名:5211
}

如果要开启控制台详细信息 [默认关闭false]
ConsoleBugs: false ==> true
