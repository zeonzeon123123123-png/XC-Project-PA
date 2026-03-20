/**
 * AI 助手 - 修复版本
 * 解决重复声明和语法错误问题
 */

(function() {
    'use strict';
    
    console.log('🤖 AI 助手（修复版）初始化中...');
    
    // 避免重复声明
    if (window.AIAssistantFixed && window.AIAssistantFixed.initialized) {
        console.log('✅ AI 助手已初始化，跳过');
        return;
    }
    
    // AI 助手类
    class AIAssistant {
        constructor() {
            this.initialized = false;
            this.apiConfig = null;
            this.panelElement = null;
            this.currentField = null;
            
            this.init();
        }
        
        // 初始化
        async init() {
            console.log('🔧 正在初始化 AI 助手...');
            
            // 1. 加载 API 配置
            await this.loadAPIConfig();
            
            // 2. 创建面板
            this.createPanel();
            
            // 3. 绑定事件
            this.bindEvents();
            
            this.initialized = true;
            console.log('✅ AI 助手初始化完成');
            console.log('📡 API 配置:', this.apiConfig ? '已加载' : '未加载');
        }
        
        // 加载 API 配置
        async loadAPIConfig() {
            try {
                // 尝试从 OpenClaw 配置加载
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
                        
                        console.log('✅ 已从 OpenClaw 加载 API 配置');
                        console.log('📡 Base URL:', this.apiConfig.baseUrl);
                        console.log('🤖 模型:', this.apiConfig.model);
                        console.log('🔑 Key:', this.apiConfig.apiKey.substring(0, 15) + '...');
                        
                        return true;
                    }
                }
                
                console.warn('⚠️ 未找到 OpenClaw 配置');
                return false;
                
            } catch (error) {
                console.error('❌ 加载 API 配置失败:', error);
                return false;
            }
        }
        
        // 创建面板
        createPanel() {
            console.log('🔨 创建 AI 助手面板...');
            
            const panel = document.createElement('div');
            panel.id = 'aiAssistantFixedPanel';
            panel.style.cssText = `
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
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            
            panel.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">🤖</div>
                        <div>
                            <div style="font-size: 16px; font-weight: 600;">AI 智能助手</div>
                            <div style="font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 6px;">
                                <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block;"></span>
                                <span id="aiStatusText">${this.apiConfig ? '在线 (' + this.apiConfig.model + ')' : '在线 - 未配置 API'}</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="document.getElementById('aiAssistantFixedPanel').style.maxHeight = document.getElementById('aiAssistantFixedPanel').style.maxHeight === '60px' ? '600px' : '60px'" style="width: 28px; height: 28px; border-radius: 6px; border: none; background: rgba(255,255,255,0.2); color: white; cursor: pointer; font-size: 18px;">−</button>
                        <button onclick="document.getElementById('aiAssistantFixedPanel').style.display='none'" style="width: 28px; height: 28px; border-radius: 6px; border: none; background: rgba(255,255,255,0.2); color: white; cursor: pointer; font-size: 18px;">×</button>
                    </div>
                </div>
                
                <div style="flex: 1; overflow-y: auto; padding: 16px; background: #f8f9fa;">
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #333;">
                            <span>💡</span>
                            <span>智能建议</span>
                        </div>
                        <div id="aiSuggestionBox" style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e0e0e0;">
                            <div style="text-align: center; padding: 20px; color: #999;">
                                <div style="font-size: 32px; margin-bottom: 8px;">✨</div>
                                <div>点击表单字段获取智能建议</div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #333;">
                            <span>💬</span>
                            <span>问答对话</span>
                        </div>
                        <div id="aiChatBox" style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e0e0e0; min-height: 150px; max-height: 250px; overflow-y: auto;">
                            <div style="margin-bottom: 12px; padding: 10px 14px; background: #f0f0f0; border-radius: 12px; font-size: 13px; line-height: 1.5;">
                                你好！我是你的智能表单助手。我可以：
                                <ul style="margin: 8px 0 8px 20px;">
                                    <li>提供填写建议（基于历史项目数据）</li>
                                    <li>回答填写过程中的问题</li>
                                    <li>联网搜索行业信息</li>
                                </ul>
                                有什么可以帮你的吗？
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px; margin-top: 12px;">
                            <input type="text" id="aiChatInput" placeholder="输入问题，按 Enter 发送..." style="flex: 1; padding: 10px 14px; border: 1px solid #e0e0e0; border-radius: 20px; font-size: 13px; outline: none;">
                            <button onclick="window.sendAIChat()" style="width: 40px; height: 40px; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; cursor: pointer; font-size: 18px;">📤</button>
                        </div>
                    </div>
                </div>
                
                <div style="padding: 12px 16px; background: white; border-top: 1px solid #e0e0e0; display: flex; gap: 8px;">
                    <button onclick="window.showAIHelp()" style="flex: 1; padding: 8px; border: 1px solid #e0e0e0; background: white; border-radius: 8px; font-size: 12px; cursor: pointer;">❓ 帮助</button>
                    <button onclick="window.showAIHistory()" style="flex: 1; padding: 8px; border: 1px solid #e0e0e0; background: white; border-radius: 8px; font-size: 12px; cursor: pointer;">📚 历史示例</button>
                </div>
            `;
            
            document.body.appendChild(panel);
            this.panelElement = panel;
            console.log('✅ AI 助手面板已创建');
        }
        
        // 绑定事件
        bindEvents() {
            // 字段聚焦事件
            document.querySelectorAll('input, textarea, select').forEach(field => {
                field.addEventListener('focus', () => {
                    this.currentField = field;
                    this.showFieldSuggestion(field);
                });
            });
            
            // 聊天输入回车发送
            const chatInput = document.getElementById('aiChatInput');
            if (chatInput) {
                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        window.sendAIChat();
                    }
                });
            }
            
            console.log('✅ 事件已绑定');
        }
        
        // 显示字段建议
        showFieldSuggestion(field) {
            const fieldName = field.id || field.name || '当前字段';
            const suggestionBox = document.getElementById('aiSuggestionBox');
            
            if (!suggestionBox) return;
            
            console.log('💡 字段聚焦:', fieldName);
            
            // 更新状态
            const statusText = document.getElementById('aiStatusText');
            if (statusText) {
                statusText.textContent = this.apiConfig ? '在线 (' + this.apiConfig.model + ')' : '在线 - 未配置 API';
            }
            
            // 显示建议
            suggestionBox.innerHTML = `
                <div style="font-size: 14px; color: #333;">
                    <div style="font-weight: 600; margin-bottom: 12px;">💡 ${fieldName} 填写建议</div>
                    <div style="color: #666; line-height: 1.6;">
                        请点击表单字段进行填写。<br>
                        ${this.apiConfig ? 'AI 助手已就绪，可以回答你的问题。' : '⚠️ 请先配置 API 密钥以获得智能建议。'}
                    </div>
                </div>
            `;
        }
    }
    
    // 全局函数
    window.sendAIChat = function() {
        const input = document.getElementById('aiChatInput');
        const message = input.value.trim();
        if (!message) return;
        
        console.log('💬 用户提问:', message);
        
        // 添加到聊天框
        const chatBox = document.getElementById('aiChatBox');
        if (chatBox) {
            chatBox.innerHTML += `
                <div style="margin-top: 12px; padding: 10px 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; font-size: 13px; line-height: 1.5;">
                    ${message}
                </div>
            `;
            chatBox.scrollTop = chatBox.scrollHeight;
        }
        
        input.value = '';
        
        // 显示 AI 回复（简化版）
        setTimeout(() => {
            if (chatBox) {
                chatBox.innerHTML += `
                    <div style="margin-top: 12px; padding: 10px 14px; background: #f0f0f0; border-radius: 12px; font-size: 13px; line-height: 1.5;">
                        收到你的问题："${message}"<br><br>
                        ${window.aiAssistantFixed && window.aiAssistantFixed.apiConfig 
                            ? '正在调用 AI 模型回答...' 
                            : '⚠️ 请先配置 API 密钥以获得智能回答。'}
                    </div>
                `;
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        }, 500);
    };
    
    window.showAIHelp = function() {
        alert('❓ 快速帮助\n\n我可以帮你：\n\n1. 📝 提供表单填写建议\n   - 点击表单字段获取实时建议\n   - 基于历史项目数据分析\n\n2. 💬 回答填写问题\n   - 在下方输入框提问\n   - 我会结合历史数据和联网搜索回答\n\n3. 📚 查看历史示例\n   - 点击"历史示例"按钮\n   - 参考过往项目的填写方式');
    };
    
    window.showAIHistory = function() {
        alert('📚 历史项目示例：\n\n1. IPC 摄像头自动化生产线 (SR1202500015)\n   预算：75 万元 | 周期：12 个月\n\n2. 基于 AI 高性能 GPU 算力集群的管理开发平台 (SR1202500001)\n   预算：2400 万元 | 周期：12 个月\n\n3. 智能工厂视觉质检系统 (SR1202600025)\n   预算：850 万元 | 周期：10 个月');
    };
    
    // 初始化
    window.aiAssistantFixed = new AIAssistant();
    
    console.log('🤖 AI 助手（修复版）加载完成');
})();
