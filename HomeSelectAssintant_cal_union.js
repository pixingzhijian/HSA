// ==UserScript==
// @name         选房助手_房源信息精确计算_多脚本合并版。 HomeSelectAssintant_union
// @namespace   Violentmonkey Scripts v
// @description  选房助手_房源信息精确计算_详情页。在页面上的特定位置显示“平米”前数字的总和。用于计算套内面积。 同时计算得房率，显示得房率等级。便于快速判断房子的性价比。
// @match       https://*.ke.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @version     4.0.5
// @author      Leon
// @description 2024/8/23 00:33:59
// @downloadURL http://git.nling.site/adminplokijn/HSA/raw/master/HomeSelectAssintant_cal_union.js

// @note 6.0.0 TODO:运用模型选房，运用机器学习模型进行评分
// @note 5.0.1 TODO:快捷可视化分析
// @note 5.0.0 TODO: 远端保存缓存数据，减轻服务器压力
// @note 4.0.5 修复小区缓存问题, 减少获取数据次数，  增加详情页的小区成交记录信息。
// @note 4.0.4 修复小区成交列表可拖动问题。
// @note 4.0.1 修复小区缓存问题
// @note 4.0.0 完成 小区成交批量查询 与页面显示！！ 新增推荐房源检测并查询！


// @note 3.1.0 更新热更新， 更新合并独立文件。


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


(function() {
    'use strict';

    // 当前页面的URL路径
    var currentPath = window.location.pathname;

    // 定义不同路径对应的脚本文件URL
     var scriptPaths = {
         '/ershoufang/*/': 'http://git.nling.site/adminplokijn/HSA/raw/master/HomeSelectAssintant_cal_list.js',
         '/ershoufang/*': 'http://git.nling.site/adminplokijn/HSA/raw/master/HomeSelectAssintant_cal_detail.js',
         '/chengjiao/*': 'http://git.nling.site/adminplokijn/HSA/raw/master/HomeSelectAssintant_cal_deal.js',
         // 更多子目录和对应的脚本文件...
     };

    // 检查当前路径是否匹配scriptPaths中的某个模式
    Object.keys(scriptPaths).forEach(function(pattern) {
        // 使用正则表达式来匹配当前路径
        var regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        if (regex.test(currentPath)) {
            // 如果匹配成功，加载对应的脚本文件
            loadScript(scriptPaths[pattern]);
        }
    });

    // 定义一个函数来加载脚本文件
    function loadScript(url) {
        // 使用GM.xmlHttpRequest来异步加载脚本文件
        GM.xmlHttpRequest({
            method: 'GET',
            url: url,
            onload: function (response) {
                // // 创建一个新的script元素，并将脚本内容插入到页面中执行
                // var script = document.createElement('script');
                // script.textContent = response.responseText;
                // document.body.appendChild(script);
                // // 当脚本加载完成后，从body中移除script元素
                // script.onload = function () {
                //     document.body.removeChild(script);
                // };
                eval(response.responseText);
            },
            onerror: function (error) {
                console.error('加载脚本失败:', error);
            }
        });
    }
})();

