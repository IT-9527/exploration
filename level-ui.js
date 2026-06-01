// 关卡界面相关UI代码（合并了game-render.js）

// 获取全局上下文
function getCtx() {
    return window.ctx || ctx;
}

function getCanvas() {
    return window.canvas || canvas;
}

// 绘制游戏背景
function drawBackground() {
    const ctx = getCtx();
    const canvas = getCanvas();
    if (!ctx || !canvas) return;
    
    // 绘制浅蓝色背景
    ctx.fillStyle = '#E6F3FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 绘制平台（关卡按钮）- 使用game-render.js的完善版本
function drawPlatforms() {
    const ctx = getCtx();
    const canvas = getCanvas();
    if (!ctx || !canvas) return;
    
    if (!window.platforms) return;

    // 确保平台数据已初始化
    if (window.platforms.length === 0) {
        window.platforms = window.generatePlatforms(canvas.width, canvas.height);
        window.connections = window.generateConnections();
    }

    window.platforms.forEach(platform => {
        // 根据解锁状态决定是否置灰
        const isUnlocked = platform.unlocked;
        
        switch(platform.type) {
            case 'start':
                // 绘制大山模型（出生点）
                ctx.fillStyle = isUnlocked ? '#228B22' : '#808080';
                // 绘制大山主体
                ctx.beginPath();
                ctx.moveTo(platform.x - 100, platform.y + 35);
                ctx.lineTo(platform.x, platform.y - 40);
                ctx.lineTo(platform.x + 100, platform.y + 35);
                ctx.closePath();
                ctx.fill();
                // 绘制山峰细节
                ctx.beginPath();
                ctx.moveTo(platform.x - 70, platform.y + 10);
                ctx.lineTo(platform.x - 30, platform.y - 20);
                ctx.lineTo(platform.x, platform.y + 10);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(platform.x, platform.y + 10);
                ctx.lineTo(platform.x + 30, platform.y - 20);
                ctx.lineTo(platform.x + 70, platform.y + 10);
                ctx.closePath();
                ctx.fill();
                if (platform.cleared) {
                    ctx.strokeStyle = '#FFFF00';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(platform.x - 103, platform.y + 38);
                    ctx.lineTo(platform.x, platform.y - 43);
                    ctx.lineTo(platform.x + 103, platform.y + 38);
                    ctx.closePath();
                    ctx.stroke();
                }
                break;
            case 'boss':
                // 绘制圆形（大boss关）
                ctx.fillStyle = isUnlocked ? '#FF6347' : '#808080';
                ctx.beginPath();
                ctx.arc(platform.x, platform.y, 60, 0, Math.PI * 2);
                ctx.fill();
                if (platform.cleared) {
                    ctx.strokeStyle = '#FFFF00';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(platform.x, platform.y, 63, 0, Math.PI * 2);
                    ctx.stroke();
                }
                break;
            case 'normal':
                // 绘制圆形（普通怪物关）
                ctx.fillStyle = isUnlocked ? '#1E90FF' : '#808080';
                ctx.beginPath();
                ctx.arc(platform.x, platform.y, 30, 0, Math.PI * 2);
                ctx.fill();
                if (platform.cleared) {
                    ctx.strokeStyle = '#FFFF00';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(platform.x, platform.y, 33, 0, Math.PI * 2);
                    ctx.stroke();
                }
                break;
            case 'mystery':
                // 绘制三角形（神秘关卡）
                ctx.fillStyle = isUnlocked ? '#4682B4' : '#808080';
                ctx.beginPath();
                ctx.moveTo(platform.x, platform.y - 30);
                ctx.lineTo(platform.x - 30, platform.y + 30);
                ctx.lineTo(platform.x + 30, platform.y + 30);
                ctx.closePath();
                ctx.fill();
                if (platform.cleared) {
                    ctx.strokeStyle = '#FFFF00';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(platform.x, platform.y - 33);
                    ctx.lineTo(platform.x - 33, platform.y + 33);
                    ctx.lineTo(platform.x + 33, platform.y + 33);
                    ctx.closePath();
                    ctx.stroke();
                }
                break;
            case 'rest':
                // 绘制心形（休息关）
                ctx.fillStyle = isUnlocked ? '#4682B4' : '#808080';
                ctx.beginPath();
                ctx.moveTo(platform.x, platform.y - 30);
                ctx.bezierCurveTo(platform.x + 30, platform.y - 60, platform.x + 60, platform.y - 15, platform.x, platform.y + 30);
                ctx.bezierCurveTo(platform.x - 60, platform.y - 15, platform.x - 30, platform.y - 60, platform.x, platform.y - 30);
                ctx.closePath();
                ctx.fill();
                if (platform.cleared) {
                    ctx.strokeStyle = '#FFFF00';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(platform.x, platform.y - 33);
                    ctx.bezierCurveTo(platform.x + 33, platform.y - 63, platform.x + 63, platform.y - 18, platform.x, platform.y + 33);
                    ctx.bezierCurveTo(platform.x - 63, platform.y - 18, platform.x - 33, platform.y - 63, platform.x, platform.y - 33);
                    ctx.closePath();
                    ctx.stroke();
                }
                break;
            case 'mini-boss':
                // 绘制菱形（小boss关卡）
                ctx.fillStyle = isUnlocked ? '#4169E1' : '#808080';
                ctx.beginPath();
                ctx.moveTo(platform.x, platform.y - 30);
                ctx.lineTo(platform.x + 30, platform.y);
                ctx.lineTo(platform.x, platform.y + 30);
                ctx.lineTo(platform.x - 30, platform.y);
                ctx.closePath();
                ctx.fill();
                if (platform.cleared) {
                    ctx.strokeStyle = '#FFFF00';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(platform.x, platform.y - 33);
                    ctx.lineTo(platform.x + 33, platform.y);
                    ctx.lineTo(platform.x, platform.y + 33);
                    ctx.lineTo(platform.x - 33, platform.y);
                    ctx.closePath();
                    ctx.stroke();
                }
                break;
        }

        // 绘制物品
        drawItem(platform.x, platform.y, platform.type, platform.unlocked);
    });

    // 绘制玩家小人（显示在当前所在平台上）
    drawPlayerOnPlatform();

    // 绘制游戏界面UI元素
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // 绘制楼层信息
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvasWidth * 0.35, canvasHeight * 0.03, canvasWidth * 0.3, canvasHeight * 0.06);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${Math.max(16, canvasWidth * 0.025)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`当前在第${currentFloor}/${totalFloors}层`, canvasWidth * 0.5, canvasHeight * 0.06);

    // 绘制玩家信息
    if (selectedCharacter) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvasWidth * 0.02, canvasHeight * 0.15, canvasWidth * 0.25, canvasHeight * 0.25);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${Math.max(14, canvasWidth * 0.02)}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`角色: ${selectedCharacter.name}`, canvasWidth * 0.03, canvasHeight * 0.16);
        ctx.fillText(`等级: ${playerLevel}`, canvasWidth * 0.03, canvasHeight * 0.19);
        ctx.fillText(`生命值: ${playerHealth}`, canvasWidth * 0.03, canvasHeight * 0.22);
        ctx.fillText(`能量: ${playerEnergy}`, canvasWidth * 0.03, canvasHeight * 0.25);
        
        // 绘制金币
        const gold = globalThis.playerGold || 0;
        ctx.fillStyle = '#FFD700'; // 金色
        ctx.fillText(`金币: ${gold}`, canvasWidth * 0.03, canvasHeight * 0.28);
        
        // 绘制药水栏（3格连接在一起）
        const potionSlotWidth = 30;
        const potionSlotHeight = 35;
        const potionStartX = canvasWidth * 0.03;
        const potionStartY = canvasHeight * 0.31;
        const maxSlots = 3;
        
        // 绘制整体药水栏背景（连接在一起）
        ctx.fillStyle = '#333333';
        ctx.fillRect(potionStartX, potionStartY, potionSlotWidth * maxSlots, potionSlotHeight);
        
        const potions = globalThis.playerPotions || [];
        const itemsData = globalThis.itemsData || [];
        
        // 药水效果图标映射
        const effectIcons = {
            health: '治',
            energy: '能',
            attack: '攻',
            poison: '毒',
            gold: '$',
            draw: '抽',
            defense: '防'
        };
        
        // 药水效果颜色映射
        const effectColors = {
            health: '#FF6B6B',
            energy: '#4ECDC4',
            attack: '#FFA07A',
            poison: '#228B22',
            gold: '#FFD700',
            draw: '#9932CC',
            defense: '#87CEEB'
        };
        
        for (let i = 0; i < maxSlots; i++) {
            const slotX = potionStartX + i * potionSlotWidth;
            
            // 如果不是第一个槽位，绘制分隔线
            if (i > 0) {
                ctx.strokeStyle = '#555555';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(slotX, potionStartY);
                ctx.lineTo(slotX, potionStartY + potionSlotHeight);
                ctx.stroke();
            }
            
            // 如果有药水，绘制药水图标
            if (i < potions.length) {
                const itemId = potions[i];
                const item = itemsData.find(item => item.id === itemId);
                
                if (item) {
                    ctx.fillStyle = effectColors[item.effect] || '#808080';
                    ctx.fillRect(slotX + 3, potionStartY + 3, potionSlotWidth - 6, potionSlotHeight - 6);
                    
                    // 绘制药水类型标记
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(effectIcons[item.effect] || '?', slotX + potionSlotWidth / 2, potionStartY + potionSlotHeight / 2);
                }
            }
        }
    }
}

