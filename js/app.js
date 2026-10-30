// 骑开得胜 - 原型交互脚本

// 全局状态
const state = {
    currentPage: 'home',
    pageHistory: [],
    problemType: 'merchant',
    platform: 'eleme',
    editingDraft: false,
    draftText: '',
    currentRulePlatform: 'eleme',
    currentCasePlatform: 'eleme'
};

// 页面标题映射
const pageTitles = {
    home: '骑开得胜',
    problem: '选择问题类型',
    form: '填写情况',
    rule: '规则解读',
    evidence: '证据清单',
    draft: '申诉初稿',
    library: '规则库与案例库',
    profile: '我的'
};

// 问题类型配置
const problemConfig = {
    navigation: {
        title: '导航或定位异常',
        icon: '🧭',
        ruleOriginal: '因平台导航定位偏差或路线规划不合理，导致骑手实际行驶距离、时间明显超出系统预估，进而影响配送时效的，骑手可提交导航截图、实际行驶路线等证据进行申诉。经核实确属系统导航问题的，不对骑手进行超时处罚。',
        explain: '如果平台导航让你绕了远路、定位不准，导致你送餐晚了，你可以把导航截图和实际路线作为证据申诉。平台核实后，不该扣你的钱或影响评分。',
        conditions: [
            '保留了平台导航推荐路线截图',
            '实际行驶路线与系统推荐存在明显偏差',
            '因导航问题导致订单最终超时',
            '能提供订单时间、实际到达时间等佐证'
        ],
        source: '平台公开骑手规则中心 / 帮助文档',
        category: '导航或定位异常',
        evidence: [
            { title: '平台导航截图', desc: '显示系统推荐的行驶路线和预计时间' },
            { title: '实际行驶路线截图', desc: '显示实际骑行轨迹，证明存在偏差' },
            { title: '订单时间截图', desc: '包含到店、取餐、送达时间' },
            { title: '路况说明（如有）', desc: '交通管制、道路施工等客观情况说明' }
        ]
    },
    merchant: {
        title: '商家出餐慢',
        icon: '🍜',
        ruleOriginal: '因商家原因导致订单出餐延误，骑手应在到店后及时通过APP进行「商家出餐慢」报备，系统将根据报备时间、商家实际出餐时间等信息进行综合判定。经核实确属商家责任的，不对骑手进行超时处罚。',
        explain: '如果商家做饭慢了导致你取餐晚、最终订单超时，只要你在APP里及时点了"商家出餐慢"报备，并且平台核实确实是商家的责任，就不应该扣你的钱或影响你的评分。',
        conditions: [
            '到店后已在APP内进行"商家出餐慢"报备',
            '报备时间与实际等待时间能够相互印证',
            '订单确实存在因商家出餐慢导致的超时',
            '能提供订单时间截图或商家沟通记录作为佐证'
        ],
        source: '蜂鸟众包公开骑手规则中心 / 帮助文档',
        category: '商家出餐慢',
        evidence: [
            { title: '到店时间截图', desc: 'APP内显示到达商家的时间，证明骑手按时到店' },
            { title: '「商家出餐慢」报备记录', desc: '在APP内提交的报备截图，需包含提交时间' },
            { title: '实际取餐时间截图', desc: '显示最终取餐时间，证明等待时长超出合理范围' },
            { title: '与商家沟通记录（如有）', desc: '催餐、协商取餐时间的聊天记录或通话记录' }
        ]
    },
    customer_location: {
        title: '顾客定位不准',
        icon: '📍',
        ruleOriginal: '因顾客在APP中填写的收货定位与实际地址存在明显偏差，导致骑手无法按系统定位完成配送并产生超时的，骑手可提交定位截图、实际地址照片、与顾客沟通记录等材料进行申诉。经核实确属顾客定位错误的，不对骑手进行超时处罚。',
        explain: '如果顾客填的定位不对，把你导航到错误地方，导致送餐绕路或超时，你可以把顾客定位截图、实际门牌照片和聊天记录作为证据申诉。核实是顾客定位问题，就不该处罚你。',
        conditions: [
            '顾客APP定位与实际收货地址存在明显偏差',
            '保留平台导航显示的顾客定位截图',
            '拍摄实际收货地址门牌或周边环境照片',
            '能提供与顾客确认地址的沟通记录'
        ],
        source: '蜂鸟众包公开骑手规则中心 / 帮助文档',
        category: '顾客定位不准',
        evidence: [
            { title: '顾客定位截图', desc: 'APP内显示的顾客收货定位及地址信息' },
            { title: '实际地址照片', desc: '收货地点门牌号、楼栋号等可证明实际位置的照片' },
            { title: '与顾客沟通记录', desc: '电话录音、APP消息等确认实际地址的记录' },
            { title: '实际行驶路线截图', desc: '证明因定位偏差导致绕路的导航或轨迹截图' }
        ]
    },
    unreachable_customer: {
        title: '联系不上顾客',
        icon: '📞',
        ruleOriginal: '骑手已按订单地址到达配送地点，并通过APP内置通话、短信等方式多次联系顾客均无法取得联系，导致无法完成交付的，应在APP内进行「联系不上顾客」报备，并按规则流程处理。经核实确属无法联系顾客的，不对骑手进行超时或差评处罚。',
        explain: '如果你已经到了顾客地址，但打电话、发消息都联系不上人，只要在APP里按规定报备"联系不上顾客"，并按流程处理，就不该因为超时或被差评扣你的钱。',
        conditions: [
            '已按订单地址到达配送地点',
            '通过APP或电话多次联系顾客均无回应',
            '已在APP内进行「联系不上顾客」报备',
            '按平台要求等待或放置餐品，保留现场照片'
        ],
        source: '蜂鸟众包公开骑手规则中心 / 帮助文档',
        category: '联系不上顾客',
        evidence: [
            { title: '通话记录截图', desc: '显示多次拨打顾客电话但未接通的记录' },
            { title: 'APP消息截图', desc: '通过APP联系顾客但无回复的消息记录' },
            { title: '「联系不上顾客」报备截图', desc: '在APP内完成报备的时间及内容' },
            { title: '现场照片', desc: '到达地址后的现场照片，含时间水印更佳' }
        ]
    },
    merchant_location: {
        title: '商户定位不准',
        icon: '🏪',
        ruleOriginal: '因平台地图中标注的商户位置与实际门店位置存在偏差，导致骑手到店时间、取餐时间受到影响的，骑手可提交平台商户定位截图、实际门店位置照片、订单时间截图等材料进行申诉。经核实确属商户定位错误的，不对骑手进行超时处罚。',
        explain: '如果平台地图上标的店位置不对，让你找错地方、绕路或到店晚了，你可以把平台定位截图、实际门店照片和订单时间截图作为证据申诉。核实是平台定位问题，就不该处罚你。',
        conditions: [
            '平台标注的商户位置与实际门店位置存在偏差',
            '保留APP内商户定位截图和实际门店照片',
            '订单时间能反映因找店导致的延误',
            '能提供与商家或客服的沟通记录（如有）'
        ],
        source: '蜂鸟众包公开骑手规则中心 / 帮助文档',
        category: '商户定位不准',
        evidence: [
            { title: '平台商户定位截图', desc: 'APP内显示的商家位置及导航路线' },
            { title: '实际门店照片', desc: '商家实际门头、门牌号及周边环境照片' },
            { title: '订单时间截图', desc: '到店、取餐时间，证明因找店导致延误' },
            { title: '与商家沟通记录', desc: '询问具体位置、绕路取餐的聊天记录或通话' }
        ]
    },
    time: {
        title: '配送时间争议',
        icon: '⏱️',
        ruleOriginal: '因恶劣天气、交通管制、电梯故障、小区封控等不可抗力或特殊客观原因，导致骑手无法按系统预计时间完成配送的，骑手可通过APP提交相关证明材料进行申诉。经核实情况属实的，可免除相应超时处罚。',
        explain: '如果因为下雨、下雪、堵车、电梯坏了、小区不让进等客观原因，导致你没法按时送到，你可以提供照片、视频或截图申诉。核实属实的话，平台不应该处罚你。',
        conditions: [
            '超时原因属于不可抗力或特殊客观情况',
            '在合理时间内进行了申诉或报备',
            '能提供天气、路况、现场照片等证明材料',
            '订单超时与客观原因之间存在直接关联'
        ],
        source: '平台公开骑手规则中心 / 帮助文档',
        category: '配送时间争议',
        evidence: [
            { title: '天气或路况照片', desc: '暴雨、大雪、道路施工等现场照片' },
            { title: '交通管制或封控证明', desc: '小区、道路临时管控的通知或照片' },
            { title: '电梯/门禁故障记录', desc: '物业通知、现场视频等' },
            { title: '订单时间截图', desc: '取餐、送达时间与客观情况发生时间对应' }
        ]
    },
    income: {
        title: '收入计价争议',
        icon: '💰',
        ruleOriginal: '骑手对订单配送费、活动奖励、违规扣款等收入计算存在异议的，可在APP内查看收入明细，并在规定时间内提交申诉。平台将按照公示的计价规则和扣款标准进行复核。',
        explain: '如果你觉得某单的钱算少了、活动奖励没发、或者被扣款扣得不对，可以在APP里查看明细并申诉。平台要按照它自己公布的规则来复核。',
        conditions: [
            '收入明细与平台公示计价规则不一致',
            '活动奖励符合参与条件但未发放',
            '扣款项目有明确规则依据但执行存在偏差',
            '在规定申诉时效内提交'
        ],
        source: '平台公开骑手规则中心 / 帮助文档',
        category: '收入计价争议',
        evidence: [
            { title: '收入明细截图', desc: 'APP内显示该笔订单或活动奖励明细' },
            { title: '计价规则截图', desc: '平台公示的配送费、奖励规则' },
            { title: '扣款通知截图', desc: '显示扣款原因、金额、时间' },
            { title: '活动参与记录（如有）', desc: '报名截图、完成任务截图等' }
        ]
    }
};

