/*
#    ╔════════════════════════════════════════════════════════════════════╗
#    ║▓▓██▓▓▓▓▓▓▓▓▓██▓▓▓▓▓███▓▓▓▓▓▓███████▓▓▓▓▓███████▓▓▓▓▓██▓▓▓▓██████▓▓▓║
#    ║▓▓████▓▓▓▓▓████▓▓▓██▓▓▓██▓▓▓▓▓█▓▓▓▓██▓▓▓▓▓█▓▓▓▓██▓▓▓▓▓▓▓▓▓▓██▓▓▓▓▓▓▓║
#    ║▓▓██▓▓█████▓▓██▓▓▓███████▓▓▓▓▓█▓▓▓▓██▓▓▓▓▓█▓▓▓▓██▓▓▓▓██▓▓▓▓██████▓▓▓║
#    ║▓▓██▓▓▓███▓▓▓██▓▓▓██▓▓▓██▓▓▓▓▓█▓▓▓▓██▓▓▓▓▓█▓▓▓▓██▓▓▓▓██▓▓▓▓██▓▓▓▓▓▓▓║
#    ║▓▓██▓▓▓▓▓▓▓▓▓██▓▓▓██▓▓▓██▓▓▓▓███████▓▓▓▓▓███████▓▓▓▓▓██▓▓▓▓██████▓▓▓║
#    ╚════════════════════════════════════════════════════════════════════╝
/**/
/*次数*/
let Number = 0;

/*// 存储所有连接的客户端*/
let Client = new Set();

/*插件名称*/
const PLUGIN_Name = "LevelServer";

/*插件版本*/
const PLUGIN_Version = [1, 1, 0];

/*插件作者*/
const PLUGIN_Author = "MineFeng";

/*WS连接*/
const WebSocket = require("ws");

/*Tell显示*/
const Wss_Tell = "[WSS] ";	/*服务端*/

/*Tell显示*/
const Wsc_Tell = "[WSC] ";	/*客户端*/

/*插件介绍*/
const PLUGIN_Introduce = "等级系统同步插件";

/*文件路径*/
const _filePath = `.\\plugins\\${PLUGIN_Name}\\MainData\\`; /*文件配置所在位置*/

/*托管地址*/
const Git_hub = "https://www.github.com/MC-MineFeng/LevelServer/"; /*托管网站*/

/*插件注册*/
ll.registerPlugin(/*插件名字*/PLUGIN_Name, /*介绍*/PLUGIN_Introduce, /*版本*/PLUGIN_Version, /*信息*/{"Github": Git_hub})

/*查询存在*/
let isLevel = ll.listPlugins().includes("LevelExp");

if (!isLevel) {

logger.warn("未检测到前置插件 LevelExp 等级系统v3 ");

logger.warn("请前往 https://www.minebbs.com/resources/levelexp-papi.7027/ ");

return false; //mc.runcmd("stop"); //关闭服务器

}

// 引入 API
let getInfo = ll.import("LevelExp", "LevelExp_getPlayData");

let onUpdate = ll.import("LevelExp", "LevelExp_onUpdate");

