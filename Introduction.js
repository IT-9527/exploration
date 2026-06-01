// 道具管理界面
function drawItemManagement() {
    const ctx = window.ctx || window.canvas?.getContext('2d');
    const canvas = window.canvas;
    
    if (!ctx || !canvas) {
        console.error('Canvas or context not found');
        return;
    }
    
    ctx.fillStyle = '#E6F3FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 标题
    ctx.fillStyle = '#4682B4';
    ctx.font = `${getScaledValue(36)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('道具管理', canvas.width / 2, getScaledValue(60));
    
    // 获取已发现的药水
    let discoveredPotions = [];
    if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('discoveredPotions');
        if (stored) {
            discoveredPotions = JSON.parse(stored);
        }
    }
    
    // 从 potion.json 加载药水数据
    let potions = [];
    try {
        if (typeof window.items !== 'undefined') {
            potions = window.items;
        }
    } catch (e) {
        console.error('Failed to load potions:', e);
    }
    
    // 如果没有加载到数据，使用默认数据
    if (potions.length === 0) {
        potions = [
            {"id": 1, "name": "治疗药水", "type": "consumable", "effect": "health", "value": 50, "duration": 1, "description": "使用后恢复50点生命值", "icon": "treatment"},
            {"id": 2, "name": "能量药水", "type": "consumable", "effect": "energy", "value": 3, "duration": 1, "description": "使用后恢复3点能量", "icon": "enery"},
            {"id": 3, "name": "攻击药水", "type": "consumable", "effect": "attack", "value": 5, "duration": 1, "description": "下次攻击伤害提升", "icon": "atk"},
            {"id": 4, "name": "毒药", "type": "consumable", "effect": "poison", "value": 5, "duration": 3, "description": "对敌人添加中毒效果，回合开始时扣5点血量，持续3回合", "icon": "poison"},
            {"id": 5, "name": "金币药水", "type": "consumable", "effect": "gold", "value": 0.1, "duration": 1, "description": "使用后增加当前金币数量的10%", "icon": "gold"},
            {"id": 6, "name": "抽卡药水", "type": "consumable", "effect": "draw", "value": 3, "duration": 1, "description": "使用后抽3张卡", "icon": "draw"},
            {"id": 7, "name": "防御力提升", "type": "consumable", "effect": "defense", "value": 5, "duration": 3, "description": "3回合内增加5点防御力", "icon": "def"}
        ];
    }
    
    // 布局设置 - 整体一个面板
    const panelWidth = canvas.width - getScaledValue(40);
    const panelHeight = canvas.height - getScaledValue(220);
    const panelX = getScaledValue(20);
    const panelY = getScaledValue(100);
    
    // 绘制主面板背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = '#4682B4';
    ctx.lineWidth = getScaledValue(2);
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // 标题
    ctx.fillStyle = '#4682B4';
    ctx.font = `${getScaledValue(18)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('药水详情', panelX + panelWidth / 2, panelY + getScaledValue(30));
    
    // 表格设置
    const tableY = panelY + getScaledValue(60);
    const rowHeight = getScaledValue(60);
    const iconWidth = getScaledValue(60);
    const nameWidth = getScaledValue(120);
    const effectWidth = getScaledValue(100);
    const valueWidth = getScaledValue(80);
    const durationWidth = getScaledValue(80);
    const descWidth = panelWidth - iconWidth - nameWidth - effectWidth - valueWidth - durationWidth - getScaledValue(60);
    
    // 绘制表头
    ctx.fillStyle = '#4682B4';
    ctx.font = `${getScaledValue(14)}px Arial`;
    ctx.textAlign = 'center';
    
    const headerY = tableY;
    ctx.fillText('图标', panelX + getScaledValue(30), headerY + rowHeight / 2 + getScaledValue(5));
    ctx.fillText('名称', panelX + iconWidth + nameWidth / 2, headerY + rowHeight / 2 + getScaledValue(5));
    ctx.fillText('效果', panelX + iconWidth + nameWidth + effectWidth / 2, headerY + rowHeight / 2 + getScaledValue(5));
    ctx.fillText('数值', panelX + iconWidth + nameWidth + effectWidth + valueWidth / 2, headerY + rowHeight / 2 + getScaledValue(5));
    ctx.fillText('持续', panelX + iconWidth + nameWidth + effectWidth + valueWidth + durationWidth / 2, headerY + rowHeight / 2 + getScaledValue(5));
    ctx.fillText('描述', panelX + iconWidth + nameWidth + effectWidth + valueWidth + durationWidth + descWidth / 2, headerY + rowHeight / 2 + getScaledValue(5));
    
    // 绘制表头分隔线
    ctx.strokeStyle = '#4682B4';
    ctx.lineWidth = getScaledValue(2);
    ctx.beginPath();
    ctx.moveTo(panelX, headerY + rowHeight);
    ctx.lineTo(panelX + panelWidth, headerY + rowHeight);
    ctx.stroke();
    
    // 存储按钮
    window.itemButtons = [];
    
    // 绘制药水列表（合并成表格形式）
    potions.forEach((potion, index) => {
        const y = tableY + (index + 1) * rowHeight;
        
        // 检查是否已发现该药水
        const isDiscovered = discoveredPotions.includes(potion.id);
        
        // 绘制行背景（交替颜色）
        if (index % 2 === 0) {
            ctx.fillStyle = isDiscovered ? 'rgba(70, 130, 180, 0.05)' : 'rgba(200, 200, 200, 0.2)';
        } else {
            ctx.fillStyle = isDiscovered ? 'rgba(255, 255, 255, 0.9)' : 'rgba(200, 200, 200, 0.3)';
        }
        ctx.fillRect(panelX, y, panelWidth, rowHeight);
        
        // 绘制列分隔线
        ctx.strokeStyle = isDiscovered ? 'rgba(70, 130, 180, 0.3)' : 'rgba(200, 200, 200, 0.5)';
        ctx.lineWidth = getScaledValue(1);
        
        // 图标列
        let colX = panelX + iconWidth;
        ctx.beginPath();
        ctx.moveTo(colX, y);
        ctx.lineTo(colX, y + rowHeight);
        ctx.stroke();
        
        // 名称列
        colX += nameWidth;
        ctx.beginPath();
        ctx.moveTo(colX, y);
        ctx.lineTo(colX, y + rowHeight);
        ctx.stroke();
        
        // 效果列
        colX += effectWidth;
        ctx.beginPath();
        ctx.moveTo(colX, y);
        ctx.lineTo(colX, y + rowHeight);
        ctx.stroke();
        
        // 数值列
        colX += valueWidth;
        ctx.beginPath();
        ctx.moveTo(colX, y);
        ctx.lineTo(colX, y + rowHeight);
        ctx.stroke();
        
        // 持续列
        colX += durationWidth;
        ctx.beginPath();
        ctx.moveTo(colX, y);
        ctx.lineTo(colX, y + rowHeight);
        ctx.stroke();
        
        // 绘制行分隔线
        ctx.strokeStyle = isDiscovered ? 'rgba(70, 130, 180, 0.2)' : 'rgba(200, 200, 200, 0.3)';
        ctx.beginPath();
        ctx.moveTo(panelX, y + rowHeight);
        ctx.lineTo(panelX + panelWidth, y + rowHeight);
        ctx.stroke();
        
        // 绘制图标（使用emoji）
        const iconX = panelX + iconWidth / 2;
        const iconY = y + rowHeight / 2;
        
        ctx.fillStyle = isDiscovered ? getIconColor(potion.effect) : '#CCCCCC';
        ctx.font = `${getScaledValue(24)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(getIconSymbol(potion.effect), iconX, iconY);
        
        // 绘制名称
        ctx.fillStyle = isDiscovered ? '#000000' : '#999999';
        ctx.font = `${getScaledValue(14)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(potion.name, panelX + iconWidth + nameWidth / 2, y + rowHeight / 2 + getScaledValue(5));
        
        // 绘制效果
        ctx.fillStyle = isDiscovered ? '#000000' : '#999999';
        ctx.textAlign = 'center';
        ctx.fillText(getEffectText(potion.effect), panelX + iconWidth + nameWidth + effectWidth / 2, y + rowHeight / 2 + getScaledValue(5));
        
        // 绘制数值
        ctx.fillStyle = isDiscovered ? '#000000' : '#999999';
        ctx.textAlign = 'center';
        const valueText = potion.value.toString() + (potion.effect === 'gold' ? '%' : '');
        ctx.fillText(valueText, panelX + iconWidth + nameWidth + effectWidth + valueWidth / 2, y + rowHeight / 2 + getScaledValue(5));
        
        // 绘制持续时间
        ctx.fillStyle = isDiscovered ? '#000000' : '#999999';
        ctx.textAlign = 'center';
        const durationText = potion.duration ? potion.duration + '回合' : '立即';
        ctx.fillText(durationText, panelX + iconWidth + nameWidth + effectWidth + valueWidth + durationWidth / 2, y + rowHeight / 2 + getScaledValue(5));
        
        // 绘制描述
        ctx.fillStyle = isDiscovered ? '#666666' : '#999999';
        ctx.font = `${getScaledValue(12)}px Arial`;
        ctx.textAlign = 'left';
        
        // 截断过长的描述
        let descText = potion.description;
        const maxDescLength = 25;
        if (descText.length > maxDescLength) {
            descText = descText.substring(0, maxDescLength) + '...';
        }
        ctx.fillText(descText, panelX + iconWidth + nameWidth + effectWidth + valueWidth + durationWidth + getScaledValue(10), y + rowHeight / 2 + getScaledValue(5));
        
        // 存储按钮信息
        window.itemButtons.push({ 
            x: panelX, 
            y: y, 
            width: panelWidth, 
            height: rowHeight, 
            potion: potion,
            action: function() {
                window.selectedPotion = potion;
            }
        });
    });
    
    // 返回按钮
    const backBtnY = canvas.height - getScaledValue(80);
    const backBtnAction = function() {
        window.gameState = 'menu';
        window.selectedPotion = null;
    };
    
    // 绘制返回按钮
    const drawBtn = window.drawButton || function(x, y, width, height, text, onClick) {
        ctx.fillStyle = '#4682B4';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = getScaledValue(2);
        ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${getScaledValue(16)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + width / 2, y + height / 2);
        return onClick;
    };
    
    drawBtn(canvas.width / 2 - getScaledValue(100), backBtnY, getScaledValue(200), getScaledValue(50), '返回主菜单', backBtnAction);
    
    // 存储按钮
    window.characterDetailsButtons = [{ 
        x: canvas.width / 2 - getScaledValue(100), 
        y: backBtnY, 
        width: getScaledValue(200), 
        height: getScaledValue(50), 
        action: backBtnAction 
    }];
}

// 获取药水图标的符号
function getIconSymbol(icon) {
    const iconMap = {
        'treatment': '💚',
        'enery': '⚡',
        'atk': '⚔️',
        'poison': '☠️',
        'gold': '💰',
        'draw': '🃏',
        'def': '🛡️'
    };
    return iconMap[icon] || '⚗️';
}

// 获取图标颜色
function getIconColor(icon) {
    const colorMap = {
        'treatment': '#4CAF50',
        'enery': '#FF9800',
        'atk': '#F44336',
        'poison': '#9C27B0',
        'gold': '#FFC107',
        'draw': '#2196F3',
        'def': '#00BCD4'
    };
    return colorMap[icon] || '#4682B4';
}

// 获取效果类型的中文描述
function getEffectText(effect) {
    const effectMap = {
        'health': '恢复生命',
        'energy': '恢复能量',
        'attack': '提升攻击',
        'defense': '提升防御',
        'poison': '中毒效果',
        'gold': '增加金币',
        'draw': '抽取卡牌'
    };
    return effectMap[effect] || effect;
}

// 自适应缩放函数（如果全局不存在则定义）
if (typeof getScaledValue !== 'function') {
    function getScaledValue(value, baseWidth = 800, baseHeight = 1000) {
        const canvas = window.canvas;
        if (!canvas) return value;
        const scaleX = canvas.width / baseWidth;
        const scaleY = canvas.height / baseHeight;
        return value * Math.min(scaleX, scaleY);
    }
}

// 导出到全局作用域
window.introductionUI = {
    drawItemManagement,
    getEffectText,
    getIconSymbol,
    getIconColor
};