// 规则库数据（比赛阶段仅维护蜂鸟众包平台数据，其余平台显示空白）
const rulesData = [
    { id: 1, platform: 'eleme', category: 'merchant', title: '商家出餐慢如何报备？', desc: '到店后如发现商家未按时出餐，应在APP内点击「商家出餐慢」进行报备，系统将记录到店时间和报备时间。' },
    { id: 2, platform: 'eleme', category: 'merchant', title: '报备后仍被判定超时怎么办？', desc: '可在订单详情页提交申诉，附上订单时间截图、报备截图和商家沟通记录。' },
    { id: 3, platform: 'eleme', category: 'merchant', title: '没有报备能否申诉？', desc: '如当时因操作原因未报备，可提供到店时间、实际取餐时间等截图，说明未报备的合理原因。' },
    { id: 4, platform: 'eleme', category: 'customer_location', title: '顾客定位不准如何申诉？', desc: '保留顾客APP定位截图、实际收货地址照片及与顾客沟通确认地址的记录。' },
    { id: 5, platform: 'eleme', category: 'customer_location', title: '顾客定位与地址不符怎么办？', desc: '当系统导航定位与顾客填写的具体门牌地址不一致时，以实际地址为准并保留证据。' },
    { id: 6, platform: 'eleme', category: 'unreachable_customer', title: '联系不上顾客如何报备？', desc: '到达配送地址后，通过APP内按钮进行「联系不上顾客」报备，并按提示等待或处理餐品。' },
    { id: 7, platform: 'eleme', category: 'unreachable_customer', title: '多次联系顾客无回应怎么办？', desc: '保留通话记录、APP消息截图，证明已多次尝试联系顾客但未成功。' },
    { id: 8, platform: 'eleme', category: 'merchant_location', title: '商户定位不准导致绕路如何申诉？', desc: '保留APP内商户定位截图与实际门店照片，证明平台标注位置与实际位置存在偏差。' },
    { id: 9, platform: 'eleme', category: 'merchant_location', title: '找不到商家门店怎么办？', desc: '先与商家电话确认实际位置，保存通话记录，同时拍摄实际门店门头照片。' }
];