// 绘制玩家小人在当前平台上
function drawPlayerOnPlatform() {
    const ctx = getCtx();
    if (!ctx) return;
    
    const currentPlatformIndex = globalThis.currentPlatformIndex || 0;
    if (!window.platforms || window.platforms.length === 0 || currentPlatformIndex >= window.platforms.length) {
        return null;
    }
    const platform = window.platforms[currentPlatformIndex];
    if (!platform) return;
    
    // 绘制一个小的火柴人表示玩家
    const centerX = platform.x;
    const centerY = platform.y - 40; // 在平台上方显示
    const size = 30;
    const scale = size / 100;
    
    // 保存当前上下文状态
    ctx.save();
    
    // 头部
    ctx.beginPath();
    ctx.arc(centerX, centerY - 20 * scale, 8 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#FFDAB9'; // 肤色
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();
    
    // 身体
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 12 * scale);
    ctx.lineTo(centerX, centerY + 15 * scale);
    ctx.stroke();
    
    // 手臂
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 5 * scale);
    ctx.lineTo(centerX - 15 * scale, centerY + 5 * scale);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 5 * scale);
    ctx.lineTo(centerX + 15 * scale, centerY + 5 * scale);
    ctx.stroke();
    
    // 腿部
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 15 * scale);
    ctx.lineTo(centerX - 12 * scale, centerY + 30 * scale);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 15 * scale);
    ctx.lineTo(centerX + 12 * scale, centerY + 30 * scale);
    ctx.stroke();
    
    // 恢复上下文状态
    ctx.restore();
}