//生成ID函数length=长度
function randID(length = 8) {
		var res = '';
		let mcc = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
		mcc += ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
		mcc += ['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
		for (let i = 0; i < length; i++) res += mcc[Math.round(Math.random() * (mcc.length - 1))];
		return res.replace(/,/g, '');
	}

/**预释放文件*/
const Config_init = {
		/* 配置文件 */
		"Config": {
			/*服务端和客户端开关 */
			/*[ true   =  启动服务端]*/
			/*[ false  =  启动客户端]*/
			IsParentServer: true,				// 模式[ true = 服务端 / false = 客户端]
			LoggerConsole: false,				// 控制台显示[常规显示]建议关闭 = false
			SetInterval: true,					// 自动同步和刷新数据【客户端】
			WsClientTime: 60,					// 刷新时间（秒）60S
			/*服务端*/
			Websocket: {
				Uuid: 8888,						// 服务端UUID 【服务端】
				Name: "Main",					// 主服务器名称【服务端】
				Port: 5211,						// 服务端端口  【服务端】
			},
			/*客户端*/
			WsClient: {
				Uuid: randID(),					// 服务端UUID【客户端】随机
				Name: "S1",						// 连接名称，例如【s1, s2, s3】【客户端】
				WsURL: "ws://localhost:5211",	// WebSocket连接URL 【客户端】例如：ws://域名:5211
			},
		}
	}

/*配置*/
const Conf = data.openConfig(_filePath + "Config.json", "json", data.toJson(Config_init.Config));

// LevelClient //LevelServer
mc.listen("onServerStarted", () => {
		logger.info("§b如有bug请加QQ反馈：§f1455278082");
		let allow = undefined; /*没啥用但是不要删*/
		// 启动时设置 WebSocket 连接
		let wsc = new WSClient();
		if (Conf.get("IsParentServer") == true) {
			logger.info(Wss_Tell + `§d服务端 §b模式 端口：§d ${Conf.get("Websocket").Port}`);
			// 创建一个 WebSocket 服务器
			let wss = new WebSocket.Server({ port: Conf.get("Websocket").Port });
			/*Server*/initWSServer(wss); /*服务端*/
		}
		if (Conf.get("IsParentServer") == false) {
			logger.info(Wsc_Tell + `§d客户端 §b模式 IP地址：§e ${Conf.get("WsClient").WsURL}`);
			/*Client*/initWSClient(wsc); //客户端
		}

		// 发送消息给所有连接的客户端
		function sendWsAllMessage(message, sender) {
			if (Conf.get("LoggerConsole")) logger.info(Wss_Tell + `正在发送 ${message}`);
			Client.forEach(conn => { if (conn !== sender) { conn.send(message); }});
		}

		// 实时更新玩家数据
		function onUpdateTime(pl) {
			if (Conf.get("SetInterval") == false) return
			let tm = setInterval(function () {
				if (pl.inWorld == 1) { //在不在世界中
					mc.getOnlinePlayers().forEach(pl => {
						//检查是否是NPC
						if (pl.isSimulatedPlayer() || !pl) return;
						//客户端同步
						if (Conf.get("IsParentServer") == false) return isDataLive(pl, "sync");
						//服务端数据同步到其他客户端
						if (Conf.get("IsParentServer") == true) {
						let sendData = getPlayList(pl.xuid, Conf.get("Websocket").Name);
						return sendWsAllMessage(JSON.stringify(sendData), allow);
						}
					});
				}else{ //不在世界中取消同步
					return clearInterval(tm);
				}
			}, Conf.get("WsClientTime") * 1000); //速度
		}

		/*玩家数据处理*/
		function getPlayList(plxuid, cname) {
			if (plxuid == null) return
			// 给其他节点发送数据
			let dat = getInfo(plxuid);
			let Na = dat["Name"], time = dat["Time"];
			let level = dat["Level"], exp = dat["Exp"], point = dat["Points"], luck = dat["Luck"];
			let health = dat["Health"], attack = dat["Attack"], defence = dat["DeFence"];
			var sendData = {
				type: "Update",
				name: cname,
				xuid: plxuid,
				data: [ level, exp, point, health, attack, defence, luck ]
			}
			return sendData;
		}

		/*写这里来了*/
		function isDataLive(pl, type) {
			if (pl == null && type == null) return
			if (type == "apply") {
				//发送更新申请信息
				let sendData = { 
					type: "isData", /*申请类型*/
					name: Conf.get("WsClient").Name, /*那个客户端在申请*/
					xuid: pl.xuid, /*申请人xuid*/
				};
				wsc.send(JSON.stringify(sendData));
				if (Conf.get("LoggerConsole")) logger.info(Wsc_Tell + "§e玩家 "+pl.realName+" 正在申请数据，等待从主服同步！"); //info
				if (Conf.get("LoggerConsole")) logger.info(Wsc_Tell + "已发送数据: "+ JSON.stringify(sendData) +" !");
			}
			if (type == "sync") {
				let sendData = getPlayList(pl.xuid, Conf.get("WsClient").Name);
				wsc.send(JSON.stringify(sendData));
				if (Conf.get("LoggerConsole")) logger.info(Wsc_Tell + "同步玩家 "+pl.realName+" 数据给主服 "+ JSON.stringify(sendData) +" !");
			}
		}

		//服务端
		function initWSServer(wss) {
			/*当有客户端连接时触发的事件处理函数*/
			wss.on('connection', (ws, res) => {
				/*接收客户端发来的消息*/
				ws.on('message', (message) => {
					try { //const msg = JSON.parse(message);
						let maddie = message.toString();
						const msg = JSON.parse(maddie);
						if (Conf.get("LoggerConsole")) logger.info(`接收到客户端 [${msg.name}] 的数据 !!!`);

						//认证
						if (msg.type === 'Auth') {
							Client.add(ws); /*存储已连接的客户端*/
							let Auth = {
								type: "Auth", /*信息*/
								atuu: msg.uuid, /*返回uuid*/
								uuid: Conf.get("Websocket").Uuid, /*让客户端知道你的服务端UUID*/
								name: Conf.get("Websocket").Name, /*让客户端知道连接的是谁*/
							};
							sendWsAllMessage(JSON.stringify(Auth), allow); //给全部客户端发送消息
							logger.info(Wss_Tell + `§e客户端§d [${msg.name}] §a已连接 §f| §eUUID:§d ${msg.uuid}`);
						}

						//申请数据并且转发
						if (msg.type === "isData") {
							/*获取玩家名*/let plname = data.xuid2name(msg.xuid);
							if (plname == null || plname == "") {
								let sendData = getPlayList(msg.xuid, Conf.get("Websocket").Name);
								sendWsAllMessage(JSON.stringify(sendData), allow); //给全部客户端发送消息
								if (Conf.get("LoggerConsole")) logger.info(Wss_Tell + "收到 ["+ msg.xuid +"] 申请同步信息, 已发送 "+ JSON.stringify(sendData) +" !"); //info
							}else{
								let sendData = getPlayList(msg.xuid, Conf.get("Websocket").Name);
								sendWsAllMessage(JSON.stringify(sendData), allow); //给全部客户端发送消息
								if (Conf.get("LoggerConsole")) logger.info(Wss_Tell + "收到 ["+ plname +"] 申请同步信息, 已发送 "+ JSON.stringify(sendData) +" !"); //info
							}
						}

						//更新数据并且执行
						if (msg.type === "Update") {
							/*获取玩家名*/let plname = data.xuid2name(msg.xuid);
							if (plname == null || plname == "") {
								let sendData = msg.data; //玩家数据
								if (onUpdate(msg.xuid, sendData)); //最新玩家数据
								if (Conf.get("LoggerConsole")) logger.info(Wss_Tell + "收到 ["+ msg.xuid +"] 在 ["+msg.name+"] 更新数据 "+ msg.data); //info
							}else{
								let sendData = msg.data; //玩家数据
								if (onUpdate(msg.xuid, sendData)); //最新玩家数据
								if (Conf.get("LoggerConsole")) logger.info(Wss_Tell + "收到 ["+ plname +"] 在 ["+ msg.name +"] 更新数据 "+ msg.data); //info
							}
						}
					} catch (error) {
						console.error(Wss_Tell + '§c处理信息时出错:', error);
					}
					/*当连接关闭时触发*/
					ws.on('close', () => { //关闭触发
						Client.delete(ws); /*删除客户端记录*/
					});
				});
			});
		}

		//客户端
		function initWSClient(wsc) {
			logger.info(Wsc_Tell + "§e正在连接到服务器");
			let iscosu = wsc.connect(Conf.get("WsClient").WsURL);
			if (iscosu) { /*给主机发送你是谁*/
				/*bugs*/
				if (Conf.get("LoggerConsole")) logger.info(Wsc_Tell + "正在发送认证...");
				let AuthMsg = {
					type: "Auth", /*信息*/
					uuid: Conf.get("WsClient").Uuid,
					name: Conf.get("WsClient").Name,
				};
				wsc.send(JSON.stringify(AuthMsg));
				/////////logger.info(Wsc_Tell + "§a连接成功...");
			} else {
				/*bugs*/
				if (Conf.get("LoggerConsole")) logger.info(Wsc_Tell + "§c连接失败, 可能是网络异常 !");
				logger.info(Wsc_Tell + "§c连接失败 !"); /*没有什么开关，不然你都不知道，连不连成功都不知道*/
				wsc.close(); /*断开*/
			}

			//收到文本消息
			wsc.listen("onTextReceived", (message) => {
				/*bugs*/
				if (Conf.get("LoggerConsole")) logger.info(Wsc_Tell + "收到数据：" + message);
				let maddie = message.toString();
				const msg = JSON.parse(maddie);

				//客户端信息
				if (msg.type === 'Auth') {
					if (msg.atuu == Conf.get("WsClient").Uuid) {
					logger.info(Wsc_Tell + `§a已连接到服务端 §d[${msg.name}] §f| §eUUID:§d ${msg.uuid}`);
					}
				}

				//更新查询
				if (msg.type === "Update") {
					/*获取玩家名*/let plname = data.xuid2name(msg.xuid);
					if (plname == null || plname == "") { //不存在
						let sendData = msg.data;//玩家数据
						if (Conf.get("LoggerConsole")) logger.info(Wsc_Tell + "收到 ["+ msg.xuid +"] 在 ["+msg.name+"] 更新信息 "+ msg.data); //info
						if (onUpdate(msg.xuid, sendData)); //最新玩家数据
					}else{
						let sendData = msg.data; //玩家数据
						if (Conf.get("LoggerConsole")) logger.info(Wsc_Tell + "收到 ["+ plname +"] 在 ["+ msg.name +"] 更新信息 "+ msg.data); //info
						if (onUpdate(msg.xuid, sendData)); //最新玩家数据
					}
				}
			});

			//连接丢失
			wsc.listen("onLostConnection", (code) => {
				//if (Conf.get("LoggerConsole")) return 
				logger.error(Wsc_Tell + `§c连接已丢失 | 错误码: ${code} `);
				wsc.close(); /*断开*/
			});

			//连接错误
			wsc.listen("onError", () => {
				//if (Conf.get("LoggerConsole")) return 
				logger.error(Wsc_Tell + "§c断线了");
				wsc.close(); /*断开*/
			});
		}

		// 玩家进服监听
		mc.listen("onJoin", (pl) => {
			if (pl == null) return //玩家为空
			try { //查询是否为模拟玩家
				if (pl.isSimulatedPlayer()) return;
				//客户端
				if (Conf.get("IsParentServer") == false) {
					isDataLive(pl, "apply"); /*从主服申请玩家数据**/
					onUpdateTime(pl); /*实时更新*/
				}
			} catch (error) {
				logger.warn('§c处理数据时出错:', error);
			}
		});

		// 玩家退服监听
		mc.listen("onLeft", (pl) => {
			if (pl == null) return //玩家为空
			try { //查询是否为模拟玩家
				if (pl.isSimulatedPlayer()) return;

				//客户端
				if (Conf.get("IsParentServer") == false) {
					/**/isDataLive(pl, "sync"); /**同步退出的玩家数据*/
					if (Conf.get("LoggerConsole")) logger.info(Wsc_Tell + "已发送玩家 "+pl.realName+" 同步数据给主服务器 !");
				}

				//服务端
				if (Conf.get("IsParentServer") == true) {
					if (Conf.get("LoggerConsole")) logger.info(Wsc_Tell + "已发送玩家 "+pl.realName+" 的数据给所有客户端 !");
					let sendData = getPlayList(pl.xuid, Conf.get("Websocket").Name);
					sendWsAllMessage(JSON.stringify(sendData), allow);
					if (Conf.get("LoggerConsole")) logger.info(Wsc_Tell + "已发送玩家 "+pl.realName+" 数据 "+ JSON.stringify(sendData) +" !");
				}

			} catch (error) {
				logger.warn('§c处理数据时出错:', error);
			}
		});
	});



