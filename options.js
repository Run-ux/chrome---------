// 设置页面脚本

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 获取表单元素
  const apiKeyInput = document.getElementById('apiKey');
  const targetLangSelect = document.getElementById('targetLang');
  const autoTranslateCheckbox = document.getElementById('autoTranslate');
  const showButtonCheckbox = document.getElementById('showButton');
  const saveButton = document.getElementById('saveBtn');
  const resetButton = document.getElementById('resetBtn');
  const statusMessage = document.getElementById('statusMessage');
  
  // 加载保存的设置
  loadSettings();
  
  // 添加保存按钮事件
  saveButton.addEventListener('click', saveSettings);
  
  // 添加重置按钮事件
  resetButton.addEventListener('click', resetSettings);
});

// 加载保存的设置
function loadSettings() {
  chrome.storage.sync.get([
    'apiUrl',
    'modelName',
    'apiKey',
    'targetLang',
    'autoTranslate',
    'showButton'
  ], function(result) {
    // 填充表单
    if (result.apiUrl) {
      document.getElementById('apiUrl').value = result.apiUrl;
    }
    
    if (result.modelName) {
      document.getElementById('modelName').value = result.modelName;
    }
    
    if (result.apiKey) {
      document.getElementById('apiKey').value = result.apiKey;
    }
    
    if (result.targetLang) {
      document.getElementById('targetLang').value = result.targetLang;
    } else {
      document.getElementById('targetLang').value = 'zh-CN'; // 默认值
    }
    
    document.getElementById('autoTranslate').checked = 
      result.autoTranslate === true;
    
    document.getElementById('showButton').checked = 
      result.showButton !== false; // 默认为true
  });}


// 保存设置
function saveSettings() {
  // 获取表单值
  const apiUrl = document.getElementById('apiUrl').value.trim();
  const modelName = document.getElementById('modelName').value.trim();
  const apiKey = document.getElementById('apiKey').value.trim();
  const targetLang = document.getElementById('targetLang').value;
  const autoTranslate = document.getElementById('autoTranslate').checked;
  const showButton = document.getElementById('showButton').checked;
  
  // 保存到存储
  chrome.storage.sync.set({
    apiUrl: apiUrl,
    modelName: modelName,
    apiKey: apiKey,
    targetLang: targetLang,
    autoTranslate: autoTranslate,
    showButton: showButton
  }, function() {
    // 显示成功消息
    showStatus('设置已保存', 'success');
  });
}

// 重置设置
function resetSettings() {
  // 重置表单
  document.getElementById('apiUrl').value = 'https://api.openai.com/v1/chat/completions';
  document.getElementById('modelName').value = 'gpt-3.5-turbo';
  document.getElementById('apiKey').value = '';
  document.getElementById('targetLang').value = 'zh-CN';
  document.getElementById('autoTranslate').checked = false;
  document.getElementById('showButton').checked = true;
  
  // 保存默认设置
  chrome.storage.sync.set({
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    modelName: 'gpt-3.5-turbo',
    apiKey: '',
    targetLang: 'zh-CN',
    autoTranslate: false,
    showButton: true
  }, function() {
    // 显示成功消息
    showStatus('设置已重置为默认值', 'success');
  });
}

// 显示状态消息
function showStatus(message, type) {
  const statusElement = document.getElementById('statusMessage');
  
  // 设置消息内容和样式
  statusElement.textContent = message;
  statusElement.className = 'status-message';
  
  if (type === 'success') {
    statusElement.classList.add('status-success');
  } else if (type === 'error') {
    statusElement.classList.add('status-error');
  }
  
  // 显示消息
  statusElement.style.display = 'block';
  
  // 3秒后自动隐藏
  setTimeout(function() {
    statusElement.style.display = 'none';
  }, 3000);
}