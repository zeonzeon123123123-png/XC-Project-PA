/**
 * AI Form Assistant - 智能表单助手
 * 提供实时填写建议和问答功能
 */

class AIFormAssistant {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: options.apiEndpoint || '',
            historyDataPath: options.historyDataPath || './project-history.json',
            enableWebSearch: options.enableWebSearch !== false,
            ...options
        };
        
        this.currentField = null;
        this.suggestions = {};
        this.historyData = null;
        this.panelElement = null;
        this.chatMessages = [];
        
        this.init();
    }
    
    // 初始化
    async init() {
        await this.loadHistoryData();
        this.createAssistantPanel();
        this.bindFieldEvents();
        this.bindGlobalEvents();
        console.log('✅ AI Form Assistant 已初始化');
    }
    
    // 加载历史项目数据
    async loadHistoryData() {
        try {
            // 尝试从多个来源加载历史数据
            const sources = [
                './project-history.json',
                '../project-history.json',
                'https://raw.githubusercontent.com/zeonzeon123123123-png/XC-Project-PA/main/project-history.json'
            ];
            
            for (const source of sources) {
                try {
                    const response = await fetch(source);
                    if (response.ok) {
                        this.historyData = await response.json();
                        console.log(`✅ 历史数据已加载：${source}`);
                        return;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            // 如果都失败，使用内置示例数据
            this.historyData = this.getBuiltInHistoryData();
            console.log('⚠️ 使用内置示例历史数据');
        } catch (e) {
            console.error('❌ 加载历史数据失败:', e);
            this.historyData = this.getBuiltInHistoryData();
        }
    }
    
    // 内置历史数据（示例）
    getBuiltInHistoryData() {
        return {
            projects: [
                {
                    id: 'SR1202500015',
                    name: 'IPC 摄像头自动化生产线',
                    type: '智能硬件',
                    budget: 750000,
                    duration: 12,
                    techGoal: '开发一套用于 IPC 摄像头生产的自动化生产设备，实现从零部件上料到成品包装的全自动化运行',
                    techFeasibility: '1. 团队具备 AI 和嵌入式开发技术积累\n2. 采用成熟芯片平台，风险可控\n3. 已有原型验证，技术路径清晰',
                    necessity: '1. 满足智能制造市场增长需求\n2. 符合公司 AIoT 战略方向\n3. 提升产品竞争力和市场份额'
                },
                {
                    id: 'SR1202500008',
                    name: '基于摄像机的爬宠类 AI 算法大模型应用技术的开发',
                    type: 'AI 算法',
                    budget: 3536000,
                    duration: 6,
                    techGoal: '开发一套基于摄像头的爬宠 AI 智能监测系统，针对爬行动物饲养场景提供智能化管理工具',
                    techFeasibility: '1. 团队具备深度学习算法与大数据处理架构\n2. 引入 AES-256/国密算法及零信任架构\n3. 技术路径清晰可行',
                    necessity: '1. 市场需求明确，客户痛点突出\n2. 符合公司 AI 战略方向\n3. 可提升产品竞争力'
                },
                {
                    id: 'SR1202500001',
                    name: '基于 AI 高性能 GPU 算力集群的管理开发平台',
                    type: '云平台',
                    budget: 24000000,
                    duration: 12,
                    techGoal: '研发一套智能化、一体化的 GPU 算力集群管理平台，实现对大规模异构算力的统一纳管、弹性调度与精准计量',
                    techFeasibility: '1. 团队具备 AI、分布式系统、高性能计算等领域技术积累\n2. 采用分阶段、模块化开发模式，风险可控',
                    necessity: '1. 市场需求明确，算力即服务 (CaaS) 兴起\n2. 可大幅提升资源利用率\n3. 符合公司技术布局与长期发展战略'
                },
                {
                    id: 'SR1202500020',
                    name: '基于大数据与深度学习的主动式智慧视频分析及集成管理系统开发',
                    type: '智能硬件',
                    budget: 19000000,
                    duration: 8,
                    techGoal: '构建一个既"聪明"又"安全"的智慧安防底座，满足政企客户对"看得懂"且"守得住"的双重需求',
                    techFeasibility: '1. 公司已掌握成熟的深度学习算法与大数据处理架构\n2. 引入 AES-256/国密算法及零信任架构\n3. 技术路径清晰可行',
                    necessity: '1. 满足合规红线要求\n2. 解决行业核心痛点\n3. 构筑安全护城河'
                },
                {
                    id: 'SR1202500013',
                    name: '一款搭配电动变焦网络摄像机的网络硬盘录像机 (NVR) 套装开发',
                    type: '智能硬件',
                    budget: 16000000,
                    duration: 8,
                    techGoal: '研发一套高端智能 NVR 套装，集成 12MP 专业级全彩摄像机与电动变焦技术，实现超高清、无盲区的视频采集',
                    techFeasibility: '1. 硬件由 SSC372+ATBM6441+SC231HAI 等成熟芯片组成\n2. 在协创的传统安防项目上大批量使用\n3. 有一定的技术积累经验',
                    necessity: '1. 解决"安装调试难"的痛点\n2. 突破"画质瓶颈"\n3. 提升"数据价值"'
                }
            ],
            stats: {
                avgBudget: {
                    '智能硬件': 8500000,
                    'AI 算法': 3500000,
                    '云平台': 24000000
                },
                avgDuration: {
                    '智能硬件': 8,
                    'AI 算法': 6,
                    '云平台': 12
                }
            }
        };
    }
    
    // 创建助手面板
    createAssistantPanel() {
        const panel = document.createElement('div');
        panel.id = 'aiAssistantPanel';
        panel.className = 'ai-assistant-panel';
        panel.innerHTML = `
            <div class="ai-panel-header">
                <div class="ai-header-left">
                    <div class="ai-avatar">🤖</div>
                    <div class="ai-header-text">
                        <div class="ai-title">AI 智能助手</div>
                        <div class="ai-status">
                            <span class="status-dot"></span>
                            <span class="status-text">在线</span>
                        </div>
                    </div>
                </div>
                <div class="ai-header-actions">
                    <button class="ai-btn-icon" onclick="aiAssistant.togglePanel()" title="最小化">−</button>
                    <button class="ai-btn-icon" onclick="aiAssistant.closePanel()" title="关闭">×</button>
                </div>
            </div>
            
            <div class="ai-panel-content">
                <!-- 智能建议区域 -->
                <div class="ai-suggestion-section" id="aiSuggestionSection">
                    <div class="ai-section-header">
                        <span class="ai-section-icon">💡</span>
                        <span class="ai-section-title">智能建议</span>
                    </div>
                    <div class="ai-suggestion-content" id="aiSuggestionContent">
                        <div class="ai-empty-state">
                            <div class="ai-empty-icon">✨</div>
                            <div class="ai-empty-text">点击表单字段获取智能建议</div>
                        </div>
                    </div>
                </div>
                
                <!-- 聊天对话区域 -->
                <div class="ai-chat-section">
                    <div class="ai-section-header">
                        <span class="ai-section-icon">💬</span>
                        <span class="ai-section-title">问答对话</span>
                    </div>
                    <div class="ai-chat-messages" id="aiChatMessages">
                        <div class="ai-message ai-message-system">
                            <div class="ai-message-content">
                                你好！我是你的智能表单助手。我可以：
                                <ul>
                                    <li>提供填写建议（基于历史项目数据）</li>
                                    <li>回答填写过程中的问题</li>
                                    <li>联网搜索行业信息</li>
                                </ul>
                                有什么可以帮你的吗？
                            </div>
                        </div>
                    </div>
                    <div class="ai-chat-input">
                        <input 
                            type="text" 
                            class="ai-input-field" 
                            id="aiChatInput" 
                            placeholder="输入问题，按 Enter 发送..."
                            onkeypress="aiAssistant.handleChatKeyPress(event)"
                        >
                        <button class="ai-send-btn" onclick="aiAssistant.sendChatMessage()">
                            <span>📤</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="ai-panel-footer">
                <div class="ai-quick-actions">
                    <button class="ai-quick-btn" onclick="aiAssistant.showQuickHelp()">❓ 帮助</button>
                    <button class="ai-quick-btn" onclick="aiAssistant.showHistoryExamples()">📚 历史示例</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.panelElement = panel;
        
        // 添加样式
        this.addStyles();
    }
    
    // 添加样式
    addStyles() {
        const style = document.createElement('style');
        style.id = 'aiAssistantStyles';
        style.textContent = `
            /* AI 助手面板 */
            .ai-assistant-panel {
                position: fixed;
                right: 20px;
                bottom: 20px;
                width: 400px;
                max-height: 600px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                border: 1px solid #e0e0e0;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .ai-assistant-panel.minimized {
                max-height: 60px;
            }
            
            .ai-assistant-panel.hidden {
                display: none;
            }
            
            /* 面板头部 */
            .ai-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .ai-header-left {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .ai-avatar {
                width: 40px;
                height: 40px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            
            .ai-header-text {
                display: flex;
                flex-direction: column;
            }
            
            .ai-title {
                font-size: 16px;
                font-weight: 600;
            }
            
            .ai-status {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                opacity: 0.9;
            }
            
            .status-dot {
                width: 8px;
                height: 8px;
                background: #22c55e;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .ai-header-actions {
                display: flex;
                gap: 8px;
            }
            
            .ai-btn-icon {
                width: 28px;
                height: 28px;
                border-radius: 6px;
                border: none;
                background: rgba(255,255,255,0.2);
                color: white;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }
            
            .ai-btn-icon:hover {
                background: rgba(255,255,255,0.3);
            }
            
            /* 面板内容 */
            .ai-panel-content {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                background: #f8f9fa;
            }
            
            .ai-section-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
                font-size: 14px;
                font-weight: 600;
                color: #333;
            }
            
            .ai-section-icon {
                font-size: 18px;
            }
            
            /* 智能建议区域 */
            .ai-suggestion-section {
                margin-bottom: 20px;
            }
            
            .ai-suggestion-content {
                background: white;
                border-radius: 12px;
                padding: 16px;
                border: 1px solid #e0e0e0;
            }
            
            .ai-empty-state {
                text-align: center;
                padding: 20px;
                color: #999;
            }
            
            .ai-empty-icon {
                font-size: 32px;
                margin-bottom: 8px;
            }
            
            .ai-suggestion-card {
                background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
                border-left: 4px solid #ff9800;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 12px;
            }
            
            .ai-suggestion-card:last-child {
                margin-bottom: 0;
            }
            
            .ai-suggestion-title {
                font-weight: 600;
                color: #f57c00;
                margin-bottom: 8px;
                font-size: 14px;
            }
            
            .ai-suggestion-text {
                font-size: 13px;
                color: #666;
                line-height: 1.6;
                margin-bottom: 8px;
            }
            
            .ai-suggestion-stats {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
                margin-top: 8px;
            }
            
            .ai-stat-item {
                background: rgba(255,255,255,0.6);
                padding: 8px;
                border-radius: 6px;
                text-align: center;
            }
            
            .ai-stat-value {
                font-size: 16px;
                font-weight: 600;
                color: #333;
            }
            
            .ai-stat-label {
                font-size: 11px;
                color: #666;
                margin-top: 2px;
            }
            
            .ai-suggestion-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }
            
            .ai-action-btn {
                flex: 1;
                padding: 8px 12px;
                border: none;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .ai-action-btn.primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .ai-action-btn.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
            
            .ai-action-btn.secondary {
                background: #f5f6f7;
                color: #333;
            }
            
            .ai-action-btn.secondary:hover {
                background: #e0e0e0;
            }
            
            /* 聊天区域 */
            .ai-chat-section {
                display: flex;
                flex-direction: column;
            }
            
            .ai-chat-messages {
                flex: 1;
                max-height: 300px;
                overflow-y: auto;
                margin-bottom: 12px;
                padding: 8px;
                background: white;
                border-radius: 12px;
                border: 1px solid #e0e0e0;
            }
            
            .ai-message {
                margin-bottom: 12px;
                display: flex;
                flex-direction: column;
            }
            
            .ai-message-user {
                align-items: flex-end;
            }
            
            .ai-message-ai {
                align-items: flex-start;
            }
            
            .ai-message-system {
                align-items: center;
                background: #f0f0f0;
                border-radius: 12px;
                padding: 12px;
            }
            
            .ai-message-content {
                max-width: 85%;
                padding: 10px 14px;
                border-radius: 12px;
                font-size: 13px;
                line-height: 1.5;
            }
            
            .ai-message-user .ai-message-content {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-bottom-right-radius: 4px;
            }
            
            .ai-message-ai .ai-message-content {
                background: #f5f6f7;
                color: #333;
                border-bottom-left-radius: 4px;
            }
            
            .ai-message-content ul {
                margin: 8px 0 8px 20px;
            }
            
            .ai-message-content li {
                margin-bottom: 4px;
            }
            
            .ai-message-time {
                font-size: 11px;
                color: #999;
                margin-top: 4px;
            }
            
            .ai-chat-input {
                display: flex;
                gap: 8px;
            }
            
            .ai-input-field {
                flex: 1;
                padding: 10px 14px;
                border: 1px solid #e0e0e0;
                border-radius: 20px;
                font-size: 13px;
                outline: none;
                transition: border-color 0.2s;
            }
            
            .ai-input-field:focus {
                border-color: #667eea;
            }
            
            .ai-send-btn {
                width: 40px;
                height: 40px;
                border: none;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s;
            }
            
            .ai-send-btn:hover {
                transform: scale(1.1);
            }
            
            .ai-send-btn:active {
                transform: scale(0.95);
            }
            
            /* 面板底部 */
            .ai-panel-footer {
                padding: 12px 16px;
                background: white;
                border-top: 1px solid #e0e0e0;
            }
            
            .ai-quick-actions {
                display: flex;
                gap: 8px;
            }
            
            .ai-quick-btn {
                flex: 1;
                padding: 8px;
                border: 1px solid #e0e0e0;
                background: white;
                border-radius: 8px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .ai-quick-btn:hover {
                background: #f5f6f7;
                border-color: #667eea;
            }
            
            /* 加载动画 */
            .ai-loading {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #667eea;
                font-size: 13px;
            }
            
            .ai-loading-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid #667eea;
                border-top-color: transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            /* 响应式 */
            @media (max-width: 768px) {
                .ai-assistant-panel {
                    right: 10px;
                    left: 10px;
                    bottom: 10px;
                    width: auto;
                    max-height: 80vh;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 绑定字段事件
    bindFieldEvents() {
        // 监测所有输入字段
        document.querySelectorAll('input, textarea, select').forEach(field => {
            // 聚焦时显示建议
            field.addEventListener('focus', (e) => {
                this.currentField = e.target;
                this.handleFieldFocus(e.target);
            });
            
            // 输入时更新建议
            field.addEventListener('input', (e) => {
                this.handleFieldInput(e.target);
            });
            
            // 失焦时隐藏高亮
            field.addEventListener('blur', () => {
                // 可以添加失焦逻辑
            });
        });
    }
    
    // 绑定全局事件
    bindGlobalEvents() {
        // 监听动态添加的字段
        const observer = new MutationObserver(() => {
            document.querySelectorAll('input, textarea, select').forEach(field => {
                if (!field.hasAttribute('data-ai-bound')) {
                    field.setAttribute('data-ai-bound', 'true');
                    this.bindFieldEvents();
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // 处理字段聚焦
    async handleFieldFocus(field) {
        const fieldId = field.id || field.name || field.type;
        const fieldName = this.getFieldName(field);
        const fieldValue = field.value;
        
        console.log(`📝 字段聚焦：${fieldId}, 值：${fieldValue}`);
        
        // 显示加载状态
        this.showSuggestionLoading();
        
        // 生成建议
        const suggestion = await this.generateSuggestion(fieldId, fieldName, fieldValue);
        
        // 显示建议
        this.showSuggestion(suggestion);
    }
    
    // 处理字段输入
    handleFieldInput(field) {
        // 可以实现实时建议更新
        // 为避免频繁调用，可以添加防抖
    }
    
    // 获取字段名称
    getFieldName(field) {
        const label = document.querySelector(`label[for="${field.id}"]`);
        if (label) {
            return label.textContent.trim().replace('*', '').replace('?', '');
        }
        
        // 尝试从 placeholder 获取
        if (field.placeholder) {
            return field.placeholder;
        }
        
        // 使用 ID 或 name
        return field.id || field.name || '当前字段';
    }
    
    // 获取当前表单已填写的数据
    getCurrentFormData() {
        const formData = {};
        const fields = [
            'projectName', 'projectType', 'productManager', 'projectManager',
            'techGoal', 'marketGoal', 'budget', 'duration', 'hrRequirement', 'risks',
            'techFeasibility', 'economicFeasibility', 'necessity',
            'workingPrinciple', 'productUsage',
            'techChallenges', 'solutions',
            'metric1', 'metric2', 'metric3', 'metric4',
            'totalDuration', 'phases',
            'totalCost', 'expectedPrice', 'costBreakdown',
            'targetCustomers', 'competitiveAdvantage'
        ];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && field.value.trim()) {
                formData[fieldId] = field.value.trim();
            }
        });
        
        console.log('📊 当前表单数据:', formData);
        return formData;
    }
    
    // 生成建议
    async generateSuggestion(fieldId, fieldName, fieldValue, formData = {}) {
        // 根据字段类型生成不同建议
        const fieldKeywords = {
            'projectName': ['项目名称', '命名', 'title'],
            'budget': ['预算', '金额', 'cost', 'budget'],
            'duration': ['周期', '时间', 'duration', 'month'],
            'techGoal': ['技术目标', 'techGoal', '技术'],
            'techFeasibility': ['可行性', 'feasibility', '技术可行性'],
            'necessity': ['必要性', 'necessity', '项目必要性'],
            'workingPrinciple': ['工作原理', 'principle', '工作原理'],
            'productUsage': ['用途', 'usage', '应用场景'],
            'risks': ['风险', 'risks', '风险评估']
        };
        
        // 匹配字段类型
        let fieldType = 'general';
        for (const [type, keywords] of Object.entries(fieldKeywords)) {
            if (keywords.some(kw => fieldId.toLowerCase().includes(kw) || fieldName.toLowerCase().includes(kw))) {
                fieldType = type;
                break;
            }
        }
        
        console.log(`🔍 字段类型：${fieldType}`);
        
        // 根据类型生成建议（传入表单数据）
        switch (fieldType) {
            case 'budget':
                return this.generateBudgetSuggestion(fieldValue, formData);
            case 'duration':
                return this.generateDurationSuggestion(fieldValue, formData);
            case 'techGoal':
                return this.generateTechGoalSuggestion(fieldValue, formData);
            case 'techFeasibility':
                return this.generateFeasibilitySuggestion(fieldValue, formData);
            case 'necessity':
                return this.generateNecessitySuggestion(fieldValue, formData);
            case 'risks':
                return this.generateRisksSuggestion(fieldValue, formData);
            default:
                return this.generateGeneralSuggestion(fieldId, fieldName, fieldValue, formData);
        }
    }
    
    // 生成预算建议（结合表单其他字段）
    generateBudgetSuggestion(currentValue, formData = {}) {
        const projects = this.historyData.projects || [];
        
        // 根据项目类型筛选历史项目
        const projectType = formData.projectType || '';
        const projectName = formData.projectName || '';
        
        let filteredProjects = projects;
        let suggestionContext = '';
        
        // 如果已填写项目类型，按类型筛选
        if (projectType) {
            const typeMapping = {
                '新产品开发': '智能硬件',
                '技术预研': 'AI 算法',
                '产品改进': '智能硬件',
                '云平台/系统': '云平台',
                'AI 算法': 'AI 算法'
            };
            const mappedType = typeMapping[projectType];
            if (mappedType) {
                filteredProjects = projects.filter(p => p.type === mappedType);
                suggestionContext = `根据项目类型"${projectType}"，`;
            }
        }
        
        // 如果项目名称包含关键词，智能推荐
        let projectKeyword = '';
        if (projectName) {
            if (projectName.includes('摄像头') || projectName.includes('摄像') || projectName.includes('IPC')) {
                projectKeyword = '摄像头';
            } else if (projectName.includes('AI') || projectName.includes('算法')) {
                projectKeyword = 'AI 算法';
            } else if (projectName.includes('GPU') || projectName.includes('算力')) {
                projectKeyword = 'GPU';
            }
            
            // 根据关键词筛选相关历史项目
            if (projectKeyword) {
                const keywordProjects = projects.filter(p => p.name.includes(projectKeyword));
                if (keywordProjects.length > 0) {
                    filteredProjects = keywordProjects;
                    suggestionContext = `检测到项目名称包含"${projectKeyword}"，`;
                }
            }
        }
        
        const budgets = filteredProjects.map(p => p.budget).filter(b => b);
        
        if (budgets.length === 0) {
            return {
                title: '💰 预算建议',
                content: '暂无匹配的历史数据参考。建议根据项目规模和资源需求合理评估。',
                stats: [],
                actions: [
                    { text: '查看所有历史项目', action: 'showBudgetExamples' }
                ]
            };
        }
        
        const avg = Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length);
        const min = Math.min(...budgets);
        const max = Math.max(...budgets);
        const current = parseFloat(currentValue) || 0;
        
        let suggestionText = `${suggestionContext}参考 ${budgets.length} 个相关历史项目：\n`;
        suggestionText += `• 平均预算：${(avg/10000).toFixed(0)} 万元\n`;
        suggestionText += `• 范围：${(min/10000).toFixed(0)}万 - ${(max/10000).toFixed(0)} 万元`;
        
        // 如果已填写周期，提供联动建议
        if (formData.duration || formData.totalDuration) {
            const duration = formData.duration || formData.totalDuration;
            suggestionText += `\n• 当前周期：${duration}个月`;
            const monthlyBudget = avg / duration;
            suggestionText += `\n• 建议月度预算：${(monthlyBudget/10000).toFixed(1)}万元/月`;
        }
        
        if (current > 0) {
            if (current < avg * 0.5) {
                suggestionText += `\n⚠️ 当前预算偏低，可能影响项目质量`;
            } else if (current > avg * 1.5) {
                suggestionText += `\n⚠️ 当前预算偏高，建议优化成本`;
            } else {
                suggestionText += `\n✅ 当前预算合理`;
            }
        }
        
        // 添加相关项目参考
        if (filteredProjects.length > 0) {
            suggestionText += `\n\n📚 相关项目参考：`;
            filteredProjects.slice(0, 2).forEach(p => {
                suggestionText += `\n• ${p.name}：${(p.budget/10000).toFixed(0)}万元`;
            });
        }
        
        return {
            title: '💰 预算建议',
            content: suggestionText,
            stats: [
                { label: '平均预算', value: `${(avg/10000).toFixed(0)}万` },
                { label: '相关项目', value: budgets.length.toString() }
            ],
            actions: [
                { text: '应用平均值', value: avg.toString() },
                { text: '查看示例', action: 'showBudgetExamples' }
            ]
        };
    }
    
    // 生成周期建议
    generateDurationSuggestion(currentValue) {
        const projects = this.historyData.projects || [];
        const durations = projects.map(p => p.duration).filter(d => d);
        
        if (durations.length === 0) {
            return {
                title: '📅 周期建议',
                content: '暂无历史数据参考。建议根据项目复杂度合理评估。',
                stats: [],
                actions: []
            };
        }
        
        const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
        const min = Math.min(...durations);
        const max = Math.max(...durations);
        
        return {
            title: '📅 开发周期建议',
            content: `根据 ${durations.length} 个历史项目：\n• 平均周期：${avg} 个月\n• 范围：${min}-${max} 个月`,
            stats: [
                { label: '平均周期', value: `${avg}个月` },
                { label: '最短周期', value: `${min}个月` }
            ],
            actions: [
                { text: '应用平均值', value: avg.toString() }
            ]
        };
    }
    
    // 生成技术目标建议
    generateTechGoalSuggestion(currentValue) {
        const projects = this.historyData.projects || [];
        const examples = projects.filter(p => p.techGoal).slice(0, 2);
        
        let content = '技术目标应包含：\n';
        content += '1. 实现 XXX 功能，支持 XXX 性能指标\n';
        content += '2. 完成 XXX 技术研发，达到 XXX 水平\n';
        content += '3. 申请专利 X 项，软件著作权 X 项';
        
        if (examples.length > 0) {
            content += '\n\n📚 历史项目参考：';
            examples.forEach(ex => {
                content += `\n• ${ex.name}: ${ex.techGoal.substring(0, 50)}...`;
            });
        }
        
        return {
            title: '🎯 技术目标建议',
            content: content,
            stats: [],
            actions: [
                { text: '使用模板', action: 'applyTechGoalTemplate' }
            ]
        };
    }
    
    // 生成可行性建议
    generateFeasibilitySuggestion(currentValue) {
        const projects = this.historyData.projects || [];
        const examples = projects.filter(p => p.techFeasibility).slice(0, 2);
        
        let content = '技术可行性应包含：\n';
        content += '1. 团队具备相关领域技术积累\n';
        content += '2. 采用成熟技术栈，风险可控\n';
        content += '3. 已有原型验证，技术路径清晰';
        
        if (examples.length > 0) {
            content += '\n\n📚 历史项目参考：';
            examples.forEach(ex => {
                content += `\n• ${ex.name}: ${ex.techFeasibility.substring(0, 50)}...`;
            });
        }
        
        return {
            title: '✅ 可行性分析建议',
            content: content,
            stats: [],
            actions: [
                { text: '使用模板', action: 'applyFeasibilityTemplate' }
            ]
        };
    }
    
    // 生成必要性建议
    generateNecessitySuggestion(currentValue) {
        const projects = this.historyData.projects || [];
        const examples = projects.filter(p => p.necessity).slice(0, 2);
        
        let content = '项目必要性应包含：\n';
        content += '1. 市场需求明确，客户痛点突出\n';
        content += '2. 符合公司战略方向\n';
        content += '3. 可提升产品竞争力';
        
        if (examples.length > 0) {
            content += '\n\n📚 历史项目参考：';
            examples.forEach(ex => {
                content += `\n• ${ex.name}: ${ex.necessity.substring(0, 50)}...`;
            });
        }
        
        return {
            title: '💡 项目必要性建议',
            content: content,
            stats: [],
            actions: [
                { text: '使用模板', action: 'applyNecessityTemplate' }
            ]
        };
    }
    
    // 生成风险建议
    generateRisksSuggestion(currentValue) {
        const commonRisks = [
            '技术风险：XXX 技术难度大，可能影响进度',
            '人员风险：关键岗位人员不足',
            '进度风险：需求变更频繁',
            '供应链风险：关键物料交期长'
        ];
        
        return {
            title: '⚠️ 风险评估建议',
            content: '常见风险类型：\n' + commonRisks.map(r => '• ' + r).join('\n'),
            stats: [],
            actions: [
                { text: '添加常见风险', action: 'addCommonRisks' }
            ]
        };
    }
    
    // 生成通用建议
    generateGeneralSuggestion(fieldId, fieldName, fieldValue) {
        return {
            title: '💡 填写建议',
            content: `当前字段：${fieldName}\n\n请根据项目实际情况填写。如有问题，可以在下方对话框中提问。`,
            stats: [],
            actions: []
        };
    }
    
    // 显示建议加载状态
    showSuggestionLoading() {
        const content = document.getElementById('aiSuggestionContent');
        if (content) {
            content.innerHTML = `
                <div class="ai-loading">
                    <div class="ai-loading-spinner"></div>
                    <span>正在生成建议...</span>
                </div>
            `;
        }
    }
    
    // 显示建议
    showSuggestion(suggestion) {
        const content = document.getElementById('aiSuggestionContent');
        if (!content) return;
        
        let html = `
            <div class="ai-suggestion-card">
                <div class="ai-suggestion-title">${suggestion.title}</div>
                <div class="ai-suggestion-text" style="white-space: pre-line;">${suggestion.content}</div>
        `;
        
        // 添加统计数据
        if (suggestion.stats && suggestion.stats.length > 0) {
            html += `<div class="ai-suggestion-stats">`;
            suggestion.stats.forEach(stat => {
                html += `
                    <div class="ai-stat-item">
                        <div class="ai-stat-value">${stat.value}</div>
                        <div class="ai-stat-label">${stat.label}</div>
                    </div>
                `;
            });
            html += `</div>`;
        }
        
        // 添加操作按钮
        if (suggestion.actions && suggestion.actions.length > 0) {
            html += `<div class="ai-suggestion-actions">`;
            suggestion.actions.forEach(action => {
                if (action.value) {
                    html += `<button class="ai-action-btn primary" onclick="aiAssistant.applySuggestion('${action.value}')">${action.text}</button>`;
                } else if (action.action) {
                    html += `<button class="ai-action-btn secondary" onclick="aiAssistant.${action.action}()">${action.text}</button>`;
                }
            });
            html += `</div>`;
        }
        
        html += `</div>`;
        content.innerHTML = html;
    }
    
    // 应用建议到表单
    applySuggestion(value) {
        if (this.currentField && value) {
            this.currentField.value = value;
            this.currentField.focus();
            this.addChatMessage('ai', `✅ 已应用建议：${value}`);
        }
    }
    
    // 发送聊天消息
    async sendChatMessage() {
        const input = document.getElementById('aiChatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // 添加用户消息
        this.addChatMessage('user', message);
        input.value = '';
        
        // 显示加载状态
        this.showChatLoading();
        
        // 生成回答
        const answer = await this.generateAnswer(message);
        
        // 移除加载状态，添加 AI 回答
        this.removeChatLoading();
        this.addChatMessage('ai', answer);
    }
    
    // 处理聊天输入按键
    handleChatKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendChatMessage();
        }
    }
    
    // 生成回答（调用真实 API）
    async generateAnswer(question) {
        // 收集上下文信息
        const context = {
            formData: this.getCurrentFormData(),
            historyData: this.historyData,
            needsWebSearch: this.shouldSearchWeb(question)
        };
        
        // 检查是否配置了 API 服务
        if (typeof aiAPIService !== 'undefined' && aiAPIService) {
            try {
                // 调用 AI API 服务
                const results = await aiAPIService.comprehensiveSearch(question, context);
                
                if (results.success || results.answer) {
                    return this.formatAIAnswer(results);
                }
            } catch (e) {
                console.error('AI API 调用失败:', e);
            }
        }
        
        // 如果 API 调用失败或未配置，降级到本地回答
        return this.generateLocalAnswer(question, context);
    }
    
    // 格式化 AI 回答
    formatAIAnswer(results) {
        let answer = '';
        
        // 添加历史项目参考
        if (results.history && results.history.length > 0) {
            answer += '📚 历史项目参考：\n\n';
            results.history.forEach((project, i) => {
                answer += `${i + 1}. **${project.name}** (${project.id})\n`;
                if (project.budget) {
                    answer += `   预算：${project.budget / 10000}万元 | 周期：${project.duration}个月\n`;
                }
                const relevantInfo = this.extractRelevantInfo(project, '');
                if (relevantInfo) {
                    answer += `   ${relevantInfo}\n`;
                }
                answer += '\n';
            });
        }
        
        // 添加 AI 生成的回答
        if (results.answer) {
            answer += '\n🤖 AI 回答：\n\n';
            answer += results.answer;
        }
        
        // 添加联网搜索结果
        if (results.web && results.web.length > 0) {
            answer += '\n\n🔍 联网搜索结果：\n\n';
            results.web.forEach((result, i) => {
                answer += `${i + 1}. [${result.title}](${result.url})\n`;
                if (result.description) {
                    answer += `   ${result.description}\n`;
                }
                answer += '\n';
            });
        }
        
        return answer || '抱歉，未能获取到有效信息。';
    }
    
    // 本地回答（降级方案）
    generateLocalAnswer(question, context) {
        // 1. 检索历史项目
        const historyResults = this.searchHistory(question);
        
        let answer = '';
        
        // 添加历史数据回答
        if (historyResults.length > 0) {
            answer += '📚 根据历史项目数据：\n\n';
            historyResults.slice(0, 3).forEach(project => {
                answer += `• **${project.name}** (${project.id})\n`;
                const relevantInfo = this.extractRelevantInfo(project, question);
                if (relevantInfo) {
                    answer += `  ${relevantInfo}\n\n`;
                }
            });
        }
        
        // 如果需要联网搜索但没有 API
        if (context.needsWebSearch) {
            answer += '\n\n🔍 建议联网搜索：\n';
            answer += '以下问题可以通过联网搜索获取最新信息：\n';
            answer += `• "${question}" 的行业最佳实践\n`;
            answer += `• "${question}" 的最新技术标准\n\n`;
            answer += '⚠️ 请配置 API 密钥以启用联网搜索功能。';
        }
        
        // 如果没有找到相关信息
        if (!answer.trim()) {
            answer = '我暂时没有找到相关的历史项目信息。你可以：\n';
            answer += '1. 尝试换一种问法\n';
            answer += '2. 询问更具体的问题\n';
            answer += '3. 点击"📚 历史示例"查看参考';
        }
        
        return answer;
    }
    
    // 检索历史项目
    searchHistory(question) {
        if (!this.historyData || !this.historyData.projects) return [];
        
        const keywords = question.toLowerCase().split(/[\s,，？?]+/).filter(k => k.length > 1);
        
        const scores = this.historyData.projects.map(project => {
            let score = 0;
            const searchText = JSON.stringify(project).toLowerCase();
            
            keywords.forEach(keyword => {
                if (searchText.includes(keyword)) {
                    score++;
                }
            });
            
            return { project, score };
        });
        
        return scores
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(s => s.project);
    }
    
    // 判断是否需要联网搜索
    shouldSearchWeb(question) {
        const webKeywords = [
            '最新', '当前', '2024', '2025', '2026',
            '行业标准', '国家标准', '规范',
            '市场', '趋势', '竞品',
            '如何', '怎么', '什么'
        ];
        
        return webKeywords.some(kw => question.toLowerCase().includes(kw));
    }
    
    // 提取相关信息
    extractRelevantInfo(project, question) {
        const fields = ['techGoal', 'techFeasibility', 'necessity', 'budget', 'duration'];
        
        for (const field of fields) {
            if (project[field]) {
                const value = project[field].toString();
                if (value.length < 200) {
                    return value;
                } else {
                    return value.substring(0, 200) + '...';
                }
            }
        }
        
        return null;
    }
    
    // 添加聊天消息
    addChatMessage(sender, content) {
        const messagesContainer = document.getElementById('aiChatMessages');
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-message-${sender}`;
        
        const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="ai-message-content">${this.formatMessage(content)}</div>
            <div class="ai-message-time">${time}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.chatMessages.push({ sender, content, time });
    }
    
    // 格式化消息
    formatMessage(content) {
        // 将换行符转换为<br>
        let formatted = content.replace(/\n/g, '<br>');
        
        // 加粗
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 列表
        formatted = formatted.replace(/• (.*?)(<br>|$)/g, '<li>$1</li>');
        
        return formatted;
    }
    
    // 显示聊天加载状态
    showChatLoading() {
        const messagesContainer = document.getElementById('aiChatMessages');
        if (!messagesContainer) return;
        
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'aiChatLoading';
        loadingDiv.className = 'ai-message ai-message-ai';
        loadingDiv.innerHTML = `
            <div class="ai-message-content">
                <div class="ai-loading">
                    <div class="ai-loading-spinner"></div>
                    <span>正在思考...</span>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // 移除聊天加载状态
    removeChatLoading() {
        const loading = document.getElementById('aiChatLoading');
        if (loading) loading.remove();
    }
    
    // 切换面板
    togglePanel() {
        this.panelElement.classList.toggle('minimized');
    }
    
    // 关闭面板
    closePanel() {
        this.panelElement.classList.add('hidden');
    }
    
    // 显示面板
    openPanel() {
        this.panelElement.classList.remove('hidden');
        this.panelElement.classList.remove('minimized');
    }
    
    // 显示快速帮助
    showQuickHelp() {
        const help = `❓ 快速帮助\n\n我可以帮你：\n\n1. 📝 提供表单填写建议\n   - 点击表单字段获取实时建议\n   - 基于历史项目数据分析\n\n2. 💬 回答填写问题\n   - 在下方输入框提问\n   - 我会结合历史数据和联网搜索回答\n\n3. 📚 查看历史示例\n   - 点击"历史示例"按钮\n   - 参考过往项目的填写方式`;
        
        this.addChatMessage('ai', help);
        this.openPanel();
    }
    
    // 显示历史示例
    showHistoryExamples() {
        if (!this.historyData || !this.historyData.projects) {
            this.addChatMessage('ai', '暂无历史项目数据');
            return;
        }
        
        let content = '📚 历史项目示例：\n\n';
        this.historyData.projects.slice(0, 5).forEach((project, index) => {
            content += `${index + 1}. **${project.name}** (${project.id})\n`;
            content += `   类型：${project.type || '未分类'}\n`;
            content += `   预算：${(project.budget / 10000).toFixed(0)}万元 | 周期：${project.duration}个月\n\n`;
        });
        
        content += '\n点击表单字段时，我会自动推荐相关项目的填写方式。';
        
        this.addChatMessage('ai', content);
        this.openPanel();
    }
    
    // 应用模板方法
    applyTechGoalTemplate() {
        const template = '1. 实现 XXX 功能，支持 XXX 性能指标\n2. 完成 XXX 技术研发，达到 XXX 水平\n3. 申请专利 X 项，软件著作权 X 项';
        this.applySuggestionToField(template);
    }
    
    applyFeasibilityTemplate() {
        const template = '1. 团队具备相关领域技术积累\n2. 采用成熟技术栈，风险可控\n3. 已有原型验证，技术路径清晰';
        this.applySuggestionToField(template);
    }
    
    applyNecessityTemplate() {
        const template = '1. 市场需求明确，客户痛点突出\n2. 符合公司战略方向\n3. 可提升产品竞争力';
        this.applySuggestionToField(template);
    }
    
    addCommonRisks() {
        const risks = '1. 技术风险：XXX 技术难度大，可能影响进度\n2. 人员风险：关键岗位人员不足\n3. 进度风险：需求变更频繁\n4. 供应链风险：关键物料交期长';
        this.applySuggestionToField(risks);
    }
    
    // 应用建议到当前字段
    applySuggestionToField(text) {
        if (this.currentField) {
            this.currentField.value = text;
            this.currentField.focus();
            this.addChatMessage('ai', `✅ 已应用模板到"${this.getFieldName(this.currentField)}"`);
        } else {
            this.addChatMessage('ai', '⚠️ 请先选择一个表单字段');
        }
    }
    
    // 显示预算示例
    showBudgetExamples() {
        if (!this.historyData || !this.historyData.projects) {
            this.addChatMessage('ai', '暂无历史预算数据');
            return;
        }
        
        const budgets = this.historyData.projects.filter(p => p.budget);
        let content = '💰 历史项目预算示例：\n\n';
        
        budgets.slice(0, 5).forEach((p, i) => {
            content += `${i + 1}. ${p.name}: ${(p.budget / 10000).toFixed(0)}万元\n`;
        });
        
        const avg = budgets.reduce((a, b) => a + b.budget, 0) / budgets.length;
        content += `\n平均预算：${(avg / 10000).toFixed(0)}万元`;
        
        this.addChatMessage('ai', content);
    }
}

// 初始化 AI 助手和 API 服务
let aiAssistant;
let aiAPIService;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 初始化 API 服务（如果可用）
    try {
        if (typeof AIAPIService !== 'undefined') {
            // 尝试从配置加载 API 密钥
            const config = await loadAPIConfig();
            aiAPIService = new AIAPIService(config);
            console.log('✅ AI API Service 已初始化');
        }
    } catch (e) {
        console.warn('⚠️ AI API Service 初始化失败:', e);
    }
    
    // 2. 初始化表单助手
    aiAssistant = new AIFormAssistant({
        enableWebSearch: true,
        apiService: aiAPIService
    });
    
    console.log('✅ AI Form Assistant 已初始化');
});

// 加载 API 配置
async function loadAPIConfig() {
    try {
        // 尝试从配置文件加载
        const response = await fetch('./api-config.json');
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.warn('⚠️ 未找到 API 配置文件，使用默认配置');
    }
    
    // 返回默认配置
    return {
        model: 'qwen-plus',
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        webSearch: {
            enabled: true,
            provider: 'brave'
        }
    };
}
