/**
 * AI 助手面板 - 简化版本
 * 确保面板能正常显示
 */

(function() {
    console.log('🤖 AI 助手面板初始化中...');
    
    // 创建 AI 助手面板
    function createPanel() {
        // 检查是否已存在
        if (document.getElementById('simpleAIAssistant')) {
            console.log('✅ AI 助手面板已存在');
            return;
        }
        
        console.log('🔨 创建 AI 助手面板...');
        
        const panel = document.createElement('div');
        panel.id = 'simpleAIAssistant';
        panel.innerHTML = `
            <div style="position: fixed; right: 20px; bottom: 20px; width: 380px; max-height: 550px; background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); border: 1px solid #e0e0e0; z-index: 9999; display: flex; flex-direction: column; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <!-- 头部 -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">🤖</div>
                        <div>
                            <div style="font-size: 16px; font-weight: 600;">AI 智能助手</div>
                            <div style="font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 6px;">
                                <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block; animation: pulse 2s infinite;"></span>
                                <span id="aiStatusText">在线</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="document.getElementById('simpleAIAssistant').querySelector('div[style*=\\'max-height\\']').style.maxHeight = document.getElementById('simpleAIAssistant').querySelector('div[style*=\\'max-height\\']').style.maxHeight === '60px' ? '550px' : '60px'" style="width: 28px; height: 28px; border-radius: 6px; border: none; background: rgba(255,255,255,0.2); color: white; cursor: pointer; font-size: 18px;">−</button>
                        <button onclick="document.getElementById('simpleAIAssistant').style.display='none'" style="width: 28px; height: 28px; border-radius: 6px; border: none; background: rgba(255,255,255,0.2); color: white; cursor: pointer; font-size: 18px;">×</button>
                    </div>
                </div>
                
                <!-- 内容区域 -->
                <div style="flex: 1; overflow-y: auto; padding: 16px; background: #f8f9fa;">
                    <!-- 智能建议 -->
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #333;">
                            <span>💡</span>
                            <span>智能建议</span>
                        </div>
                        <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e0e0e0;">
                            <div style="text-align: center; padding: 20px; color: #999;">
                                <div style="font-size: 32px; margin-bottom: 8px;">✨</div>
                                <div>点击表单字段获取智能建议</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 问答对话 -->
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 600; color: #333;">
                            <span>💬</span>
                            <span>问答对话</span>
                        </div>
                        <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e0e0e0; min-height: 200px;">
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
                            <button onclick="sendChatMessage()" style="width: 40px; height: 40px; border: none; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 50%; cursor: pointer; font-size: 18px;">📤</button>
                        </div>
                    </div>
                </div>
                
                <!-- 底部快捷操作 -->
                <div style="padding: 12px 16px; background: white; border-top: 1px solid #e0e0e0; display: flex; gap: 8px;">
                    <button onclick="showQuickHelp()" style="flex: 1; padding: 8px; border: 1px solid #e0e0e0; background: white; border-radius: 8px; font-size: 12px; cursor: pointer;">❓ 帮助</button>
                    <button onclick="showHistoryExamples()" style="flex: 1; padding: 8px; border: 1px solid #e0e0e0; background: white; border-radius: 8px; font-size: 12px; cursor: pointer;">📚 历史示例</button>
                </div>
            </div>
            
            <style>
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            </style>
        `;
        
        document.body.appendChild(panel);
        console.log('✅ AI 助手面板已创建');
        
        // 绑定字段事件
        bindFieldEvents();
        
        // 绑定聊天功能
        window.sendChatMessage = function() {
            const input = document.getElementById('aiChatInput');
            const message = input.value.trim();
            if (!message) return;
            
            console.log('用户提问:', message);
            alert('AI 问答功能需要配置 API 密钥。\n\n问题：' + message + '\n\n请查看控制台日志获取配置信息。');
            input.value = '';
        };
        
        window.showQuickHelp = function() {
            alert('❓ 快速帮助\n\n我可以帮你：\n\n1. 📝 提供表单填写建议\n   - 点击表单字段获取实时建议\n   - 基于历史项目数据分析\n\n2. 💬 回答填写问题\n   - 在下方输入框提问\n   - 我会结合历史数据和联网搜索回答\n\n3. 📚 查看历史示例\n   - 点击"历史示例"按钮\n   - 参考过往项目的填写方式');
        };
        
        window.showHistoryExamples = function() {
            alert('📚 历史项目示例：\n\n1. IPC 摄像头自动化生产线 (SR1202500015)\n   类型：智能硬件\n   预算：75 万元 | 周期：12 个月\n\n2. 基于摄像机的爬宠类 AI 算法大模型应用技术的开发 (SR1202500008)\n   类型：AI 算法\n   预算：353.6 万元 | 周期：6 个月\n\n3. 基于 AI 高性能 GPU 算力集群的管理开发平台 (SR1202500001)\n   类型：云平台\n   预算：2400 万元 | 周期：12 个月\n\n点击表单字段时，我会自动推荐相关项目的填写方式。');
        };
    }
    
    // 绑定字段事件
    function bindFieldEvents() {
        document.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('focus', function() {
                console.log('字段聚焦:', this.id || this.name || this.type);
                
                // 更新状态文本
                const statusText = document.getElementById('aiStatusText');
                if (statusText) {
                    statusText.textContent = '在线 - 已就绪';
                }
                
                // 显示建议提示
                const fieldName = this.id || this.name || '当前字段';
                console.log(`💡 用户正在编辑：${fieldName}`);
            });
        });
    }
    
    // 页面加载时创建面板
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createPanel);
    } else {
        createPanel();
    }
    
    console.log('🤖 AI 助手面板脚本加载完成');
})();
