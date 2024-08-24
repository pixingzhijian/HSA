// ==UserScript==
// @name         选房助手_房源信息精确计算_详情页 HomeSelectAssintant
// @namespace   Violentmonkey Scripts
// @description  选房助手_房源信息精确计算_详情页。在页面上的特定位置显示“平米”前数字的总和。用于计算套内面积。 同时计算得房率，显示得房率等级。便于快速判断房子的性价比。
// @author       Leon
// @match        https://*.ke.com/chengjiao/
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @version     3.0.5
// @author      Leon
// @description 2024/8/23 00:33:59

// ==/UserScript==

(function () {
    'use strict';

    // 这里是脚本的主要逻辑

    // 创建悬浮窗元素
    var popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '10px';
    popup.style.right = '10px';
    popup.style.backgroundColor = '#fff';
    popup.style.padding = '10px';
    popup.style.border = '1px solid #ccc';
    popup.style.zIndex = '9999';
    popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    popup.style.opacity = '0.9';
    popup.style.fontSize = '14px';
    popup.style.fontFamily = 'Arial, sans-serif';
    popup.style.color = '#333';
    popup.style.width = '200px';
    popup.style.height = 'auto';
    popup.style.textAlign = 'center';
    popup.style.borderRadius = '5px';

//     // 添加关闭按钮
//     var closeButton = document.createElement('span');
//     closeButton.textContent = '×';
//     closeButton.style.position = 'absolute';
//     closeButton.style.top = '-10px';
//     closeButton.style.right = '-10px';
//     closeButton.style.cursor = 'pointer';
//     closeButton.style.color = '#fff';
//     closeButton.style.backgroundColor = '#333';
//     closeButton.style.padding = '5px 10px';
//     closeButton.style.borderRadius = '50%';
//     closeButton.style.fontSize = '12px';

// // 为关闭按钮添加点击事件监听器
// closeButton.addEventListener('click', function () {
//     popup.style.display = 'none';
// });

// // 将关闭按钮添加到 popup 元素中
// popup.appendChild(closeButton);

// // 确保 popup 元素已经被添加到页面中
// // 如果还没有添加，需要先将 popup 添加到页面的适当位置
// document.body.appendChild(popup);


    // 假设这段代码是在一个浏览器环境中运行的，且#infoList元素已经存在于DOM中

    function get_all_room_area() {
        var infoList = document.getElementById('infoList');
        var roomInfoArray = [];
        Array.from(infoList.querySelectorAll('.row')).forEach(function (row) {
            // 初始化一个对象来存储当前行的信息
            var roomInfo = {};
            // 获取当前.row下的所有.col元素，并按顺序存储它们的文本内容
            var cols = row.querySelectorAll('.col');
            if (cols.length >= 4) {
                roomInfo['name'] = cols[0].textContent.trim(); // 房间名称
                roomInfo['area'] = cols[1].textContent.trim(); // 房间面积
                roomInfo['orientation'] = cols[2].textContent.trim(); // 朝向
                roomInfo['windowType'] = cols[3].textContent.trim(); // 窗户类型
                roomInfoArray.push(roomInfo);
            }
        });
        var roomInfoJson = JSON.stringify(roomInfoArray, null, 2);
        console.log('roomInfoJson', roomInfoArray);
        return roomInfoArray
    }

    // var all_room_area = get_all_room_area()


    function get_base_room_info() {
        var houseInfo = {};
        var listItems = document.querySelectorAll('.content li');
        listItems.forEach(function (item) {
            // 获取label元素和其文本内容
            var label = item.querySelector('.label');
            console.log(label);

            var labelContent = label ? label.textContent.trim() : '';
            console.log(labelContent);

            // 获取对应的值，排除空格和换行符
            var value = item.textContent.trim().replace(/\s+/g, ' ').replace(labelContent, ' ').trim();
            // 将label内容作为键，对应的值作为值，存储到houseInfo对象中
            if (labelContent) {
                houseInfo[labelContent] = value;
            }
        });
        var houseInfoJson = JSON.stringify(houseInfo, null, 2);
        console.log(houseInfo);
        return houseInfo
    }

    get_base_room_info()


    function get_tiny_house_info() {
        // 获取页面中的相关元素
        var priceContainer = document.querySelector('.price-container');
        var roomInfo = document.querySelector('.mainInfo').textContent.trim();
        var typeInfo = document.querySelector('.subInfo').textContent.trim();
        var areaInfo = document.querySelector('.area .mainInfo').textContent.trim();
        var communityName = document.querySelector('.communityName a').textContent.trim();
        var areaName = document.querySelector('.areaName a').textContent.trim();


        var 贝壳编号 = window.location.href.match(/\/(\d+)\.html/);
        var url = window.location.href;

        // 构建房屋信息JSON对象
        var houseInfo = {
            '价格': {
                '总价': priceContainer.querySelector('.total').textContent.trim() + '万',
                '单价': priceContainer.querySelector('.unitPriceValue').textContent.trim() + '元/平米'
            },
            '房屋信息': {
                '房间': roomInfo,
                '类型': typeInfo,
                '面积': areaInfo
            },
            '区域信息': {
                '小区名称': communityName,
                '所在区域': areaName
            },
            '贝壳编号': 贝壳编号,
            'url': url

        };
        console.log(houseInfo);

        // 返回房屋信息JSON对象
        return houseInfo;
    }

    get_tiny_house_info()


    get_deal_info()

    function get_deal_info() {

        // 选择目标元素
        var listContent = document.querySelector('ul.listContent[data-query-id="879789727682265088"]');

        // 检查是否成功选取元素
        if (listContent) {
            // 初始化一个数组来保存所有房源信息
            var properties = [];

            // 获取所有列表项
            var items = listContent.querySelectorAll('li');
            items.forEach(function (item) {
                // 创建一个对象来保存当前房源的信息
                var property = {
                    viewEventId: item.getAttribute('data-view-evtid'),
                    action: item.getAttribute('data-action'),
                    link: item.querySelector('a').getAttribute('href'),
                    title: item.querySelector('.title a').innerText,
                    address: item.querySelector('.address .houseInfo').innerText,
                    dealDate: item.querySelector('.dealDate').innerText,
                    totalPrice: item.querySelector('.totalPrice .number').innerText + '万',
                    unitPrice: item.querySelector('.unitPrice .number').innerText + '元/平',
                    positionInfo: item.querySelector('.positionInfo').innerText,
                    dealCycle: item.querySelector('.dealCycleeInfo .dealCycleTxt').innerText
                };

                // 将房源信息对象添加到数组中
                properties.push(property);
            });

            // 将数组转换为JSON字符串
            var propertiesJson = JSON.stringify(properties, null, 2);
            return properties
            // 输出JSON字符串到控制台（或保存到文件、发送到服务器等）
            console.log(propertiesJson);
        } else {
            console.error('未能找到 deal 目标元素 。');
        }
    }

    // 假设我们要在id为"target"的元素后面显示计算结果
    var targetElement = document.getElementById('infoList');
    if (!targetElement) {
        console.error('目标元素未找到');
        return;
    }
//   2024年8月23日19:33:55  LEON 作废， 计算会有提取缺失，反复实验后重新计算。
//     // 创建一个数组来存储每个#infoList内特定div的数据
//     var extractedNumbers = [];
//     // 初始化一个变量来存储总计
//     var totalArea = 0;
//     // 遍历所有#infoList元素
//     infoLists.forEach(function (infoList) {
//         // 对每个#infoList元素，使用querySelectorAll获取所有div的第二个子div
//         var specificDivs = infoList.querySelectorAll('div > div:nth-child(2)');
//         // 遍历所有的特定divs，并提取“平米”前面的数字
//         specificDivs.forEach(function (specificDiv) {
//             var text = specificDiv.textContent || specificDiv.innerHTML;
//             // 使用正则表达式来匹配“平米”前面的数字
//             var match = text.match(/(\d+(?:\.\d+)?)平米/);
//             if (match) {
//                 var number = parseFloat(match[1]);
//                 // 检查数字是否已经存在于数组中
//                 if (!extractedNumbers.includes(number)) {
//                     // 将提取的数字添加到数组中
//                     extractedNumbers.push(number);
//                     // 累加到总计中
//                     totalArea += number;
//                 }
//             }
//         });
//     });
//     // 打印结果数组和总计
//     console.log('Extracted Numbers:', extractedNumbers);
//     console.log('Total:', totalArea);


    // 遍历JSON数组   2024年8月23日21:37:46 新增优化计算建筑面积
    let totalArea = 0;
    var all_room_area = get_all_room_area(document)
    all_room_area.forEach(item => {
        // 提取数字部分并转换为浮点数
        let areaNumber = parseFloat(item.area.replace('平米', ''));
        // 累加到总和中
        console.log('totalArea  item', item)

        totalArea += areaNumber;
    });
    console.log('totalArea', totalArea)


    // 创建一个新元素来展示计算结果
    var resultElement = document.createElement('div');
    resultElement.textContent = '总和: ' + totalArea.toFixed(2) + ' 平米';

    var totalElement = document.querySelector('#beike > div.sellDetailPage > div:nth-child(6) > div.overview > div.content > div.price-container > div > span.total');
    // var total = totalElement.textContent || totalElement.innerText;
    var total = parseFloat(totalElement.textContent.trim().match(/\d+(?:\.\d+)?/)[0]);

    var unitPriceElement = document.querySelector('#beike > div.sellDetailPage > div:nth-child(6) > div.overview > div.content > div.price-container > div > div.text > div.unitPrice > span');
    var unitPrice = parseFloat(unitPriceElement.textContent.trim().match(/\d+(?:\.\d+)?/)[0]);


    var areaElement = document.querySelector('#introduction > div > div > div.base > div.content > ul > li:nth-child(2)');
    var buildingArea = parseFloat(areaElement.textContent.trim().match(/\d+(?:\.\d+)?/)[0]);
    // 计算得房率
    var efficiencyRate = totalArea / buildingArea;
    var realPerice = total / totalArea;

    // 创建一个新元素来展示建筑面积和得房率
    var infoElement = document.createElement('div');
    infoElement.innerHTML = '建筑面积: ' + buildingArea.toFixed(2) + ' 平米<br>得房率: ' + efficiencyRate.toFixed(2) + '%';


    // var targetElement = document.querySelector('#beike > div.sellDetailPage > div:nth-child(6) > div.overview > div.content > div.houseInfo');
    var targetElement = document.querySelector('#introduction > div > div > div.transaction');

    if (targetElement) {
        targetElement.insertAdjacentElement('afterend', resultElement);
        targetElement.insertAdjacentElement('afterend', infoElement);
    } else {
        console.error('目标元素未找到');
    }
    // 将结果元素添加到页面的特定位置后面


    var efficiencyRates = parseFloat(efficiencyRate * 100); // 确保转换为数字

    let color;
    if (efficiencyRates >= 80 && efficiencyRates <= 100) {
        color = 'blue'; // 绿色字体
    } else if (efficiencyRates >= 75 && efficiencyRates <= 80) {
        color = 'green'; // 黄色字体
    } else if (efficiencyRates >= 70 && efficiencyRates < 75) {
        color = '#bfbf0f'; // 黄色字体
    } else if (efficiencyRates >= 63 && efficiencyRates < 70) {
        color = 'orange'; // 橙色字体
    } else if (efficiencyRates >= 40 && efficiencyRates < 63) {
        color = 'red'; // 红色字体
    } else {
        // 如果得房率不在预期范围内，可以设置一个默认颜色或者不显示颜色
        color = 'gray'; // 默认颜色
    }


    let link = window.location.href;
    const match = String(link).match(/\/(\d+)\.html/);
    const match_id = match[1]; // match[1] 是正则表达式中第一个括号捕获的内容

    var crab_res = {};
    crab_res.id = match_id
    crab_res.is_catch = false
    crab_res.get_all_room_area = get_all_room_area(document)
    crab_res.get_base_room_info = get_base_room_info(document)
    crab_res.get_tiny_house_info = get_tiny_house_info(document)
    crab_res.cal_res = {
        totalArea: totalArea.toFixed(2),
        buildingArea: buildingArea.toFixed(2),
        efficiencyRate: efficiencyRate.toFixed(2),
        total: total.toFixed(2),
        realPerice: realPerice.toFixed(2),
        unitPrice: (unitPrice / 10000).toFixed(2),
        realPericeRate: (1 - (unitPrice / 10000) / realPerice).toFixed(4),
    }

    console.log('更新缓存', match_id, crab_res);
    GM_setValue(match_id, crab_res)


    // 将计算的数据添加到悬浮窗中
    popup.innerHTML += '<h3>房屋信息</h3>';
    popup.innerHTML += `<p>总价: ${total.toFixed(2)} 万元</p>`;

    popup.innerHTML += `<p>套内面积总和: ${totalArea.toFixed(2)} 平米</p>`;

    popup.innerHTML += `<p>建筑面积: ${buildingArea.toFixed(2)} 平米</p>`;
    popup.innerHTML += `<p style="color: ${color};">得房率: ${efficiencyRates.toFixed(4)}%</p>`;


    // 检查抵押信息是否为"无抵押"
    var displayMortgageInfo = crab_res.get_base_room_info['抵押信息'] !== '无抵押' ? `<span style="color: rgba(255,89,0,0.81);">抵押: ${crab_res.get_base_room_info['抵押信息']}</span>` : '';
    var displaySellYearInfo = crab_res.get_base_room_info['房屋年限'] !== '满五年' ? `<span style="color: #ff4800;">年限: ${crab_res.get_base_room_info['房屋年限']}</span>` : '';

    var 无抵押 = `<p> ${displaySellYearInfo}    ${displayMortgageInfo}</p>`;

    popup.innerHTML += 无抵押

    popup.innerHTML += `<p>实际单价: ${realPerice.toFixed(2)} 万元</p>`;

    // 将悬浮窗添加到页面中
    document.body.appendChild(popup);

    // 使悬浮窗显示
    popup.style.display = 'block';


})();
