/**
 * AI 供应商配置模块 - 独立模块
 * 定义各供应商的 API 端点、默认模型、调用方式
 * 
 * 设计原则：
 * 1. 配置与逻辑分离，方便添加新供应商
 * 2. 统一的调用接口
 * 3. 支持测试连接
 */

const AI_PROVIDERS = {
  // OpenAI
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    chatEndpoint: '/chat/completions',
    defaultModel: 'gpt-4o',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    keyPrefix: 'sk-'
  },
  
  // Anthropic (Claude)
  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    chatEndpoint: '/messages',
    defaultModel: 'claude-3-5-sonnet-20241022',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
    keyPrefix: 'sk-ant-'
  },
  
  // 智谱 AI
  zhipu: {
    name: '智谱 AI',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    chatEndpoint: '/chat/completions',
    defaultModel: 'glm-4',
    models: ['glm-4', 'glm-4-flash', 'glm-3-turbo'],
    keyPrefix: '.'
  },
  
  // 月之暗面 (Kimi)
  moonshot: {
    name: '月之暗面',
    baseUrl: 'https://api.moonshot.cn/v1',
    chatEndpoint: '/chat/completions',
    defaultModel: 'moonshot-v1-8k',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    keyPrefix: 'sk-'
  },
  
  // 通义千问
  alibaba: {
    name: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    chatEndpoint: '/chat/completions',
    defaultModel: 'qwen-plus',
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
    keyPrefix: 'sk-'
  },
  
  // DeepSeek
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    chatEndpoint: '/chat/completions',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-coder'],
    keyPrefix: 'sk-'
  },
  
  // 百川智能
  baichuan: {
    name: '百川智能',
    baseUrl: 'https://api.baichuan-ai.com/v1',
    chatEndpoint: '/chat/completions',
    defaultModel: 'Baichuan4',
    models: ['Baichuan4', 'Baichuan3-Turbo'],
    keyPrefix: 'sk-'
  },
  
  // MiniMax
  minimax: {
    name: 'MiniMax',
    baseUrl: 'https://api.minimax.chat/v1',
    chatEndpoint: '/chat/completions',
    defaultModel: 'abab6.5s-chat',
    models: ['abab6.5s-chat', 'abab6.5-chat', 'abab6-chat'],
    keyPrefix: 'sk-'
  }
};

/**
 * AI 供应商调用模块
 */
