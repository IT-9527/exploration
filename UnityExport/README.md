# 游戏项目 Unity 移植指南

## 项目概述
本项目是将基于 Electron + Canvas 的游戏移植到 Unity 引擎的完整方案。

## UI设计规范

### 颜色配置
| 用途 | 颜色代码 | 说明 |
|------|---------|------|
| 主背景色 | #E6F3FF | 浅蓝色，用于所有面板背景 |
| 标题文字 | #4682B4 | 钢蓝色，用于标题和重要文字 |
| 按钮背景（渐变） | #D2B48C → #A0522D | 棕色渐变，顶部浅到底部深 |
| 按钮边框 | #8B4513 | 深棕色，用于按钮和面板边框 |
| 按钮文字 | #FFFFFF | 白色，带描边效果 |
| 强调色 | #FFD700 | 金色，用于高亮和重要信息 |
| 危险色 | #FF0000 | 红色，用于敌人和危险提示 |
| 成功色 | #00FF00 | 绿色，用于成功状态 |
| 禁用色 | #808080 | 灰色，用于禁用状态 |

### 按钮设计
- **形状**: 圆角矩形，圆角半径25像素
- **阴影**: 偏移(3,3)，颜色 rgba(0, 0, 0, 0.3)
- **边框**: 2像素宽度，深棕色
- **文字**: 32px 粗体 Arial，白色，带描边

### 面板设计
- **背景**: 半透明白色 rgba(255, 255, 255, 0.9)
- **边框**: 2像素钢蓝色
- **间距**: 使用自适应缩放系统 (getScaledValue)

### 自适应缩放
使用 `getScaledValue()` 函数进行自适应缩放：
```csharp
float GetScaledValue(float value, float baseWidth = 800, float baseHeight = 1000) {
    float scaleX = Screen.width / baseWidth;
    float scaleY = Screen.height / baseHeight;
    return value * Mathf.Min(scaleX, scaleY);
}
```

## 文件结构
```
UnityExport/
├── Scripts/
│   ├── Data/          # 数据模型类
│   ├── Managers/      # 核心管理器
│   ├── UI/            # UI面板组件
│   └── Utils/         # 工具类
└── README.md          # 移植说明
```

## 导入步骤

### 1. 创建Unity项目
1. 打开 Unity Hub
2. 创建新项目 → 选择 2D 模板
3. 设置项目名称和路径

### 2. 导入脚本
1. 将 `Scripts/` 目录复制到 `Assets/Scripts/`
2. 在 Unity 中刷新项目

### 3. 创建Resources目录
1. 在 `Assets/` 下创建 `Resources/Data/` 目录
2. 将原项目的 JSON 文件复制到该目录

### 4. 设置场景

#### 场景结构
```
MainScene
├── Canvas
│   ├── MenuPanel
│   ├── CharacterSelectPanel
│   ├── MapSelectPanel
│   ├── BattlePanel
│   ├── CharacterDetailsPanel
│   └── ItemManagementPanel
├── GameManager (Empty GameObject)
├── DataManager (Empty GameObject)
├── UIManager (Empty GameObject)
└── SaveManager (Empty GameObject)
```

#### 创建面板的步骤
1. 在 Canvas 下创建空 GameObject，命名为对应面板名
2. 设置 RectTransform 覆盖全屏
3. 添加 Panel 组件作为背景
4. 创建子 UI 元素（Button, Text, Image 等）
5. 添加对应的 Panel 脚本

### 5. 配置管理器
1. 创建空 GameObject，添加 GameManager 脚本
2. 重复此步骤添加 DataManager、UIManager、SaveManager
3. 在 Inspector 中配置 UIManager 的面板引用

### 6. 导入资源
1. 将原项目 `pictures/` 目录的图片导入
2. 设置 Texture Type 为 Sprite (2D and UI)
3. 调整 Pixels Per Unit

## UI组件配置说明

### MenuPanel
| 组件 | 类型 | 作用 |
|------|------|------|
| startButton | Button | 开始游戏 |
| characterButton | Button | 角色管理 |
| itemButton | Button | 道具管理 |
| loadButton | Button | 读取存档 |

### CharacterSelectPanel
| 组件 | 类型 | 作用 |
|------|------|------|
| cardPrefab | CharacterCard | 角色卡片预制件 |
| cardContainer | Transform | 卡片容器 |
| backButton | Button | 返回 |

### BattlePanel
| 组件 | 类型 | 作用 |
|------|------|------|
| playerHealthText | Text | 玩家生命值 |
| playerEnergyText | Text | 玩家能量 |
| enemyHealthText | Text | 敌人生命值 |
| cardHand | CardHand | 手牌管理 |
| endTurnButton | Button | 结束回合 |

## 数据文件格式

### characters.json
```json
[
  {
    "id": "martial_artist",
    "name": "拳法家",
    "health": 100,
    "PhyAtk": 15,
    "defense": 10,
    "skills": ["普通攻击", "防御", "连环踢"]
  }
]
```

### potion.json
```json
[
  {
    "id": 1,
    "name": "治疗药水",
    "effect": "health",
    "value": 50,
    "description": "恢复50点生命值"
  }
]
```

## 核心功能说明

### 游戏状态管理
- GameManager 使用单例模式管理全局状态
- 支持状态切换：Menu → CharacterSelect → MapSelect → Battle
- 维护玩家数据：生命值、能量、金币、等级

### 战斗系统
- 回合制战斗
- 卡牌系统（攻击卡、防御卡、技能卡）
- 能量消耗机制
- 敌人AI自动攻击

### 存档系统
- 使用 PlayerPrefs 存储
- 支持多存档槽位
- 保存玩家进度和角色选择

## 注意事项

1. **异步处理**：Unity 使用 Coroutine 处理异步操作
2. **坐标系统**：Unity UI 使用 RectTransform，与 Canvas 2D 不同
3. **资源加载**：使用 Resources.Load 加载资源
4. **输入处理**：使用 Unity EventSystem

## 推荐工具
- TextMesh Pro：高质量文本渲染
- DOTween：平滑动画效果
- Odin Inspector（可选）：编辑器增强

## 后续开发建议
1. 添加动画效果
2. 优化 UI 布局
3. 添加音效系统
4. 实现商店系统
5. 添加更多角色和技能
