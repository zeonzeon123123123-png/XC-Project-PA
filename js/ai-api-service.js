/**
 * AI API Service - AI API 服务
 * 提供真实的模型调用和联网搜索功能
 */

class AIAPIService {
    constructor(config = {}) {
        // 配置 API 密钥（从环境变量或配置加载）
        this.config = {
            // 模型配置（使用用户配置的模型）
            model: config.model || 'qwen-plus',
            baseUrl: config.baseUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            apiKey: config.apiKey || '', // 需要从配置中读取
            
            // 联网搜索配置
            webSearch: {
                enabled: config.webSearch !== false,
                provider: config.searchProvider || 'brave', // brave, bing, google
                apiKey: config.searchApiKey || ''
            },
            
            ...config
        };
        
        this.apiKeys = this.loadAPIKeys();
        console.log('🔑 AI API Service 已初始化');
    }
    
    // 加载 API 密钥
    loadAPIKeys() {
        // 尝试从多个来源加载 API 密钥
        const keys = {
            qwen: '',
            glm: '',
            openai: '',
            search: ''
        };
        
        try {
            // 1. 尝试从 localStorage 读取
            const savedKeys = localStorage.getItem('api_keys');
            if (savedKeys) {
                const parsed = JSON.parse(savedKeys);
                Object.assign(keys, parsed);
            }
            
            // 2. 尝试从配置文件读取（如果有）
            // 注意：实际项目中不应该在前端代码中硬编码 API 密钥
            // 这里只是为了演示
            
        } catch (e) {
            console.warn('⚠️ 无法加载 API 密钥:', e);
        }
        
        return keys;
    }
    
    // 调用 AI 模型生成回答
    async chat(message, context = {}) {
        const apiKey = this.apiKeys.qwen || this.config.apiKey;
        
        if (!apiKey) {
            return {
                success: false,
                error: '未配置 API 密钥',
                message: '请先在设置中配置 API 密钥'
            };
        }
        
        try {
            // 构建消息
            const messages = [
                {
                    role: 'system',
                    content: `你是一个智能表单助手，帮助用户填写研发项目文档。
                    
你可以：
1. 结合历史项目数据提供建议
2. 联网搜索行业最佳实践
3. 回答用户的问题

请提供专业、准确、有帮助的回答。`
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
                    'Authorization': `Bearer ${apiKey}`
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
                throw new Error(error.message || 'API 调用失败');
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
            console.error('❌ AI 模型调用失败:', error);
            return {
                success: false,
                error: error.message,
                message: 'AI 模型调用失败，请稍后重试'
            };
        }
    }
    
    // 构建提示词
    buildPrompt(message, context) {
        let prompt = '';
        
        // 添加上下文信息
        if (context.projectName) {
            prompt += `当前项目名称：${context.projectName}\n`;
        }
        if (context.projectType) {
            prompt += `项目类型：${context.projectType}\n`;
        }
        if (context.budget) {
            prompt += `预算：${context.budget}元\n`;
        }
        if (context.duration) {
            prompt += `周期：${context.duration}个月\n`;
        }
        
        // 添加历史项目参考
        if (context.historyProjects && context.historyProjects.length > 0) {
            prompt += '\n相关历史项目：\n';
            context.historyProjects.forEach(p => {
                prompt += `- ${p.name} (${p.id}): 预算${p.budget/10000}万元，周期${p.duration}个月\n`;
            });
        }
        
        // 添加用户问题
        prompt += `\n用户问题：${message}`;
        
        // 添加搜索要求
        if (context.needsWebSearch) {
            prompt += '\n\n请结合最新行业实践和标准回答这个问题。如果需要，可以建议用户进行联网搜索获取更多信息。';
        }
        
        return prompt;
    }
    
    // 联网搜索
    async webSearch(query, options = {}) {
        const searchConfig = this.config.webSearch;
        
        if (!searchConfig.enabled) {
            return {
                success: false,
                error: '联网搜索未启用'
            };
        }
        
        try {
            // 根据不同的搜索提供商调用 API
            switch (searchConfig.provider) {
                case 'brave':
                    return await this.braveSearch(query, options);
                case 'bing':
                    return await this.bingSearch(query, options);
                case 'google':
                    return await this.googleSearch(query, options);
                default:
                    // 默认使用 Brave Search
                    return await this.braveSearch(query, options);
            }
        } catch (error) {
            console.error('❌ 联网搜索失败:', error);
            return {
                success: false,
                error: error.message,
                results: []
            };
        }
    }
    
    // Brave Search API
    async braveSearch(query, options = {}) {
        const apiKey = this.apiKeys.search || this.config.webSearch.apiKey;
        
        if (!apiKey) {
            // 如果没有 API 密钥，返回错误
            return {
                success: false,
                error: '未配置搜索 API 密钥',
                message: '请在设置中配置 Brave Search API 密钥'
            };
        }
        
        const params = new URLSearchParams({
            q: query,
            count: options.count || 5,
            safe: 'moderate'
        });
        
        const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
            headers: {
                'Accept': 'application/json',
                'X-Subscription-Token': apiKey
            }
        });
        
        if (!response.ok) {
            throw new Error('Brave Search API 调用失败');
        }
        
        const data = await response.json();
        
        return {
            success: true,
            provider: 'brave',
            query: query,
            results: data.web.results.map(r => ({
                title: r.title,
                url: r.url,
                description: r.description,
                date: r.age
            })),
            total: data.web.total
        };
    }
    
