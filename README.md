666# 智能划词翻译助手

一款功能强大的 Chrome 浏览器插件，支持划词翻译和解释功能，帮助用户快速理解网页内容。

## 功能特点

- **划词翻译**：选中文本后一键翻译
- **内容解释**：获取选中文本的详细解释和分析
- **右键菜单**：通过右键菜单快速访问翻译和解释功能
- **多语言支持**：支持多种目标语言的翻译
- **自定义设置**：根据个人需求自定义插件行为

## 安装方法

### 开发模式安装（适用于开发者）

1. 下载或克隆本仓库到本地
2. 打开 Chrome 浏览器，进入扩展管理页面（chrome://extensions/）
3. 开启右上角的「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择本插件的文件夹

## 使用方法

### 基本使用

1. 在网页上选中您想要翻译或解释的文本
2. 选中后，会在文本附近出现一个蓝色的翻译按钮
3. 点击翻译按钮，将显示翻译结果弹窗
4. 在弹窗中，您可以选择「翻译」或「解释」功能

### 使用右键菜单

1. 在网页上选中文本
2. 右键点击选中的文本
3. 在右键菜单中选择「翻译选中文本」或「解释选中文本」
4. 结果将在弹窗中显示

## 配置选项

在插件的设置页面中，您可以配置以下选项：

- **API 密钥**：设置用于翻译和解释服务的 API 密钥
- **目标语言**：选择翻译的目标语言
- **自动翻译**：启用后，选中文本将自动显示翻译结果
- **显示翻译按钮**：控制是否在选中文本旁显示翻译按钮

## 技术实现

- 使用 Chrome 扩展 API 实现浏览器插件功能
- 内容脚本实现页面交互和 UI 展示
- 背景脚本处理 API 调用和全局事件
- 支持多种翻译和解释 API 服务

## 隐私声明

本插件尊重用户隐私，不会收集用户的个人信息。所有的翻译和解释请求都是通过用户配置的 API 密钥直接发送到相应的服务提供商。

## 许可证

[MIT License](LICENSE)
