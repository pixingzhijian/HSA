// ==UserScript==
// @name         选房助手_房源信息精确计算_详情页 HomeSelectAssintant
// @namespace   Violentmonkey Scripts
// @description  选房助手_房源信息精确计算_详情页。在页面上的特定位置显示“平米”前数字的总和。用于计算套内面积。 同时计算得房率，显示得房率等级。便于快速判断房子的性价比。
// @author       Leon
// @match        https://*.ke.com/ershoufang/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @version     3.0.5
// @author      Leon
// @description 2024/8/23 00:33:59

// @note 6.0.0 TODO:运用模型选房，运用机器学习模型进行评分
// @note 5.0.0 TODO:快捷可视化分析
// @note 4.0.0 TODO:远端保存

// @note 3.0.5 新增实际单价折扣率， 用于展示建筑面积和套内面积的实际房价单价的增长率。
// @note 3.0.4 给详情页的展示也进行着色， 给详情页的风险信息也进行着色。
// @note 3.0.3 优化详情页的部分代码从列表页获取。  部分合并两边的代码。
// @note 3.0.2 优化数据导出后的格式， 增加导出数据的时候保留ID ，否则不知道这个是哪个房源。
// @note 3.0.1 优化数据导出的代码。

// @note 2.3.3 新增一键删除全部缓存。
// @note 2.3.2 del_wrong_data 删除错误数据，根据历史缺失的数据判断，是否删除缓存。
// @note 2.3.1 优化广告问题，屏蔽部分广告。
// @note 2.3.0 优化缓存获取，使用ID可以直接查询该房源的历史记录。同时增加是否从缓存里面读取的标识。

// @note 2.2.6 优化数据缓存，保存到缓存中， 减少重复获取的问题。 使用房间ID进行获取。
// @note 2.2.5 优化数据缓存，防止反爬内问题。  有时候打开过快，会导致获取失败。 同时需要手动输入验证码。
// @note 2.2.4 优化展示结果，对重要的风险信息进行着色，并且上次在同行优化了展示，因此本次增加了颜色作为区分。
// @note 2.2.3 优化展示结果，对3个内容进行合并展示，优化整体展示框架的长度，避免单个房间过长。 部分内容合并到同一行。
// @note 2.2.2 新增根据字段的内容做出判断，精简页面展示内容，如果无抵押则不显示，如果非共有则不显示，如果满五唯一则不显示。
// @note 2.2.1 增加了年限信息
// @note 2.2.0 大优化，新增列表页面的展示计算。获取了房间基本信息的新字段，抵押信息，共有信息
// @note 2.1.13 优化下载后保存的问题，优化保存文件名上增加当前总条数。
// @note 2.1.12 优化下载后保存的问题，优化保存文件名为当前时间。便于区分。
// @note 2.1.11 优化下载后保存的问题，优化JSON解析只解析一级的问题，由于总共有4个JSON合并，把JSON解析到二级再保存。
// @note 2.1.10 优化下载后保存的问题，解析JSON有问题，无法正确解析。无法在CSV中便捷查看，无法后续分析。优化为解析CSV之后再保存。
// @note 2.1.9 优化下载后保存的问题，保存为CSV的格式。
// @note 2.1.8 修复BUG.由于数据格式改变，会导致有些数据在页面上获取不到。  重新优化代码结构，所有代码从cal_res 中获取。
// @note 2.1.7 新增了删除错误的数据的功能，
// @note 2.1.6 优化下载按钮，新增了展示的数据条数。  新增了悬浮窗，可以显示房屋总价等重要信息。
// @note 2.1.5 优化下载按钮，新增了展示的数据条数。  新增了悬浮窗，可以显示房屋总价等重要信息。  新增了删除错误的数据的功能。
// @note 2.1.4 优化数据的保存方式。   优化计算得房率的逻辑。  新增了下载按钮。
// @note 2.1.3 优化展示效果。新增得房率的判断，分为4个等级，分别使用蓝色 绿色 黄色 橙色   红色 表示房屋得房率的高低，以及灰色表示错误。
// @note 2.1.2 部分计算数据优化为从JSON获取数据。 同时其上级调用的代码也优化为从document中获取并且计算。  取消原来getElementById的代码，改为使用document.querySelectorAll获取。
// @note 2.1.1 大范围重构，由于之前的错误，导致无法获取到房间面积，所以需要重构。   新增了保存到GM_setValue的代码， 获取到房间面积后，保存到GM_setValue中。  然后获取到页面的链接，然后获取到每个链接的详细信息，然后计算单价以及得房率。  最后将计算结果保存到GM_setValue中。
// @note 2.1.0 优化保存的数据， 删除了多余的代码。  分为4大模块， 1、房间简要信息， 2、房间基本信息， 3、房间各个面积， 4、房间计算结果信息。