    // Bing Search API
    async bingSearch(query, options = {}) {
        const apiKey = this.apiKeys.search || this.config.webSearch.apiKey;
        
        if (!apiKey) {
            return {
                success: false,
                error: '未配置 Bing Search API 密钥'
            };
        }
        
        const params = new URLSearchParams({
            q: query,
            count: options.count || 5,
            mkt: 'zh-CN'
        });
        
        const response = await fetch(`https://api.bing.microsoft.com/v7.0/search?${params}`, {
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey
            }
        });
        
        if (!response.ok) {
            throw new Error('Bing Search API 调用失败');
        }
        
        const data = await response.json();
        
        return {
            success: true,
            provider: 'bing',
            query: query,
            results: data.webPages.value.map(r => ({
                title: r.name,
                url: r.url,
                description: r.snippet,
                date: r.datePublished
            })),
            total: data.webPages.totalEstimatedMatches
        };
    }
    
    // Google Custom Search API
    async googleSearch(query, options = {}) {
        const apiKey = this.apiKeys.search || this.config.webSearch.apiKey;
        const cx = this.config.webSearch.googleCX;
        
        if (!apiKey || !cx) {
            return {
                success: false,
                error: '未配置 Google Search API 密钥或 CX'
            };
        }
        
        const params = new URLSearchParams({
            q: query,
            key: apiKey,
            cx: cx,
            num: options.count || 5
        });
        
        const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`);
        
        if (!response.ok) {
            throw new Error('Google Search API 调用失败');
        }
        
        const data = await response.json();
        
        return {
            success: true,
            provider: 'google',
            query: query,
            results: data.items.map(r => ({
                title: r.title,
                url: r.link,
                description: r.snippet
            })),
            total: data.searchInformation.totalResults
        };
    }
    
    // 综合搜索（先历史数据，后联网）
    async comprehensiveSearch(question, context = {}) {
        const results = {
            history: [],
            web: [],
            answer: ''
        };
        
        // 1. 检索历史项目
        if (context.historyData) {
            results.history = this.searchHistory(question, context.historyData);
        }
        
        // 2. 判断是否需要联网搜索
        const needsWebSearch = this.shouldSearchWeb(question);
        
        if (needsWebSearch) {
            // 3. 联网搜索
            const webResults = await this.webSearch(question, { count: 5 });
            if (webResults.success) {
                results.web = webResults.results;
            }
        }
        
        // 4. 调用 AI 生成综合回答
        const aiResponse = await this.chat(question, {
            ...context,
            historyProjects: results.history,
            webResults: results.web,
            needsWebSearch: needsWebSearch
        });
        
        if (aiResponse.success) {
            results.answer = aiResponse.answer;
        }
        
        return results;
    }
    
    // 检索历史项目（简化版）
    searchHistory(question, historyData) {
        if (!historyData || !historyData.projects) return [];
        
        const keywords = question.toLowerCase().split(/[\s,，？?]+/).filter(k => k.length > 1);
        
        const scores = historyData.projects.map(project => {
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
            .map(s => s.project)
            .slice(0, 5);
    }
    
    // 判断是否需要联网搜索
    shouldSearchWeb(question) {
        const webKeywords = [
            '最新', '当前', '2024', '2025', '2026', '2027',
            '行业标准', '国家标准', '规范', '标准',
            '市场', '趋势', '竞品', '竞争对手',
            '最佳实践', '行业实践',
            '如何', '怎么', '什么', '哪些',
            '技术路线', '技术方案',
            '政策', '法规', '合规'
        ];
        
        return webKeywords.some(kw => question.toLowerCase().includes(kw));
    }
    
    // 格式化搜索结果
    formatSearchResults(results) {
        let formatted = '';
        
        if (results.history && results.history.length > 0) {
            formatted += '📚 历史项目参考：\n\n';
            results.history.forEach((project, i) => {
                formatted += `${i + 1}. **${project.name}** (${project.id})\n`;
                if (project.budget) {
                    formatted += `   预算：${project.budget / 10000}万元 | 周期：${project.duration}个月\n`;
                }
                if (project.techGoal) {
                    formatted += `   技术目标：${project.techGoal.substring(0, 100)}...\n`;
                }
                formatted += '\n';
            });
        }
        
        if (results.web && results.web.length > 0) {
            formatted += '\n🔍 联网搜索结果：\n\n';
            results.web.forEach((result, i) => {
                formatted += `${i + 1}. [${result.title}](${result.url})\n`;
                if (result.description) {
                    formatted += `   ${result.description}\n`;
                }
                if (result.date) {
                    formatted += `   发布时间：${result.date}\n`;
                }
                formatted += '\n';
            });
        }
        
        return formatted;
    }
}

// 导出全局实例
let aiAPIService;
if (typeof window !== 'undefined') {
    window.AIAPIService = AIAPIService;
}
