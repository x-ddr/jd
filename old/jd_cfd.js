/*
如果缺少依赖：如下安装
1.进入docker容器：docker exec -it <容器id(docker ps可获取)> /bin/bash
2.npm install <要安装的库>

”<>“为替换内容
cron 0 * * * * jd_cfd.js

*/

const {format} = require('date-fns');
const axios = require('axios');
// import USER_AGENT from './TS_USER_AGENTS';
const USER_AGENT = require('./USER_AGENTS').USER_AGENT;
const CryptoJS = require('crypto-js')

let appId = 10028, fingerprint, token, enCryptMethodJD;
let cookie= '', cookiesArr= [], res = '', shareCodes = ['BE533C650298443816B7A14536B215B6BF5E777BCB124479D7E1FAB95CD4C0A8','AC0A0340671E446DF83D3971963B59F04114C9F26F3EF08FE73B6DB01088F34C','F4B2D85B8A1BBC34A42A9D35B11476DAB4BA50E3608C0B01B7A3B297CC9CAB1D'];

let UserName, index, isLogin, nickName;
!(async () => {
  await requestAlgo();
  await requireConfig();

  for (let i = 0; i < cookiesArr.length; i++) {
    cookie = cookiesArr[i];
    UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
    index = i + 1;
    isLogin = true;
    nickName = '';
    await TotalBean();
    console.log(`\n开始【京东账号${index}】${nickName || UserName}\n`);

    await makeShareCodes();

    // 任务1
    let tasks;
    /*
     tasks= await api('story/GetActTask', '_cfd_t,bizCode,dwEnv,ptag,source,strZone')
    for (let t of tasks.Data.TaskList) {
      if (t.dwCompleteNum === t.dwTargetNum && t.dwAwardStatus === 2) {
        res = await api('Award', '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId', {taskId: t.ddwTaskId})
        if (res.ret === 0) {
          console.log(`${t.strTaskName}领奖成功:`, res.data.prizeInfo)
        }
        await wait(1000)
      }
    }
     */


    // res = await api('story/SpecialUserOper',
    //   '_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone,triggerType',
    //   {strStoryId: 'stroy_1626065998453014_1', dwType: '2', triggerType: 0, ddwTriggerDay: 1626019200})
    // console.log('船到:', res)
    // await wait(31000)
    // res = await api('story/SpecialUserOper',
    //   '_cfd_t,bizCode,ddwTriggerDay,dwEnv,dwType,ptag,source,strStoryId,strZone,triggerType',
    //   {strStoryId: 'stroy_1626065998453014_1', dwType: '3', triggerType: 0, ddwTriggerDay: 1626019200})
    // console.log('下船:', res)

    // 导游
    res = await api('user/EmployTourGuideInfo', '_cfd_t,bizCode,dwEnv,ptag,source,strZone')
    if (!res.TourGuideList) {
        console.log('账号尚未完成新手指引，跳过账号')
        continue
    }
    for (let e of res.TourGuideList) {
      if (e.strBuildIndex !== 'food' && e.ddwRemainTm === 0) {
        let employ = await api('user/EmployTourGuide', '_cfd_t,bizCode,ddwConsumeCoin,dwEnv,dwIsFree,ptag,source,strBuildIndex,strZone',
          {ddwConsumeCoin: e.ddwCostCoin, dwIsFree: 0, strBuildIndex: e.strBuildIndex})
        console.log(employ)
        await wait(3000)
      }
    }

    tasks = await mainTask('GetUserTaskStatusList', '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId', {taskId: 0});
    for (let t of tasks.data.userTaskStatusList) {
      if (t.dateType === 2) {
        // 每日任务
        if (t.awardStatus === 2 && t.completedTimes === t.targetTimes) {
          console.log(1, t.taskName)
          res = await mainTask('Award', '_cfd_t,bizCode,dwEnv,ptag,source,strZone,taskId', {taskId: t.taskId})
          console.log(res)
          if (res.ret === 0) {
            console.log(`${t.taskName}领奖成功:`, res.data.prizeInfo)
          }
          await wait(2000)
        } else if (t.awardStatus === 2 && t.completedTimes < t.targetTimes && (t.orderId === 2 || t.orderId === 3)) {
          // console.log('做任务:', t.taskId, t.taskName, t.completedTimes, t.targetTimes)
          res = await mainTask('DoTask', '_cfd_t,bizCode,configExtra,dwEnv,ptag,source,strZone,taskId', {taskId: t.taskId, configExtra: ''})
          console.log('做任务:', res)
          await wait(5000)
        }
      }
    }

    for (let b of ['food', 'fun', 'shop', 'sea']) {
      res = await api('user/GetBuildInfo', '_cfd_t,bizCode,dwEnv,dwType,ptag,source,strBuildIndex,strZone', {strBuildIndex: b})
      console.log(`${b}升级需要:`, res.ddwNextLvlCostCoin)
      await wait(1000)
      if (res.dwCanLvlUp === 1) {
        res = await api('user/BuildLvlUp', '_cfd_t,bizCode,ddwCostCoin,dwEnv,ptag,source,strBuildIndex,strZone', {ddwCostCoin: res.ddwNextLvlCostCoin, strBuildIndex: b})
        if (res.iRet === 0) {
          console.log(`升级成功`)
          await wait(2000)
        }
      }
      res = await api('user/CollectCoin', '_cfd_t,bizCode,dwEnv,dwType,ptag,source,strBuildIndex,strZone', {strBuildIndex: b, dwType: '1'})
      console.log(`${b}收金币:`, res.ddwCoin)
      await wait(1000)
    }
  }
  // if (cookiesArr.length === shareCodes.length) {
    
  // }
  for (let i = 0; i < cookiesArr.length; i++) {
      for (let j = 0; j < shareCodes.length; j++) {
        cookie = cookiesArr[i]
        res = await api('story/helpbystage', '_cfd_t,bizCode,dwEnv,ptag,source,strShareId,strZone', {strShareId: shareCodes[j]})
        console.log(res)
        await wait(1000)
        if (Number(res.iRet) === 2235) {
            console.log('当前账号没有助力次数了')
            continue
        }
      }
    }
})()

