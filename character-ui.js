// 角色管理相关UI代码

// 角色详情界面状态
let currentTab = 'basic'; // 基本信息页签

// 绘制角色选择界面（主菜单进入）
function drawCharacterSelect() {
    ctx.fillStyle = '#E6F3FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 存储角色按钮
    const characterButtons = [];
    
    // 角色选项
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const totalCharacters = characters.length;
    const charactersPerRow = 3;
    const characterWidth = getScaledValue(200);
    const characterHeight = getScaledValue(300);
    const horizontalSpacing = getScaledValue(220);
    const verticalSpacing = getScaledValue(330);
    
    // 计算整个角色选择区域的总宽度和总高度
    const totalWidth = Math.min(totalCharacters, charactersPerRow) * characterWidth + (Math.min(totalCharacters, charactersPerRow) - 1) * (horizontalSpacing - characterWidth);
    const totalHeight = Math.ceil(totalCharacters / charactersPerRow) * verticalSpacing + getScaledValue(120); // 120包括标题和按钮高度
    
    // 计算起始位置，使整个角色选择区域在画布中居中
    const startX = (canvasWidth - totalWidth) / 2;
    const startY = (canvasHeight - totalHeight) / 2;
    
    // 标题
    ctx.fillStyle = '#4682B4';
    ctx.font = `${getScaledValue(36)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('角色管理', canvasWidth / 2, startY - getScaledValue(130));
    
    characters.forEach((character, index) => {
        const row = Math.floor(index / charactersPerRow);
        const col = index % charactersPerRow;
        const x = startX + col * horizontalSpacing;
        const y = startY + row * verticalSpacing;
        
        // 创建点击区域，不绘制背景
        const charBtn = function() {
            // 所有角色都跳转到详情界面
            selectedCharacter = character;
            gameState = 'characterDetails';
        };
        
        characterButtons.push({ x: x, y: y, width: characterWidth, height: characterHeight, action: charBtn });
        
        // 绘制角色形象（火柴人模型）
        const centerX = x + characterWidth / 2;
        const charY = y + getScaledValue(60);
        
        // 先绘制背景和属性面板
        // 为属性信息添加背景图
        const panelWidth = getScaledValue(180);
        const panelHeight = getScaledValue(70);
        const panelX = x + getScaledValue(10);
        const panelY = y + getScaledValue(160);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        ctx.strokeStyle = '#4682B4';
        ctx.lineWidth = getScaledValue(2);
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // 绘制角色属性
        ctx.fillStyle = '#000000';
        ctx.font = `${getScaledValue(14)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(`生命值: ${character.health}`, centerX, panelY + getScaledValue(20));
        
        // 添加技能提示文本
        ctx.fillStyle = '#4682B4';
        ctx.font = `${getScaledValue(12)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('技能：点击预览详情', centerX, panelY + getScaledValue(60));
        
        // 绘制角色名称（艺术字效果）
        ctx.font = `${getScaledValue(20)}px cursive`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = getScaledValue(2);
        ctx.strokeText(character.name, centerX, y + getScaledValue(140));
        ctx.fillStyle = '#FFD700';
        ctx.fillText(character.name, centerX, y + getScaledValue(140));
        
        // 最后绘制角色立绘（确保在最上层）
        const avatarSize = getScaledValue(120);
        if (character.id === 'martial_artist') {
            // 为拳法师使用本地图片立绘
            if (character.id === 'martial_artist' && images.martialArtist) {
                ctx.drawImage(
                    images.martialArtist,
                    centerX - avatarSize / 2,
                    charY - avatarSize / 2,
                    avatarSize,
                    avatarSize
                );
            }
        } else if (character.id === 'weapon_master') {
            // 为武器大师使用本地图片立绘
            if (character.id === 'weapon_master' && images.weaponMaster) {
                ctx.drawImage(
                    images.weaponMaster,
                    centerX - avatarSize / 2,
                    charY - avatarSize / 2,
                    avatarSize,
                    avatarSize
                );
            }
        } else if (character.id === 'mage') {
            // 为法师使用本地图片立绘
            if (character.id === 'mage' && images.mage) {
                ctx.drawImage(
                    images.mage,
                    centerX - avatarSize / 2,
                    charY - avatarSize / 2,
                    avatarSize,
                    avatarSize
                );
            }
        }
    });
    
    // 齿轮设置按钮
    const settingsBtnSize = getScaledValue(54);
    const settingsBtnMargin = getScaledValue(50);
    const settingsBtn = drawGearButton(canvas.width - settingsBtnSize - settingsBtnMargin, settingsBtnMargin, settingsBtnSize, settingsBtnSize, () => {
        previousGameState = gameState;
        gameState = 'settings';
    });
    characterButtons.push({ x: canvas.width - settingsBtnSize - settingsBtnMargin, y: settingsBtnMargin, width: settingsBtnSize, height: settingsBtnSize, action: settingsBtn });
    
    // 返回主菜单按钮
    const backBtnY = startY + Math.ceil(totalCharacters / charactersPerRow) * verticalSpacing + getScaledValue(90);
    const backBtnWidth = getScaledValue(200);
    const backBtnHeight = getScaledValue(60);
    const backBtn = drawButton(canvasWidth / 2 - backBtnWidth / 2, backBtnY, backBtnWidth, backBtnHeight, '返回主菜单', () => gameState = 'menu');
    characterButtons.push({ x: canvasWidth / 2 - backBtnWidth / 2, y: backBtnY, width: backBtnWidth, height: backBtnHeight, action: backBtn });
    
    // 存储按钮
    window.characterButtons = characterButtons;
}

// 绘制角色选择界面（地图选择进入）
function drawCharacterSelectForGame() {
    ctx.fillStyle = '#E6F3FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 存储角色按钮
    const characterButtons = [];
    
    // 角色选项
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const totalCharacters = characters.length;
    const charactersPerRow = 3;
    const characterWidth = getScaledValue(200);
    const characterHeight = getScaledValue(300);
    const horizontalSpacing = getScaledValue(220);
    const verticalSpacing = getScaledValue(330);
    
    // 计算整个角色选择区域的总宽度和总高度
    const totalWidth = Math.min(totalCharacters, charactersPerRow) * characterWidth + (Math.min(totalCharacters, charactersPerRow) - 1) * (horizontalSpacing - characterWidth);
    const totalHeight = Math.ceil(totalCharacters / charactersPerRow) * verticalSpacing + getScaledValue(120); // 120包括标题和按钮高度
    
    // 计算起始位置，使整个角色选择区域在画布中居中
    const startX = (canvasWidth - totalWidth) / 2;
    const startY = (canvasHeight - totalHeight) / 2;
    
    // 标题
    ctx.fillStyle = '#4682B4';
    ctx.font = `${getScaledValue(36)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('选择角色', canvasWidth / 2, startY - getScaledValue(130));
    
    characters.forEach((character, index) => {
        const row = Math.floor(index / charactersPerRow);
        const col = index % charactersPerRow;
        const x = startX + col * horizontalSpacing;
        const y = startY + row * verticalSpacing;
        
        // 绘制角色形象（火柴人模型）
        const centerX = x + characterWidth / 2;
        const charY = y + getScaledValue(60);
        
        // 创建点击区域，仅限于头像区域
        const charBtn = function() {
            // 直接选择角色并进入游戏
            selectedCharacter = character;
            playerHealth = character.health;
            // 使用角色的默认技能数据，提取技能名称
            playerSkills = character.skills.map(skill => {
                return typeof skill === 'string' ? skill : skill.name;
            });
            // 重新初始化卡组
            if (typeof initializeDeck === 'function') {
                initializeDeck();
            }
            // 进入游戏后直接开始摸牌
            if (typeof drawCards === 'function') {
                drawCards(6);
            }
            // 重置lastHand，避免手牌变化检测错误
            lastHand = [];
            // 跳转到游戏界面
            gameState = 'game';
        };
        
        // 缩小点击区域，仅限于头像区域
        const avatarSize = getScaledValue(120);
        characterButtons.push({ x: centerX - avatarSize / 2, y: charY - avatarSize / 2, width: avatarSize, height: avatarSize, action: charBtn });
        
        // 先绘制背景和属性面板
        // 为属性信息添加背景图
        const panelWidth = getScaledValue(180);
        const panelHeight = getScaledValue(70);
        const panelX = x + getScaledValue(10);
        const panelY = y + getScaledValue(160);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        ctx.strokeStyle = '#4682B4';
        ctx.lineWidth = getScaledValue(2);
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // 绘制角色属性
        ctx.fillStyle = '#000000';
        ctx.font = `${getScaledValue(14)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(`生命值: ${character.health}`, centerX, panelY + getScaledValue(20));
        
        // 添加选择提示文本（在介绍框下方）
        ctx.fillStyle = '#4682B4';
        ctx.font = `${getScaledValue(12)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('点击头像选择角色', centerX, y + getScaledValue(245));
        
        // 绘制角色名称（艺术字效果）
        ctx.font = `${getScaledValue(20)}px cursive`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = getScaledValue(2);
        ctx.strokeText(character.name, centerX, y + getScaledValue(140));
        ctx.fillStyle = '#FFD700';
        ctx.fillText(character.name, centerX, y + getScaledValue(140));
        
        // 最后绘制角色立绘（确保在最上层）
        if (character.id === 'martial_artist') {
            // 为拳法师使用本地图片立绘
            if (character.id === 'martial_artist' && images.martialArtist) {
                ctx.drawImage(
                    images.martialArtist,
                    centerX - avatarSize / 2,
                    charY - avatarSize / 2,
                    avatarSize,
                    avatarSize
                );
            }
        } else if (character.id === 'weapon_master') {
            // 为武器大师使用本地图片立绘
            if (character.id === 'weapon_master' && images.weaponMaster) {
                ctx.drawImage(
                    images.weaponMaster,
                    centerX - avatarSize / 2,
                    charY - avatarSize / 2,
                    avatarSize,
                    avatarSize
                );
            }
        } else if (character.id === 'mage') {
            // 为法师使用本地图片立绘
            if (character.id === 'mage' && images.mage) {
                ctx.drawImage(
                    images.mage,
                    centerX - avatarSize / 2,
                    charY - avatarSize / 2,
                    avatarSize,
                    avatarSize
                );
            }
        }
    });
    
    // 齿轮设置按钮
    const settingsBtnSize = getScaledValue(54);
    const settingsBtnMargin = getScaledValue(50);
    const settingsBtn = drawGearButton(canvas.width - settingsBtnSize - settingsBtnMargin, settingsBtnMargin, settingsBtnSize, settingsBtnSize, () => {
        previousGameState = gameState;
        gameState = 'settings';
    });
    characterButtons.push({ x: canvas.width - settingsBtnSize - settingsBtnMargin, y: settingsBtnMargin, width: settingsBtnSize, height: settingsBtnSize, action: settingsBtn });
    
    // 返回主菜单按钮
    const backBtnY = startY + Math.ceil(totalCharacters / charactersPerRow) * verticalSpacing + getScaledValue(90);
    const backBtnWidth = getScaledValue(200);
    const backBtnHeight = getScaledValue(60);
    const backBtn = drawButton(canvasWidth / 2 - backBtnWidth / 2, backBtnY, backBtnWidth, backBtnHeight, '返回地图选择', () => gameState = 'mapSelect');
    characterButtons.push({ x: canvasWidth / 2 - backBtnWidth / 2, y: backBtnY, width: backBtnWidth, height: backBtnHeight, action: backBtn });
    
    // 存储按钮
    window.characterButtons = characterButtons;
}

// 角色详情界面状态
window.characterDetailsTab = 0; // 0: 角色信息, 1: 技能
window.skillScrollPosition = 0; // 技能卡片滚动位置

// 绘制雷达图
function drawRadarChart(centerX, centerY, radius, character) {
    // 定义统计数据，所有属性上限为100，按照顺时针方向排列：生命值-法攻-辅助-防御-物攻
    const stats = [
        { name: '生命值', value: character.health, max: 100 },
        { name: '法攻', value: character.ManaAtk, max: 100 },
        { name: '辅助', value: character.support, max: 100 },
        { name: '防御', value: character.defense, max: 100 },
        { name: '物攻', value: character.PhyAtk, max: 100 }
    ];
    
    const angleStep = (Math.PI * 2) / stats.length;
    
    // 绘制网格
    for (let i = 1; i <= 5; i++) {
        const r = radius * (i / 5);
        ctx.beginPath();
        for (let j = 0; j < stats.length; j++) {
            const angle = j * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            if (j === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(70, 130, 180, 0.3)';
        ctx.lineWidth = getScaledValue(1);
        ctx.stroke();
    }
    
    // 绘制轴线
    for (let i = 0; i < stats.length; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgba(70, 130, 180, 0.5)';
        ctx.lineWidth = getScaledValue(1);
        ctx.stroke();
        

    }
    
    // 绘制数据区域
    ctx.beginPath();
    for (let i = 0; i < stats.length; i++) {
        const angle = i * angleStep - Math.PI / 2;
        // 计算标准化值（0-1之间）
        const normalizedValue = Math.max(0, Math.min(1, stats[i].value / stats[i].max));
        const r = radius * normalizedValue;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        
        // 继续绘制雷达图路径
        if (i === 0) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(70, 130, 180, 0.3)';
    ctx.fill();
    ctx.strokeStyle = '#4682B4';
    ctx.lineWidth = getScaledValue(2);
    ctx.stroke();
}

// 绘制角色详情界面
function drawCharacterDetails() {
    ctx.fillStyle = '#E6F3FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (!selectedCharacter) {
        return;
    }
    
    // 清空按钮数组
    const characterButtons = [];
    
    const character = selectedCharacter;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // 绘制标题
    ctx.fillStyle = '#2E7D32';
    ctx.font = `${getScaledValue(36)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(`${character.name} 详情`, canvasWidth / 2, getScaledValue(100)); // 往下移动标题
    
    // 内容区域
    const contentY = getScaledValue(200); // 整个界面往下移动
    const tabWidth = getScaledValue(100);
    const tabHeight = getScaledValue(40);
    const tabX = getScaledValue(20);
    const tabs = ['角色信息', '技能'];
    
    // 计算主框体尺寸（更宽的长方形）
    const mainBoxWidth = getScaledValue(600); // 增加宽度以容纳左右布局
    const mainBoxHeight = canvasHeight * 0.5; // 保持高度
    const mainBoxX = tabX + tabWidth;
    
    // 左侧页签按钮（与主框体连接）
    tabs.forEach((tab, index) => {
        const tabY = contentY + index * tabHeight;
        
        // 绘制页签背景
        ctx.fillStyle = index === window.characterDetailsTab ? '#4682B4' : 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(tabX, tabY, tabWidth, tabHeight);
        ctx.strokeStyle = '#4682B4';
        ctx.lineWidth = getScaledValue(2);
        ctx.strokeRect(tabX, tabY, tabWidth, tabHeight);
        
        // 绘制页签文字
        ctx.fillStyle = index === window.characterDetailsTab ? '#FFFFFF' : '#000000';
        ctx.font = `${getScaledValue(14)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(tab, tabX + tabWidth / 2, tabY + tabHeight / 2 + getScaledValue(5));
        
        // 存储页签按钮
        characterButtons.push({ 
            x: tabX, 
            y: tabY, 
            width: tabWidth, 
            height: tabHeight, 
            action: () => {
                window.characterDetailsTab = index;
            } 
        });
    });
    
    // 绘制内容背景（右侧主框体，与按钮连接）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(mainBoxX, contentY, mainBoxWidth, mainBoxHeight);
    ctx.strokeStyle = '#4682B4';
    ctx.lineWidth = getScaledValue(2);
    ctx.strokeRect(mainBoxX, contentY, mainBoxWidth, mainBoxHeight);
    
    // 右侧内容区域
    const rightContentX = mainBoxX + getScaledValue(20);
    const rightContentWidth = mainBoxWidth - getScaledValue(40);
    
    // 根据选中的页签显示内容
    switch(window.characterDetailsTab) {
        case 0: // 角色信息（三部分布局）
            // 左侧区域（占总宽度的1/2）
            const leftWidth = rightContentWidth / 2;
            const rightWidth = rightContentWidth / 2;
            
            // 左侧上下两层
            const leftTopHeight = mainBoxHeight / 2;
            const leftBottomHeight = mainBoxHeight / 2;
            
            // 右侧上下两层
            const rightTopHeight = mainBoxHeight / 2;
            const rightBottomHeight = mainBoxHeight / 2;
            
            // 1. 左侧上层：人物立绘
            const avatarX = rightContentX + leftWidth / 2;
            const avatarY = contentY + leftTopHeight / 2 + getScaledValue(35); // 立绘往上移动25像素
            
            // 等比例放大立绘，占满整个上层框体
            let characterImage = null;
            if (character.id === 'martial_artist' && images.martialArtist) {
                characterImage = images.martialArtist;
            } else if (character.id === 'weapon_master' && images.weaponMaster) {
                characterImage = images.weaponMaster;
            } else if (character.id === 'mage' && images.mage) {
                characterImage = images.mage;
            }
            
            if (characterImage) {
                // 计算等比例放大的尺寸，完全铺满上层框体
                const maxSize = Math.min(leftWidth, leftTopHeight); // 完全填充，无边距
                const scale = maxSize / Math.max(characterImage.width, characterImage.height);
                const scaledWidth = characterImage.width * scale;
                const scaledHeight = characterImage.height * scale;
                
                // 绘制角色立绘
                ctx.drawImage(
                    characterImage,
                    avatarX - scaledWidth / 2,
                    avatarY - scaledHeight / 2,
                    scaledWidth,
                    scaledHeight
                );
            }
            
            // 2. 左侧下层：人物属性（属性名称+数值条）
            const leftBottomX = rightContentX + getScaledValue(10);
            const leftBottomY = contentY + leftTopHeight + getScaledValue(70) ; // 整体往下移动50像素
            const leftBottomWidth = leftWidth - getScaledValue(20);
            
            // 定义属性列表
            const attributes = [
                { name: '生命值', value: character.health || 0, max: 100 },
                { name: '物攻', value: character.PhyAtk || 0, max: 100 },
                { name: '法攻', value: character.ManaAtk || 0, max: 100 },
                { name: '防御', value: character.defense || 0, max: 100 },
                { name: '辅助', value: character.support || 0, max: 100 }
            ];
            
            // 绘制属性条
            let attributeY = leftBottomY;
            const attributeHeight = getScaledValue(20); // 缩小属性条高度
            const attributeSpacing = getScaledValue(15); // 缩小间距
            
            attributes.forEach(attr => {
                // 绘制属性名称
                ctx.fillStyle = '#000000';
                ctx.font = `${getScaledValue(14)}px Arial`;
                ctx.textAlign = 'left';
                ctx.fillText(attr.name, leftBottomX, attributeY + getScaledValue(15));
                
                // 绘制数值条背景
                const barX = leftBottomX + getScaledValue(50); // 缩短文本和数值条之间的距离
                const maxBarWidth = leftWidth  - getScaledValue(100); // 不超过中心分割线
                const barWidth = maxBarWidth;
                const barHeight = getScaledValue(12);
                
                ctx.fillStyle = '#E0E0E0';
                ctx.fillRect(barX, attributeY + getScaledValue(3), barWidth, barHeight);
                
                // 绘制数值条
                const barFillWidth = (attr.value / attr.max) * barWidth;
                ctx.fillStyle = '#4682B4';
                ctx.fillRect(barX, attributeY + getScaledValue(3), barFillWidth, barHeight);
                
                // 绘制数值
                ctx.fillStyle = '#000000';
                ctx.font = `${getScaledValue(12)}px Arial`;
                ctx.textAlign = 'left';
                ctx.fillText(`${attr.value}`, barX + barWidth + getScaledValue(5), attributeY + getScaledValue(10));
                
                // 移动到下一个属性
                attributeY += attributeHeight + attributeSpacing;
            });
            
            // 3. 右侧上层：角色名称和描述（居中显示）
            const rightX = rightContentX + leftWidth + getScaledValue(10);
            const rightTopY = contentY + getScaledValue(70); // 描述再往下移动50像素
            
            // 角色名称（居中）
            ctx.fillStyle = '#000000';
            ctx.font = `${getScaledValue(20)}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(character.name, rightX + rightWidth / 2, rightTopY);
            
            // 角色描述（居中）
            const descriptionY = rightTopY + getScaledValue(40);
            ctx.font = `${getScaledValue(14)}px Arial`;
            ctx.fillStyle = '#333333';
            
            // 从descriptions中获取描述
            const description = descriptions && descriptions.characters ? descriptions.characters[character.id] || '无描述' : '无描述';
            
            // 文本换行
            const words = description.split('，');
            let lineY = descriptionY;
            words.forEach((word, index) => {
                if (index < 4) { // 限制显示行数
                    ctx.fillText(word, rightX + rightWidth / 2, lineY);
                    lineY += getScaledValue(25);
                }
            });
            
            // 4. 右侧下层：雷达图显示
            const radarChartX = rightX + rightWidth / 2;
            const radarChartRadius = (Math.min(rightWidth / 2, rightBottomHeight / 2) - getScaledValue(10)) * 0.75; // 放大雷达图0.25倍
            // 计算左侧详情底部位置
            const leftDetailsBottom = contentY + leftTopHeight + getScaledValue(20) + getScaledValue(50) + (getScaledValue(15) + getScaledValue(8)) * 5;
            // 调整雷达图Y坐标，使其底部与左侧详情底部在同一条水平线上
            const radarChartY = leftDetailsBottom - radarChartRadius + getScaledValue(50); // 再往下移动雷达图50像素
            
            // 绘制雷达图
            drawRadarChart(radarChartX, radarChartY, radarChartRadius, character);
            break;
            
        case 1: // 技能（技能展示）
            // 技能展示区域
            const skillsY = contentY + getScaledValue(20);
            const skillsHeight = mainBoxHeight - getScaledValue(40);
            const skillWidth = getScaledValue(150);
            const skillHeight = getScaledValue(220);
            const skillSpacing = getScaledValue(30);
            const cardsPerRow = 3;
            
            // 确保skills是数组
            const skills = character.skills || [];
            
            // 绘制技能卡片
            ctx.save();
            ctx.beginPath();
            ctx.rect(rightContentX, skillsY, rightContentWidth, skillsHeight);
            ctx.clip();
            
            skills.forEach((skill, index) => {
                // 计算卡牌位置，一排显示三个，然后往下排列
                const row = Math.floor(index / cardsPerRow);
                const col = index % cardsPerRow;
                const x = rightContentX + (skillWidth + skillSpacing) * col;
                const y = skillsY + (skillHeight + skillSpacing) * row + window.skillScrollPosition;
                
                // 绘制卡牌背景（绿色）
                ctx.fillStyle = '#2E7D32';
                ctx.fillRect(x, y, skillWidth, skillHeight);
                
                // 绘制金色边框
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = getScaledValue(3);
                ctx.strokeRect(x, y, skillWidth, skillHeight);
                
                // 绘制卡牌四个角的装饰
                const cornerSize = getScaledValue(10);
                ctx.fillStyle = '#FFD700';
                // 左上角
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + cornerSize, y);
                ctx.lineTo(x, y + cornerSize);
                ctx.fill();
                // 右上角
                ctx.beginPath();
                ctx.moveTo(x + skillWidth, y);
                ctx.lineTo(x + skillWidth - cornerSize, y);
                ctx.lineTo(x + skillWidth, y + cornerSize);
                ctx.fill();
                // 左下角
                ctx.beginPath();
                ctx.moveTo(x, y + skillHeight);
                ctx.lineTo(x + cornerSize, y + skillHeight);
                ctx.lineTo(x, y + skillHeight - cornerSize);
                ctx.fill();
                // 右下角
                ctx.beginPath();
                ctx.moveTo(x + skillWidth, y + skillHeight);
                ctx.lineTo(x + skillWidth - cornerSize, y + skillHeight);
                ctx.lineTo(x + skillWidth, y + skillHeight - cornerSize);
                ctx.fill();
                
                // 技能名称
                const skillName = typeof skill === 'object' && skill.name ? skill.name : skill;
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + getScaledValue(20), y + getScaledValue(20), skillWidth - getScaledValue(40), getScaledValue(20));
                ctx.fillStyle = '#FFFFFF';
                ctx.font = `${getScaledValue(12)}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText(skillName, x + skillWidth / 2, y + getScaledValue(35));
                
                // 技能描述（放置在中心）
                const description = descriptions && descriptions.skills ? descriptions.skills[skillName] || '无描述' : '无描述';
                ctx.fillStyle = '#FFFFFF';
                ctx.font = `${getScaledValue(12)}px Arial`;
                ctx.textAlign = 'center';
                
                // 拆分描述文本为多行
                const words = description.split('，');
                let lineY = y + getScaledValue(70);
                words.forEach((word, wordIndex) => {
                    if (wordIndex < 4) { // 显示更多行
                        ctx.fillText(word, x + skillWidth / 2, lineY);
                        lineY += getScaledValue(20);
                    }
                });
                
                // 能量点信息（假设能量点为2）
                ctx.fillStyle = '#FFFFFF';
                ctx.font = `${getScaledValue(12)}px Arial`;
                ctx.textAlign = 'right';
                ctx.fillText(`能量点: 2`, x + skillWidth - getScaledValue(15), y + skillHeight - getScaledValue(15));
            });
            
            ctx.restore();
            break;
    }
    
    // 按钮区域
    const btnY = contentY + mainBoxHeight + getScaledValue(60); // 往下移动返回按钮
    
    // 返回按钮
    const backBtn = drawButton(canvasWidth / 2 - getScaledValue(100), btnY, getScaledValue(200), getScaledValue(50), '返回角色选择', () => {
        gameState = 'characterSelect';
        selectedCharacter = null;
        window.characterDetailsTab = 0;
    });
    
    // 添加返回按钮到数组
    characterButtons.push({ 
        x: canvasWidth / 2 - getScaledValue(100), 
        y: btnY, 
        width: getScaledValue(200), 
        height: getScaledValue(50), 
        action: backBtn 
    });
    
    // 存储按钮
    window.characterButtons = characterButtons;
}

// 导出模块到全局作用域
window.characterUI = {
    drawCharacterSelect,
    drawCharacterSelectForGame,
    drawCharacterDetails
};