// @note 2.0.10 雏形初显。TODO: 悬浮窗拖动的时候会有一个重置位置的跳动问题。  因为已经优化为不遮挡任何东西，因此待后续修复。
// @note 2.0.9 雏形初显。优化悬浮窗的透明度和宽度问题。
// @note 2.0.8 优化悬浮窗为可点击拖动。
// @note 2.0.7 列表页展示BUG修复。优化展示位置，悬浮窗细节调整为混合浮动类型。 悬浮在链接的后方偏下的空白位置。设置固定宽度。保证不遮挡任何文字。
// @note 2.0.6 列表页展示BUG修复。插入到标题后面会有文字排版的问题。因此还是优化为插入悬浮窗。 悬浮窗插入到第二个含有网址的LINK的后面。
// @note 2.0.5 列表页展示BUG修复。插入到标题后面会有文字排版的问题。因此还是优化为插入悬浮窗。 悬浮窗插入到第二个含有网址的LINK的后面。
// @note 2.0.4 列表页展示BUG修复。图片也能跳转到详情网址，因此获取到的LINK在图片后面，解析出来的信息插入在图片后面看不到。 因此优化为插入到第二个链接 ，也就是标题后面。
// @note 2.0.3 新增。列表页插入本房源的得房率信息到 含有网页网址的文字后面。 由于本来就要获取网址，因此这样做方便点。
// @note 2.0.2 列表页展示BUG修复。由于获取列表页的全部详情网址之后，会有重复，因此优化。
// @note 2.0.1 优化展示效果。新增得房率的判断，分为3个等级，分别使用 绿色黄色  红色 表示房屋得房率的高低
// @note 2.0.0 大版本更新， 新增了列表页的展示。 原来的获取详情页内容为指定获取详情页内容，计算单价以及得房率 。 现在优化成全部获取指定ID的全部信息，保存到JSON.