// 案例库数据（比赛阶段仅维护蜂鸟众包平台数据，其余平台显示空白）
const casesData = [
    {
        id: 1,
        platform: 'eleme',
        title: '商家出餐慢导致超时，申诉成功免除处罚',
        category: 'merchant',
        tags: ['蜂鸟众包', '商家出餐慢', '申诉成功'],
        summary: '骑手小王到店后商家迟迟不出餐，小王及时在APP内报备「商家出餐慢」，并保留了订单时间截图。订单超时后，小王提交申诉，平台核实后撤销了超时处罚。',
        result: '申诉成功',
        detail: '【事实经过】2026年9月12日午高峰，骑手小王接到某奶茶店订单，系统预计取餐时间为12:05。小王于12:02到店，但商家直至12:18才完成出餐，导致订单最终超时8分钟。\n\n【采取措施】小王在到店后5分钟（12:07）于APP内点击「商家出餐慢」报备，并截图保存了预计取餐时间和实际取餐时间。\n\n【申诉结果】小王在订单详情页提交申诉，上传了报备截图、订单时间截图。平台复核后认定超时系商家出餐慢导致，撤销了该订单的超时扣款。\n\n【经验提示】遇到商家出餐慢，务必第一时间在APP内报备，并保存相关时间截图。'
    },
    {
        id: 2,
        platform: 'eleme',
        title: '顾客定位不准导致绕路，申诉撤销超时处罚',
        category: 'customer_location',
        tags: ['蜂鸟众包', '顾客定位不准', '申诉成功'],
        summary: '骑手小张按照平台导航前往顾客定位，却发现定位与顾客实际住址相差一条街，导致绕行和超时。小张截取定位截图并拍摄实际门牌后申诉成功。',
        result: '申诉成功',
        detail: '【事实经过】2026年10月3日，骑手小张配送一单至某新小区，平台导航将目的地定位在小区东侧，而顾客实际门牌号位于小区西侧，导致小张绕行了约600米并超时5分钟。\n\n【采取措施】小张发现定位偏差后，截图保存了APP内顾客定位、推荐路线，并拍摄了小区实际门牌照片，同时通过APP消息与顾客确认正确地址。\n\n【申诉结果】平台比对订单地址、定位记录和实际照片后，认定存在顾客定位偏差，撤销了超时处罚。\n\n【经验提示】遇到顾客定位明显不准时，及时截图保存APP定位与推荐路线，并拍摄实际地址照片，必要时通过APP消息与顾客确认。'
    },
    {
        id: 3,
        platform: 'eleme',
        title: '联系不上顾客，报备后申诉免责',
        category: 'unreachable_customer',
        tags: ['蜂鸟众包', '联系不上顾客', '申诉成功'],
        summary: '骑手小李到达配送地址后多次拨打顾客电话无人接听，在APP报备「联系不上顾客」并按规定等待后完成处理。订单超时后，小李申诉成功。',
        result: '申诉成功',
        detail: '【事实经过】2026年10月8日晚高峰，骑手小李将餐品送至订单地址楼下，连续拨打顾客电话3次均无人接听，APP内消息也未获回复，导致无法按时完成交付。\n\n【采取措施】小李在APP内点击「联系不上顾客」报备，按系统提示等待5分钟并拍摄现场照片，随后将餐品暂存至小区门卫处并通过APP留言告知顾客。\n\n【申诉结果】平台核实小李确实多次联系顾客未果，且已按规则完成报备和等待流程，撤销了该订单的超时处罚。\n\n【经验提示】联系不上顾客时，务必在APP内完成报备并保留通话记录、现场照片，按平台提示流程处理。'
    },
    {
        id: 4,
        platform: 'eleme',
        title: '商户定位不准导致取餐延误，申诉成功',
        category: 'merchant_location',
        tags: ['蜂鸟众包', '商户定位不准', '申诉成功'],
        summary: '骑手小陈按平台地图前往取餐，却发现标注位置与实际门店不符，找店花费了较长时间。小陈提交定位截图和门店照片后，申诉撤销超时处罚。',
        result: '申诉成功',
        detail: '【事实经过】2026年10月10日午高峰，骑手小陈接到某快餐店订单，平台地图将商家标注在商业街A区，但实际门店位于B区，小陈找店多花约10分钟，导致订单超时。\n\n【采取措施】小陈到达实际门店后，截图保存了APP内商户定位页面，并拍摄门店门头照片，同时记录了订单中的到店和取餐时间。\n\n【申诉结果】平台核实该商户确实存在定位偏差，且小陈到店时间正常，因找店导致的超时不应由骑手承担，撤销了超时处罚。\n\n【经验提示】发现商户定位不准时，及时截图保存APP定位页面，并拍摄实际门店照片，保留订单时间记录。'
    },
    {
        id: 5,
        platform: 'eleme',
        title: '顾客定位偏差且电话不通，综合申诉成功',
        category: 'customer_location',
        tags: ['蜂鸟众包', '顾客定位不准', '申诉成功'],
        summary: '骑手小赵遇到顾客定位不准且电话联系不上的情况，通过保存定位截图、通话记录和现场照片，最终申诉成功。',
        result: '申诉成功',
        detail: '【事实经过】2026年10月12日，骑手小赵配送一单至某写字楼，平台定位显示为写字楼北门，实际顾客所在公司为南门，且顾客电话多次无人接听，导致订单超时。\n\n【采取措施】小赵截图保存了顾客定位与推荐路线，拨打了3次电话并保留通话记录，拍摄了写字楼南门现场照片，后通过APP客服渠道说明情况。\n\n【申诉结果】平台综合定位偏差和联系不上顾客的情况，认定骑手已尽力完成配送，撤销了超时处罚。\n\n【经验提示】复杂情况要保留多种证据，包括定位截图、通话记录和现场照片，便于平台综合判断。'
    }
];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    updateClock();
    setInterval(updateClock, 60000);
    renderRules();
    renderCases();
    updateEvidenceCount();
});

