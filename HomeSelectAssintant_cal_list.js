// ==UserScript==
// @name         选房助手_房源信息精确计算_列表页 批量搜索。 HomeSelectAssintant
// @namespace   Violentmonkey Scripts v
// @description  选房助手_房源信息精确计算_详情页。在页面上的特定位置显示“平米”前数字的总和。用于计算套内面积。 同时计算得房率，显示得房率等级。便于快速判断房子的性价比。
// @match       https://*.ke.com/*
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_listValues
// @grant       GM_deleteValue
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
    var elementsToRemove = document.querySelectorAll('#sticky-wrapper > div');
    // 遍历并删除这些元素   广告 删除
    elementsToRemove.forEach(function (element) {
        element.remove();
    });
    var elementsToRemove = document.querySelectorAll('#beike > div.sellListPage > div.content > div.leftContent > div > ul > li.list_goodhouse_daoliu');
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


    download_csv_sale()

    function download_csv_sale() {// 创建悬浮窗并添加到页面的左上角
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
        statusElement.textContent = '缓存房源：未知';
        overlay.appendChild(statusElement);

        // 使用 GM_listValues 获取所有键名
        var keys = GM_listValues();

// 使用 filter 方法筛选出以数字 '1' 开头的键名
        var filteredKeys = keys.filter(key => key.startsWith('1'));

        // 使用 map 方法遍历筛选后的键名数组，获取对应的值，并将它们存储在 items 数组中
        var items = filteredKeys.map(key => {
            var value = GM_getValue(key);
            try {
                // 尝试将值解析为 JSON 对象
                var parsedValue = JSON.parse(value);
                // 返回键名和解析后的值作为对象
                return {key: key, value: parsedValue};
            } catch (e) {
                console.error('解析 缓存房源 GM_getValue 中的值失败:', e);
                // 如果解析失败，返回 null 或其他错误处理方式
                return null;
            }
        }).filter(item => item !== null); // 移除解析失败的项

        // 计算数据条数并更新状态元素
        var totalItems = items.length;
        statusElement.textContent = '缓存房源条数：' + totalItems;
// 创建一个按钮并添加到悬浮窗中
        var exportButton = document.createElement('button');
        exportButton.textContent = '导出缓存房源';
        overlay.appendChild(exportButton);

// 为按钮添加点击事件监听器
        exportButton.addEventListener('click', function () {
            if (items.length === 0) {
                alert('没有可导出的缓存房源数据！');
                return;
            }

            // 获取所有字段名（键名）
            var fieldNames = getUniqueFieldNames(items);
            var header = fieldNames.map(function (fieldName) {
                return `"${fieldName}"`;
            }).join('|') + '\n';

            // 创建CSV的内容行
            var csvContent = items.map(function (item) {
                var values = fieldNames.map(function (fieldName) {
                    var value = getValueFromObject(item.value, fieldName);
                    // 如果值是对象或数组，转换为JSON字符串，否则直接转换为字符串
                    return typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
                });
                return values.join('|');
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
    }

    download_csv_deal()

    function download_csv_deal() {// 创建悬浮窗并添加到页面的左上角
        var overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.left = '10px';
        overlay.style.top = '140px';
        overlay.style.backgroundColor = 'white';
        overlay.style.padding = '10px';
        overlay.style.zIndex = '1000';
        overlay.style.borderRadius = '5px';
        overlay.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        document.body.appendChild(overlay);

// 显示当前GM_setValue数据的总条数
        var statusElement = document.createElement('p');
        statusElement.textContent = '缓存成交：未知';
        overlay.appendChild(statusElement);

        // 使用 GM_listValues 获取所有键名
        var keys = GM_listValues();

// 使用 filter 方法筛选出以数字 '1' 开头的键名
        var filteredKeys = keys.filter(key => key.startsWith('5'));

        // 使用 map 方法遍历筛选后的键名数组，获取对应的值，并将它们存储在 items 数组中
        var items = filteredKeys.map(key => {
            var value = GM_getValue(key);
            try {
                // 尝试将值解析为 JSON 对象
                var parsedValue = JSON.parse(value);
                // 返回键名和解析后的值作为对象
                return {key: key, value: parsedValue};
            } catch (e) {
                console.error('解析缓存成交 GM_getValue 中的值失败:', e);
                // 如果解析失败，返回 null 或其他错误处理方式
                return null;
            }
        }).filter(item => item !== null); // 移除解析失败的项

        // 计算数据条数并更新状态元素
        var totalItems = items.length;
        statusElement.textContent = '缓存成交：' + totalItems;
// 创建一个按钮并添加到悬浮窗中
        var exportButton = document.createElement('button');
        exportButton.textContent = '导出缓存成交';
        overlay.appendChild(exportButton);

// 为按钮添加点击事件监听器
        exportButton.addEventListener('click', function () {
            if (items.length === 0) {
                alert('没有可导出的缓存成交数据！');
                return;
            }

            // 获取所有字段名（键名）
            var fieldNames = getUniqueFieldNames(items);
            var header = fieldNames.map(function (fieldName) {
                return `"${fieldName}"`;
            }).join('|') + '\n';

            // 创建CSV的内容行
            var csvContent = items.map(function (item) {
                var values = fieldNames.map(function (fieldName) {
                    var value = getValueFromObject(item.value, fieldName);
                    // 如果值是对象或数组，转换为JSON字符串，否则直接转换为字符串
                    return typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
                });
                return values.join('|');
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
    }

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


    // clear_g()

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

    function get_sale_info_list() {
        //   获取在售房屋信息列表
        // 初始化一个数组来保存所有房源信息
        var properties = [];

        // 获取所有列表项
        var items = document.querySelectorAll('.sellListContent li');
        items.forEach(function (item) {
            // 提取信息
            var title = item.querySelector('.title a')?.textContent.trim() ?? '';
            var address = item.querySelector('.positionInfo a')?.textContent.trim() ?? '';
            if (!address) {
                var address = item.querySelector('.address a')?.textContent.trim() ?? '';
            }
            var positionId = item.querySelector('.positionInfo a')?.href.match(/\/(\d+)\//)?.[1] ?? null;
            if (!positionId) {
                var positionId = item.querySelector('.address a')?.href.match(/\/(\d+)\//)?.[1] ?? null;
            }
            var price = item.querySelector('.totalPrice')?.textContent.trim() ?? '';
            var numericPrice = price.replace(/[^\d\.]/g, ''); // 移除所有非数字和小数点的字符
            var unitPrice = item.querySelector('.unitPrice span')?.textContent.trim() ?? '';
            var numericunitPrice = unitPrice.replace(/[^\d\.]/g, ''); // 移除所有非数字和小数点的字符

            var link = item.querySelector('.title a')?.href ?? '';

            // 使用正则表达式从链接中提取数字部分
            var match = link.match(/\/(\d+)\.html/);
            var id = match ? match[1] : null;

            // 构建房源信息对象并添加到数组中
            var propertyInfo = {
                title: title,
                address: address,
                positionId: positionId,
                // price: price,
                numericPrice: numericPrice,
                // unitPrice: unitPrice,
                numericunitPrice: numericunitPrice,
                link: link,
                id: id
            };
            properties.push(propertyInfo);
        });

        // 将数组转换为JSON字符串
        var propertiesJson = JSON.stringify(properties, null, 2);
        console.log('get_sale_info_list', properties);

        return properties
        // 输出JSON字符串到控制台（或保存到文件、发送到服务器等）
    }

    function get_suggest_info_list() {
        var properties = [];
        // 获取指定节点下的所有列表项
        var items = document.querySelectorAll('#lessResultIds .sellListContent li');
        items.forEach(function (item) {
            // 初始化当前房源信息对象
            var propertyInfo = {};

            // 提取标题中的链接和文本
            var titleLinkNode = item.querySelector('.title a');
            propertyInfo.title = titleLinkNode ? titleLinkNode.textContent.trim() : '';
            propertyInfo.link = titleLinkNode ? titleLinkNode.href : '';

            // 提取地址信息
            var addressNode = item.querySelector('.address .houseInfo a');
            propertyInfo.address = addressNode ? addressNode.textContent.trim() : '';

            // 提取位置信息（楼层和建造年份）
            var positionNode = item.querySelector('.positionInfo');
            propertyInfo.position = positionNode ? positionNode.textContent.trim() : '';


            var positionId = item.querySelector('.positionInfo a')?.href.match(/\/(\d+)\//)?.[1] ?? null;
            if (!positionId) {
                var positionId = item.querySelector('.address a')?.href.match(/\/(\d+)\//)?.[1] ?? null;
                // var positionId = document.querySelector('.address a')?.href.match(/\/(\d+)\//)?.[1] ?? null;
            }
            propertyInfo.positionId = positionNode ? positionNode.textContent.trim() : '';

            // 提取价格信息
            var totalPriceNode = item.querySelector('.totalPrice');
            propertyInfo.totalPrice = totalPriceNode ? totalPriceNode.textContent.trim() : '';

            var unitPriceNode = item.querySelector('.unitPrice span');
            propertyInfo.unitPrice = unitPriceNode ? unitPriceNode.textContent.trim() : '';

            // 使用正则表达式从链接中提取数字部分
            var match = propertyInfo.link.match(/\/(\d+)\.html/);
            propertyInfo.id = match ? match[1] : null;

            // 将当前房源信息添加到数组中
            properties.push(propertyInfo);
        });

        // 将所有房源信息转换为JSON格式并输出
        var propertiesJson = JSON.stringify(properties, null, 2);
        console.log('get_suggest_info_list', properties);

        return properties;
    }


    function get_suggest_node_list(document) {
        var properties = [];
        var items = document.querySelectorAll('#lessResultIds .sellListContent li');
        items.forEach(function (item) {
            var propertyInfo = {};
            // 提取标题中的a标签节点
            var titleLinkNode = item.querySelector('.title a');
            propertyInfo.titleLinkNode = titleLinkNode ? titleLinkNode : null;
            // // 提取地址信息
            // var addressNode = item.querySelector('.address .houseInfo a');
            // propertyInfo.addressNode = addressNode ? addressNode : null;
            // // 提取位置信息（楼层和建造年份）
            // var positionInfoNode = item.querySelector('.positionInfo');
            // propertyInfo.positionInfoNode = positionInfoNode ? positionInfoNode : null;
            // // 提取价格信息
            // var totalPriceNode = item.querySelector('.totalPrice');
            // propertyInfo.totalPriceNode = totalPriceNode ? totalPriceNode : null;
            // var unitPriceNode = item.querySelector('.unitPrice span');
            // propertyInfo.unitPriceNode = unitPriceNode ? unitPriceNode : null;
            // 将当前房源信息添加到数组中
            properties.push(propertyInfo);
        });

        // 将所有房源信息转换为JSON格式并输出
        var propertiesJson = JSON.stringify(properties, null, 2);
        console.log('get_suggest_node_list', properties);
        return properties
    }


    async function get_deal_info_list(document) {
        // 选择目标元素
        var listContent = document.querySelector('#beike > div.dealListPage > div.content > div.leftContent > div > ul');
        if (listContent) {
            // 初始化一个数组来保存所有房源信息
            var properties = [];
            // 获取所有列表项
            var items = listContent.querySelectorAll('li');
            items.forEach(async function (item) {
                // 创建一个对象来保存当前房源的信息
                var property = {
                    id: String(item.querySelector('a').getAttribute('href')).match(/\/(\d+)\.html/)[1],
                    viewEventId: item.getAttribute('data-view-evtid'),
                    link: item.querySelector('a').getAttribute('href'),
                    title: item.querySelector('.title a').innerText.trim(),
                    address: item.querySelector('.address .houseInfo').innerText.trim(),
                    dealDate: item.querySelector('.dealDate').innerText.trim(),
                    totalPrice: item.querySelector('.totalPrice .number').innerText.trim() + '万',
                    unitPrice: item.querySelector('.unitPrice .number').innerText.trim() + '元/平',
                    positionInfo: item.querySelector('.positionInfo').innerText.trim(),
                    dealCycle: item.querySelector('.dealCycleeInfo .dealCycleTxt').innerText.trim()
                };

                // 检查是否所有需要的信息都存在
                if (property.link && property.title && property.address && property.dealDate && property.totalPrice && property.unitPrice && property.positionInfo && property.dealCycle) {
                    // 将房源信息对象添加到数组中
                    properties.push(property);
                } else {
                    console.error('缺少某些信息，无法提取 deal 完整数据。');
                }
            });
            // 将数组转换为JSON字符串
            var propertiesJson = JSON.stringify(properties, null, 2);

            // 输出JSON字符串到控制台（或保存到文件、发送到服务器等）
            console.log(properties);
            return properties;
        } else {
            console.error('未能找到目标 deal 元素。');
            return [];
        }
    }
// 用于在每个链接后面插入悬浮窗的函数
    async function insertPopupAfterLink(linkSelector, sale_info_list) {
        // 获取所有匹配的链接元素
        // let links = document.querySelectorAll('#beike > div.sellListPage > div.content > div.leftContent > div:nth-child(4) > ul > li > div > div.title > a');
        // let links = document.querySelectorAll('#lessResultIds > ul > li > div.info.clear > div.title > a');
        let links = document.querySelectorAll(linkSelector);
        console.log('links', links);

        if (links.length === 0) {         // 如果没有找到任何链接，直接返回
            console.log('未找到匹配的 links 链接元素');
            return;
        }

        // 遍历所有链接，并在每个链接后面添加悬浮窗
        for (let i = 0; i < links.length; i++) {
            let link = links[i];
            let sale_info = sale_info_list[i]; // 从sale_info_list中获取positionId

            // 调用findElementsAndExtractLinks函数，并传入link和positionId
            let popup = await findElementsAndExtractLinks(link, sale_info);

            // 尝试将悬浮窗插入到链接元素后面
            try {
                if (link.nextSibling) {
                    link.parentNode.insertBefore(popup[0], link.nextSibling);
                    link.parentNode.insertBefore(popup[1], link.nextSibling);

                } else {
                    link.parentNode.appendChild(popup);
                }
            } catch (error) {
                console.error('无法在链接后面添加悬浮窗:', error);
            }
        }
    }

// 假设sale_info_list是一个对象数组，每个对象至少包含一个positionId属性
// 你需要确保sale_info_list和links数组长度相同，且它们的元素是对应的

    // 监听页面加载完成
    window.addEventListener('load', async function () {

// 选择器用于定位特定的<a>元素
        const saleLinkSelector = '#beike > div.sellListPage > div.content > div.leftContent > div:nth-child(4) > ul > li > div > div.title > a';
        var sale_info_list = get_sale_info_list()
        await insertPopupAfterLink(saleLinkSelector, sale_info_list);


        const suggestLinkSelector = '#lessResultIds > ul > li > div.info.clear > div.title > a';
        var suggest_info_list = get_suggest_info_list()
        await insertPopupAfterLink(suggestLinkSelector, suggest_info_list);

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


    async function findElementsAndExtractLinks(link, sale_info) {
        // 异步操作
        const match = String(link).match(/\/(\d+)\.html/);
        const match_id = match[1]; // match[1] 是正则表达式中第一个括号捕获的内容
        const positionId = sale_info.positionId   // 小区使用小区ID

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
                var doc = await findElementsAndExtractLinks_doc(link, '')

                // 非常重要， 组装全部数据
                var crab_res = {};
                crab_res.id = match_id
                crab_res.is_catch = false
                crab_res.create_time = new Date().toISOString()

                crab_res.get_all_room_area = await get_all_room_area(doc)
                crab_res.get_base_room_info = await get_base_room_info(doc)
                crab_res.get_tiny_house_info = await get_tiny_house_info(doc)
                crab_res.cal_res = await cal_and_get(doc, link, crab_res)


                console.log('未找到缓存 开始爬虫2', match_id);
                GM_setValue(match_id, crab_res)

                console.log('未找到缓存 开始爬虫3*******', crab_res);
            }


            // 此处开始构造小区信息
            let deal_info_list_catch = GM_getValue(positionId)
            if (deal_info_list_catch) {
                deal_info_list_catch.is_positionId_catch = true
                var deal_info_list = deal_info_list_catch
                console.log('小区成交信息 deal_info_list  已找到缓存', positionId, deal_info_list);

            } else {
                var addressCN = sale_info.address  // 查询整个小区使用小区的名字
                var doc_xiaoqu = await findElementsAndExtractLinks_doc(link, addressCN)
                console.log('小区成交信息 doc_xiaoqu  开始缓存doc', doc_xiaoqu);

                var deal_info_list = await get_deal_info_list(doc_xiaoqu)

                console.log('小区成交信息 deal_info_list  开始缓存', addressCN, deal_info_list);
                GM_setValue(positionId, deal_info_list)

            }

            if (deal_info_list) {
                // 将悬浮窗添加到页面中

                let popup = make_popup(crab_res, '')
                // LEON  2024年8月28日23:15:40  修改 去除重复房源问题。   暂时不去重
                // var unique_deal_info_list = uniqueByProperty(deal_info_list, 'id').map(item => {

                var unique_deal_info_list = deal_info_list.map(item => {
                    return {
                        id: item.id,
                        // viewEventId:15431,
                        link: item.link,
                        dealDate: item.dealDate,
                        totalPrice: item.totalPrice,
                        unitPrice: item.unitPrice,
                        title: item.title,
                        address: item.address,
                        // positionInfo:中楼层(共35层) 2002年塔楼,
                        // dealCycle:挂牌539万\n                                                                                                    成交周期20天};
                    };
                })
                let DealInfoPopup = showDealInfoPopup(unique_deal_info_list, deal_info_list.is_positionId_catch);


                // popup.classList.add('popup'); // 添加一个类名以便于样式化
                // makeDraggable(popup);
                // document.body.appendChild(popup);
                // popup.style.display = 'block';
                return [popup, DealInfoPopup]
            } else {
                console.log('未获取crab_res');
                // GM_deleteValue(key);

            }
        } else {
            console.log('未解析到id');

        }
    }


    async function findElementsAndExtractLinks_doc(link, addressCN) {
        return new Promise((resolve, reject) => {
            // 模拟异步操作完成
            if (addressCN) {
                link = 'https://sh.ke.com/chengjiao/rs' + addressCN
            }
            setTimeout(() => {
                // 配置请求
                GM_xmlhttpRequest({
                    method: 'GET', url: link,
                    // headers: {
                    //     "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    //     "accept-language": "zh-CN,zh;q=0.9",
                    //     "cache-control": "no-cache",
                    //     "pragma": "no-cache",
                    //     "sec-fetch-dest": "document",
                    //     "sec-fetch-mode": "navigate",
                    //     "sec-fetch-site": "same-origin",
                    //     "sec-fetch-user": "?1",
                    //     "upgrade-insecure-requests": "1",
                    //     // "cookie": "SECKEY_ABVK=kmLdD35iu07BMp2Id8I6R3e7I767bA+r056MeuZ3pilwhiP7U4Kikym+WRl+2uFzkhHnJx5PK7PGpiNC5xYTRg%3D%3D; BMAP_SECKEY=kmLdD35iu07BMp2Id8I6R3e7I767bA-r056MeuZ3pilC_SAOvpJqwNjCQQ7J_Aa0MTKbeufY0hCOSkjKjieMY04GsYkdQBWlE7d6-wSmvjTPc79DwQ2ftv7uXvnKsVx6Us90e_cqIAHPEvjTApALq_lCwSZx2To4OyfyZGluUv6hiArrICfR0Tr6F2euHDmPxJEAm7rVu9lX03rkYvG_Jw; lianjia_uuid=0e7b47c3-3ada-4596-bd7d-f2392a4b469e; Hm_lvt_b160d5571570fd63c347b9d4ab5ca610=1724338322; HMACCOUNT=CB8C84FEB193D705; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%221917a92c0a58a8-0e00986ce3651-26021051-2073600-1917a92c0a6b13%22%2C%22%24device_id%22%3A%221917a92c0a58a8-0e00986ce3651-26021051-2073600-1917a92c0a6b13%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E4%BB%98%E8%B4%B9%E5%B9%BF%E5%91%8A%E6%B5%81%E9%87%8F%22%2C%22%24latest_referrer%22%3A%22https%3A%2F%2Fcn.bing.com%2F%22%2C%22%24latest_referrer_host%22%3A%22cn.bing.com%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC%22%2C%22%24latest_utm_source%22%3A%22biying%22%2C%22%24latest_utm_medium%22%3A%22pinzhuan%22%2C%22%24latest_utm_campaign%22%3A%22wymoren%22%2C%22%24latest_utm_content%22%3A%22biaotimiaoshu%22%2C%22%24latest_utm_term%22%3A%22biaoti%22%7D%7D; login_ucid=2000000002555866; lianjia_token=2.00128825b2682db78403250c83e83ea349; lianjia_token_secure=2.00128825b2682db78403250c83e83ea349; security_ticket=XzzqG/cRJ0Id9Xvc5hc5aSf2mZTca/uceIz2MyaFKkNdnFhtRvWgvte5n8Dn7h45U9D4zDMeyJZPnYhXQEr6bktoB0x/wGTdYKZQwr+grbn+rLHfUI6dIIeiEtI0Cv7Ryu0fSeIoXTkcQVIkoseozSg2YZdPHzKjrLWSskxZxuY=; ftkrc_=b4e8b2eb-4aba-4e40-9000-c48af317158a; lfrc_=27540efd-4273-4d74-a05d-fee54d65f285; digv_extends=%7B%22utmTrackId%22%3A%22%22%7D; crosSdkDT2019DeviceId=dyip8t-fcmjkf-jobxmcmtysyn0jf-ku23qsbnb; session_id=cd0a4144-353d-e62d-a1a4-35f19fa4246b; lianjia_ssid=85ed05b3-ffed-4aea-a61b-f3075d591198; Hm_lpvt_b160d5571570fd63c347b9d4ab5ca610=1724343749; srcid=eyJ0Ijoie1wiZGF0YVwiOlwiNzM5NzU1YWQ3NjY1YzllODIxNzc1ZGY4MjE3Njc3YjRlZDE1YmM3ZGU2ZTYzZWJmYmY5NTc1NDgzNTZkNjRhYzk2YjA3MDM2NmM3YzUwOGEyNWNjZmFjM2UxM2I5YzljZGIwZTY4ZWQxMTgzMjZlMjQ0NzNjNDRiODQwYzI2MTEwZDY2NDM0NzIyY2U2ZGNhYjYzZDM3YzRiMmUxOWIwZmRkMjFmODJiZGI0NTczOWI3YWYwODQ1YjRjZWI0NmQ1MzVjZDFmYTRjMGJhMDZkODc2MmVhMjBiNzNhMWVjYjI3ODUxZjk5MDNjNTk0OTM1ODgyODk5MGU5NDA5OWU1MDM3MjI5MmZjY2I0ZGE2NDdkZjYyY2Q4NDM3Yjk2ZDRhYmEzZTkxNjFmMzI3OGEyNDFjM2I0NmZlZDQ1MWQ0ZGVcIixcImtleV9pZFwiOlwiMVwiLFwic2lnblwiOlwiYTJjODlmYzZcIn0iLCJyIjoiaHR0cHM6Ly9zaC5rZS5jb20vZXJzaG91ZmFuZy8xMDcxMTA1MTkzMDAuaHRtbD9mYl9leHBvX2lkPTg3OTE0MTM0OTgwOTk3OTM5NiIsIm9zIjoid2ViIiwidiI6IjAuMSJ9; select_city=310000"
                    // },
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
    function showDealInfoPopup(deal_info_list, is_positionId_catch) {
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
        content.innerHTML = `<h3>详细成交信息   ${is_positionId_catch ? '(缓存)' : '(实时)'}</h3>`;
        // 遍历 deal_info_list 数组
        deal_info_list.forEach(info => {
            // 创建一个 div 元素来显示信息
            let itemDiv = document.createElement('div');
            itemDiv.innerHTML = '<strong></strong>';
            // 为 id 属性的值添加 href 属性，并将其值设置为 link 属性的值
            if (info.hasOwnProperty('id') && info.hasOwnProperty('link')) {
                var deal_link = `<a style="font-size: 7px;" href="${info.link}" target="_blank">${info.id}  ㅤ</a> `;
                itemDiv.innerHTML = deal_link

            }

            // 删除 link 属性
            delete info['id'];
            delete info['link'];


            // 遍历对象的键值对
            for (let key in info) {
                // 过滤掉不想要显示的属性
                if (key !== 'address' && key !== 'link') { // 这里假设我们不想要显示 'address' 和 'link'
                    let itemKey = document.createElement('span');
                    // itemKey.style.fontWeight = 'bold';
                    itemKey.textContent = `${key}:`;

                    let itemValue = document.createElement('span');
                    itemValue.textContent = `${info[key]}  ㅤ`;

                    // 将键和值添加到 div 中
                    // itemDiv.appendChild(itemKey);
                    itemDiv.appendChild(itemValue);
                    itemDiv.appendChild(document.createTextNode('\n')); // 添加换行
                }
            }

            // 将创建好的 div 添加到页面的某个元素中
            // 假设 content 是页面中已经存在的一个元素
            content.appendChild(itemDiv);
        });
        detailsPopup.appendChild(content);

        // 将新的悬浮窗添加到页面中
        document.body.appendChild(detailsPopup);

        // 使新的悬浮窗可拖动
        makeDraggable(detailsPopup);
        return detailsPopup;
    }

// 调用 make_popup 函数以创建初始悬浮窗
// make_popup(crab_res_in, deal_info_list);


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
        popup.innerHTML += `<p>单价:${crab_res_in.cal_res.unitPrice} 万  套内单价:${crab_res_in.cal_res.realPerice} 万  </p>`;
        popup.innerHTML += `<p>套内单价折扣率: ${crab_res_in.cal_res.realPericeRate} %</p>`;

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


    async function get_tiny_house_info() {
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


    function AreaHistoryDeal() {
        // 创建一个空数组来存储提取的数据
        var extractedData = [];

        // 选择页面中的所有列表项，这里假设你的HTML结构是标准的，且已知具体的类名
        var listItems = document.querySelectorAll('.listContent li');

        // 遍历所有列表项
        listItems.forEach(function (item) {
            // 创建一个对象来保存当前列表项的数据
            var itemData = {};

            // 提取并保存每个列表项中的数据
            // 假设每个列表项中都有一个<a>标签，且其包含的文本是我们需要的标题信息
            var titleElement = item.querySelector('.title a');
            if (titleElement) {
                itemData.title = titleElement.textContent.trim();
            }

            // 重复上述过程，为其他需要的属性提取数据
            // ...

            // 将当前项的数据对象添加到数组中
            extractedData.push(itemData);
        });

        // 将提取的数据转换为JSON字符串
        var jsonData = JSON.stringify(extractedData, null, 2);

        // 输出JSON字符串到控制台，你可以选择将其保存到文件或发送到服务器
        console.log(jsonData);
        // 这里可以添加代码将jsonData保存到文件或通过AJAX发送到服务器

    }


})();





