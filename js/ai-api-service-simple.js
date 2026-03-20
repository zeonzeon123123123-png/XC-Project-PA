/**
 * AI API Service - 集成 OpenClaw 配置
 * 自动读取 OpenClaw 的 API 配置并调用模型
 */

class AIAPIService {
    constructor() {
        this.config = {
            model: 'glm-5-fp8',
            baseUrl: '',
            apiKey: '',
            webSearch: {
                enabled: false
            }
        };
        
        this.initialized = false;
        console.log('🔑 AI API Service 启动中...');
    }
    
    // 初始化（从 OpenClaw 配置加载）
    async init() {
        if (this.initialized) {
            return true;
        }
        
        try {
            // 从 OpenClaw 配置加载
            if (typeof openClawConfig !== 'undefined') {
                const proxyConfig = await openClawConfig.getProxyConfig();
                
                if (proxyConfig && proxyConfig.apiKey) {
                    this.config.baseUrl = proxyConfig.baseUrl;
                    this.config.apiKey = proxyConfig.apiKey;
                    
                    // 使用代理平台的模型（优先使用 qwen-plus）
                    if (proxyConfig.models && proxyConfig.models.length > 0) {
                        // 查找 qwen 相关模型
                        const qwenModel = proxyConfig.models.find(m => m.id.includes('qwen'));
                        this.config.model = qwenModel ? qwenModel.id : proxyConfig.models[0].id;
                    } else {
                        // 默认使用 qwen-plus
                        this.config.model = 'qwen-plus';
                    }
                    
                    this.initialized = true;
                    console.log('✅ AI API Service 已初始化');
                    console.log(`📡 API: ${this.config.baseUrl}`);
                    console.log(`🤖 模型：${this.config.model}`);
                    console.log(`🔑 Key: ${this.config.apiKey.substring(0, 15)}...`);
                    
                    return true;
                }
            }
            
            console.warn('⚠️ 未找到 OpenClaw 配置，尝试使用备用配置');
            
            // 备用配置：直接使用 OpenClaw 中的 glm 配置
            const glmConfig = await openClawConfig.getGLMConfig();
            if (glmConfig && glmConfig.apiKey) {
                this.config.baseUrl = glmConfig.baseUrl;
                this.config.apiKey = glmConfig.apiKey;
                this.config.model = 'glm-4-flash';
                
                this.initialized = true;
                console.log('✅ AI API Service 已初始化（使用 GLM 配置）');
                console.log(`📡 API: ${this.config.baseUrl}`);
                console.log(`🤖 模型：${this.config.model}`);
                
                return true;
            }
            
            console.error('❌ 未找到任何有效的 API 配置');
            return false;
            
        } catch (error) {
            console.error('❌ 初始化失败:', error);
            return false;
        }
    }
    
    // 获取配置状态
    getStatus() {
        return {
            initialized: this.initialized,
            model: this.config.model,
            baseUrl: this.config.baseUrl,
            apiKeySet: !!this.config.apiKey
        };
    }
    
    // 调用 AI 模型
    async chat(message, context = {}) {
        // 确保已初始化
        if (!this.initialized) {
            await this.init();
        }
        
        if (!this.config.apiKey) {
            return {
                success: false,
                error: '未配置 API 密钥',
                answer: '⚠️ 请先配置 API 密钥。系统会自动从 OpenClaw 读取配置。'
            };
        }
        
        try {
            // 构建消息
            const messages = [
                {
                    role: 'system',
                    content: `你是一个智能表单助手，帮助用户填写研发项目文档。

要求：
1. 回答专业、准确、有帮助
2. 结合历史项目数据提供建议
3. 格式清晰，使用 Markdown
4. 中文回答`
                },
                {
                    role: 'user',
                    content: this.buildPrompt(message, context)
                }
            ];
            
            // 调用 API
            const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                },
                body: JSON.stringify({
                    model: this.config.model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `API 错误：${response.status}`);
            }
            
            const data = await response.json();
            const answer = data.choices[0].message.content;
            
            return {
                success: true,
                answer: answer,
                model: this.config.model,
                usage: data.usage
            };
            
        } catch (error) {
            console.error('❌ AI 调用失败:', error);
            return {
                success: false,
                error: error.message,
                answer: `AI 调用失败：${error.message}\n\n请检查：\n1. API 密钥是否有效\n2. 网络连接是否正常\n3. 模型是否可用`
            };
        }
    }
    
    // 构建提示词
    buildPrompt(message, context) {
        let prompt = '';
        
        // 添加上下文
        if (context.formData) {
            const data = context.formData;
            if (data.projectName) prompt += `项目名称：${data.projectName}\n`;
            if (data.projectType) prompt += `项目类型：${data.projectType}\n`;
            if (data.budget) prompt += `预算：${data.budget}元\n`;
            if (data.duration) prompt += `周期：${data.duration}个月\n`;
            prompt += '\n';
        }
        
        // 添加历史项目参考
        if (context.historyData && context.historyData.projects) {
            const related = this.searchHistory(message, context.historyData);
            if (related.length > 0) {
                prompt += '相关历史项目：\n';
                related.forEach(p => {
                    prompt += `- ${p.name}: 预算${p.budget/10000}万，周期${p.duration}月\n`;
                });
                prompt += '\n';
            }
        }
        
        // 添加问题
        prompt += `用户问题：${message}`;
        
        return prompt;
    }
    
    // 检索历史项目
    searchHistory(question, historyData) {
        if (!historyData || !historyData.projects) return [];
        
        const keywords = question.toLowerCase().split(/[\s,，？?]+/).filter(k => k.length > 1);
        
        const scores = historyData.projects.map(project => {
            let score = 0;
            const searchText = JSON.stringify(project).toLowerCase();
            
            keywords.forEach(keyword => {
                if (searchText.includes(keyword)) score++;
            });
            
            return { project, score };
        });
        
        return scores
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(s => s.project)
            .slice(0, 3);
    }
    
    // 综合搜索（历史+AI+ 联网）
    async comprehensiveSearch(question, context = {}) {
        const results = {
            history: [],
            web: [],
            answer: ''
        };
        
        // 1. 检索历史
        if (context.historyData) {
            results.history = this.searchHistory(question, context.historyData);
        }
        
        // 2. AI 回答
        const aiResponse = await this.chat(question, context);
        if (aiResponse.success) {
            results.answer = aiResponse.answer;
        }
        
        // 3. 联网搜索（暂不启用）
        // if (context.needsWebSearch) {
        //     results.web = await this.webSearch(question);
        // }
        
        return results;
    }
}

// 导出全局实例
let aiAPIService;
if (typeof window !== 'undefined') {
    window.AIAPIService = AIAPIService;
}