// 更新时间
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}`;
}

// 页面导航
function navigateTo(page, options = {}) {
    if (page === state.currentPage) return;

    // 记录历史（用于返回）
    if (state.currentPage !== 'home') {
        state.pageHistory.push(state.currentPage);
    }

    // 隐藏当前页面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.bottom-nav-item').forEach(item => item.classList.remove('active'));

    // 显示目标页面
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
        state.currentPage = page;
    }

    // 更新底部导航
    const navItem = document.querySelector(`.bottom-nav-item[data-page="${page}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }

    // 更新头部
    updateHeader(page);

    // 处理特殊页面逻辑
    if (page === 'library' && options.tab) {
        switchLibraryTab(options.tab);
    }

    if (page === 'form') {
        fillFormData();
    }

    if (page === 'rule') {
        fillRuleData();
    }

    if (page === 'evidence') {
        renderEvidenceList();
        updateEvidenceCount();
    }

    if (page === 'draft') {
        generateDraft();
    }

    // 滚动到顶部
    document.getElementById('pageContainer').scrollTop = 0;
}

// 更新头部显示
function updateHeader(page) {
    const header = document.getElementById('pageHeader');
    const title = document.getElementById('pageTitle');
    const backBtn = document.getElementById('backBtn');
    const rightAction = document.getElementById('rightAction');

    if (page === 'home') {
        header.style.display = 'none';
    } else {
        header.style.display = 'flex';
        title.textContent = pageTitles[page] || '';
        backBtn.style.visibility = 'visible';
        rightAction.textContent = '';
    }
}