// interface Params {
//   strBuildIndex?: string,
//   ddwCostCoin?: number,
//   taskId?: number,
//   dwType?: string,
//   configExtra?: string,
//   strStoryId?: string,
//   triggerType?: number,
//   ddwTriggerDay?: number,
//   ddwConsumeCoin?: number,
//   dwIsFree?: number,
//   ddwTaskId?: string,
//   strShareId?: string,
//   strMarkList?: string
// }

function api(fn, stk, params = {}) {
  return new Promise(async resolve => {
    let url = `https://m.jingxi.com/jxbfd/${fn}?strZone=jxbfd&bizCode=jxbfd&source=jxbfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=&_ste=1&_=${Date.now()}&sceneval=2&_stk=${encodeURIComponent(stk)}`
    if (['GetUserTaskStatusList', 'Award', 'DoTask'].includes(fn)) {
      console.log('api2')
      url = `https://m.jingxi.com/newtasksys/newtasksys_front/${fn}?strZone=jxbfd&bizCode=jxbfddch&source=jxbfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=&_stk=${encodeURIComponent(stk)}&_ste=1&_=${Date.now()}&sceneval=2`
    }
    if (Object.keys(params).length !== 0) {
      let key;
      
      for (key in params) {
        if (params.hasOwnProperty(key))
          url += `&${key}=${params[key]}`
      }
    }
    url += '&h5st=' + decrypt(stk, url)
    let {data} = await axios.get(url, {
      headers: {
        'Host': 'm.jingxi.com',
        'Referer': 'https://st.jingxi.com/',
        'User-Agent': USER_AGENT,
        'Cookie': cookie
      }
    })
    resolve(data)
  })
}

function mainTask(fn, stk, params) {
  return new Promise(async resolve => {
    let url = `https://m.jingxi.com/newtasksys/newtasksys_front/${fn}?strZone=jxbfd&bizCode=jxbfd&source=jxbfd&dwEnv=7&_cfd_t=${Date.now()}&ptag=&_stk=${encodeURIComponent(stk)}&_ste=1&_=${Date.now()}&sceneval=2`
    if (Object.keys(params).length !== 0) {
      let key;
      for (key in params) {
        if (params.hasOwnProperty(key))
          url += `&${key}=${params[key]}`
      }
    }
    url += '&h5st=' + decrypt(stk, url)
    let {data} = await axios.get(url, {
      headers: {
        'X-Requested-With': 'com.jd.pingou',
        'Referer': 'https://st.jingxi.com/',
        'Host': 'm.jingxi.com',
        'User-Agent': USER_AGENT,
        'Cookie': cookie
      }
    })
    resolve(data)
  })
}

