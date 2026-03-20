/**
 * AI 助手 v3 - 布局优化 + 文档管理
 * 包含：可折叠面板、文件上传、文档保存/提交、文档管理
 */

(function() {
    'use strict';
    
    console.log('🤖 AI 助手 v3 初始化中...');
    
    // AI 助手类
    class AIAssistantV3 {
        constructor() {
            this.initialized = false;
            this.apiConfig = null;
            this.panelElement = null;
            this.currentField = null;
            this.uploadedFiles = [];
            this.isExpanded = true; // 面板展开状态
            
            this.init();
        }
        
        // 初始化
        async init() {
            console.log('🔧 正在初始化 AI 助手 v3...');
            
            // 1. 加载 API 配置
            await this.loadAPIConfig();
            
            // 2. 创建面板
            this.createPanel();
            
            // 3. 绑定事件
            this.bindEvents();
            
            // 4. 添加保存/提交按钮到表单
            this.addSaveSubmitButtons();
            
            this.initialized = true;
            console.log('✅ AI 助手 v3 初始化完成');
            console.log('📡 API 配置:', this.apiConfig ? '已加载' : '未加载');
        }
        
        // 加载 API 配置
        async loadAPIConfig() {
            try {
                console.log('🔍 开始加载 API 配置...');
                
                if (typeof openClawConfig !== 'undefined') {
                    console.log('✅ openClawConfig 对象存在');
                    
                    const proxyConfig = await openClawConfig.getProxyConfig();
                    console.log('📦 获取到的 proxyConfig:', proxyConfig);
                    
                    if (proxyConfig && proxyConfig.apiKey) {
                        this.apiConfig = {
                            baseUrl: proxyConfig.baseUrl,
                            apiKey: proxyConfig.apiKey,
                            model: proxyConfig.models && proxyConfig.models.length > 0 
                                ? proxyConfig.models[0].id 
                                : 'glm-5-fp8'
                        };
                        
                        console.log('✅ 已从 OpenClaw 加载 API 配置');
                        console.log('📡 Base URL:', this.apiConfig.baseUrl);
                        console.log('🤖 模型:', this.apiConfig.model);
                        console.log('🔑 Key:', this.apiConfig.apiKey.substring(0, 15) + '...');
                        
                        return true;
                    }
                }
                
                console.warn('⚠️ 未找到 OpenClaw 配置，使用备用配置');
                this.apiConfig = {
                    baseUrl: 'https://223.167.85.184:3000/v1',
                    apiKey: 'sk-HlAhQoWHPvKeeHwGmKE2s1LPq7QautJBHURXgX47N7YQPWQg',
                    model: 'glm-5-fp8'
                };
                
                return true;
                
            } catch (error) {
                console.error('❌ 加载 API 配置失败:', error);
                return false;
            }
        }
        
        // 创建面板（优化布局）
        createPanel() {
            console.log('🔨 创建 AI 助手面板...');
            
            const panel = document.createElement('div');
            panel.id = 'aiAssistantV3Panel';
            panel.style.cssText = `
                position: fixed;
                right: 20px;
                top: 100px;
                bottom: 20px;
                width: 400px;
                min-width: 50px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                border: 1px solid #e0e0e0;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                transition: width 0.3s ease;
            `;
            
            panel.innerHTML = `
                <!-- 头部 -->
                <div id="aiPanelHeader" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; flex-shrink: 0; min-width: 50px;">
                    <div id="aiHeaderContent" style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 36px; height: 36px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px;">🤖</div>
                        <div id="aiHeaderText">
                            <div style="font-size: 15px; font-weight: 600;">AI 智能助手</div>
                            <div style="font-size: 11px; opacity: 0.9; display: flex; align-items: center; gap: 4px;">
                                <span style="width: 6px; height: 6px; background: #22c55e; border-radius: 50%; display: inline-block;"></span>
                                <span id="aiStatusText">${this.apiConfig ? '在线 (' + this.apiConfig.model + ')' : '在线'}</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button id="aiToggleBtn" title="展开/收起" style="width: 28px; height: 28px; border-radius: 6px; border: none; background: rgba(255,255,255,0.2); color: white; cursor: pointer; font-size: 16px;">🗖</button>
                        <button id="aiCloseBtn" title="关闭" style="width: 28px; height: 28px; border-radius: 6px; border: none; background: rgba(255,255,255,0.2); color: white; cursor: pointer; font-size: 16px;">×</button>
                    </div>
                </div>
                
                <!-- 可折叠的内容区域 -->
                <div id="aiPanelContent" style="flex: 1; overflow-y: auto; padding: 12px; background: #f8f9fa;">
                    <!-- 文件上传区域 -->
                    <div style="margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: #333;">
                            <span>📎</span>
                            <span>已上传文件</span>
                        </div>
                        <div id="aiFileList" style="min-height: 35px; background: white; border-radius: 8px; padding: 10px; border: 1px dashed #e0e0e0; font-size: 11px; color: #666;">
                            <div style="text-align: center; padding: 8px;">暂无上传文件</div>
                        </div>
                        <div style="display: flex; gap: 6px; margin-top: 6px;">
                            <button id="aiUploadLocalBtn" style="flex: 1; padding: 6px; border: 1px solid #667eea; background: white; color: #667eea; border-radius: 5px; font-size: 11px; cursor: pointer;">📁 本地文件</button>
                            <button id="aiUploadFeishuBtn" style="flex: 1; padding: 6px; border: 1px solid #3370ff; background: white; color: #3370ff; border-radius: 5px; font-size: 11px; cursor: pointer;">📄 飞书文档</button>
                        </div>
                        <input type="file" id="aiFileInput" style="display: none;" accept=".txt,.md,.doc,.docx,.pdf,.json">
                    </div>
                    
                    <!-- 智能建议 -->
                    <div style="margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: #333;">
                            <span>💡</span>
                            <span>智能建议</span>
                        </div>
                        <div id="aiSuggestionBox" style="background: white; border-radius: 10px; padding: 12px; border: 1px solid #e0e0e0; font-size: 12px;">
                            <div style="text-align: center; padding: 15px; color: #999;">
                                <div style="font-size: 24px; margin-bottom: 6px;">✨</div>
                                <div>点击表单字段获取建议</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 问答对话 -->
                    <div style="flex: 1; display: flex; flex-direction: column;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: #333;">
                            <span>💬</span>
                            <span>问答对话</span>
                        </div>
                        <div id="aiChatBox" style="flex: 1; background: white; border-radius: 10px; padding: 10px; border: 1px solid #e0e0e0; min-height: 120px; overflow-y: auto; margin-bottom: 8px; font-size: 12px;">
                            <div style="margin-bottom: 10px; padding: 8px 12px; background: #f0f0f0; border-radius: 10px; line-height: 1.5;">
                                你好！我是智能表单助手。我可以：
                                <ul style="margin: 6px 0 6px 16px;">
                                    <li>提供填写建议</li>
                                    <li>回答填写问题</li>
                                    <li>分析上传文档</li>
                                </ul>
                                有什么可以帮你的吗？
                            </div>
                        </div>
                        <div style="display: flex; gap: 6px; align-items: center;">
                            <button id="aiSendBtn" style="width: 36px; height: 36px; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; cursor: pointer; font-size: 16px; flex-shrink: 0;">📤</button>
                            <input type="text" id="aiChatInput" placeholder="输入问题..." style="flex: 1; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 18px; font-size: 12px; outline: none;">
                        </div>
                    </div>
                </div>
                
                <!-- 底部快捷操作 -->
                <div style="padding: 10px 12px; background: white; border-top: 1px solid #e0e0e0; display: flex; gap: 6px; flex-shrink: 0;">
                    <button id="aiHelpBtn" style="flex: 1; padding: 6px; border: 1px solid #e0e0e0; background: white; border-radius: 6px; font-size: 11px; cursor: pointer;">❓ 帮助</button>
                    <button id="aiHistoryBtn" style="flex: 1; padding: 6px; border: 1px solid #e0e0e0; background: white; border-radius: 6px; font-size: 11px; cursor: pointer;">📚 示例</button>
                </div>
            `;
            
            document.body.appendChild(panel);
            this.panelElement = panel;
            console.log('✅ AI 助手面板已创建');
        }
        
        // 绑定事件
        bindEvents() {
            // 展开/收起按钮
            document.getElementById('aiToggleBtn').addEventListener('click', () => {
                this.togglePanel();
            });
            
            // 关闭按钮
            document.getElementById('aiCloseBtn').addEventListener('click', () => {
                document.getElementById('aiAssistantV3Panel').style.display = 'none';
            });
            
            // 发送按钮
            document.getElementById('aiSendBtn').addEventListener('click', () => {
                this.sendChatMessage();
            });
            
            // 聊天输入回车发送
            const chatInput = document.getElementById('aiChatInput');
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendChatMessage();
                }
            });
            
            // 帮助按钮
            document.getElementById('aiHelpBtn').addEventListener('click', () => {
                this.showHelp();
            });
            
            // 历史示例按钮
            document.getElementById('aiHistoryBtn').addEventListener('click', () => {
                this.showHistory();
            });
            
            // 本地文件上传
            document.getElementById('aiUploadLocalBtn').addEventListener('click', () => {
                document.getElementById('aiFileInput').click();
            });
            
            // 文件选择
            document.getElementById('aiFileInput').addEventListener('change', (e) => {
                this.handleFileSelect(e);
            });
            
            // 飞书文档上传
            document.getElementById('aiUploadFeishuBtn').addEventListener('click', () => {
                this.showFeishuUploadDialog();
            });
            
            // 字段聚焦事件
            document.querySelectorAll('input, textarea, select').forEach(field => {
                field.addEventListener('focus', () => {
                    this.currentField = field;
                    this.showFieldSuggestion(field);
                });
            });
            
            console.log('✅ 事件已绑定');
        }
        
        // 切换面板展开/收起
        togglePanel() {
            const content = document.getElementById('aiPanelContent');
            const headerContent = document.getElementById('aiHeaderContent');
            const headerText = document.getElementById('aiHeaderText');
            const panel = document.getElementById('aiAssistantV3Panel');
            const toggleBtn = document.getElementById('aiToggleBtn');
            
            if (this.isExpanded) {
                // 收起 - 隐藏内容和文字，只保留头部和按钮
                content.style.display = 'none';
                if (headerText) headerText.style.display = 'none';
                panel.style.width = '50px';
                toggleBtn.textContent = '➡️';
                toggleBtn.title = '展开';
                this.isExpanded = false;
            } else {
                // 展开
                content.style.display = 'block';
                if (headerText) headerText.style.display = 'block';
                panel.style.width = '400px';
                toggleBtn.textContent = '🗖';
                toggleBtn.title = '收起';
                this.isExpanded = true;
            }
        }
        
        // 添加保存/提交按钮到表单
        addSaveSubmitButtons() {
            // 查找表单的底部位置
            const formContainer = document.querySelector('form') || document.querySelector('.container') || document.body;
            
            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 12px;
                z-index: 9998;
                background: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                border: 1px solid #e0e0e0;
            `;
            
            buttonContainer.innerHTML = `
                <button id="saveDraftBtn" style="padding: 12px 24px; border: 2px solid #667eea; background: white; color: #667eea; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                    💾 保存草稿
                </button>
                <button id="submitDocBtn" style="padding: 12px 24px; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                    📤 提交文档
                </button>
                <button id="docManageBtn" style="padding: 12px 24px; border: 1px solid #e0e0e0; background: white; color: #333; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                    📁 文档管理
                </button>
            `;
            
            document.body.appendChild(buttonContainer);
            
            // 绑定按钮事件
            document.getElementById('saveDraftBtn').addEventListener('click', () => {
                this.saveDraft();
            });
            
            document.getElementById('submitDocBtn').addEventListener('click', () => {
                this.submitDocument();
            });
            
            document.getElementById('docManageBtn').addEventListener('click', () => {
                this.openDocManager();
            });
            
            console.log('✅ 保存/提交按钮已添加');
        }
        
        // 保存草稿
        saveDraft() {
            console.log('💾 保存草稿...');
            
            // 收集表单数据
            const formData = {};
            document.querySelectorAll('input, textarea, select').forEach(field => {
                const id = field.id || field.name;
                if (id) {
                    formData[id] = field.value;
                }
            });
            
            // 保存到 localStorage
            const projectName = formData.projectName || '未命名项目';
            const timestamp = new Date().toISOString();
            const draftKey = `draft_${timestamp}_${projectName}`;
            
            localStorage.setItem(draftKey, JSON.stringify({
                projectName: projectName,
                formData: formData,
                uploadedFiles: this.uploadedFiles,
                savedAt: timestamp
            }));
            
            alert(`✅ 草稿已保存！\n\n项目名称：${projectName}\n保存时间：${new Date().toLocaleString('zh-CN')}\n\n下次打开页面时可以继续编辑。`);
        }
        
        // 提交文档
        submitDocument() {
            console.log('📤 提交文档...');
            
            // 验证必填字段
            const requiredFields = ['projectName', 'projectType'];
            const missing = requiredFields.filter(id => {
                const field = document.getElementById(id);
                return !field || !field.value.trim();
            });
            
            if (missing.length > 0) {
                alert(`⚠️ 请填写必填字段：\n${missing.join(', ')}`);
                return;
            }
            
            const projectName = document.getElementById('projectName').value;
            
            if (confirm(`📤 确认提交文档？\n\n项目名称：${projectName}\n\n提交后文档将归档到文档管理系统。`)) {
                // 保存为已提交文档
                const formData = {};
                document.querySelectorAll('input, textarea, select').forEach(field => {
                    const id = field.id || field.name;
                    if (id) {
                        formData[id] = field.value;
                    }
                });
                
                const timestamp = new Date().toISOString();
                const docKey = `doc_${timestamp}_${projectName}`;
                
                localStorage.setItem(docKey, JSON.stringify({
                    projectName: projectName,
                    formData: formData,
                    uploadedFiles: this.uploadedFiles,
                    status: 'submitted',
                    submittedAt: timestamp
                }));
                
                alert(`✅ 文档已提交！\n\n项目名称：${projectName}\n提交时间：${new Date().toLocaleString('zh-CN')}\n\n点击"文档管理"查看已提交的文档。`);
            }
        }
        
        // 打开文档管理器
        openDocManager() {
            console.log('📁 打开文档管理器...');
            
            // 收集所有文档
            const docs = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('doc_') || key.startsWith('draft_')) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        docs.push({
                            key: key,
                            name: data.projectName || '未命名',
                            type: key.startsWith('doc_') ? '已提交' : '草稿',
                            date: data.submittedAt || data.savedAt || '未知'
                        });
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
            
            // 显示文档列表
            let docList = '📁 文档列表：\n\n';
            if (docs.length === 0) {
                docList += '暂无文档\n\n请先保存草稿或提交文档。';
            } else {
                docs.forEach((doc, i) => {
                    docList += `${i + 1}. ${doc.name}\n`;
                    docList += `   类型：${doc.type}\n`;
                    docList += `   时间：${new Date(doc.date).toLocaleString('zh-CN')}\n\n`;
                });
            }
            
            docList += '\n💡 提示：文档按项目名称归档，保存在浏览器本地存储中。';
            
            alert(docList);
        }
        
        // 发送聊天消息
        async sendChatMessage() {
            const input = document.getElementById('aiChatInput');
            const message = input.value.trim();
            if (!message) return;
            
            console.log('💬 用户提问:', message);
            
            const chatBox = document.getElementById('aiChatBox');
            if (chatBox) {
                chatBox.innerHTML += `
                    <div style="margin-top: 8px; padding: 8px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; font-size: 12px; line-height: 1.5;">
                        ${message}
                    </div>
                `;
                chatBox.scrollTop = chatBox.scrollHeight;
            }
            
            input.value = '';
            
            // 显示"正在思考"
            if (chatBox) {
                chatBox.innerHTML += `
                    <div id="aiThinking" style="margin-top: 8px; padding: 8px 12px; background: #f0f0f0; border-radius: 10px; font-size: 12px; line-height: 1.5;">
                        🤔 正在思考...
                    </div>
                `;
                chatBox.scrollTop = chatBox.scrollHeight;
            }
            
            // 调用 AI 模型
            try {
                if (!this.apiConfig) {
                    throw new Error('API 配置未加载');
                }
                
                let userMessage = message;
                if (this.uploadedFiles.length > 0) {
                    userMessage += '\n\n[已上传文件]\n' + this.uploadedFiles.map(f => `• ${f.name}`).join('\n');
                }
                
                const response = await fetch(`${this.apiConfig.baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiConfig.apiKey}`
                    },
                    body: JSON.stringify({
                        model: this.apiConfig.model,
                        messages: [
                            {
                                role: 'system',
                                content: '你是一个智能表单助手，帮助用户填写研发项目文档。回答要专业、准确、有帮助。'
                            },
                            {
                                role: 'user',
                                content: userMessage
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 1500
                    })
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || `HTTP ${response.status}`);
                }
                
                const data = await response.json();
                const answer = data.choices[0].message.content;
                
                // 移除"正在思考"，显示 AI 回答
                const thinking = document.getElementById('aiThinking');
                if (thinking) thinking.remove();
                
                if (chatBox) {
                    chatBox.innerHTML += `
                        <div style="margin-top: 8px; padding: 8px 12px; background: #e8f5e9; border-radius: 10px; font-size: 12px; line-height: 1.5;">
                            <strong>🤖 AI 回答：</strong><br><br>
                            ${answer.replace(/\n/g, '<br>')}
                        </div>
                    `;
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
                
                console.log('✅ AI 回答成功');
                
            } catch (error) {
                console.error('❌ AI 调用失败:', error);
                
                const thinking = document.getElementById('aiThinking');
                if (thinking) thinking.remove();
                
                if (chatBox) {
                    chatBox.innerHTML += `
                        <div style="margin-top: 8px; padding: 8px 12px; background: #ffebee; border-radius: 10px; font-size: 12px; line-height: 1.5; color: #c62828;">
                            ❌ AI 调用失败：${error.message}
                        </div>
                    `;
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
            }
        }
        
        // 处理文件选择
        handleFileSelect(event) {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            
            const file = files[0];
            console.log('📎 选择文件:', file.name, file.type, file.size);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                this.uploadedFiles.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    content: content
                });
                
                this.updateFileList();
                this.analyzeFile(file.name, content);
            };
            
            reader.readAsText(file);
        }
        
        // 更新文件列表显示
        updateFileList() {
            const fileList = document.getElementById('aiFileList');
            if (!fileList) return;
            
            if (this.uploadedFiles.length === 0) {
                fileList.innerHTML = '<div style="text-align: center; padding: 8px;">暂无上传文件</div>';
            } else {
                fileList.innerHTML = this.uploadedFiles.map(f => `
                    <div style="padding: 6px; background: #f5f5f5; border-radius: 5px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                        <div>
                            <strong>📄 ${f.name}</strong><br>
                            <span style="color: #666;">${(f.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <button onclick="window.aiAssistantV3.removeFile('${f.name}')" style="border: none; background: #ffebee; color: #c62828; border-radius: 3px; padding: 3px 6px; cursor: pointer; font-size: 10px;">删除</button>
                    </div>
                `).join('');
            }
        }
        
        // 删除文件
        removeFile(fileName) {
            this.uploadedFiles = this.uploadedFiles.filter(f => f.name !== fileName);
            this.updateFileList();
            console.log('🗑️ 删除文件:', fileName);
        }
        
        // 分析文件
        async analyzeFile(fileName, content) {
            console.log('🔍 分析文件:', fileName);
            
            const chatBox = document.getElementById('aiChatBox');
            if (chatBox) {
                chatBox.innerHTML += `
                    <div style="margin-top: 8px; padding: 8px 12px; background: #fff3e0; border-radius: 10px; font-size: 12px; line-height: 1.5;">
                        📎 已上传文件：<strong>${fileName}</strong><br>
                        正在分析...
                    </div>
                `;
                chatBox.scrollTop = chatBox.scrollHeight;
            }
            
            try {
                const response = await fetch(`${this.apiConfig.baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiConfig.apiKey}`
                    },
                    body: JSON.stringify({
                        model: this.apiConfig.model,
                        messages: [
                            {
                                role: 'system',
                                content: '你是一个智能表单助手。请分析用户上传的文件内容，提取关键信息，并为填写研发立项书提供建议。'
                            },
                            {
                                role: 'user',
                                content: `请分析以下文件内容，并为填写研发立项书提供建议：\n\n文件名：${fileName}\n内容：\n${content.substring(0, 3000)}...`
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 1500
                    })
                });
                
                if (!response.ok) throw new Error('API 调用失败');
                
                const data = await response.json();
                const analysis = data.choices[0].message.content;
                
                if (chatBox) {
                    chatBox.innerHTML += `
                        <div style="margin-top: 8px; padding: 8px 12px; background: #e3f2fd; border-radius: 10px; font-size: 12px; line-height: 1.5;">
                            <strong>📊 文件分析结果：</strong><br><br>
                            ${analysis.replace(/\n/g, '<br>')}
                        </div>
                    `;
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
                
            } catch (error) {
                console.error('❌ 文件分析失败:', error);
            }
        }
        
        // 显示飞书文档上传对话框
        showFeishuUploadDialog() {
            const docUrl = prompt('请输入飞书文档链接：\n\n例如：https://sharetronic.feishu.cn/docx/XXXXX');
            if (!docUrl) return;
            
            console.log('📄 飞书文档链接:', docUrl);
            alert('飞书文档解析功能开发中...\n\n当前支持：\n• 本地文件上传（txt, md, doc, docx, pdf, json）\n\n飞书文档功能即将上线！');
        }
        
        // 显示字段建议
        showFieldSuggestion(field) {
            const fieldName = field.id || field.name || '当前字段';
            const suggestionBox = document.getElementById('aiSuggestionBox');
            
            if (!suggestionBox) return;
            
            console.log('💡 字段聚焦:', fieldName);
            
            suggestionBox.innerHTML = `
                <div style="font-size: 12px; color: #333;">
                    <div style="font-weight: 600; margin-bottom: 8px;">💡 ${fieldName} 填写建议</div>
                    <div style="color: #666; line-height: 1.5;">
                        点击表单字段进行填写。<br>
                        ${this.apiConfig ? 'AI 助手已就绪，可以回答问题。' : '⚠️ 请先配置 API 密钥。'}<br><br>
                        💡 提示：上传相关文档，AI 会自动分析并提供建议。
                    </div>
                </div>
            `;
        }
        
        // 显示帮助
        showHelp() {
            alert('❓ 快速帮助\n\n我可以帮你：\n\n1. 📝 提供表单填写建议\n   - 点击表单字段获取实时建议\n   - 基于历史项目数据分析\n\n2. 💬 回答填写问题\n   - 在下方输入框提问\n   - 我会结合历史数据和文件分析回答\n\n3. 📎 分析上传文档\n   - 支持本地文件（txt, md, doc, docx, pdf, json）\n   - 自动提取关键信息\n   - 提供填写建议\n\n4. 💾 保存草稿/提交文档\n   - 点击底部"保存草稿"按钮\n   - 数据保存在浏览器本地\n\n5. 📁 文档管理\n   - 点击"文档管理"按钮\n   - 按项目名称归档查看');
        }
        
        // 显示历史示例
        showHistory() {
            alert('📚 历史项目示例：\n\n1. IPC 摄像头自动化生产线 (SR1202500015)\n   预算：75 万元 | 周期：12 个月\n\n2. 基于 AI 高性能 GPU 算力集群的管理开发平台 (SR1202500001)\n   预算：2400 万元 | 周期：12 个月\n\n3. 智能工厂视觉质检系统 (SR1202600025)\n   预算：850 万元 | 周期：10 个月');
        }
    }
    
    // 初始化并导出到全局
    window.aiAssistantV3 = new AIAssistantV3();
    
    console.log('🤖 AI 助手 v3 加载完成');
})();
