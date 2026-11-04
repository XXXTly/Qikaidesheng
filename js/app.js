// 骑开得胜 - 原型交互脚本
// 场景数据来自 js/data.js

// 全局状态
const state = {
    currentPage: 'home',
    pageHistory: [],
    problemType: 'merchant_slow',
    platform: 'eleme',
    editingDraft: false,
    draftText: '',
    currentRulePlatform: 'eleme',
    currentCasePlatform: 'eleme'
};

// 页面标题映射
const pageTitles = {
    home: '骑开得胜',
    'problem-all': '选择申诉场景',
    form: '填写情况',
    rule: '规则解读',
    evidence: '证据清单',
    draft: '申诉初稿',
    library: '规则库与案例库',
    feedback: '申诉进度',
    profile: '我的'
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    updateClock();
    setInterval(updateClock, 60000);
    renderProblemAll();
    renderRules();
    renderCases();
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

    if (page === 'feedback') {
        renderFeedbackList();
    }

    // 滚动到顶部
    const pageContainer = document.getElementById('pageContainer');
    if (pageContainer) pageContainer.scrollTop = 0;
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

// 渲染全部19种申诉场景
function renderProblemAll() {
    const container = document.getElementById('problemAllGrid');
    if (!container) return;

    const bgColors = [
        '#fff3e0', '#eff6ff', '#f3e8ff', '#ecfdf5', '#fef2f2',
        '#fff7ed', '#f0f9ff', '#f5f3ff', '#fdf2f8', '#f0fdf4'
    ];

    let html = '';
    let index = 0;
    for (const [key, config] of Object.entries(problemConfig)) {
        const color = bgColors[index % bgColors.length];
        html += `
            <div class="problem-item" onclick="selectProblem('${key}')">
                <div class="icon" style="background: ${color};">${config.icon || '📋'}</div>
                <div class="info">
                    <h3>${config.title}</h3>
                    <p>${config.explain ? config.explain.split('\n')[0] : ''}</p>
                </div>
                <div class="arrow">›</div>
            </div>
        `;
        index++;
    }
    container.innerHTML = html;
}

// 选择问题类型
function selectProblem(type) {
    if (!problemConfig[type]) {
        showToast('该场景暂未配置');
        return;
    }
    state.problemType = type;
    state.pageHistory = [];
    navigateTo('form');
}

// 填充表单数据
function fillFormData() {
    const config = problemConfig[state.problemType];
    document.getElementById('problemType').value = config.title;
    document.getElementById('formTip').textContent = `当前场景：${config.title}。请根据实际情况填写事件信息，演示环境下数据仅在本地展示，不会上传。`;

    document.getElementById('platformSelect').value = state.platform;

    const example = config.example || {};
    document.getElementById('eventDesc').value = example.desc || '';
    document.getElementById('measures').value = example.measures || '';
}

// 去规则页
function goToRule() {
    state.platform = document.getElementById('platformSelect').value || 'eleme';
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

    // 法规冲突相关显示控制
    const lawCard = document.getElementById('lawCard');
    const conflictCard = document.getElementById('conflictCard');
    const lawOriginal = document.getElementById('lawOriginal');
    const conflictAnalysis = document.getElementById('conflictAnalysis');

    if (config.hasLawConflict && config.lawOriginal) {
        lawCard.style.display = 'block';
        conflictCard.style.display = 'block';
        lawOriginal.textContent = config.lawOriginal;
        conflictAnalysis.textContent = config.conflictAnalysis || '';
    } else {
        lawCard.style.display = 'none';
        conflictCard.style.display = 'none';
    }
}

// 渲染证据清单
function renderEvidenceList() {
    const config = problemConfig[state.problemType];

    // 必备证据
    const requiredContainer = document.getElementById('requiredEvidenceList');
    const required = config.requiredEvidence || [];
    requiredContainer.innerHTML = required.map((item, index) => `
        <div class="evidence-card" onclick="toggleEvidence(this, 'required')">
            <div class="checkbox"></div>
            <div class="content">
                <h4>${item}</h4>
            </div>
        </div>
    `).join('');

    // 可选证据
    const optionalContainer = document.getElementById('optionalEvidenceList');
    const optional = config.optionalEvidence || [];
    optionalContainer.innerHTML = optional.map((item, index) => `
        <div class="evidence-card" onclick="toggleEvidence(this, 'optional')">
            <div class="checkbox"></div>
            <div class="content">
                <h4>${item}</h4>
            </div>
        </div>
    `).join('');
}

// 切换证据选中状态
function toggleEvidence(element, type) {
    element.classList.toggle('selected');
    const checkbox = element.querySelector('.checkbox');
    checkbox.textContent = element.classList.contains('selected') ? '✓' : '';
    updateEvidenceCount();
}

// 更新证据计数
function updateEvidenceCount() {
    const requiredCards = document.querySelectorAll('#requiredEvidenceList .evidence-card');
    const requiredSelected = document.querySelectorAll('#requiredEvidenceList .evidence-card.selected');
    const optionalCards = document.querySelectorAll('#optionalEvidenceList .evidence-card');
    const optionalSelected = document.querySelectorAll('#optionalEvidenceList .evidence-card.selected');

    const requiredCountEl = document.getElementById('requiredEvidenceCount');
    const optionalCountEl = document.getElementById('optionalEvidenceCount');

    if (requiredCountEl) {
        requiredCountEl.textContent = `${requiredSelected.length}/${requiredCards.length}`;
    }
    if (optionalCountEl) {
        optionalCountEl.textContent = `${optionalSelected.length}/${optionalCards.length}`;
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

    // 证据勾选情况
    const requiredSelected = document.querySelectorAll('#requiredEvidenceList .evidence-card.selected');
    const optionalSelected = document.querySelectorAll('#optionalEvidenceList .evidence-card.selected');

    const selectedEvidence = [];
    requiredSelected.forEach(card => selectedEvidence.push(card.querySelector('h4').textContent));
    optionalSelected.forEach(card => selectedEvidence.push(card.querySelector('h4').textContent));

    // 一、国家法规依据
    let lawText = '';
    if (config.hasLawConflict && config.lawOriginal) {
        lawText = config.lawOriginal;
    } else {
        lawText = '本申诉场景暂无明确对应的法律法规条文，主要依据平台规则及事实证据进行说明。';
    }

    // 二、平台规则依据
    const ruleText = config.ruleOriginal;

    // 三、证据梳理与事实说明
    let factText = `${platform}客服：\n\n本人为${platform}注册骑手，于${date}配送订单过程中遇到「${config.title}」情况。事件经过如下：\n\n${desc || '（请补充具体事件经过）'}\n\n`;
    if (measures) {
        factText += `针对上述情况，本人已采取以下措施：\n${measures}\n\n`;
    }
    if (selectedEvidence.length > 0) {
        factText += '为证明上述事实，本人已准备以下证据材料：\n';
        selectedEvidence.forEach((title, index) => {
            factText += `${index + 1}. ${title}；\n`;
        });
        factText += '\n以上材料均可提供原始截图或照片，请平台核查。';
    } else {
        factText += '（尚未勾选证据，请返回证据清单补充必备/可选证据。）';
    }

    // 四、总结与结论
    let conclusionText = '';
    if (config.hasLawConflict && config.conflictAnalysis) {
        conclusionText = `依据上述法规与平台规则，${config.conflictAnalysis}\n\n`;
    }
    conclusionText += `综上所述，本次订单出现${config.title}情况，事实清楚、证据充分，符合平台规则及国家相关规定的适用条件。恳请平台：\n1. 撤销本次订单相关的超时/扣款/处罚记录；\n2. 如已产生扣款，请予以退还；\n3. 对订单进行重新审核，维护骑手正当权益。\n\n以上申诉内容属实，本人愿意配合平台进一步核实。如有需要，请联系本人。谢谢！`;

    // 写入页面
    const draftLawSection = document.getElementById('draftLawSection');
    if (draftLawSection) {
        draftLawSection.style.display = (config.hasLawConflict && config.lawOriginal) ? 'block' : 'none';
    }
    document.getElementById('draftLaw').textContent = lawText;
    document.getElementById('draftRule').textContent = ruleText;
    document.getElementById('draftFact').textContent = factText;
    document.getElementById('draftConclusion').textContent = conclusionText;

    state.draftText = [
        '【国家法规依据】',
        lawText,
        '',
        '【平台规则依据】',
        ruleText,
        '',
        '【证据梳理与事实说明】',
        factText,
        '',
        '【总结与结论】',
        conclusionText,
        '',
        '如仍有疑问，请拨打劳动保护热线 12333、12351 维权。'
    ].join('\n');
}

// 编辑/保存初稿
function toggleEdit() {
    const draftBox = document.getElementById('draftBox');
    const editBtn = document.getElementById('editBtn');

    if (!state.editingDraft) {
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
        const textarea = document.getElementById('draftTextarea');
        state.draftText = textarea.value;
        state.editingDraft = false;
        editBtn.textContent = '编辑文本';
        draftBox.classList.remove('editing');

        // 重新渲染为区块展示（保留热线提示）
        draftBox.innerHTML = `
            <h3>申诉说明</h3>
            <div class="section"><div class="section-content" style="white-space: pre-line;">${state.draftText.replace(/\n/g, '<br>')}</div></div>
            <div class="draft-tip" id="draftTip">如仍有疑问，请拨打劳动保护热线 12333、12351 维权。</div>
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

// 申诉进度/反馈数据（演示数据）
const feedbackData = [
    {
        id: 1,
        title: '商家出餐慢导致超时扣款',
        platform: 'eleme',
        platformName: '蜂鸟众包',
        submitTime: '2026-10-28 14:32',
        status: 'processing',
        statusText: '处理中',
        currentStep: 2,
        steps: ['提交申诉', '平台受理', '人工复核', '结果通知'],
        latestUpdate: '平台已受理，预计 1-3 个工作日内完成复核',
        canUrge: true
    },
    {
        id: 2,
        title: '顾客定位不准导致差评',
        platform: 'eleme',
        platformName: '蜂鸟众包',
        submitTime: '2026-10-25 09:15',
        status: 'completed',
        statusText: '已完结',
        currentStep: 4,
        steps: ['提交申诉', '平台受理', '人工复核', '结果通知'],
        latestUpdate: '申诉成功，已撤销差评并退还相应扣款',
        canUrge: false
    },
    {
        id: 3,
        title: '恶劣天气订单取消处罚',
        platform: 'eleme',
        platformName: '蜂鸟众包',
        submitTime: '2026-10-20 18:45',
        status: 'supplement',
        statusText: '需补充材料',
        currentStep: 1,
        steps: ['提交申诉', '平台受理', '人工复核', '结果通知'],
        latestUpdate: '平台要求补充天气预警截图或定位截图',
        canUrge: false
    }
];

// 渲染申诉进度列表
function renderFeedbackList() {
    const container = document.getElementById('feedbackList');
    if (!container) return;

    const statusColors = {
        processing: 'var(--accent)',
        completed: 'var(--success)',
        supplement: 'var(--danger)',
        accepted: 'var(--primary)'
    };

    const statusBg = {
        processing: '#fff3e0',
        completed: '#ecfdf5',
        supplement: '#fef2f2',
        accepted: '#e8f5ee'
    };

    if (feedbackData.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>暂无申诉记录</p>
                <span>提交申诉后可在此查看处理进度</span>
            </div>
        `;
        return;
    }

    container.innerHTML = feedbackData.map(item => {
        const stepHtml = item.steps.map((step, index) => {
            const isActive = index < item.currentStep;
            const isCurrent = index === item.currentStep - 1;
            return `
                <div class="feedback-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}">
                    <div class="step-dot"></div>
                    <div class="step-label">${step}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="card feedback-card">
                <div class="feedback-header">
                    <div class="feedback-title">${item.title}</div>
                    <span class="feedback-status" style="color: ${statusColors[item.status]}; background: ${statusBg[item.status]};">${item.statusText}</span>
                </div>
                <div class="feedback-meta">
                    <span>${item.platformName}</span>
                    <span>提交于 ${item.submitTime}</span>
                </div>
                <div class="feedback-timeline">
                    ${stepHtml}
                </div>
                <div class="feedback-update">
                    <strong>最新进展：</strong>${item.latestUpdate}
                </div>
                <div class="feedback-actions">
                    <button class="btn btn-outline" onclick="showFeedbackDetail(${item.id})">查看详情</button>
                    ${item.canUrge ? `<button class="btn btn-primary" onclick="urgeFeedback(${item.id})">催办一下</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// 查看申诉详情
function showFeedbackDetail(id) {
    const item = feedbackData.find(f => f.id === id);
    if (!item) return;

    document.getElementById('modalTitle').textContent = '申诉详情';
    document.getElementById('modalBody').innerHTML = `
        <div style="margin-bottom: 16px;">
            <span class="feedback-status" style="display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">${item.statusText}</span>
        </div>
        <h3 style="font-size: 16px; margin-bottom: 12px;">${item.title}</h3>
        <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.8; margin-bottom: 16px;">
            <p><strong>所属平台：</strong>${item.platformName}</p>
            <p><strong>提交时间：</strong>${item.submitTime}</p>
            <p><strong>当前阶段：</strong>${item.steps[item.currentStep - 1]}</p>
        </div>
        <div style="background: var(--bg); border-radius: var(--radius-sm); padding: 12px; font-size: 13px; line-height: 1.7;">
            <strong>最新进展</strong><br>${item.latestUpdate}
        </div>
    `;
    document.getElementById('caseModal').classList.add('active');
}

// 催办申诉
function urgeFeedback(id) {
    const item = feedbackData.find(f => f.id === id);
    if (!item) return;
    item.latestUpdate = '你已催办，平台将优先处理你的申诉';
    showToast('催办成功，平台将优先处理');
    renderFeedbackList();
}

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
    const config = problemConfig[category];
    if (config) return config.title;
    return category;
}

// 阻止表单默认提交
document.addEventListener('submit', function(e) {
    e.preventDefault();
});
