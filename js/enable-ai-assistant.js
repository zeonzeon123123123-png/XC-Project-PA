/**
 * 通用 AI 助手加载脚本
 * 在所有表单页面自动加载 AI 助手
 */

(function() {
    'use strict';
    
    console.log('🔌 正在加载 AI 助手...');
    
    // 检查是否已加载
    if (window.aiAssistantV4) {
        console.log('✅ AI 助手已加载');
        return;
    }
    
    // 动态加载脚本
    function loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        script.onerror = () => console.error('❌ 加载失败:', src);
        document.head.appendChild(script);
    }
    
    // 加载顺序
    loadScript('js/openclaw-config-loader.js', () => {
        console.log('✅ 配置加载器已加载');
        
        loadScript('js/ai-assistant-v4.js', () => {
            console.log('✅ AI 助手已加载');
        });
    });
    
})();
