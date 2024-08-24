// ==UserScript==
// @name        计算每个链接的房屋实际单价
// @namespace   Violentmonkey Scripts
// @match       https://*.ke.com/*/*/*/*
// @match       https://*.ke.com/*/
// @grant        GM_xmlhttpRequest
// @grant         GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @version     1.0
// @author      Leon
// @description 2024/8/23 00:33:59
// ==/UserScript==


(function () {
    'use strict';


    // 这里是脚本的主要逻辑
    var elementsToRemove = document.querySelectorAll('#sticky-wrapper > div');
    // 遍历并删除这些元素   广告 删除
    elementsToRemove.forEach(function (element) {
        element.remove();
    });


    // del_wrong_data()
    function del_wrong_data() {
        // 获取所有已保存的键名
        var keys = GM_listValues();

// 遍历键名列表
        keys.forEach(function (key) {
            // 获取对应的值
            var value = GM_getValue(key);

            // 检查值中的 cal_res 是否存在且不为空
            if (value && value.cal_res && Object.keys(value.cal_res).length > 0) {
                // 如果 cal_res 不为空，则保留该值
                // console.log('保留键名：' + key);
            } else {
                // 如果 cal_res 为空，则删除该键
                GM_deleteValue(key);
                console.log('删除键名：' + key);
            }
        });

    }


    download_csv()

    function download_csv() {// 创建悬浮窗并添加到页面的左上角
        var overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.left = '10px';
        overlay.style.top = '70px';
        overlay.style.backgroundColor = 'white';
        overlay.style.padding = '10px';
        overlay.style.zIndex = '1000';
        overlay.style.borderRadius = '5px';
        overlay.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        document.body.appendChild(overlay);

// 显示当前GM_setValue数据的总条数
        var statusElement = document.createElement('p');
        statusElement.textContent = '数据条数：未知';
        overlay.appendChild(statusElement);

// 用于存储所有键值对的数组
        var items = [];

// 使用GM_listValues获取所有键名
        var keys = GM_listValues();

// 如果GM_listValues返回的键名数量大于0
        if (keys.length > 0) {
            // 遍历所有键名，获取对应的值，并将它们存储在items数组中
            keys.forEach(function (key) {
                var value = GM_getValue(key);
                try {
                    // 尝试将值解析为JSON对象
                    var parsedValue = JSON.parse(value);
                    // 将键名和解析后的值作为对象存储在items数组中
                    items.push({key: key, value: parsedValue});
                } catch (e) {
                    console.error('解析GM_setValue中的值失败:', e);
                }
            });

            // 计算数据条数并更新状态元素
            var totalItems = items.length;
            statusElement.textContent = '数据条数：' + totalItems;
        }

// 创建一个按钮并添加到悬浮窗中
        var exportButton = document.createElement('button');
        exportButton.textContent = '导出数据';
        overlay.appendChild(exportButton);

// 为按钮添加点击事件监听器
        exportButton.addEventListener('click', function () {
            if (items.length === 0) {
                alert('没有可导出的数据！');
                return;
            }

            // 获取所有字段名（键名）
            var fieldNames = getUniqueFieldNames(items);
            var header = fieldNames.map(function (fieldName) {
                return `"${fieldName}"`;
            }).join('\t') + '\n';

            // 创建CSV的内容行
            var csvContent = items.map(function (item) {
                var values = fieldNames.map(function (fieldName) {
                    var value = getValueFromObject(item.value, fieldName);
                    // 如果值是对象或数组，转换为JSON字符串，否则直接转换为字符串
                    return typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
                });
                return values.join('\t');
            }).join('\n');

            // 合并标题行和内容行
            csvContent = header + csvContent;

            // 获取当前日期和时间作为文件名
            var currentDate = new Date();
            var dateString = currentDate.toISOString().replace(/:/g, '-').split('.')[0];
            var fileName = `House_${totalItems}_${dateString}.csv`;

            // 创建Blob对象并触发下载
            var blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url); // 清理URL对象
        });


// 递归函数，用于从嵌套的JSON对象中获取值
        function getValueFromObject(obj, fieldName) {
            var fields = fieldName.split('.');
            var value = obj;
            for (var i = 0; i < fields.length; i++) {
                if (value && typeof value === 'object') {
                    value = value[fields[i]];
                } else {
                    return value;
                }
            }
            return value;
        }

// 函数，用于获取所有唯一的字段名
        function getUniqueFieldNames(items) {
            var allFieldNames = [];
            items.forEach(function (item) {
                // 这里需要一个递归函数来遍历所有字段名
                function collectFieldNames(obj, parentKey) {
                    Object.keys(obj).forEach(function (key) {
                        var fullKey = parentKey ? `${parentKey}.${key}` : key;
                        if (typeof obj[key] === 'object' && obj[key] !== null) {
                            collectFieldNames(obj[key], fullKey);
                        } else {
                            allFieldNames.push(fullKey);
                        }
                    });
                }

                collectFieldNames(item.value);
            });
            return Array.from(new Set(allFieldNames));
        }
    }


    function clear_g() {
        // 创建按钮
        const btn = document.createElement('button');
        btn.innerText = '清空本地计算缓存';
        btn.style.position = 'fixed';
        btn.style.top = '10px';
        btn.style.left = '10px';
        btn.style.zIndex = '1000';
        btn.style.padding = '10px';
        btn.style.border = 'none';
        btn.style.background = '#f00';
        btn.style.color = '#fff';
        btn.style.cursor = 'pointer';

        // 为按钮添加点击事件
        btn.addEventListener('click', function () {
            // 清空GM_setValue存储的数据
            GM_listValues().forEach(function (key) {
                GM_deleteValue(key);
            });
            alert('所有缓存的数据已被清空');
        });

        // 将按钮添加到页面的body中
        document.body.appendChild(btn);
    }

    clear_g()

// 用于在每个链接后面插入悬浮窗的函数
    async function insertPopupAfterLink(linkSelector) {
        // 获取所有匹配的链接元素
        let links = document.querySelectorAll(linkSelector);
        console.log('links', links);

        // let   links = await links.slice(0,3)

        // 如果没有找到任何链接，直接返回
        if (links.length === 0) {
            console.log('未找到匹配的链接元素');
            return;
        }
        // 遍历所有链接，并在每个链接后面添加悬浮窗
        for (const link of links) {


            let popup = await findElementsAndExtractLinks(link);


            // 尝试将悬浮窗插入到链接元素后面
            try {
                if (link.nextSibling) {

                    link.parentNode.insertBefore(popup, link.nextSibling);

                    // let popup = document.createElement('div');

                } else {
                    link.parentNode.appendChild(popup);

                }
            } catch (error) {
                console.error('无法在链接后面添加悬浮窗:', error);
            }

        }
    }


    // 监听页面加载完成
    window.addEventListener('load', async function () {

// 选择器用于定位特定的<a>元素
        const linkSelector = '#beike > div.sellListPage > div.content > div.leftContent > div:nth-child(4) > ul > li > div > div.title > a';

        await insertPopupAfterLink(linkSelector);

    });

    // 一个同步函数用于检查数组中是否包含undefined或NaN
    function checkArrayForUndefinedOrNaN(arr) {
        // 检查参数是否为数组
        if (!Array.isArray(arr)) {
            return TypeError('The provided argument is not an array.')
        }
        // 检查数组中是否包含undefined
        const containsUndefined = arr.includes(undefined);
        // 检查数组中是否包含Na
        const containsNaN = arr.some(item => Number.isNaN(item));

        // 返回检查结果
        return {
            containsUndefined: containsUndefined,
            containsNaN: containsNaN
        }
    }


    async function findElementsAndExtractLinks(link) {
        // 异步操作
        const match = String(link).match(/\/(\d+)\.html/);
        const match_id = match[1]; // match[1] 是正则表达式中第一个括号捕获的内容

        if (match) {
            let id_catch = GM_getValue(match_id)
            let containsUndefined = checkArrayForUndefinedOrNaN(id_catch).containsUndefined
            let containsNaN = checkArrayForUndefinedOrNaN(id_catch).containsNaN

            // 如果解析到了id ，则开始判断是否已有缓存
            if (id_catch && !containsUndefined && !containsNaN) {
                console.log('已找到缓存', match_id); // 输出：107109024746
                console.log('已找到缓存', id_catch); // 输出：107109024746

                var crab_res = id_catch

                crab_res.match_id = match_id
                crab_res.is_catch = true
            } else {
                console.log('未找到缓存 开始爬虫  ', id_catch);

                var doc = await findElementsAndExtractLinks_doc(link, match_id)

                var crab_res = {};
                crab_res.id = match_id
                crab_res.is_catch = false

                crab_res.get_all_room_area = await get_all_room_area(doc)
                crab_res.get_base_room_info = await get_base_room_info(doc)
                crab_res.get_tiny_house_info = await get_tiny_house_info(doc)
                crab_res.cal_res = await cal_and_get(doc, link, crab_res)


                console.log('未找到缓存 开始爬虫2', match_id);
                GM_setValue(match_id, crab_res)

                console.log('未找到缓存 开始爬虫3*******', crab_res);
            }

            if (crab_res) {
                // 将悬浮窗添加到页面中

                let popup = make_popup(crab_res)

                popup.classList.add('popup'); // 添加一个类名以便于样式化
                // 使悬浮窗可拖动
                makeDraggable(popup);
                document.body.appendChild(popup);
                // 使悬浮窗显示
                popup.style.display = 'block';

                // resolve(popup)
                // 获取特定元素的数据
                // const totalElement = document.querySelector('#beike > div.sellDetailPage > div:nth-child(6) > div.overview > div.content > div.price-container > div > span.total');
                // // 获取元素的文本内容并输出到控制台
                // console.log('获取到的数据 并且插入:', totalElement.textContent.trim());
                return popup
            } else {
                console.log('未获取crab_res');
                // GM_deleteValue(key);

            }
        } else {
            console.log('未解析到id');

        }
    }


    async function findElementsAndExtractLinks_doc(link, match_id) {

        return new Promise((resolve, reject) => {
            // 模拟异步操作完成
            setTimeout(() => {
                // 配置请求
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: link,
                    headers: {
                        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "accept-language": "zh-CN,zh;q=0.9",
                        "cache-control": "no-cache",
                        "pragma": "no-cache",
                        "sec-fetch-dest": "document",
                        "sec-fetch-mode": "navigate",
                        "sec-fetch-site": "same-origin",
                        "sec-fetch-user": "?1",
                        "upgrade-insecure-requests": "1",
                        "cookie": "SECKEY_ABVK=kmLdD35iu07BMp2Id8I6R3e7I767bA+r056MeuZ3pilwhiP7U4Kikym+WRl+2uFzkhHnJx5PK7PGpiNC5xYTRg%3D%3D; BMAP_SECKEY=kmLdD35iu07BMp2Id8I6R3e7I767bA-r056MeuZ3pilC_SAOvpJqwNjCQQ7J_Aa0MTKbeufY0hCOSkjKjieMY04GsYkdQBWlE7d6-wSmvjTPc79DwQ2ftv7uXvnKsVx6Us90e_cqIAHPEvjTApALq_lCwSZx2To4OyfyZGluUv6hiArrICfR0Tr6F2euHDmPxJEAm7rVu9lX03rkYvG_Jw; lianjia_uuid=0e7b47c3-3ada-4596-bd7d-f2392a4b469e; Hm_lvt_b160d5571570fd63c347b9d4ab5ca610=1724338322; HMACCOUNT=CB8C84FEB193D705; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%221917a92c0a58a8-0e00986ce3651-26021051-2073600-1917a92c0a6b13%22%2C%22%24device_id%22%3A%221917a92c0a58a8-0e00986ce3651-26021051-2073600-1917a92c0a6b13%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E4%BB%98%E8%B4%B9%E5%B9%BF%E5%91%8A%E6%B5%81%E9%87%8F%22%2C%22%24latest_referrer%22%3A%22https%3A%2F%2Fcn.bing.com%2F%22%2C%22%24latest_referrer_host%22%3A%22cn.bing.com%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC%22%2C%22%24latest_utm_source%22%3A%22biying%22%2C%22%24latest_utm_medium%22%3A%22pinzhuan%22%2C%22%24latest_utm_campaign%22%3A%22wymoren%22%2C%22%24latest_utm_content%22%3A%22biaotimiaoshu%22%2C%22%24latest_utm_term%22%3A%22biaoti%22%7D%7D; login_ucid=2000000002555866; lianjia_token=2.00128825b2682db78403250c83e83ea349; lianjia_token_secure=2.00128825b2682db78403250c83e83ea349; security_ticket=XzzqG/cRJ0Id9Xvc5hc5aSf2mZTca/uceIz2MyaFKkNdnFhtRvWgvte5n8Dn7h45U9D4zDMeyJZPnYhXQEr6bktoB0x/wGTdYKZQwr+grbn+rLHfUI6dIIeiEtI0Cv7Ryu0fSeIoXTkcQVIkoseozSg2YZdPHzKjrLWSskxZxuY=; ftkrc_=b4e8b2eb-4aba-4e40-9000-c48af317158a; lfrc_=27540efd-4273-4d74-a05d-fee54d65f285; digv_extends=%7B%22utmTrackId%22%3A%22%22%7D; crosSdkDT2019DeviceId=dyip8t-fcmjkf-jobxmcmtysyn0jf-ku23qsbnb; session_id=cd0a4144-353d-e62d-a1a4-35f19fa4246b; lianjia_ssid=85ed05b3-ffed-4aea-a61b-f3075d591198; Hm_lpvt_b160d5571570fd63c347b9d4ab5ca610=1724343749; srcid=eyJ0Ijoie1wiZGF0YVwiOlwiNzM5NzU1YWQ3NjY1YzllODIxNzc1ZGY4MjE3Njc3YjRlZDE1YmM3ZGU2ZTYzZWJmYmY5NTc1NDgzNTZkNjRhYzk2YjA3MDM2NmM3YzUwOGEyNWNjZmFjM2UxM2I5YzljZGIwZTY4ZWQxMTgzMjZlMjQ0NzNjNDRiODQwYzI2MTEwZDY2NDM0NzIyY2U2ZGNhYjYzZDM3YzRiMmUxOWIwZmRkMjFmODJiZGI0NTczOWI3YWYwODQ1YjRjZWI0NmQ1MzVjZDFmYTRjMGJhMDZkODc2MmVhMjBiNzNhMWVjYjI3ODUxZjk5MDNjNTk0OTM1ODgyODk5MGU5NDA5OWU1MDM3MjI5MmZjY2I0ZGE2NDdkZjYyY2Q4NDM3Yjk2ZDRhYmEzZTkxNjFmMzI3OGEyNDFjM2I0NmZlZDQ1MWQ0ZGVcIixcImtleV9pZFwiOlwiMVwiLFwic2lnblwiOlwiYTJjODlmYzZcIn0iLCJyIjoiaHR0cHM6Ly9zaC5rZS5jb20vZXJzaG91ZmFuZy8xMDcxMTA1MTkzMDAuaHRtbD9mYl9leHBvX2lkPTg3OTE0MTM0OTgwOTk3OTM5NiIsIm9zIjoid2ViIiwidiI6IjAuMSJ9; select_city=310000",
                    },
                    onload: function (response) {
                        // 使用DOMParser解析返回的HTML字符串
                        const parser = new DOMParser();
                        let doc = parser.parseFromString(response.responseText, 'text/html');


                        resolve(doc)
                    },
                    onerror: function (error) {
                        console.error('请求失败:', error);
                    }
                });
            }, 1000)
        })
    };


    // 使元素可拖动的函数
    function makeDraggable(element) {
        let isDragging = false;
        let startX, startY, initialX, initialY;

        // 鼠标按下事件
        element.addEventListener('mousedown', function (e) {
            isDragging = true;
            initialX = e.clientX - startX;
            initialY = e.clientY - startY;
        });

        // 鼠标移动事件
        document.addEventListener('mousemove', function (e) {
            if (isDragging) {
                e.preventDefault(); // 阻止默认行为，比如选择文本
                startX = e.clientX;
                startY = e.clientY;
                element.style.top = (startY - initialY) + 'px';
                element.style.left = (startX - initialX) + 'px';
            }
        });

        // 鼠标释放事件
        document.addEventListener('mouseup', function (e) {
            isDragging = false;
        });
    }


    /**
     *cal_and_get 获取元素并计算
     */
    async function cal_and_get(document, link, res) {
        // 假设我们要在id为"target"的元素后面显示计算结果
        // 使用逻辑或操作符来简化元素查找过程
        var targetElement = document.getElementById('infoList') || document.getElementById('lessResultIds') || document.getElementById('sellListContent') || document.getElementById('sellListContent ');

        // 检查目标元素是否存在
        if (!targetElement) {
            // 如果元素未找到，抛出一个错误
            var targetElement = document.getElementById('introduction');
            console.error('目标元素未找到');
        }


        // 遍历JSON数组   2024年8月23日21:37:46 新增优化计算建筑面积
        let totalArea = 0;
        // var all_room_area = get_all_room_area(document)
        // var all_room_area =
        res.get_all_room_area.forEach(item => {
            // 提取数字部分并转换为浮点数
            let areaNumber = parseFloat(item.area.replace('平米', ''));
            // 累加到总和中
            // console.log('totalArea  item', item)

            totalArea += areaNumber;
        });
        console.log('totalArea', totalArea)

        // 创建一个新元素来展示计算结果
        // var resultElement = doc.createElement('div');
        // resultElement.textContent = '总和: ' + totalArea.toFixed(2) + ' 平米';

        var totalElement = document.querySelector('#beike > div.sellDetailPage > div:nth-child(6) > div.overview > div.content > div.price-container > div > span.total');
        var total = parseFloat(totalElement.textContent.trim().match(/\d+(?:\.\d+)?/)[0]);

        var unitPriceElement = document.querySelector('#beike > div.sellDetailPage > div:nth-child(6) > div.overview > div.content > div.price-container > div > div.text > div.unitPrice > span');
        var unitPrice = parseFloat(unitPriceElement.textContent.trim().match(/\d+(?:\.\d+)?/)[0]);


        var areaElement = document.querySelector('#introduction > div > div > div.base > div.content > ul > li:nth-child(2)');
        var buildingArea = parseFloat(areaElement.textContent.trim().match(/\d+(?:\.\d+)?/)[0]);
        // 计算得房率
        var efficiencyRate = totalArea / buildingArea;
        var realPerice = total / totalArea;

        return {
            totalArea: totalArea.toFixed(2),
            buildingArea: buildingArea.toFixed(2),
            efficiencyRate: efficiencyRate.toFixed(2),
            total: total.toFixed(2),
            realPerice: realPerice.toFixed(2),
            unitPrice: (unitPrice / 10000).toFixed(2),
            realPericeRate: (1 - (unitPrice / 10000) / realPerice).toFixed(4),
        }

    }


    function make_popup(crab_res_in) {
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
        popup.style.height = 'auto';
        popup.style.textAlign = 'center';
        popup.style.borderRadius = '5px';

        // 添加关闭按钮
        // let closeButton = document.createElement('span');
        // closeButton.textContent = '×';
        // closeButton.style.position = 'absolute';
        // closeButton.style.top = '-10px';
        // closeButton.style.right = '-10px';
        // closeButton.style.cursor = 'pointer';
        // closeButton.style.color = '#fff';
        // closeButton.style.backgroundColor = '#333';
        // closeButton.style.padding = '5px 10px';
        // closeButton.style.borderRadius = '50%';
        // closeButton.style.fontSize = '12px';
        // closeButton.addEventListener('click', function () {
        //     popup.style.display = 'none';
        // });
        // popup.appendChild(closeButton);


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
        popup.innerHTML += `<p>单价: ${crab_res_in.cal_res.unitPrice} 万    实际单价: ${crab_res_in.cal_res.realPerice} 万  </p>`;
        popup.innerHTML += `<p>实际单价折扣率: ${crab_res_in.cal_res.realPericeRate} %</p>`;

        return popup
    }


    async function get_all_room_area(document) {
        var roomInfoArray = [];

        // 使用逻辑或操作符来简化元素查找过程
        var infoList = document.getElementById('infoList');

        // 检查目标元素是否存在
        if (!infoList) {
            // 如果元素未找到，抛出一个错误
            var infoList = document.getElementById('introduction');
            console.error('目标元素未找到');
        }
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


    async function get_base_room_info(document) {
        var houseInfo = {};
        var listItems = document.querySelectorAll('.content li');
        listItems.forEach(function (item) {
            var label = item.querySelector('.label');
            var labelContent = label ? label.textContent.trim() : '';
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


    async function get_tiny_house_info(document) {
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
            '房屋信息': {'房间': roomInfo, '类型': typeInfo, '面积': areaInfo},
            '区域信息': {'小区名称': communityName, '所在区域': areaName}, '贝壳编号': 贝壳编号, 'url': url
        };
        console.log(houseInfo);

        // 返回房屋信息JSON对象
        return houseInfo;
    }


    async function save_house_info(jsonData) {
        // 假设你已经有了access_token和spreadsheetToken  https://wq4u3glemd.feishu.cn/sheets/DFgKsJ2brhPgMgtFwSYc9nBznBh?from=from_copylink
        const accessToken = 'N0gXbhqWAfH4Z53VAY7Awb6LrpYp751l';
        const spreadsheetToken = 'DFgKsJ2brhPgMgtFwSYc9nBznBh';
        const range = 'A1'; // 插入数据的起始单元格

        // 要插入的JSON数据示例
        // const jsonData = {
        //     "column1": ["row1", "row2", "row3"],
        //     "column2": [1, 2, 3]
        // };

        // 将JSON数据转换为飞书API接受的格式
        function convertToJsonForFeishu(jsonData) {
            // 这里需要根据飞书API的要求来转换JSON数据
            // 例如，可能需要将JSON对象转换成数组的形式
            // 这里只是一个示例，实际转换逻辑需要根据飞书API的文档来确定
            let dataForFeishu = [];
            for (let key in jsonData) {
                dataForFeishu.push([key, ...jsonData[key]]);
            }
            return dataForFeishu;
        }

        // 发送请求到飞书API
        function insertDataToFeishu(accessToken, spreadsheetToken, data) {
            const url = `https://open.feishu.cn/open-apis/sheet/v2/spreadsheet/${spreadsheetToken}/range/${range}`;
            // 设置请求头
            const headers = {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            };

            // 发送POST请求
            fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }

        // 调用函数插入数据
        function main() {
            const dataForFeishu = convertToJsonForFeishu(jsonData);
            insertDataToFeishu(accessToken, spreadsheetToken, dataForFeishu);
        }

        main();
    }


})();