// 绘制物品
function drawItem(x, y, type, unlocked) {
    ctx.save();
    ctx.translate(x, y);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    switch(type) {
        case 'start':
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = unlocked ? '#FFFFFF' : '#CCCCCC';
            ctx.fillText('出生', 0, 0);
            break;
        case 'boss':
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = unlocked ? '#FFFFFF' : '#CCCCCC';
            ctx.fillText('BOSS', 0, 0);
            break;
        case 'normal':
            ctx.font = '16px Arial';
            ctx.fillStyle = unlocked ? '#FFFFFF' : '#CCCCCC';
            ctx.fillText('怪物', 0, 0);
            break;
        case 'mystery':
            ctx.font = '16px Arial';
            ctx.fillStyle = unlocked ? '#FFFFFF' : '#CCCCCC';
            ctx.fillText('神秘', 0, 0);
            break;
        case 'rest':
            ctx.font = '16px Arial';
            ctx.fillStyle = unlocked ? '#FFFFFF' : '#CCCCCC';
            ctx.fillText('休息', 0, 0);
            break;
        case 'mini-boss':
            ctx.font = '16px Arial';
            ctx.fillStyle = unlocked ? '#FFFFFF' : '#CCCCCC';
            ctx.fillText('小BOSS', 0, 0);
            break;
    }

    ctx.restore();
}

