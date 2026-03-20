/**
 * AI 助手 v4 - 全面优化版
 * 1. 修复收起/展开功能
 * 2. 按钮移到右上角
 * 3. 支持所有文档页面
 */

(function() {
    'use strict';
    
    console.log('🤖 AI 助手 v4 初始化中...');
    
    // AI 助手类
    class AIAssistantV4 {
        constructor() {
            this.initialized = false;
            this.apiConfig = null;
            this.panelElement = null;
            this.currentField = null;
            this.uploadedFiles = [];
            this.isExpanded = true;
            this.isCollapsed = false;
            
            this.init();
        }
        
        // 初始化
        async init() {
            console.log('🔧 正在初始化 AI 助手 v4...');
            
            await this.loadAPIConfig();
            this.createPanel();
            this.bindEvents();
            this.addTopButtons();
            
            this.initialized = true;
            console.log('✅ AI 助手 v4 初始化完成');
        }
        
        // 加载 API 配置
        async loadAPIConfig() {
            try {
                if (typeof openClawConfig !== 'undefined') {
                    const proxyConfig = await openClawConfig.getProxyConfig();
                    
                    if (proxyConfig && proxyConfig.apiKey) {
                        this.apiConfig = {
                            baseUrl: proxyConfig.baseUrl,
                            apiKey: proxyConfig.apiKey,
                            model: proxyConfig.models && proxyConfig.models.length > 0 
                                ? proxyConfig.models[0].id 
                                : 'glm-5-fp8'
                        };
                        console.log('✅ API 配置已加载');
                        return true;
                    }
                }
                
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
        
        // 创建面板
        createPanel() {
            const panel = document.createElement('div');
            panel.id = 'aiAssistantV4Panel';
            panel.style.cssText = `
                position: fixed;
                right: 20px;
                top: 100px;
                bottom: 20px;
                width: 380px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                border: 1px solid #e0e0e0;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                transition: all 0.3s ease;
            `;
            
            panel.innerHTML = `
                <div id="aiPanelHeader" style="display: flex; justify-content: space-between; align-items: center; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; flex-shrink: 0;">
                    <div id="aiHeaderContent" style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                        <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">🤖</div>
                        <div id="aiHeaderText" style="white-space: nowrap; overflow: hidden;">
                            <div style="font-size: 14px; font-weight: 600;">AI 智能助手</div>
                            <div style="font-size: 10px; opacity: 0.9; display: flex; align-items: center; gap: 3px;">
                                <span style="width: 5px; height: 5px; background: #22c55e; border-radius: 50%; display: inline-block;"></span>
                                <span id="aiStatusText">${this.apiConfig ? '在线' : '未配置'}</span>
                            </div>
                        </div>
                    </div>
                    <button id="aiExpandBtn" title="展开面板" style="width: 26px; height: 26px; border-radius: 5px; border: none; background: rgba(255,255,255,0.2); color: white; cursor: pointer; font-size: 14px; flex-shrink: 0; display: none;">➡️</button>
                    <button id="aiCollapseBtn" title="收起面板" style="width: 26px; height: 26px; border-radius: 5px; border: none; background: rgba(255,255,255,0.2); color: white; cursor: pointer; font-size: 14px; flex-shrink: 0;">🗖</button>
                </div>
                
                <div id="aiPanelContent" style="flex: 1; overflow-y: auto; padding: 12px; background: #f8f9fa;">
                    <div style="margin-bottom: 10px;">
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 5px; font-size: 11px; font-weight: 600; color: #333;">
                            <span>📎</span><span>已上传文件</span>
                        </div>
                        <div id="aiFileList" style="min-height: 30px; background: white; border-radius: 6px; padding: 8px; border: 1px dashed #e0e0e0; font-size: 10px; color: #666;">
                            <div style="text-align: center; padding: 6px;">暂无文件</div>
                        </div>
                        <div style="display: flex; gap: 5px; margin-top: 5px;">
                            <button id="aiUploadLocalBtn" style="flex: 1; padding: 5px; border: 1px solid #667eea; background: white; color: #667eea; border-radius: 4px; font-size: 10px; cursor: pointer;">📁 本地</button>
                            <button id="aiUploadFeishuBtn" style="flex: 1; padding: 5px; border: 1px solid #3370ff; background: white; color: #3370ff; border-radius: 4px; font-size: 10px; cursor: pointer;">📄 飞书</button>
                        </div>
                        <input type="file" id="aiFileInput" style="display: none;" accept=".txt,.md,.doc,.docx,.pdf,.json">
                    </div>
                    
                    <div style="margin-bottom: 10px;">
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 5px; font-size: 11px; font-weight: 600; color: #333;">
                            <span>💡</span><span>智能建议</span>
                        </div>
                        <div id="aiSuggestionBox" style="background: white; border-radius: 6px; padding: 10px; border: 1px solid #e0e0e0; font-size: 11px;">
                            <div style="text-align: center; padding: 12px; color: #999;">
                                <div style="font-size: 20px; margin-bottom: 4px;">✨</div>
                                <div>点击字段获取建议</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="flex: 1; display: flex; flex-direction: column;">
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 5px; font-size: 11px; font-weight: 600; color: #333;">
                            <span>💬</span><span>问答对话</span>
                        </div>
                        <div id="aiChatBox" style="flex: 1; background: white; border-radius: 6px; padding: 8px; border: 1px solid #e0e0e0; min-height: 100px; overflow-y: auto; margin-bottom: 6px; font-size: 11px;"></div>
                        <div style="display: flex; gap: 5px; align-items: center;">
                            <button id="aiSendBtn" style="width: 32px; height: 32px; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; cursor: pointer; font-size: 14px; flex-shrink: 0;">📤</button>
                            <input type="text" id="aiChatInput" placeholder="输入问题..." style="flex: 1; padding: 6px 10px; border: 1px solid #e0e0e0; border-radius: 16px; font-size: 11px; outline: none;">
                        </div>
                    </div>
                </div>
                
                <div style="padding: 8px 12px; background: white; border-top: 1px solid #e0e0e0; display: flex; gap: 5px; flex-shrink: 0;">
                    <button id="aiHelpBtn" style="flex: 1; padding: 5px; border: 1px solid #e0e0e0; background: white; border-radius: 5px; font-size: 10px; cursor: pointer;">❓ 帮助</button>
                    <button id="aiHistoryBtn" style="flex: 1; padding: 5px; border: 1px solid #e0e0e0; background: white; border-radius: 5px; font-size: 10px; cursor: pointer;">📚 示例</button>
                </div>
            `;
            
            document.body.appendChild(panel);
            this.panelElement = panel;
            console.log('✅ AI 助手面板已创建');
        }
        
        // 绑定事件
        bindEvents() {
            // 展开按钮
            document.getElementById('aiExpandBtn').addEventListener('click', () => {
                this.expandPanel();
            });
            
            // 收起按钮
            document.getElementById('aiCollapseBtn').addEventListener('click', () => {
                this.collapsePanel();
            });
            
            // 发送按钮
            document.getElementById('aiSendBtn').addEventListener('click', () => {
                this.sendChatMessage();
            });
            
            // 回车发送
            const chatInput = document.getElementById('aiChatInput');
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendChatMessage();
                }
            });
            
            // 帮助按钮
            document.getElementById('aiHelpBtn').addEventListener('click', () => this.showHelp());
            
            // 历史按钮
            document.getElementById('aiHistoryBtn').addEventListener('click', () => this.showHistory());
            
            // 上传按钮
            document.getElementById('aiUploadLocalBtn').addEventListener('click', () => {
                document.getElementById('aiFileInput').click();
            });
            
            document.getElementById('aiUploadFeishuBtn').addEventListener('click', () => {
                this.showFeishuUploadDialog();
            });
            
            document.getElementById('aiFileInput').addEventListener('change', (e) => {
                this.handleFileSelect(e);
            });
            
            // 字段聚焦
            document.querySelectorAll('input, textarea, select').forEach(field => {
                field.addEventListener('focus', () => {
                    this.currentField = field;
                    this.showFieldSuggestion(field);
                });
            });
            
            console.log('✅ 事件已绑定');
        }
        
        // 收起面板
        collapsePanel() {
            const content = document.getElementById('aiPanelContent');
            const headerText = document.getElementById('aiHeaderText');
            const collapseBtn = document.getElementById('aiCollapseBtn');
            const expandBtn = document.getElementById('aiExpandBtn');
            const panel = document.getElementById('aiAssistantV4Panel');
            
            content.style.display = 'none';
            headerText.style.display = 'none';
            collapseBtn.style.display = 'none';
            expandBtn.style.display = 'block';
            panel.style.width = '50px';
            
            this.isCollapsed = true;
            console.log('📌 面板已收起');
        }
        
        // 展开面板
        expandPanel() {
            const content = document.getElementById('aiPanelContent');
            const headerText = document.getElementById('aiHeaderText');
            const collapseBtn = document.getElementById('aiCollapseBtn');
            const expandBtn = document.getElementById('aiExpandBtn');
            const panel = document.getElementById('aiAssistantV4Panel');
            
            content.style.display = 'block';
            headerText.style.display = 'block';
            collapseBtn.style.display = 'block';
            expandBtn.style.display = 'none';
            panel.style.width = '380px';
            
            this.isCollapsed = false;
            console.log('📌 面板已展开');
        }
        
        // 添加顶部按钮
        addTopButtons() {
            // 查找页面右上角的"暂存/生成文档"按钮
            const topRightContainer = document.querySelector('.header-actions') || 
                                     document.querySelector('.top-right') ||
                                     document.querySelector('header') ||
                                     document.querySelector('.form-header');
            
            if (topRightContainer) {
                const buttonContainer = document.createElement('div');
                buttonContainer.style.cssText = `
                    display: flex;
                    gap: 10px;
                    margin-left: auto;
                `;
                
                buttonContainer.innerHTML = `
                    <button id="saveDraftTopBtn" style="padding: 10px 18px; border: 2px solid #667eea; background: white; color: #667eea; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        💾 保存草稿
                    </button>
                    <button id="submitDocTopBtn" style="padding: 10px 18px; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        📤 提交文档
                    </button>
                    <button id="docManageTopBtn" style="padding: 10px 18px; border: 1px solid #e0e0e0; background: white; color: #333; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        📁 文档管理
                    </button>
                `;
                
                topRightContainer.appendChild(buttonContainer);
                
                // 绑定事件
                document.getElementById('saveDraftTopBtn').addEventListener('click', () => this.saveDraft());
                document.getElementById('submitDocTopBtn').addEventListener('click', () => this.submitDocument());
                document.getElementById('docManageTopBtn').addEventListener('click', () => this.openDocManager());
                
                console.log('✅ 顶部按钮已添加');
            } else {
                // 如果找不到容器，创建固定定位的按钮
                this.createFixedButtons();
            }
        }
        
        // 创建固定按钮（备用方案）
        createFixedButtons() {
            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                display: flex;
                gap: 10px;
                z-index: 9998;
                background: white;
                padding: 10px 16px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                border: 1px solid #e0e0e0;
            `;
            
            buttonContainer.innerHTML = `
                <button id="saveDraftTopBtn" style="padding: 8px 16px; border: 2px solid #667eea; background: white; color: #667eea; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">💾 保存草稿</button>
                <button id="submitDocTopBtn" style="padding: 8px 16px; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">📤 提交文档</button>
                <button id="docManageTopBtn" style="padding: 8px 16px; border: 1px solid #e0e0e0; background: white; color: #333; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">📁 文档管理</button>
            `;
            
            document.body.appendChild(buttonContainer);
            
            document.getElementById('saveDraftTopBtn').addEventListener('click', () => this.saveDraft());
            document.getElementById('submitDocTopBtn').addEventListener('click', () => this.submitDocument());
            document.getElementById('docManageTopBtn').addEventListener('click', () => this.openDocManager());
            
            console.log('✅ 固定按钮已创建');
        }
        
        // 保存草稿
        saveDraft() {
            const formData = {};
            document.querySelectorAll('input, textarea, select').forEach(field => {
                const id = field.id || field.name;
                if (id) formData[id] = field.value;
            });
            
            const projectName = formData.projectName || '未命名项目';
            const timestamp = new Date().toISOString();
            localStorage.setItem(`draft_${timestamp}`, JSON.stringify({
                projectName, formData, uploadedFiles: this.uploadedFiles, savedAt: timestamp
            }));
            
            alert(`✅ 草稿已保存！\n项目：${projectName}`);
        }
        
        // 提交文档
        submitDocument() {
            const formData = {};
            document.querySelectorAll('input, textarea, select').forEach(field => {
                const id = field.id || field.name;
                if (id) formData[id] = field.value;
            });
            
            const projectName = formData.projectName || '未命名项目';
            const timestamp = new Date().toISOString();
            localStorage.setItem(`doc_${timestamp}`, JSON.stringify({
                projectName, formData, uploadedFiles: this.uploadedFiles, status: 'submitted', submittedAt: timestamp
            }));
            
            alert(`✅ 文档已提交！\n项目：${projectName}`);
        }
        
        // 文档管理
        openDocManager() {
            const docs = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('doc_') || key.startsWith('draft_')) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        docs.push({ key, name: data.projectName, type: key.startsWith('doc_') ? '已提交' : '草稿', date: data.submittedAt || data.savedAt });
                    } catch (e) {}
                }
            }
            
            let docList = '📁 文档列表：\n\n';
            if (docs.length === 0) docList += '暂无文档\n';
            else docs.forEach((doc, i) => {
                docList += `${i + 1}. ${doc.name} (${doc.type})\n   ${new Date(doc.date).toLocaleString('zh-CN')}\n\n`;
            });
            
            alert(docList);
        }
        
        // 发送消息
        async sendChatMessage() {
            const input = document.getElementById('aiChatInput');
            const message = input.value.trim();
            if (!message) return;
            
            const chatBox = document.getElementById('aiChatBox');
            chatBox.innerHTML += `<div style="margin-top: 6px; padding: 6px 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 6px; font-size: 11px;">${message}</div>`;
            chatBox.scrollTop = chatBox.scrollHeight;
            input.value = '';
            
            chatBox.innerHTML += `<div id="aiThinking" style="margin-top: 6px; padding: 6px 10px; background: #f0f0f0; border-radius: 6px; font-size: 11px;">🤔 思考中...</div>`;
            chatBox.scrollTop = chatBox.scrollHeight;
            
            try {
                const response = await fetch(`${this.apiConfig.baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiConfig.apiKey}` },
                    body: JSON.stringify({
                        model: this.apiConfig.model,
                        messages: [{ role: 'system', content: '你是智能表单助手，帮助填写研发项目文档。' }, { role: 'user', content: message }],
                        temperature: 0.7, max_tokens: 1500
                    })
                });
                
                const data = await response.json();
                const answer = data.choices[0].message.content;
                
                document.getElementById('aiThinking').remove();
                chatBox.innerHTML += `<div style="margin-top: 6px; padding: 6px 10px; background: #e8f5e9; border-radius: 6px; font-size: 11px;"><strong>🤖 AI：</strong><br>${answer.replace(/\n/g, '<br>')}</div>`;
                chatBox.scrollTop = chatBox.scrollHeight;
                
            } catch (error) {
                document.getElementById('aiThinking').remove();
                chatBox.innerHTML += `<div style="margin-top: 6px; padding: 6px 10px; background: #ffebee; border-radius: 6px; font-size: 11px; color: #c62828;">❌ 失败：${error.message}</div>`;
            }
        }
        
        // 文件处理
        handleFileSelect(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.uploadedFiles.push({ name: file.name, type: file.type, size: file.size, content: e.target.result });
                this.updateFileList();
                this.analyzeFile(file.name, e.target.result);
            };
            reader.readAsText(file);
        }
        
        updateFileList() {
            const fileList = document.getElementById('aiFileList');
            if (!fileList) return;
            
            fileList.innerHTML = this.uploadedFiles.length === 0 
                ? '<div style="text-align: center; padding: 6px;">暂无文件</div>'
                : this.uploadedFiles.map(f => `<div style="padding: 5px; background: #f5f5f5; border-radius: 4px; margin-bottom: 4px; font-size: 10px; display: flex; justify-content: space-between;"><span>📄 ${f.name}</span><button onclick="window.aiAssistantV4.removeFile('${f.name}')" style="border:none;background:#ffebee;color:#c62828;border-radius:3px;padding:2px 5px;cursor:pointer;font-size:9px;">×</button></div>`).join('');
        }
        
        removeFile(fileName) {
            this.uploadedFiles = this.uploadedFiles.filter(f => f.name !== fileName);
            this.updateFileList();
        }
        
        async analyzeFile(fileName, content) {
            const chatBox = document.getElementById('aiChatBox');
            chatBox.innerHTML += `<div style="margin-top: 6px; padding: 6px 10px; background: #fff3e0; border-radius: 6px; font-size: 11px;">📎 已上传：${fileName}</div>`;
            chatBox.scrollTop = chatBox.scrollHeight;
        }
        
        showFeishuUploadDialog() {
            const docUrl = prompt('请输入飞书文档链接：');
            if (docUrl) alert('飞书文档功能开发中...');
        }
        
        showFieldSuggestion(field) {
            const fieldName = field.id || field.name || '当前字段';
            const suggestionBox = document.getElementById('aiSuggestionBox');
            if (!suggestionBox) return;
            
            suggestionBox.innerHTML = `<div style="font-size: 11px; color: #333;"><div style="font-weight: 600; margin-bottom: 6px;">💡 ${fieldName}</div><div style="color: #666; line-height: 1.4;">点击填写，AI 提供建议</div></div>`;
        }
        
        showHelp() { alert('❓ 帮助\n\n1. 点击字段获取建议\n2. 输入问题咨询 AI\n3. 上传文档自动分析\n4. 保存草稿/提交文档'); }
        showHistory() { alert('📚 历史项目：\n\n1. IPC 摄像头自动化 (75 万)\n2. GPU 算力平台 (2400 万)\n3. 视觉质检系统 (850 万)'); }
    }
    
    window.aiAssistantV4 = new AIAssistantV4();
    console.log('🤖 AI 助手 v4 加载完成');
})();