// 返回按钮
document.getElementById('backBtn').addEventListener('click', function() {
    if (state.pageHistory.length > 0) {
        const prevPage = state.pageHistory.pop();
        navigateTo(prevPage);
    } else {
        navigateTo('home');
    }
});

// 选择问题类型
function selectProblem(type) {
    state.problemType = type;
    state.pageHistory = [];
    navigateTo('form');
}

// 填充表单数据
function fillFormData() {
    const config = problemConfig[state.problemType];
    document.getElementById('problemType').value = config.title;
    document.getElementById('formTip').textContent = `当前场景：${config.title}。请根据实际情况填写事件信息，演示环境下数据仅在本地展示，不会上传。`;

    // 填充示例内容
    const platformNames = {
        meituan: '美团众包',
        eleme: '蜂鸟众包',
        dada: '达达骑士',
        sf: '顺丰同城'
    };
    document.getElementById('platformSelect').value = state.platform;

    const examples = {
        merchant: {
            desc: '2026年10月20日12:05，我到达商家XX奶茶店，系统预计取餐时间为12:08，但商家直至12:22才完成出餐。我在12:10已通过APP进行「商家出餐慢」报备，订单最终超时10分钟。',
            measures: '已在APP内报备「商家出餐慢」，并保存了订单时间截图、报备截图和与商家店员的沟通记录。'
        },
        customer_location: {
            desc: '2026年10月20日11:45，我按照APP中顾客定位前往XX小区东门，但顾客实际地址位于小区西门8号楼。按定位配送导致绕路约600米，订单最终超时6分钟。',
            measures: '已截图保存顾客APP定位页面、平台推荐路线，并拍摄了实际收货地址门牌照片，同时保存了与顾客确认地址的APP消息记录。'
        },
        unreachable_customer: {
            desc: '2026年10月20日19:20，我按订单地址到达XX小区3号楼楼下，连续拨打顾客电话3次均无人接听，APP内发送消息也未获回复，无法完成正常交付。',
            measures: '已在APP内进行「联系不上顾客」报备，并按提示等待5分钟，保留了通话记录截图、APP消息截图和现场照片。'
        },
        merchant_location: {
            desc: '2026年10月20日10:50，我按平台地图前往商家XX快餐店，但地图标注位置与实际门店不符，实际门店位于隔壁商业街B区，找店多花约8分钟，导致订单超时。',
            measures: '已截图保存APP内商户定位页面和实际门店门头照片，订单详情中的到店、取餐时间也可证明因找店导致的延误。'
        },
        navigation: {
            desc: '2026年10月20日11:30，我按照平台导航前往XX小区送餐，但导航将目的地定位在小区东门，实际地址位于西门。按照导航路线骑行导致绕路约600米，订单最终超时5分钟。',
            measures: '已截图保存平台推荐路线和实际行驶路线，订单详情中显示的到店、送达时间也可作为佐证。'
        },
        time: {
            desc: '2026年10月20日18:00左右，当地突降暴雨，能见度低、路面湿滑。我在配送途中经过积水路段，为确保安全减速行驶，导致该订单超时8分钟。',
            measures: '已保存气象预警截图和道路积水现场照片，订单时间也能证明超时发生在暴雨期间。'
        },
        income: {
            desc: '2026年10月19日午高峰，我完成了平台「午高峰冲单奖」要求的18单任务，但活动结束后100元奖励未到账，收入明细中也未显示该笔奖励。',
            measures: '已截图保存活动规则、任务完成页面和收入明细，准备提交申诉要求补发奖励。'
        }
    };

    const example = examples[state.problemType];
    document.getElementById('eventDesc').value = example.desc;
    document.getElementById('measures').value = example.measures;
}

