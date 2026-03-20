/**
 * 配置管理器 - 独立模块
 * 负责 API Key 的存储、加密、导出导入
 * 
 * 设计原则：
 * 1. 独立于任何页面，可复用
 * 2. 数据结构清晰，方便后续迁移到后端
 * 3. 支持加密存储
 * 4. 支持导出导入（为跨设备同步做准备）
 */

const configManager = (function() {
  // 配置存储键名
  const STORAGE_KEY = 'xc_project_pa_config_v1';
  
  // 加密密钥（简单混淆，生产环境应该用更安全的方案）
  const ENCRYPTION_KEY = 'xc_project_pa_2026';
  
  /**
   * 获取完整配置
   */
  function getConfig() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        version: '1.0',
        apiKeys: [],
        defaultProvider: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    }
    return JSON.parse(data);
  }
  
  /**
   * 保存完整配置
   */
  function saveConfig(config) {
    config.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
  
  /**
   * 加密 Key（简单混淆）
   * 注意：这不是真正的加密，只是防止明文存储
   * 生产环境应该使用 Web Crypto API
   */
  function encryptKey(key) {
    // 简单混淆：异或 + Base64
    let result = '';
    for (let i = 0; i < key.length; i++) {
      result += String.fromCharCode(key.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return btoa(result);
  }
  
  /**
   * 解密 Key
   */
  function decryptKey(encrypted) {
    try {
      const decoded = atob(encrypted);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
      }
      return result;
    } catch (error) {
      console.error('解密失败:', error);
      throw new Error('Key 解密失败');
    }
  }
  
  /**
   * 获取所有 API Keys
   */
  function getApiKeys() {
    const config = getConfig();
    return config.apiKeys || [];
  }
  
  /**
   * 获取单个 API Key
   */
  function getApiKey(keyId) {
    const config = getConfig();
    return config.apiKeys.find(k => k.id === keyId);
  }
  
  /**
   * 添加 API Key
   */
  function addApiKey(keyData) {
    const config = getConfig();
    
    const newKey = {
      id: 'key_' + Date.now(),
      provider: keyData.provider,
      model: keyData.model,
      encryptedKey: encryptKey(keyData.apiKey),
      customBaseUrl: keyData.customBaseUrl || null, // 自定义端点（代理平台）
      note: keyData.note || '',
      isDefault: config.apiKeys.length === 0, // 第一个自动设为默认
      status: 'active',
      lastUsed: null,
      createdAt: Date.now()
    };
    
    config.apiKeys.push(newKey);
    saveConfig(config);
    
    return newKey;
  }
  
  /**
   * 更新 API Key
   */
  function updateApiKey(keyId, keyData) {
    const config = getConfig();
    const index = config.apiKeys.findIndex(k => k.id === keyId);
    
    if (index === -1) {
      throw new Error('Key 不存在');
    }
    
    const key = config.apiKeys[index];
    
    if (keyData.provider) key.provider = keyData.provider;
    if (keyData.model) key.model = keyData.model;
    if (keyData.apiKey) key.encryptedKey = encryptKey(keyData.apiKey);
    if (keyData.note !== undefined) key.note = keyData.note;
    if (keyData.customBaseUrl !== undefined) key.customBaseUrl = keyData.customBaseUrl;
    if (keyData.status) key.status = keyData.status;
    
    saveConfig(config);
    return key;
  }
  
  /**
   * 删除 API Key
   */
  function deleteApiKey(keyId) {
    const config = getConfig();
    config.apiKeys = config.apiKeys.filter(k => k.id !== keyId);
    
    // 如果删除了默认 Key，重新设置第一个为默认
    if (config.apiKeys.length > 0 && !config.apiKeys.some(k => k.isDefault)) {
      config.apiKeys[0].isDefault = true;
    }
    
    saveConfig(config);
  }
  
  /**
   * 设置默认 Key
   */
  function setDefaultKey(keyId) {
    const config = getConfig();
    
    config.apiKeys.forEach(k => {
      k.isDefault = (k.id === keyId);
    });
    
    saveConfig(config);
  }
  
  /**
   * 获取默认 API Key
   */
  function getDefaultApiKey() {
    const config = getConfig();
    return config.apiKeys.find(k => k.isDefault && k.status === 'active');
  }
  
  /**
   * 获取指定供应商的 API Key
   */
  function getApiKeyByProvider(provider) {
    const config = getConfig();
    return config.apiKeys.find(k => k.provider === provider && k.status === 'active');
  }
  
  /**
   * 更新 Key 的最后使用时间
   */
  function updateLastUsed(keyId) {
    const config = getConfig();
    const key = config.apiKeys.find(k => k.id === keyId);
    
    if (key) {
      key.lastUsed = Date.now();
      saveConfig(config);
    }
  }
  
  /**
   * 导出配置（用于备份或跨设备同步）
   */
  function exportConfig() {
    return getConfig();
  }
  
  /**
   * 导入配置（从备份恢复）
   */
  function importConfig(data) {
    if (!data.version || !data.apiKeys) {
      throw new Error('无效的配置文件格式');
    }
    
    // 合并配置（保留现有配置，添加新配置）
    const current = getConfig();
    
    // 导入的 Key 生成新 ID，避免冲突
    data.apiKeys.forEach(key => {
      key.id = 'key_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      current.apiKeys.push(key);
    });
    
    saveConfig(current);
  }
  
  /**
   * 清空所有配置
   */
  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  }
  
  /**
   * 获取配置统计信息
   */
  function getStats() {
    const config = getConfig();
    return {
      totalKeys: config.apiKeys.length,
      activeKeys: config.apiKeys.filter(k => k.status === 'active').length,
      providers: [...new Set(config.apiKeys.map(k => k.provider))],
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    };
  }
  
  // 公开接口
  return {
    getConfig,
    saveConfig,
    encryptKey,
    decryptKey,
    getApiKeys,
    getApiKey,
    addApiKey,
    updateApiKey,
    deleteApiKey,
    setDefaultKey,
    getDefaultApiKey,
    getApiKeyByProvider,
    updateLastUsed,
    exportConfig,
    importConfig,
    clearAll,
    getStats
  };
})();