const aiProviders = (function() {
  
  /**
   * 尝试多个端点（用于代理平台）
   */
  async function tryMultipleEndpoints(endpoints, apiKey, model) {
    for (const endpoint of endpoints) {
      try {
        const result = await testConnection('custom', apiKey, model, endpoint);
        if (result.success) {
          return {
            success: true,
            message: `在 ${endpoint} 找到可用服务`,
            detectedProvider: endpoint,
            data: result.data
          };
        }
      } catch (e) {
        // 尝试下一个
      }
    }
    return {
      success: false,
      error: '所有端点都连接失败'
    };
  }
  
  /**
   * 自动检测代理平台
   */
  async function autoDetectProxy(apiKey, model) {
    // 收集所有常见代理平台端点
    const allEndpoints = [];
    
    // 添加常见代理平台端点
    const commonProxies = [
      'https://api.one-api.com/v1',
      'https://one-api.vercel.app/v1',
      'https://openai.api2d.net/v1',
      'https://api.closeai-asia.com/v1',
      'https://api.simple-api.com/v1'
    ];
    
    allEndpoints.push(...commonProxies);
    
    // 尝试所有端点
    for (const endpoint of allEndpoints) {
      try {
        const response = await fetch(endpoint + '/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model || 'glm-4',
            messages: [{ role: 'user', content: 'Hello' }],
            max_tokens: 10
          })
        });
        
        if (response.ok) {
          return {
            success: true,
            message: '自动检测到可用服务',
            detectedProvider: endpoint,
            data: await response.json()
          };
        }
      } catch (e) {
        // 继续尝试下一个
      }
    }
    
    return {
      success: false,
      error: '未检测到可用的代理平台，请检查 API Key 或手动指定端点'
    };
  }
  
  /**
   * 测试连接
   * @param {string} provider - 供应商 ID
   * @param {string} apiKey - API Key
   * @param {string} model - 模型名称
   * @param {string} customBaseUrl - 自定义 API 端点（代理平台）
   */
  async function testConnection(provider, apiKey, model, customBaseUrl = null) {
    let baseUrl, endpoint;
    
    // 如果是自定义端点（代理平台）
    if (provider === 'custom' && customBaseUrl) {
      baseUrl = customBaseUrl.replace(/\/$/, ''); // 移除末尾斜杠
      endpoint = '/chat/completions'; // 兼容 OpenAI 格式
    } else {
      const config = AI_PROVIDERS[provider];
      if (!config) {
        return { success: false, error: '不支持的供应商' };
      }
      baseUrl = config.baseUrl;
      endpoint = config.chatEndpoint;
    }
    
    try {
      const response = await fetch(baseUrl + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || 'glm-4',
          messages: [
            { role: 'user', content: 'Hello, this is a test.' }
          ],
          max_tokens: 10
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          message: '连接成功',
          data: data
        };
      } else {
        const error = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: error.error?.message || `HTTP ${response.status}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || '网络错误' 
      };
    }
  }
  
  /**
   * 发送聊天请求
   * @param {string} provider - 供应商 ID
   * @param {string} apiKey - API Key
   * @param {string} model - 模型名称
   * @param {Array} messages - 消息数组
   * @param {Object} options - 选项
   * @param {string} customBaseUrl - 自定义 API 端点（代理平台）
   */
  async function chat(provider, apiKey, model, messages, options = {}, customBaseUrl = null) {
    let baseUrl, endpoint, defaultModel;
    
    // 如果是自定义端点（代理平台）
    if (provider === 'custom' && customBaseUrl) {
      baseUrl = customBaseUrl.replace(/\/$/, '');
      endpoint = '/chat/completions';
      defaultModel = model || 'glm-4';
    } else {
      const config = AI_PROVIDERS[provider];
      if (!config) {
        throw new Error('不支持的供应商：' + provider);
      }
      baseUrl = config.baseUrl;
      endpoint = config.chatEndpoint;
      defaultModel = model || config.defaultModel;
    }
    
    const body = {
      model: model || config.defaultModel,
      messages: messages,
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature !== undefined ? options.temperature : 0.7,
      stream: options.stream || false
    };
    
    // Anthropic 特殊处理
    if (provider === 'anthropic') {
      body.max_tokens = options.maxTokens || 2000;
      delete body.max_tokens;
    }
    
    const response = await fetch(baseUrl + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(provider === 'anthropic' && {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        })
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // 统一返回格式
    if (provider === 'anthropic') {
      return {
        content: data.content[0]?.text || '',
        usage: data.usage
      };
    } else {
      return {
        content: data.choices[0]?.message?.content || '',
        usage: data.usage
      };
    }
  }
  
  /**
   * 获取供应商配置
   */
  function getProviderConfig(provider) {
    return AI_PROVIDERS[provider] || null;
  }
  
  /**
   * 获取所有供应商列表
   */
  function getProviderList() {
    return Object.keys(AI_PROVIDERS).map(key => ({
      id: key,
      name: AI_PROVIDERS[key].name,
      defaultModel: AI_PROVIDERS[key].defaultModel,
      models: AI_PROVIDERS[key].models
    }));
  }
  
  /**
   * 验证 Key 格式
   */
  function validateKeyFormat(provider, apiKey) {
    const config = AI_PROVIDERS[provider];
    if (!config) return false;
    
    if (config.keyPrefix === '.') {
      return apiKey.length > 10; // 智谱没有固定前缀
    }
    
    return apiKey.startsWith(config.keyPrefix);
  }
  
  return {
    testConnection,
    chat,
    getProviderConfig,
    getProviderList,
    validateKeyFormat
  };
})();
