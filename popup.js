// 弹出窗口脚本

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 获取元素
  const apiStatusElement = document.getElementById('apiStatus');
  const optionsButton = document.getElementById('optionsBtn');
  const helpButton = document.getElementById('helpBtn');
  
  // 检查API状态
  checkApiStatus();
  
  // 添加按钮事件监听
  optionsButton.addEventListener('click', openOptionsPage);
  helpButton.addEventListener('click', openHelpPage);
});

// 检查API状态
function checkApiStatus() {
  const apiStatusElement = document.getElementById('apiStatus');
  
  // 从存储中获取API密钥
  chrome.storage.sync.get(['apiKey'], function(result) {
    if (result.apiKey && result.apiKey.trim() !== '') {
      apiStatusElement.textContent = '已配置';
      apiStatusElement.style.color = '#0f9d58'; // 绿色
    } else {
      apiStatusElement.textContent = '未配置';
      apiStatusElement.style.color = '#d93025'; // 红色
    }
  });
}

// 打开设置页面
function openOptionsPage() {
  chrome.runtime.openOptionsPage();
}

// 打开帮助页面
function openHelpPage() {
  // 创建帮助页面URL
  const helpUrl = chrome.runtime.getURL('help.html');
  
  // 在新标签页中打开帮助页面
  chrome.tabs.create({ url: helpUrl });
}