// 去规则页
function goToRule() {
    state.platform = document.getElementById('platformSelect').value || 'meituan';
    navigateTo('rule');
}

// 填充规则数据
function fillRuleData() {
    const config = problemConfig[state.problemType];
    document.getElementById('ruleOriginal').textContent = config.ruleOriginal;
    document.getElementById('ruleExplain').textContent = config.explain;

    const conditionsList = document.getElementById('ruleConditions');
    conditionsList.innerHTML = config.conditions.map(c => `<li>${c}</li>`).join('');

    document.getElementById('ruleSource').textContent = `来源：${config.source}`;
    document.getElementById('ruleUpdate').textContent = '2026-09-15';
    document.getElementById('ruleCategory').textContent = config.category;
}

// 渲染证据清单
function renderEvidenceList() {
    const config = problemConfig[state.problemType];
    const container = document.querySelector('#page-evidence .card:first-of-type');
    // 保留标题和副标题
    const title = container.querySelector('.card-title');
    const subtitle = container.querySelector('.card-subtitle');
    container.innerHTML = '';
    container.appendChild(title);
    container.appendChild(subtitle);

    config.evidence.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'evidence-card';
        card.onclick = function() { toggleEvidence(this, true); };
        card.innerHTML = `
            <div class="checkbox"></div>
            <div class="content">
                <h4>${item.title}</h4>
                <p>${item.desc}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// 切换证据选中状态
function toggleEvidence(element, updateCount = false) {
    element.classList.toggle('selected');
    const checkbox = element.querySelector('.checkbox');
    checkbox.textContent = element.classList.contains('selected') ? '✓' : '';
    if (updateCount) {
        updateEvidenceCount();
    }
}

// 更新证据计数
function updateEvidenceCount() {
    const cards = document.querySelectorAll('#page-evidence .evidence-card, #page-form .evidence-card');
    if (cards.length === 0) return;

    const selected = document.querySelectorAll('#page-evidence .evidence-card.selected, #page-form .evidence-card.selected');
    const countEl = document.getElementById('evidenceCount');
    if (countEl) {
        countEl.textContent = `${selected.length}/${cards.length}`;
    }
}

// 生成申诉初稿
function generateDraft() {
    const config = problemConfig[state.problemType];
    const platformNames = {
        meituan: '美团众包',
        eleme: '蜂鸟众包',
        dada: '达达骑士',
        sf: '顺丰同城'
    };
    const platform = platformNames[state.platform] || '平台';
    const date = document.getElementById('eventDate').value || '2026年10月20日';
    const desc = document.getElementById('eventDesc').value || '';
    const measures = document.getElementById('measures').value || '';

    const facts = `${platform}客服：\n\n本人为${platform}注册骑手，于${date}配送订单过程中遇到${config.title}情况，导致订单出现异常。具体情况如下：\n\n${desc}\n\n${measures ? '针对上述情况，我已采取以下措施：\n' + measures : ''}`;

    const evidenceSelected = document.querySelectorAll('#page-evidence .evidence-card.selected');
    let evidenceText = '为便于平台核实，我已准备以下证据材料：\n';
    if (evidenceSelected.length > 0) {
        evidenceSelected.forEach((card, index) => {
            const title = card.querySelector('h4').textContent;
            evidenceText += `${index + 1}. ${title}；\n`;
        });
    } else {
        evidenceText += '（尚未勾选证据，请返回证据清单补充）';
    }
    evidenceText += '\n以上材料均可提供原始截图或照片，请平台核查。';

    const ruleText = `根据平台公示的骑手规则，${config.ruleOriginal}\n\n本次情况符合上述规则中关于「${config.title}」的适用条件，恳请平台依据规则进行复核。`;

    const requestText = `基于以上事实、证据和规则依据，本人提出以下诉求：\n1. 撤销本次订单相关的超时/扣款/处罚记录；\n2. 如已产生扣款，请予以退还；\n3. 请平台对订单进行重新审核，维护骑手正当权益。\n\n以上申诉内容属实，本人愿意配合平台进一步核实。如有需要，请联系本人。谢谢！`;

    document.getElementById('draftFact').textContent = facts;
    document.getElementById('draftEvidence').textContent = evidenceText;
    document.getElementById('draftRule').textContent = ruleText;
    document.getElementById('draftRequest').textContent = requestText;

    state.draftText = `${facts}\n\n${evidenceText}\n\n${ruleText}\n\n${requestText}`;
}

// 编辑/保存初稿
function toggleEdit() {
    const draftBox = document.getElementById('draftBox');
    const editBtn = document.getElementById('editBtn');

    if (!state.editingDraft) {
        // 进入编辑模式
        state.editingDraft = true;
        editBtn.textContent = '保存修改';
        draftBox.classList.add('editing');

        const textarea = document.createElement('textarea');
        textarea.id = 'draftTextarea';
        textarea.value = state.draftText;
        draftBox.innerHTML = '';
        draftBox.appendChild(textarea);
        textarea.focus();
    } else {
        // 保存修改
        const textarea = document.getElementById('draftTextarea');
        state.draftText = textarea.value;
        state.editingDraft = false;
        editBtn.textContent = '编辑文本';
        draftBox.classList.remove('editing');

        // 重新渲染为区块展示（简化处理：只显示文本）
        draftBox.innerHTML = `
            <h3>申诉说明</h3>
            <div class="section"><div class="section-content" style="white-space: pre-line;">${state.draftText.replace(/\n/g, '<br>')}</div></div>
        `;
    }
}

// 复制初稿
function copyDraft() {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(state.draftText).then(() => {
            showToast('已复制到剪贴板');
        }).catch(() => {
            showToast('复制成功（模拟）');
        });
    } else {
        showToast('复制成功（模拟）');
    }
}

// 规则库与案例库标签切换
function switchLibraryTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tab}"]`).classList.add('active');

    document.getElementById('library-rules').style.display = tab === 'rules' ? 'block' : 'none';
    document.getElementById('library-cases').style.display = tab === 'cases' ? 'block' : 'none';

    // 更新标题
    document.getElementById('pageTitle').textContent = tab === 'rules' ? '规则库' : '案例库';
}

