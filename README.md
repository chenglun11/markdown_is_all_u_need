# 📄 MarkItDown Studio

> 基于微软 [MarkItDown](https://github.com/microsoft/markitdown) 的 Web UI 文件转换工具，将多种格式文件一键转换为 Markdown。

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![React](https://img.shields.io/badge/React-18-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## ✨ 功能特性

- 🗂️ **多格式支持** - PDF、Word、Excel、PPT、HTML、CSV、JSON、XML、图片、音频等
- 📤 **拖拽上传** - 支持多文件拖拽上传，一次转换多个文件
- 🔗 **URL 转换** - 直接输入网页 URL 转换为 Markdown
- 👀 **实时预览** - Markdown 渲染预览 + 源码查看，支持语法高亮
- 📦 **批量转换** - 批量上传文件，进度条实时展示
- 📋 **转换历史** - SQLite 存储转换记录，随时查看历史
- 🌍 **多语言** - 支持中文 / English 切换
- 🌙 **深色模式** - 默认深色主题，支持亮色切换
- 🐳 **Docker 部署** - docker-compose 一键启动

## 🚀 快速开始

### 方式一：服务器部署（推荐，无需克隆代码）

```bash
# 下载生产配置文件
curl -O https://raw.githubusercontent.com/chenglun11/markdown_is_all_u_need/main/docker-compose.prod.yml

# 一键启动
docker compose -f docker-compose.prod.yml up -d

# 访问 http://你的服务器IP:3000
```

### 方式二：从源码构建部署

```bash
# 克隆项目
git clone https://github.com/chenglun11/markdown_is_all_u_need.git
cd markdown_is_all_u_need

# 复制环境变量（可选，修改端口等）
cp .env.example .env

# 构建并启动
docker compose up -d

# 访问 http://localhost:3000
```

### 本地开发

#### 后端

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动服务
uvicorn app.main:app --reload --port 8000
```

#### 前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 访问 http://localhost:5173
```

## 📁 项目结构

```
markdown_is_all_u_need/
├── backend/                  # FastAPI 后端
│   ├── app/
│   │   ├── main.py           # 入口
│   │   ├── api/routes.py     # API 路由
│   │   ├── core/
│   │   │   ├── config.py     # 配置
│   │   │   └── converter.py  # MarkItDown 封装
│   │   ├── db/
│   │   │   ├── database.py   # SQLite 连接
│   │   │   └── models.py     # ORM 模型
│   │   └── models/schemas.py # 请求/响应模型
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # React 前端
│   ├── src/
│   │   ├── components/       # UI 组件
│   │   ├── hooks/            # 自定义 Hook
│   │   ├── i18n/             # 多语言
│   │   ├── lib/              # API 客户端
│   │   └── types/            # TypeScript 类型
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## 🔌 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/convert/file` | 单文件上传转换 |
| POST | `/api/convert/files` | 批量文件转换 |
| POST | `/api/convert/url` | URL 转换 |
| GET | `/api/history` | 转换历史列表 |
| GET | `/api/history/{id}` | 历史详情 |
| DELETE | `/api/history/{id}` | 删除历史 |
| GET | `/api/download/{id}` | 下载 .md 文件 |
| POST | `/api/download/batch` | 批量下载 ZIP |
| GET | `/api/formats` | 支持的格式列表 |

## 📝 支持的文件格式

| 格式 | 扩展名 |
|------|--------|
| PDF | `.pdf` |
| Word | `.docx` |
| PowerPoint | `.pptx` |
| Excel | `.xlsx`, `.xls` |
| HTML | `.html`, `.htm` |
| CSV | `.csv` |
| JSON | `.json` |
| XML | `.xml` |
| 图片 | `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp` |
| 音频 | `.mp3`, `.wav`, `.m4a`, `.ogg` |
| 电子书 | `.epub` |
| 压缩包 | `.zip` |
| Outlook | `.msg` |

## ⚙️ 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `BACKEND_PORT` | `8000` | 后端服务端口 |
| `FRONTEND_PORT` | `3000` | 前端服务端口 |
| `MAX_FILE_SIZE` | `104857600` | 最大文件大小 (100MB) |

## 📄 License

MIT
