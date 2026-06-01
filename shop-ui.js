// 商店UI
function drawShopUI() {
    const canvas = globalThis.canvas;
    const ctx = globalThis.ctx;
    const shopItems = globalThis.shopItems || [];
    const gold = globalThis.gold || 0;
    
    // 清空画布
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制标题
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('商店', canvas.width / 2, 50);
    
    // 绘制金币显示
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`金币: ${gold}`, 30, 50);
    
    // 绘制物品网格
    const itemWidth = 180;
    const itemHeight = 220;
    const padding = 20;
    const startX = (canvas.width - (4 * itemWidth + 3 * padding)) / 2;
    const startY = 100;
    
    shopItems.forEach((item, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const x = startX + col * (itemWidth + padding);
        const y = startY + row * (itemHeight + padding);
        
        // 绘制物品背景
        if (item.type === 'card') {
            // 卡牌样式
            const gradient = ctx.createLinearGradient(x, y, x, y + itemHeight);
            gradient.addColorStop(0, '#2c3e50');
            gradient.addColorStop(1, '#1a252f');
            ctx.fillStyle = gradient;
        } else {
            // 药水样式
            const gradient = ctx.createLinearGradient(x, y, x, y + itemHeight);
            gradient.addColorStop(0, '#1e3a5f');
            gradient.addColorStop(1, '#0d2137');
            ctx.fillStyle = gradient;
        }
        
        // 绘制圆角矩形
        ctx.beginPath();
        ctx.roundRect(x, y, itemWidth, itemHeight, 15);
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制物品图标
        const iconSize = 60;
        const iconX = x + (itemWidth - iconSize) / 2;
        const iconY = y + 20;
        
        if (item.type === 'card') {
            // 卡牌图标（剑）
            ctx.fillStyle = '#FF6B6B';
            ctx.beginPath();
            ctx.moveTo(iconX + iconSize/2, iconY + 5);
            ctx.lineTo(iconX + iconSize - 5, iconY + iconSize - 5);
            ctx.lineTo(iconX + iconSize/2, iconY + iconSize - 15);
            ctx.lineTo(iconX + 5, iconY + iconSize - 5);
            ctx.closePath();
            ctx.fill();
        } else {
            // 药水图标（瓶子）
            ctx.fillStyle = '#4ECDC4';
            ctx.beginPath();
            ctx.roundRect(iconX + 15, iconY + 15, 30, 40, 5);
            ctx.fill();
            ctx.fillStyle = '#FFD700';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✦', iconX + iconSize/2, iconY + iconSize/2 + 10);
        }
        
        // 绘制物品名称
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(item.name, x + itemWidth/2, y + 100);
        
        // 绘制物品描述
        ctx.fillStyle = '#aaa';
        ctx.font = '12px Arial';
        ctx.fillText(item.description, x + itemWidth/2, y + 125);
        
        // 绘制价格
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`💰 ${item.price}`, x + itemWidth/2, y + 165);
        
        // 绘制购买按钮
        const buttonX = x + 30;
        const buttonY = y + 180;
        const buttonWidth = itemWidth - 60;
        const buttonHeight = 25;
        
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.roundRect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('购买', x + itemWidth/2, y + 197);
        
        // 记录按钮位置供点击检测
        if (!globalThis.shopButtons) globalThis.shopButtons = [];
        globalThis.shopButtons[index] = {
            x: buttonX,
            y: buttonY,
            width: buttonWidth,
            height: buttonHeight,
            itemIndex: index
        };
    });
    
    // 绘制关闭按钮
    const closeButtonX = canvas.width - 120;
    const closeButtonY = 30;
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.roundRect(closeButtonX, closeButtonY, 100, 40, 5);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('离开商店', closeButtonX + 50, closeButtonY + 27);
    
    // 记录关闭按钮位置
    globalThis.shopButtons.push({
        x: closeButtonX,
        y: closeButtonY,
        width: 100,
        height: 40,
        action: 'close'
    });
    
    // 绘制刷新按钮
    const refreshButtonX = canvas.width - 240;
    ctx.fillStyle = '#9b59b6';
    ctx.beginPath();
    ctx.roundRect(refreshButtonX, closeButtonY, 100, 40, 5);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('刷新 (10💰)', refreshButtonX + 50, closeButtonY + 27);
    
    globalThis.shopButtons.push({
        x: refreshButtonX,
        y: closeButtonY,
        width: 100,
        height: 40,
        action: 'refresh'
    });
}

// 处理商店点击
function handleShopClick(x, y) {
    const buttons = globalThis.shopButtons || [];
    
    for (const button of buttons) {
        if (x >= button.x && x <= button.x + button.width &&
            y >= button.y && y <= button.y + button.height) {
            
            if (button.action === 'close') {
                globalThis.closeShop();
            } else if (button.action === 'refresh') {
                globalThis.refreshShop();
            } else {
                const success = globalThis.buyItem(button.itemIndex);
                if (!success) {
                    if (typeof globalThis.battleLog !== 'undefined') {
                        globalThis.battleLog.push('金币不足！');
                    }
                }
            }
            break;
        }
    }
}

// 暴露到全局
globalThis.drawShopUI = drawShopUI;
globalThis.handleShopClick = handleShopClick;