function makeShareCodes() {
  return new Promise(async resolve => {
    res = await api('user/QueryUserInfo', '_cfd_t,bizCode,ddwTaskId,dwEnv,ptag,source,strShareId,strZone', {ddwTaskId: '', strShareId: '', strMarkList: 'undefined'})
    console.log('助力码:', res.strMyShareId)
    shareCodes.push(Math.random() > 0.5 ? res.strMyShareId : 'BE533C650298443816B7A14536B215B6BF5E777BCB124479D7E1FAB95CD4C0A8')
    resolve()
  })
}


async function requestAlgo() {
  fingerprint = await generateFp();
  return new Promise(async resolve => {
    let {data} = await axios.post('https://cactus.jd.com/request_algo?g_ty=ajax', {
      "version": "1.0",
      "fp": fingerprint,
      "appId": appId,
      "timestamp": Date.now(),
      "platform": "web",
      "expandParams": ""
    }, {
      "headers": {
        'Authority': 'cactus.jd.com',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'Accept': 'application/json',
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/json',
        'Origin': 'https://st.jingxi.com',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'https://st.jingxi.com/',
        'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
      },
    })
    if (data['status'] === 200) {
      token = data.data.result.tk;
      let enCryptMethodJDString = data.data.result.algo;
      if (enCryptMethodJDString) enCryptMethodJD = new Function(`return ${enCryptMethodJDString}`)();
    } else {
      console.log(`fp: ${fingerprint}`)
      console.log('request_algo 签名参数API请求失败:')
    }
    resolve(200)
  })
}

function decrypt(stk, url) {
  const timestamp = (format(new Date(), 'yyyyMMddhhmmssSSS'))
  // console.log(timestamp, 'timestamp')
  let hash1;
  if (fingerprint && token && enCryptMethodJD) {
    hash1 = enCryptMethodJD(token, fingerprint.toString(), timestamp.toString(), appId.toString(), CryptoJS).toString(CryptoJS.enc.Hex);
  } else {
    const random = '5gkjB6SpmC9s';
    token = `tk01wcdf61cb3a8nYUtHcmhSUFFCfddDPRvKvYaMjHkxo6Aj7dhzO+GXGFa9nPXfcgT+mULoF1b1YIS1ghvSlbwhE0Xc`;
    fingerprint = 9686767825751161;
    // $.fingerprint = 7811850938414161;
    const str = `${token}${fingerprint}${timestamp}${appId}${random}`;
    hash1 = CryptoJS.SHA512(str, token).toString(CryptoJS.enc.Hex);
  }
  let st = '';
  stk.split(',').map((item, index) => {
    st += `${item}:${getQueryString(url, item)}${index === stk.split(',').length - 1 ? '' : '&'}`;
  })
  const hash2 = CryptoJS.HmacSHA256(st, hash1.toString()).toString(CryptoJS.enc.Hex);
  return encodeURIComponent(["".concat(timestamp.toString()), "".concat(fingerprint.toString()), "".concat(appId.toString()), "".concat(token), "".concat(hash2)].join(";"))
}

function requireConfig() {
  return new Promise(resolve => {
    console.log('开始获取配置文件\n')
    const jdCookieNode = require('./jdCookie.js');
    Object.keys(jdCookieNode).forEach((item) => {
      if (jdCookieNode[item]) {
        cookiesArr.push(jdCookieNode[item])
      }
    })
    console.log(`共${cookiesArr.length}个京东账号\n`)
    resolve()
  })
}

function TotalBean() {
  return new Promise(async resolve => {
    axios.get('https://me-api.jd.com/user_new/info/GetJDUserInfoUnion', {
      headers: {
        Host: "me-api.jd.com",
        Connection: "keep-alive",
        Cookie: cookie,
        "User-Agent": USER_AGENT,
        "Accept-Language": "zh-cn",
        "Referer": "https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&",
        "Accept-Encoding": "gzip, deflate, br"
      }
    }).then(res => {
      if (res.data) {
        let data = res.data
        if (data['retcode'] === "1001") {
          isLogin = false; //cookie过期
          return;
        }
        if (data['retcode'] === "0" && data['data'] && data.data.hasOwnProperty("userInfo")) {
          nickName = data.data.userInfo.baseInfo.nickname;
        }
      } else {
        console.log('京东服务器返回空数据');
      }
    }).catch(e => {
      console.log('Error:', e)
    })
    resolve();
  })
}

function generateFp() {
  let e = "0123456789";
  let a = 13;
  let i = '';
  for (; a--;)
    i += e[Math.random() * e.length | 0];
  return (i + Date.now()).slice(0, 16)
}

function getQueryString(url, name) {
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  let r = url.split('?')[1].match(reg);
  if (r != null) return unescape(r[2]);
  return '';
}

function wait(t) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, t)
  })
}