// 渲染规则库
function renderRules(filter = 'all', keyword = '', platform = state.currentRulePlatform) {
    const container = document.getElementById('ruleList');
    let filtered = rulesData.filter(r => r.platform === platform);

    if (filter !== 'all') {
        filtered = filtered.filter(r => r.category === filter);
    }

    if (keyword) {
        const lower = keyword.toLowerCase();
        filtered = filtered.filter(r =>
            r.title.toLowerCase().includes(lower) ||
            r.desc.toLowerCase().includes(lower)
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>暂无该平台的规则数据</p>
                <span>比赛阶段优先维护蜂鸟众包平台内容</span>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(rule => `
        <div class="rule-list-item" onclick="showRuleDetail(${rule.id})">
            <h4>${rule.title}</h4>
            <p>${rule.desc}</p>
        </div>
    `).join('');
}

// 渲染案例库
function renderCases(keyword = '', platform = state.currentCasePlatform) {
    const container = document.getElementById('caseList');
    let filtered = casesData.filter(c => c.platform === platform);

    if (keyword) {
        const lower = keyword.toLowerCase();
        filtered = filtered.filter(c =>
            c.title.toLowerCase().includes(lower) ||
            c.summary.toLowerCase().includes(lower) ||
            c.tags.some(t => t.toLowerCase().includes(lower))
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>暂无该平台的案例数据</p>
                <span>比赛阶段优先维护蜂鸟众包平台内容</span>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(c => `
        <div class="case-card" onclick="showCaseDetail(${c.id})">
            <div class="tags">
                ${c.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
            <h3>${c.title}</h3>
            <p>${c.summary}</p>
            <span class="result">${c.result}</span>
        </div>
    `).join('');
}

// 搜索规则
function searchRules(keyword) {
    const activeCategory = document.querySelector('#library-rules .category-item.active');
    const category = activeCategory ? activeCategory.getAttribute('onclick').match(/'(\w+)'/)[1] : 'all';
    renderRules(category, keyword);
}

// 筛选规则分类
function filterRules(category, element) {
    document.querySelectorAll('#library-rules .category-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    renderRules(category);
}

// 筛选规则库平台
function filterRulesByPlatform(platform, element) {
    state.currentRulePlatform = platform;
    document.querySelectorAll('#rulePlatformFilter .platform-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    renderRules();
}

// 筛选案例库平台
function filterCasesByPlatform(platform, element) {
    state.currentCasePlatform = platform;
    document.querySelectorAll('#casePlatformFilter .platform-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    renderCases();
}

// 搜索案例
function searchCases(keyword) {
    renderCases(keyword);
}

// 显示规则详情
function showRuleDetail(id) {
    const rule = rulesData.find(r => r.id === id);
    if (!rule) return;

    document.getElementById('modalTitle').textContent = rule.title;
    document.getElementById('modalBody').innerHTML = `
        <p style="font-size: 14px; line-height: 1.8; color: var(--text-secondary); margin-bottom: 16px;">${rule.desc}</p>
        <div class="rule-meta">
            <span>🏷️ ${getCategoryName(rule.category)}</span>
            <span>📅 2026-09-15 更新</span>
        </div>
    `;
    document.getElementById('caseModal').classList.add('active');
}

// 显示案例详情
function showCaseDetail(id) {
    const c = casesData.find(item => item.id === id);
    if (!c) return;

    document.getElementById('modalTitle').textContent = '案例详情';
    document.getElementById('modalBody').innerHTML = `
        <div class="tags" style="margin-bottom: 12px;">
            ${c.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <h3 style="font-size: 16px; margin-bottom: 12px; line-height: 1.5;">${c.title}</h3>
        <p style="font-size: 14px; line-height: 1.8; color: var(--text); white-space: pre-line;">${c.detail}</p>
        <div style="margin-top: 16px;">
            <span class="result">${c.result}</span>
        </div>
    `;
    document.getElementById('caseModal').classList.add('active');
}

// 关闭弹窗
function closeModal() {
    document.getElementById('caseModal').classList.remove('active');
}

// 点击弹窗背景关闭
document.getElementById('caseModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Toast 提示
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => {
        toast.classList.remove('active');
    }, 2500);
}

// 分类名称映射
function getCategoryName(category) {
    const names = {
        merchant: '商家出餐慢',
        customer_location: '顾客定位不准',
        unreachable_customer: '联系不上顾客',
        merchant_location: '商户定位不准',
        navigation: '导航定位',
        time: '配送时间',
        income: '收入计价'
    };
    return names[category] || '其他';
}

// 阻止表单默认提交（如果有）
document.addEventListener('submit', function(e) {
    e.preventDefault();
});
