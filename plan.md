# MarkItDown Web UI - 实施计划

## 项目概述
基于微软 MarkItDown 构建一个全功能的 Web UI 文件转换工具，支持拖拽上传、批量转换、实时预览、URL 转换等功能。

## 技术栈
- **后端**: Python + FastAPI + MarkItDown + SQLite
- **前端**: React + Vite + TailwindCSS + shadcn/ui
- **部署**: Docker + docker-compose
- **多语言**: i18n 支持中英文

## 项目结构
```
markdown_is_all_u_need/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI 入口
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py        # API 路由
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py        # 配置
│   │   │   └── converter.py     # MarkItDown 封装
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schemas.py       # Pydantic 模型
│   │   └── db/
│   │       ├── __init__.py
│   │       ├── database.py      # SQLite 连接
│   │       └── models.py        # ORM 模型
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   │   ├── FileUploader.tsx      # 拖拽上传组件
│   │   │   ├── UrlConverter.tsx      # URL 转换组件
│   │   │   ├── MarkdownPreview.tsx   # Markdown 预览
│   │   │   ├── ConversionHistory.tsx # 历史记录
│   │   │   ├── BatchProgress.tsx     # 批量进度
│   │   │   └── LanguageSwitch.tsx    # 语言切换
│   │   ├── hooks/
│   │   │   └── useConversion.ts      # 转换逻辑 Hook
│   │   ├── i18n/
│   │   │   ├── index.ts
│   │   │   ├── zh.json
│   │   │   └── en.json
│   │   └── lib/
│   │       └── api.ts               # API 客户端
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 任务分解

### 任务 1: 后端核心 (backend-dev)
- FastAPI 项目初始化
- MarkItDown 转换服务封装
- API 路由实现（文件上传、URL转换、批量转换、历史记录）
- SQLite 数据库（转换历史）
- 文件上传/下载管理
- CORS 配置

### 任务 2: 前端界面 (frontend-dev)
- React + Vite 项目初始化
- 拖拽上传组件（支持多文件）
- URL 转换输入
- Markdown 实时预览（语法高亮）
- 批量转换进度展示
- 转换历史列表
- i18n 多语言支持（中/英）
- 响应式设计

### 任务 3: Docker 部署 (integrator)
- 后端 Dockerfile
- 前端 Dockerfile
- docker-compose.yml（一键启动）
- 环境变量配置

## API 设计

```
POST /api/convert/file     # 单文件转换
POST /api/convert/files    # 批量文件转换
POST /api/convert/url      # URL 转换
GET  /api/history          # 获取转换历史
GET  /api/history/{id}     # 获取单条历史详情
DELETE /api/history/{id}   # 删除历史记录
GET  /api/download/{id}    # 下载转换结果
GET  /api/formats          # 获取支持的格式列表
```