// 绘制平台之间的连接线 - 使用game-render.js的版本
function drawChains() {
    const ctx = getCtx();
    const canvas = getCanvas();
    if (!ctx || !canvas) return;
    
    if (!window.platforms || !window.connections) return;

    // 确保平台数据已初始化
    if (window.platforms.length === 0) {
        window.platforms = window.generatePlatforms(canvas.width, canvas.height);
        window.connections = window.generateConnections();
    }

    // 绘制关卡连接
    ctx.strokeStyle = '#808080'; // 灰色
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    window.connections.forEach(connection => {
        const start = window.platforms[connection[0]];
        const end = window.platforms[connection[1]];

        // 显示所有连接线，未解锁的连接线用灰色虚线
        if (start && end) {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    });

    ctx.setLineDash([]);
}

// 绘制箭头（空实现，保持兼容性）
function drawArrows() {
    // 不需要绘制黄色倒三角图形
}

// 绘制圆角矩形的辅助函数
function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// 绘制拳法家火柴人
function drawStickmanMartialArtist(x, y, size) {
    const centerX = x;
    const centerY = y;
    const scale = size / 100;

    // 头部
    ctx.beginPath();
    ctx.arc(centerX, centerY - 40 * scale, 15 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#333333';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // 身体
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 25 * scale);
    ctx.lineTo(centerX, centerY + 30 * scale);
    ctx.stroke();

    // 手臂
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 15 * scale);
    ctx.lineTo(centerX - 30 * scale, centerY);
    ctx.lineTo(centerX - 35 * scale, centerY + 5 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 15 * scale);
    ctx.lineTo(centerX + 30 * scale, centerY);
    ctx.lineTo(centerX + 35 * scale, centerY + 5 * scale);
    ctx.stroke();

    // 腿部
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 30 * scale);
    ctx.lineTo(centerX - 25 * scale, centerY + 70 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 30 * scale);
    ctx.lineTo(centerX + 25 * scale, centerY + 70 * scale);
    ctx.stroke();

    // 左手拳套（红色）
    ctx.beginPath();
    ctx.arc(centerX - 35 * scale, centerY + 10 * scale, 15 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#FF0000';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // 拳套指节
    ctx.beginPath();
    ctx.arc(centerX - 42 * scale, centerY + 5 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#FF0000';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX - 45 * scale, centerY + 12 * scale, 6 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#FF0000';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX - 42 * scale, centerY + 19 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#FF0000';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX - 35 * scale, centerY + 22 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#FF0000';
    ctx.fill();
    ctx.stroke();

    // 白色装饰
    ctx.beginPath();
    ctx.arc(centerX - 30 * scale, centerY + 10 * scale, 8 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.stroke();

    // 拳套腕带
    ctx.beginPath();
    ctx.ellipse(centerX - 25 * scale, centerY + 10 * scale, 8 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.stroke();

    // 右手拳套（蓝色）
    ctx.beginPath();
    ctx.arc(centerX + 35 * scale, centerY + 10 * scale, 15 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#0000FF';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // 拳套指节
    ctx.beginPath();
    ctx.arc(centerX + 42 * scale, centerY + 5 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#0000FF';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX + 45 * scale, centerY + 12 * scale, 6 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#0000FF';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX + 42 * scale, centerY + 19 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#0000FF';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX + 35 * scale, centerY + 22 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#0000FF';
    ctx.fill();
    ctx.stroke();

    // 白色装饰
    ctx.beginPath();
    ctx.arc(centerX + 30 * scale, centerY + 10 * scale, 8 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.stroke();

    // 拳套腕带
    ctx.beginPath();
    ctx.ellipse(centerX + 25 * scale, centerY + 10 * scale, 8 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.stroke();
}

// 绘制法师火柴人
function drawStickmanMage(x, y, size) {
    const centerX = x;
    const centerY = y;
    const scale = size / 100;

    // 头部
    ctx.beginPath();
    ctx.arc(centerX, centerY - 40 * scale, 15 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#333333';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // 法师帽
    ctx.beginPath();
    ctx.moveTo(centerX - 20 * scale, centerY - 40 * scale);
    ctx.lineTo(centerX, centerY - 65 * scale);
    ctx.lineTo(centerX + 20 * scale, centerY - 40 * scale);
    ctx.closePath();
    ctx.fillStyle = '#4B0082';
    ctx.fill();
    ctx.stroke();

    // 身体
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 25 * scale);
    ctx.lineTo(centerX, centerY + 30 * scale);
    ctx.stroke();

    // 手臂
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 15 * scale);
    ctx.lineTo(centerX - 30 * scale, centerY + 10 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 15 * scale);
    ctx.lineTo(centerX + 35 * scale, centerY - 10 * scale);
    ctx.stroke();

    // 法术效果
    ctx.beginPath();
    ctx.arc(centerX + 45 * scale, centerY - 15 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(135, 206, 250, 0.7)';
    ctx.fill();
    ctx.strokeStyle = '#1E90FF';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // 腿部
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 30 * scale);
    ctx.lineTo(centerX - 25 * scale, centerY + 70 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 30 * scale);
    ctx.lineTo(centerX + 25 * scale, centerY + 70 * scale);
    ctx.stroke();
}

// 绘制简化火柴人
function drawStickman(x, y, size) {
    const centerX = x;
    const centerY = y;
    const scale = size / 100;

    // 头部
    ctx.beginPath();
    ctx.arc(centerX, centerY - 30 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fillStyle = '#333333';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // 身体
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 20 * scale);
    ctx.lineTo(centerX, centerY + 20 * scale);
    ctx.stroke();

    // 手臂
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 10 * scale);
    ctx.lineTo(centerX - 20 * scale, centerY + 5 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 10 * scale);
    ctx.lineTo(centerX + 20 * scale, centerY + 5 * scale);
    ctx.stroke();

    // 腿部
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 20 * scale);
    ctx.lineTo(centerX - 15 * scale, centerY + 45 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 20 * scale);
    ctx.lineTo(centerX + 15 * scale, centerY + 45 * scale);
    ctx.stroke();
}

// 绘制游戏UI（关卡界面）
function drawGameUI() {
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // 绘制背景
    drawBackground();

    // 绘制平台（关卡按钮）
    drawPlatforms();

    // 绘制平台之间的连接线
    drawChains();

    // 绘制箭头
    drawArrows();

    // 清空游戏界面按钮数组
    gameButtons = [];

    // 绘制设置按钮
    const buttonSize = getScaledValue(54);
    const buttonMargin = getScaledValue(50);
    const x = canvasWidth - buttonSize - buttonMargin;
    const y = buttonMargin;

    // 绘制齿轮设置按钮
    const centerX = x + buttonSize / 2;
    const centerY = y + buttonSize / 2;
    const radius = buttonSize / 2;

    // 绘制按钮背景（棕色渐变）
    const gradient = ctx.createLinearGradient(x, y, x, y + buttonSize);
    gradient.addColorStop(0, '#D2B48C');
    gradient.addColorStop(1, '#A0522D');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // 绘制按钮边框
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = getScaledValue(2);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 绘制三横线+圆点样式
    const lineCount = 3;
    const lineHeight = buttonSize * 0.12;
    const lineWidth = buttonSize * 0.4;
    const dotRadius = buttonSize * 0.08;
    const lineSpacing = buttonSize * 0.18;
    const totalHeight = (lineCount - 1) * lineSpacing;

    for (let i = 0; i < lineCount; i++) {
        const lineY = centerY - totalHeight / 2 + i * lineSpacing;
        const offset = buttonSize * 0.1;
        const dotX = centerX - lineWidth * 0.5 - dotRadius * 1.5 + offset;
        const lineStartX = centerX - lineWidth * 0.5 + offset;

        // 绘制圆点
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(dotX, lineY, dotRadius, 0, Math.PI * 2);
        ctx.fill();

        // 绘制横线
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(lineStartX, lineY - lineHeight / 2, lineWidth, lineHeight);
    }

    // 将设置按钮添加到gameButtons数组
    gameButtons.push({ x: x, y: y, width: buttonSize, height: buttonSize, action: () => {
        previousGameState = gameState;
        gameState = 'settings';
    }});
}

// 导出模块到全局作用域
window.levelUI = {
    drawBackground,
    drawPlatforms,
    drawChains,
    drawArrows,
    roundedRect,
    drawStickmanMartialArtist,
    drawStickmanMage,
    drawStickman,
    drawGameUI,
    drawPlayerOnPlatform
};