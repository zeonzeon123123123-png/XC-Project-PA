/**
 * OpenClaw 配置加载器
 * 从 OpenClaw 主配置读取 API 密钥和模型配置
 */

class OpenClawConfigLoader {
    constructor() {
        this.config = null;
        this.configUrl = '../../openclaw.json';
    }
    
    // 加载 OpenClaw 配置
    async load() {
        if (this.config) {
            return this.config;
        }
        
        try {
            // 尝试从多个路径加载配置
            const paths = [
                '../../openclaw.json',
                '../../../openclaw.json',
                '../../../../openclaw.json',
                './openclaw.json'
            ];
            
            for (const path of paths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        this.config = await response.json();
                        console.log(`✅ OpenClaw 配置已加载：${path}`);
                        return this.config;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            console.warn('⚠️ 未找到 OpenClaw 配置文件');
            return null;
            
        } catch (error) {
            console.error('❌ 加载 OpenClaw 配置失败:', error);
            return null;
        }
    }
    
    // 获取当前使用的模型配置
    async getCurrentModel() {
        const config = await this.load();
        if (!config) return null;
        
        // 获取默认模型
        const defaultModel = config.default_model || 'bailian/qwen3.5-plus';
        
        // 解析模型提供商和模型 ID
        const [provider, modelId] = defaultModel.split('/');
        
        // 从配置中获取 API 密钥
        const providers = config.models?.providers || {};
        const providerConfig = providers[provider] || providers.proxy;
        
        if (!providerConfig) {
            console.warn('⚠️ 未找到模型提供商配置');
            return null;
        }
        
        return {
            provider: provider,
            model: modelId || defaultModel,
            baseUrl: providerConfig.baseUrl,
            apiKey: providerConfig.apiKey,
            fullName: defaultModel
        };
    }
    
    // 获取所有可用的模型列表
    async getAvailableModels() {
        const config = await this.load();
        if (!config) return [];
        
        const models = [];
        const providers = config.models?.providers || {};
        
        for (const [providerId, providerConfig] of Object.entries(providers)) {
            if (providerConfig.models) {
                providerConfig.models.forEach(model => {
                    models.push({
                        id: model.id,
                        name: model.name,
                        provider: providerId,
                        fullName: `${providerId}/${model.id}`,
                        baseUrl: providerConfig.baseUrl,
                        apiKey: providerConfig.apiKey
                    });
                });
            }
        }
        
        return models;
    }
    
    // 获取代理平台配置（优先使用）
    async getProxyConfig() {
        const config = await this.load();
        if (!config) return null;
        
        const proxyConfig = config.models?.providers?.proxy;
        if (!proxyConfig) return null;
        
        return {
            provider: 'proxy',
            baseUrl: proxyConfig.baseUrl,
            apiKey: proxyConfig.apiKey,
            models: proxyConfig.models || []
        };
    }
    
    // 获取 GLM 配置
    async getGLMConfig() {
        const config = await this.load();
        if (!config) return null;
        
        const glmConfig = config.models?.providers?.glm;
        if (!glmConfig) return null;
        
        return {
            provider: 'glm',
            baseUrl: glmConfig.baseUrl,
            apiKey: glmConfig.apiKey,
            models: glmConfig.models || []
        };
    }
    
    // 获取 Qwen 配置
    async getQwenConfig() {
        const config = await this.load();
        if (!config) return null;
        
        const qwenConfig = config.models?.providers?.qwen;
        if (!qwenConfig) return null;
        
        return {
            provider: 'qwen',
            baseUrl: qwenConfig.baseUrl,
            apiKey: qwenConfig.apiKey,
            models: qwenConfig.models || []
        };
    }
}

// 创建全局实例
const openClawConfig = new OpenClawConfigLoader();

// 导出到全局
if (typeof window !== 'undefined') {
    window.OpenClawConfigLoader = OpenClawConfigLoader;
    window.openClawConfig = openClawConfig;
}