// @note 1.1.2 再次优化循环获取房间面积的代码， 优化性能。  有时候会获取重复第二个房间的面积。
// @note 1.1.1 修复获取详情页内容时，除法错误的问题。
// @note 1.1.0 小范围更新优化全部代码， 修复重复获取某个房间面积的问题。
// @note 1.0.4 新增悬浮窗展示，在右上角显示悬浮窗，可以显示房屋总价等重要信息。
// @note 1.0.3 优化插入结果到页面的代码， 插入到房间各个面积的节点下面。
// @note 1.0.2 优化获取每个房间面积的代码
// @note 1.0.1 根据详情页内容计算单价以及得房率
// @note 1.0.0 初始化创建
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
            // console.log(label);

            var labelContent = label ? label.textContent.trim() : '';
            // console.log(labelContent);

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
        // 初始化房屋信息JSON对象
        var houseInfo = {};

        // 获取页面中的相关元素
        var priceContainer = document.querySelector('.price-container');
        var roomInfo = document.querySelector('.mainInfo');
        var typeInfo = document.querySelector('.subInfo');
        var areaInfo = document.querySelector('.area .mainInfo');
        var communityName = document.querySelector('.communityName a');
        var areaName = document.querySelector('.areaName a');

        // 检查是否成功选取了元素
        if (priceContainer && roomInfo && typeInfo && areaInfo && communityName && areaName) {
            // 获取页面中的相关文本内容
            var roomInfoText = roomInfo.textContent.trim();
            var typeInfoText = typeInfo.textContent.trim();
            var areaInfoText = areaInfo.textContent.trim();
            var communityNameText = communityName.textContent.trim();
            var communityNameHref = communityName.href.match(/\/(\d+)/);
            var areaNameText = areaName.textContent.trim();

            // 获取页面URL中的贝壳编号
            var 贝壳编号 = window.location.href.match(/\/(\d+)\.html/);
            var url = window.location.href;

            // 构建房屋信息JSON对象
            houseInfo = {
                '价格': {
                    '总价': priceContainer.querySelector('.total').textContent.trim() + '万',
                    '单价': priceContainer.querySelector('.unitPriceValue').textContent.trim() + '元/平米'
                },
                '房屋信息': {
                    '房间': roomInfoText,
                    '类型': typeInfoText,
                    '面积': areaInfoText
                },
                '区域信息': {
                    '小区名称': communityNameText,
                    'communityId': communityNameHref[1],
                    '所在区域': areaNameText
                },
                '贝壳编号': 贝壳编号 ? 贝壳编号[1] : null, // 确保提取的编号是字符串类型
                'url': url
            };
        } else {
            console.error('无法获取 tiny house 某些元素，请检查页面结构。');
        }

        // 输出房屋信息JSON对象到控制台
        console.log(houseInfo);

        // 返回房屋信息JSON对象
        return houseInfo;
    }

    get_tiny_house_info()


    // 使悬浮窗可拖动的函数
    function makeDraggable(element) {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        element.onmousedown = function (event) {
            isDragging = true;
            initialX = event.clientX - element.offsetLeft;
            initialY = event.clientY - element.offsetTop;
            document.onmousemove = function moveAt(e) {
                if (isDragging) {
                    element.style.left = e.clientX - initialX + 'px';
                    element.style.top = e.clientY - initialY + 'px';
                }
            };
        };
        document.onmouseup = function () {
            isDragging = false;
            document.onmousemove = null;
        };
    }


    // 创建一个新的悬浮窗并展示 deal_info_list 的函数
    function showDealInfoPopup(deal_info_list) {
        // 创建新的悬浮窗元素
        let detailsPopup = document.createElement('div');
        detailsPopup.style.position = 'absolute';
        detailsPopup.style.top = '5px'; // 根据需要调整位置
        detailsPopup.style.left = '5px'; // 根据需要调整位置
        detailsPopup.style.backgroundColor = '#fff';
        detailsPopup.style.padding = '10px';
        detailsPopup.style.border = '1px solid #ccc';
        detailsPopup.style.zIndex = '9999';
        detailsPopup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        detailsPopup.style.opacity = '0.9';
        detailsPopup.style.fontSize = '7px';
        detailsPopup.style.fontFamily = 'Arial, sans-serif';
        detailsPopup.style.color = '#333';
        // detailsPopup.style.width = '300px'; // 根据需要调整宽度
        detailsPopup.style.height = 'auto'; // 默认高度为auto，以便内容可以自适应
        detailsPopup.style.textAlign = 'left';
        detailsPopup.style.borderRadius = '5px';
        detailsPopup.style.display = 'block'; // 默认显示悬浮窗

        // 添加内容展示 deal_info_list 中每个对象的所有键值对
        let content = document.createElement('div');
        content.innerHTML = `<h3>详细信息   ${deal_info_list.is_positionId_catch ? '(缓存)' : '(实时)'}</h3>`;
        deal_info_list.forEach(info => {
            let itemDiv = document.createElement('div');
            itemDiv.innerHTML = '<strong></strong>';
            for (let key in info) {
                // delete info['address']
                if (info.hasOwnProperty(key)) {
                    let itemKey = document.createElement('span');
                    itemKey.style.fontWeight = 'bold';
                    itemKey.textContent = `${key}:`;
                    let itemValue = document.createElement('span');
                    itemValue.textContent = `${info[key]}  ㅤ`;
                    // itemDiv.appendChild(itemKey);
                    itemDiv.appendChild(itemValue);
                    itemDiv.appendChild(document.createTextNode('\n')); // 添加换行
                }
            }
            content.appendChild(itemDiv);
        });
        detailsPopup.appendChild(content);

        // 将新的悬浮窗添加到页面中
        document.body.appendChild(detailsPopup);

        // 使新的悬浮窗可拖动
        makeDraggable(detailsPopup);
        return detailsPopup;
    }

    function make_popup(crab_res_in, deal_info_list) {
        // 创建悬浮窗元素
        let popup = document.createElement('div');
        popup.style.position = 'absolute';
        popup.style.top = '130px';
        popup.style.right = '30px';
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
        popup.style.height = 'auto'; // 默认高度为auto，以便内容可以自适应
        popup.style.textAlign = 'center';
        popup.style.borderRadius = '5px';
        popup.style.display = 'block'; // 默认显示悬浮窗
        popup.classList.add('popup'); // 添加一个类名以便于样式化
        popup.id = 'popup-sale-' + crab_res_in.id + '-' + Date.now();

        // 添加按钮，用于打开新的悬浮窗并展示 deal_info_list
        let openDetailsButton = document.createElement('button');
        openDetailsButton.textContent = '详';
        openDetailsButton.style.position = 'absolute';
        openDetailsButton.style.top = '5px';
        openDetailsButton.style.right = '10px';
        openDetailsButton.style.cursor = 'pointer';
        openDetailsButton.style.color = '#fff';
        openDetailsButton.style.backgroundColor = '#333';
        openDetailsButton.style.padding = '5px 10px';
        openDetailsButton.style.borderRadius = '5px';
        openDetailsButton.style.fontSize = '12px';
        openDetailsButton.onclick = function () {
            // 创建并显示新的悬浮窗

        };
        popup.appendChild(openDetailsButton);


        makeDraggable(popup); // 使悬浮窗可拖动

        // 将悬浮窗添加到页面中
        // document.body.appendChild(popup);


        // 根据得房率的范围设置不同的颜色
        var efficiencyRates = parseFloat(crab_res_in.cal_res.efficiencyRate * 100); // 确保转换为数字

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

        console.log('***crab_res_in*******', crab_res_in)
        // var base_room_info = get_base_room_info(document)
        // 将计算的数据添加到悬浮窗中
        popup.innerHTML += '<h3>房屋信息' + (crab_res_in.is_catch ? ' (缓存)' : '(实时)') + '</h3>';

        popup.innerHTML += `<p>建筑类型: ${crab_res_in.get_base_room_info.建筑类型} </p>`;

        popup.innerHTML += `<p>总价: ${crab_res_in.cal_res.total} 万元</p>`;
        popup.innerHTML += `<p style="color: ${color};">得房率: ${efficiencyRates}%</p>`;

        popup.innerHTML += `<p>套内面积总和: ${crab_res_in.cal_res.totalArea} 平米</p>`;

        popup.innerHTML += `<p>建筑面积: ${crab_res_in.cal_res.buildingArea} 平米</p>`;


        // 检查抵押信息是否为"无抵押"
        var displayMortgageInfo = crab_res_in.get_base_room_info['抵押信息'] !== '无抵押' ? `<span style="color: rgba(255,89,0,0.81);">抵押: ${crab_res_in.get_base_room_info['抵押信息']}</span>` : '';
        var displaySellYearInfo = crab_res_in.get_base_room_info['房屋年限'] !== '满五年' ? `<span style="color: #ff4800;">年限: ${crab_res_in.get_base_room_info['房屋年限']}</span>` : '';
        var displayHoldInfo = crab_res_in.get_base_room_info['产权所属'] !== '非共有' ? `<span style="color: #993005;">产权: ${crab_res_in.get_base_room_info['产权所属']}</span>` : '';

        var dynatiData = `<p> ${displaySellYearInfo}    ${displayMortgageInfo}  ${displayHoldInfo}</p>`;

        popup.innerHTML += dynatiData
        popup.innerHTML += `<p>单价:${crab_res_in.cal_res.unitPrice} 万  建面单价:${crab_res_in.cal_res.realPerice} 万  </p>`;
        popup.innerHTML += `<p>建面单价折扣率: ${crab_res_in.cal_res.realPericeRate} %</p>`;

        return popup
    }


    // 去重函数，基于对象的 id 属性
    function uniqueByProperty(list, property) {
        const uniqueList = [];
        const propertySet = new Set();

        list.forEach(item => {
            const propertyValue = item[property];
            if (!propertySet.has(propertyValue)) {
                uniqueList.push(item);
                propertySet.add(propertyValue);
            }
        });
        return uniqueList
    }

    // 假设我们要在id为"target"的元素后面显示计算结果
    var targetElement = document.getElementById('infoList');
    if (!targetElement) {
        console.error('目标元素 infoList 未找到');
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
        // console.log('totalArea  item', item)

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


    const positionId = crab_res.get_tiny_house_info.区域信息.communityId   // 小区使用小区ID
    // 此处开始构造小区信息
    let deal_info_list_catch = GM_getValue(positionId)
    if (deal_info_list_catch) {
        deal_info_list_catch.is_positionId_catch = true
        var deal_info_list = deal_info_list_catch
        console.log('小区成交信息 deal_info_list  已找到缓存', positionId, deal_info_list);


        if (deal_info_list) {
            // 将悬浮窗添加到页面中

            let popup = make_popup(crab_res, deal_info_list)
            var unique_deal_info_list = uniqueByProperty(deal_info_list, 'id').map(item => {
                return {
                    id: item.id,
                    // viewEventId:15431,
                    // link:https://sh.ke.com/chengjiao/107109353602.html,
                    dealDate: item.dealDate,
                    totalPrice: item.totalPrice,
                    unitPrice: item.unitPrice,
                    title: item.title,
                    address: item.address,
                    // positionInfo:中楼层(共35层) 2002年塔楼,
                    // dealCycle:挂牌539万\n                                                                                                    成交周期20天};
                };
            })
            let DealInfoPopup = showDealInfoPopup(unique_deal_info_list);
            document.body.appendChild(DealInfoPopup);

        }
    } else {
        console.error('小区未查询到缓存 positionId', positionId)
    }


})();
