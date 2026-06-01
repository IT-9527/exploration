// UI相关代码

// 引入Node.js文件系统模块
const fs = require('fs');
const path = require('path');

// 从全局作用域获取游戏状态变量

// 存档数据
let gameSaves = [];
const MAX_SAVES = 5;
window.currentSaveId = null;

// 存档文件路径
const saveFilePath = path.join(__dirname, 'saves.json');

// 卡牌特效变量
let cardEffects = []; // 存储卡牌飞入特效的状态
let lastHand = []; // 存储上一次的手牌，用于检测手牌变化
let cardsWithCompletedEffects = new Set(); // 存储已完成特效的卡牌
let isUsingCard = false; // 标记是否是使用卡牌导致的手牌变化

// 按钮存储
window.loadGameButtons = [];

// 绘制通用按钮（根据图片设计）
function drawStyledButton(x, y, width, height, text, type, onClick) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const buttonKey = `${type}-${x}-${y}-${width}-${height}`;
    const borderRadius = 25;
    
    // 绘制按钮阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    roundedRect(ctx, x + 3, y + 3, width, height, borderRadius);
    ctx.fill();
    
    // 绘制按钮背景（棕色渐变效果）
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, '#D2B48C');
    gradient.addColorStop(1, '#A0522D');
    ctx.fillStyle = gradient;
    roundedRect(ctx, x, y, width, height, borderRadius);
    ctx.fill();
    
    // 绘制按钮边框
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    roundedRect(ctx, x, y, width, height, borderRadius);
    ctx.stroke();
    
    // 绘制文字
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // 绘制文字描边
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.strokeText(text, centerX, centerY);
    // 绘制文字填充
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, centerX, centerY);
    
    // 绘制装饰元素 - 已移除所有装饰图标
    switch(type) {
        case 'start':
            // 开始游戏按钮 - 无装饰
            break;
            
        case 'character':
            // 角色管理按钮 - 无装饰
            break;
            
        case 'exit':
            // 退出游戏按钮 - 无装饰
            break;
    }
    
    // 处理按钮点击
    return function() {
        if (onClick) {
            // 创建按钮特效
            buttonEffects[buttonKey] = {
                x: centerX,
                y: centerY,
                size: Math.min(width, height) * 0.3,
                maxSize: Math.min(width, height) * 2
            };
            
            // 强制立即绘制一帧
            drawUI();
            
            // 执行onClick
            onClick();
        }
    };
}

// 绘制设置按钮
function drawGearButton(x, y, width, height, onClick) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2;
    const buttonKey = `gear-${x}-${y}-${width}-${height}`;
    
    // 绘制按钮背景（棕色渐变）
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, '#D2B48C');
    gradient.addColorStop(1, '#A0522D');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制按钮边框
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 绘制三横线+圆点样式
    const lineCount = 3;
    const lineHeight = height * 0.12;
    const lineWidth = width * 0.4;
    const dotRadius = width * 0.08;
    const lineSpacing = height * 0.18;
    const totalHeight = (lineCount - 1) * lineSpacing;
    
    for (let i = 0; i < lineCount; i++) {
        const lineY = centerY - totalHeight / 2 + i * lineSpacing;
        const offset = width * 0.1;
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
    
    // 处理按钮点击
    return function() {
        if (onClick) {
            // 创建按钮特效
            buttonEffects[buttonKey] = {
                x: centerX,
                y: centerY,
                size: Math.min(width, height) * 0.3,
                maxSize: Math.min(width, height) * 2
            };
            
            // 强制立即绘制一帧
            drawUI();
            
            // 执行onClick
            onClick();
        }
    };
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

// 加载存档数据
function loadSaveData() {
    try {
        if (fs.existsSync(saveFilePath)) {
            const savedData = fs.readFileSync(saveFilePath, 'utf8');
            if (savedData) {
                gameSaves = JSON.parse(savedData);
                console.log('从文件加载存档成功:', gameSaves.length, '个存档');
            }
        } else {
            console.log('存档文件不存在，创建新的存档文件');
            fs.writeFileSync(saveFilePath, JSON.stringify(gameSaves, null, 2));
        }
    } catch (error) {
        console.error('加载存档失败:', error);
        gameSaves = [];
    }
}

// 保存游戏
function saveGame() {
    console.log('保存游戏开始:', { selectedCharacter: window.selectedCharacter, currentFloor, playerLevel, currentSaveId: window.currentSaveId });
    if (!window.selectedCharacter) {
        console.log('保存失败：没有选择角色');
        return false;
    }
    
    // 检查当前存档是否属于同一个角色
    let sameCharacter = false;
    if (window.currentSaveId) {
        const currentSave = gameSaves.find(s => s.id === window.currentSaveId);
        if (currentSave && currentSave.character && currentSave.character.id === window.selectedCharacter.id) {
            sameCharacter = true;
        }
    }
    
    const saveData = {
        id: sameCharacter ? window.currentSaveId : Date.now(),
        timestamp: new Date().toLocaleString(),
        character: window.selectedCharacter,
        currentFloor,
        playerLevel,
        playerExp,
        playerHealth,
        playerEnergy,
        playerSkills,
        playerItems,
        selectedMap,
        unlockedCharacters,
        unlockedDifficulties,
        clearedLevels: Array.from(clearedLevels)
    };
    
    console.log('创建存档数据:', saveData);
    
    if (sameCharacter && window.currentSaveId) {
        // 覆盖原存档（同一角色）
        const saveIndex = gameSaves.findIndex(s => s.id === window.currentSaveId);
        if (saveIndex !== -1) {
            gameSaves[saveIndex] = saveData;
            console.log('覆盖存档:', window.currentSaveId);
        } else {
            // 如果找不到存档，创建新存档
            gameSaves.unshift(saveData);
            window.currentSaveId = saveData.id;
            console.log('找不到存档，创建新存档:', window.currentSaveId);
        }
    } else {
        // 创建新存档（不同角色或无存档）
        gameSaves.unshift(saveData);
        window.currentSaveId = saveData.id;
        console.log('创建新存档:', window.currentSaveId);
    }
    
    // 限制存档数量
    if (gameSaves.length > MAX_SAVES) {
        gameSaves = gameSaves.slice(0, MAX_SAVES);
        console.log('限制存档数量后:', gameSaves.length);
    }
    
    // 保存到文件系统
    try {
        fs.writeFileSync(saveFilePath, JSON.stringify(gameSaves, null, 2));
        console.log('保存到文件系统成功');
    } catch (error) {
        console.error('保存到文件系统失败:', error);
        return false;
    }
    
    return true;
}

// 加载游戏
function loadGame(saveId) {
    const save = gameSaves.find(s => s.id === saveId);
    if (!save) return false;
    
    // 记录当前存档ID
    window.currentSaveId = saveId;
    console.log('加载存档:', saveId);
    
    // 恢复游戏状态
    window.selectedCharacter = save.character;
    currentFloor = save.currentFloor;
    playerLevel = save.playerLevel;
    playerExp = save.playerExp;
    playerHealth = save.playerHealth;
    playerEnergy = save.playerEnergy;
    // 确保playerSkills是技能名称字符串数组
    playerSkills = save.playerSkills.map(skill => {
        return typeof skill === 'string' ? skill : skill.name;
    });
    playerItems = save.playerItems;
    selectedMap = save.selectedMap;
    unlockedCharacters = save.unlockedCharacters;
    unlockedDifficulties = save.unlockedDifficulties;
    clearedLevels = new Set(save.clearedLevels);
    
    // 重新初始化卡组
    if (typeof initializeDeck === 'function') {
        initializeDeck();
    }
    
    // 加载存档后直接开始摸牌
    if (typeof drawCards === 'function') {
        drawCards(6);
    }
    
    return true;
}

// 删除存档
function deleteSave(saveId) {
    gameSaves = gameSaves.filter(s => s.id !== saveId);
    try {
        fs.writeFileSync(saveFilePath, JSON.stringify(gameSaves, null, 2));
        console.log('删除存档并保存到文件系统成功');
    } catch (error) {
        console.error('删除存档后保存失败:', error);
    }
}

// 加载存档数据 - 暂时注释掉，避免在game.js加载完成前执行
// loadSaveData();

// 自适应缩放函数
function getScaledValue(value, baseWidth = 800, baseHeight = 1000) {
    const scaleX = canvas.width / baseWidth;
    const scaleY = canvas.height / baseHeight;
    return value * Math.min(scaleX, scaleY);
}

// 将getScaledValue暴露到全局作用域
window.getScaledValue = getScaledValue;

// 绘制UI
function drawUI() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    console.log('drawUI called, gameState:', window.gameState);
    
    switch(window.gameState) {
        case 'menu':
            drawMenu();
            break;
        case 'mapSelect':
            drawMapSelect();
            break;
        case 'characterSelect':
            // 根据来源决定调用哪个角色选择函数
            if (characterSelectSource === 'map') {
                // 从地图选择进入，使用游戏角色选择界面
                drawCharacterSelectForGame();
            } else {
                // 从主菜单进入，使用角色管理界面
                drawCharacterSelect();
            }
            break;
        case 'characterDetails':
            drawCharacterDetails();
            break;
        case 'game':
            drawGameUI();
            break;
        case 'battle':
            drawBattleUI();
            break;
        case 'gameOver':
            drawGameOver();
            break;
        case 'victory':
            drawVictory();
            break;
        case 'settings':
            drawSettings();
            break;
        case 'confirmSave':
            drawConfirmSave();
            break;
        case 'loadGame':
            drawLoadGame();
            break;
        case 'itemManagement':
            window.introductionUI.drawItemManagement();
            break;
        case 'deckView':
            // 暂时返回战斗界面，因为 drawDeckView 函数还未定义
            window.gameState = 'battle';
            break;
        case 'discardView':
            // 暂时返回战斗界面，因为 drawDiscardView 函数还未定义
            window.gameState = 'battle';
            break;
    }
}

// 绘制菜单
function drawMenu() {
    // 浅蓝色背景
    ctx.fillStyle = '#E6F3FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 标题
    ctx.fillStyle = '#4682B4';
    ctx.font = `${getScaledValue(48)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('地牢探险', canvas.width / 2, getScaledValue(200));
    
    // 按钮尺寸
    const buttonWidth = getScaledValue(200);
    const buttonHeight = getScaledValue(60);
    const buttonSpacing = getScaledValue(100);
    const buttonYStart = getScaledValue(350);
    
    // 按钮
    const startGameBtn = drawStyledButton(canvas.width / 2 - buttonWidth / 2, buttonYStart, buttonWidth, buttonHeight, '开始游戏', 'start', () => {
        characterSelectSource = 'map'; // 标记从地图选择进入
        window.gameState = 'mapSelect';
    });
    const characterBtn = drawStyledButton(canvas.width / 2 - buttonWidth / 2, buttonYStart + buttonSpacing, buttonWidth, buttonHeight, '角色管理', 'character', () => {
        characterSelectSource = 'menu'; // 标记从主菜单进入
        window.gameState = 'characterSelect';
    });
    const saveBtn = drawStyledButton(canvas.width / 2 - buttonWidth / 2, buttonYStart + buttonSpacing * 2, buttonWidth, buttonHeight, '存档', 'save', () => {
        if (window.gameState === 'game' && window.selectedCharacter) {
            if (saveGame()) {
                alert('游戏已存档');
            } else {
                alert('没有可保存的游戏进度');
            }
        } else {
            window.gameState = 'loadGame';
        }
    });
    
    // 道具管理按钮
    const itemBtn = drawStyledButton(canvas.width / 2 - buttonWidth / 2, buttonYStart + buttonSpacing * 3, buttonWidth, buttonHeight, '道具管理', 'item', () => {
        window.gameState = 'itemManagement';
    });
    
    // 齿轮设置按钮
    const settingsBtnSize = getScaledValue(54);
    const settingsBtnMargin = getScaledValue(50);
    const settingsBtn = drawGearButton(canvas.width - settingsBtnSize - settingsBtnMargin, settingsBtnMargin, settingsBtnSize, settingsBtnSize, () => {
        window.previousGameState = window.gameState;
        window.gameState = 'settings';
    });
    
    // 存储按钮信息
    console.log('=== Setting menu buttons ===');
    console.log('buttonWidth:', buttonWidth);
    console.log('buttonHeight:', buttonHeight);
    console.log('buttonSpacing:', buttonSpacing);
    console.log('buttonYStart:', buttonYStart);
    console.log('canvas.width:', canvas.width);
    
    window.menuButtons = [
        { x: canvas.width / 2 - buttonWidth / 2, y: buttonYStart, width: buttonWidth, height: buttonHeight, action: function() { 
            console.log('Before click - window.gameState:', window.gameState);
            window.characterSelectSource = 'map';
            window.gameState = 'mapSelect';
            console.log('After click - window.gameState:', window.gameState);
        } },
        { x: canvas.width / 2 - buttonWidth / 2, y: buttonYStart + buttonSpacing, width: buttonWidth, height: buttonHeight, action: function() { 
            window.characterSelectSource = 'menu';
            window.gameState = 'characterSelect';
            console.log('Character clicked, gameState:', window.gameState);
        } },
        { x: canvas.width / 2 - buttonWidth / 2, y: buttonYStart + buttonSpacing * 2, width: buttonWidth, height: buttonHeight, action: function() { 
            const currentSelectedCharacter = window.selectedCharacter;
            if (window.gameState === 'game' && currentSelectedCharacter) { 
                if (typeof saveGame === 'function' && saveGame()) { alert('游戏已存档'); } 
                else { alert('没有可保存的游戏进度'); } 
            } else { 
                window.gameState = 'loadGame';
            }
            console.log('Save clicked, gameState:', window.gameState);
        } },
        { x: canvas.width / 2 - buttonWidth / 2, y: buttonYStart + buttonSpacing * 3, width: buttonWidth, height: buttonHeight, action: function() { 
            window.gameState = 'itemManagement';
            console.log('Item clicked, gameState:', window.gameState);
        } },
        { x: canvas.width - settingsBtnSize - settingsBtnMargin, y: settingsBtnMargin, width: settingsBtnSize, height: settingsBtnSize, action: function() { 
            window.previousGameState = window.gameState;
            window.gameState = 'settings';
            console.log('Settings clicked, gameState:', window.gameState);
        } }
    ];
}

// 绘制地图选择
function drawMapSelect() {
    ctx.fillStyle = '#E6F3FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 标题
    ctx.fillStyle = '#4682B4';
    ctx.font = `${getScaledValue(36)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('选择地图', canvas.width / 2, getScaledValue(100));
    
    // 存储地图按钮
    mapButtons = [];
    
    // 地图选项
    const mapButtonWidth = getScaledValue(300);
    const mapButtonHeight = getScaledValue(80);
    const mapButtonSpacing = getScaledValue(120);
    const mapButtonYStart = getScaledValue(200);
    
    maps.forEach((map, index) => {
        const y = mapButtonYStart + index * mapButtonSpacing;
        const mapBtn = drawButton(canvas.width / 2 - mapButtonWidth / 2, y, mapButtonWidth, mapButtonHeight, `${map.name} (${map.difficulty})`, 
            map.unlocked ? () => {
                selectedMap = map.id;
                characterSelectSource = 'map'; // 标记从地图选择进入
                window.gameState = 'characterSelect';
            } : () => {
                alert('地图尚未解锁，请通关上一关卡');
            });
        
        mapButtons.push({ x: canvas.width / 2 - mapButtonWidth / 2, y: y, width: mapButtonWidth, height: mapButtonHeight, action: mapBtn });
        
        if (!map.unlocked) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(canvas.width / 2 - mapButtonWidth / 2, y, mapButtonWidth, mapButtonHeight);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `${getScaledValue(20)}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('未解锁', canvas.width / 2, y + mapButtonHeight / 2);
        }
    });
    
    // 齿轮设置按钮
    const settingsBtnSize = getScaledValue(54);
    const settingsBtnMargin = getScaledValue(50);
    const settingsBtn = drawGearButton(canvas.width - settingsBtnSize - settingsBtnMargin, settingsBtnMargin, settingsBtnSize, settingsBtnSize, () => {
        window.previousGameState = window.gameState;
        window.gameState = 'settings';
    });
    mapButtons.push({ x: canvas.width - settingsBtnSize - settingsBtnMargin, y: settingsBtnMargin, width: settingsBtnSize, height: settingsBtnSize, action: settingsBtn });
    
    // 返回主菜单按钮
    const backBtnWidth = getScaledValue(200);
    const backBtnHeight = getScaledValue(60);
    const backBtnY = getScaledValue(600);
    const backBtn = drawButton(canvas.width / 2 - backBtnWidth / 2, backBtnY, backBtnWidth, backBtnHeight, '返回主菜单', () => window.gameState = 'menu');
    mapButtons.push({ x: canvas.width / 2 - backBtnWidth / 2, y: backBtnY, width: backBtnWidth, height: backBtnHeight, action: backBtn });
}



// 绘制角色管理界面
function drawCharacterSelect() {
    ctx.fillStyle = '#E6F3FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 存储角色按钮到全局变量
    window.characterButtons = [];
    
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
            window.selectedCharacterDetails = character;
            window.gameState = 'characterDetails';
        };
        
        window.characterButtons.push({ x: x, y: y, width: characterWidth, height: characterHeight, action: charBtn });
        
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
        window.previousGameState = window.gameState;
        window.gameState = 'settings';
    });
    window.characterButtons.push({ x: canvas.width - settingsBtnSize - settingsBtnMargin, y: settingsBtnMargin, width: settingsBtnSize, height: settingsBtnSize, action: settingsBtn });
    
    // 返回主菜单按钮
    const backBtnY = startY + Math.ceil(totalCharacters / charactersPerRow) * verticalSpacing + getScaledValue(90);
    const backBtnWidth = getScaledValue(200);
    const backBtnHeight = getScaledValue(60);
    const backBtn = drawButton(canvasWidth / 2 - backBtnWidth / 2, backBtnY, backBtnWidth, backBtnHeight, '返回主菜单', () => window.gameState = 'menu');
    window.characterButtons.push({ x: canvasWidth / 2 - backBtnWidth / 2, y: backBtnY, width: backBtnWidth, height: backBtnHeight, action: backBtn });
}

// 绘制开始游戏时的角色选择界面
function drawCharacterSelectForGame() {
    ctx.fillStyle = '#E6F3FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 存储角色按钮
    characterButtons = [];
    
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
    ctx.fillText('角色选择', canvasWidth / 2, startY - getScaledValue(130));
    
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
            window.selectedCharacter = character;
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
            window.gameState = 'game';
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
        window.previousGameState = window.gameState;
        window.gameState = 'settings';
    });
    window.characterButtons.push({ x: canvas.width - settingsBtnSize - settingsBtnMargin, y: settingsBtnMargin, width: settingsBtnSize, height: settingsBtnSize, action: settingsBtn });
    
    // 返回主菜单按钮
    const backBtnY = startY + Math.ceil(totalCharacters / charactersPerRow) * verticalSpacing + getScaledValue(90);
    const backBtnWidth = getScaledValue(200);
    const backBtnHeight = getScaledValue(60);
    const backBtn = drawButton(canvasWidth / 2 - backBtnWidth / 2, backBtnY, backBtnWidth, backBtnHeight, '返回主菜单', () => window.gameState = 'menu');
    window.characterButtons.push({ x: canvasWidth / 2 - backBtnWidth / 2, y: backBtnY, width: backBtnWidth, height: backBtnHeight, action: backBtn });
}

// 绘制游戏UI
function drawGameUI() {
    // 调试：输出函数调用
    console.log('drawGameUI called');
    
    // 自适应设置
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
    
    // 绘制楼层信息
    const floorInfoX = canvasWidth * 0.35;
    const floorInfoY = getScaledValue(30);
    const floorInfoWidth = canvasWidth * 0.3;
    const floorInfoHeight = getScaledValue(60);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(floorInfoX, floorInfoY, floorInfoWidth, floorInfoHeight);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${getScaledValue(24)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`当前在第${currentFloor}/${totalFloors}层`, canvasWidth * 0.5, floorInfoY + floorInfoHeight / 2);
    
    // 绘制玩家信息
    if (window.selectedCharacter) {
        const playerInfoX = getScaledValue(20);
        const playerInfoY = getScaledValue(150);
        const playerInfoWidth = getScaledValue(250);
        const playerInfoHeight = getScaledValue(150);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(playerInfoX, playerInfoY, playerInfoWidth, playerInfoHeight);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${getScaledValue(14)}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`角色: ${window.selectedCharacter.name}`, playerInfoX + getScaledValue(10), playerInfoY + getScaledValue(10));
        ctx.fillText(`等级: ${playerLevel}`, playerInfoX + getScaledValue(10), playerInfoY + getScaledValue(40));
        ctx.fillText(`生命值: ${playerHealth}`, playerInfoX + getScaledValue(10), playerInfoY + getScaledValue(70));
        ctx.fillText(`能量: ${playerEnergy}`, playerInfoX + getScaledValue(10), playerInfoY + getScaledValue(100));
    }
    
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
        window.previousGameState = window.gameState;
        window.gameState = 'settings';
    }});
    
    // 更新平台点击特效
    if (typeof updatePlatformEffect === 'function') {
        updatePlatformEffect();
    }
    
    // 绘制平台点击特效
    if (typeof drawPlatformEffect === 'function') {
        drawPlatformEffect();
    }
}

// 绘制战斗UI
function drawBattleUI() {
    // 修改背景色为亮色
    ctx.fillStyle = '#E6F3FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // 绘制战斗背景主框体（用于显示战斗动画及特效）
    const battleBoxX = getScaledValue(50);
    const battleBoxY = getScaledValue(150); // 往上移动50像素
    const battleBoxWidth = canvasWidth - getScaledValue(100);
    const battleBoxHeight = canvasHeight - getScaledValue(350); // 缩小主框体高度
    
    // 绘制框体背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(battleBoxX, battleBoxY, battleBoxWidth, battleBoxHeight);
    
    // 绘制框体边框
    ctx.strokeStyle = '#4682B4';
    ctx.lineWidth = getScaledValue(2);
    ctx.strokeRect(battleBoxX, battleBoxY, battleBoxWidth, battleBoxHeight);
    
    // 玩家位置（左侧，位于战斗框体内）
    const playerX = battleBoxX + battleBoxWidth * 0.25;
    const playerY = battleBoxY + battleBoxHeight / 2;
    
    // 敌人位置（右侧，位于战斗框体内）
    const enemyX = battleBoxX + battleBoxWidth * 0.75;
    const enemyY = battleBoxY + battleBoxHeight / 2;
    
    // 绘制玩家信息（包含到主框体内并调整大小）
    if (window.selectedCharacter) {
        // 玩家信息面板位置（位于战斗框体内）
        const panelX = battleBoxX + getScaledValue(20);
        const panelY = battleBoxY + getScaledValue(20);
        const panelWidth = getScaledValue(250); // 宽度调整到250
        const panelHeight = getScaledValue(68); // 保持高度不变
        
        // 绘制面板背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // 绘制圆形头像框
        const avatarRadius = getScaledValue(22); // 保持大小不变
        const avatarX = panelX + getScaledValue(28);
        const avatarY = panelY + getScaledValue(34);
        
        // 绘制圆形边框
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = getScaledValue(2);
        ctx.stroke();
        
        // 绘制圆形裁剪区域
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
        ctx.clip();
        
        // 尝试使用角色图片
        let characterImage = null;
        if (window.selectedCharacter.id === 'martial_artist' && images.martialArtist) {
            characterImage = images.martialArtist;
        } else if (window.selectedCharacter.id === 'mage' && images.mage) {
            characterImage = images.mage;
        } else if (window.selectedCharacter.id === 'weapon_master' && images.weaponMaster) {
            characterImage = images.weaponMaster;
        }
        
        if (characterImage) {
            const scale = (avatarRadius * 2) / Math.max(characterImage.width, characterImage.height);
            const scaledWidth = characterImage.width * scale;
            const scaledHeight = characterImage.height * scale;
            
            ctx.drawImage(
                characterImage,
                avatarX - scaledWidth / 2,
                avatarY - scaledHeight / 2,
                scaledWidth,
                scaledHeight
            );
        } else {
            // 如果没有图片，使用火柴人
            drawStickman(avatarX, avatarY, avatarRadius * 2);
        }
        
        ctx.restore();
        
        // 绘制角色名称（不显示等级）
        const nameX = panelX + getScaledValue(65);
        const nameY = panelY + getScaledValue(18);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${getScaledValue(16)}px Arial`; // 放大字体
        ctx.textAlign = 'left';
        ctx.fillText(window.selectedCharacter.name, nameX, nameY);
        
        // 绘制属性条
        const statsY = panelY + getScaledValue(42);
        const statBarWidth = getScaledValue(150); // 状态栏宽度调整到150
        const statBarHeight = getScaledValue(8); // 稍微增加高度
        
        // 绘制血量条
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${getScaledValue(11)}px Arial`; // 放大字体
        ctx.fillText('HP:', nameX, statsY);
        
        const healthBarX = nameX + getScaledValue(24.2); // 字体放大后相应调整位置
        const healthBarY = statsY - getScaledValue(5);
        
        // 血量条背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(healthBarX, healthBarY, statBarWidth, statBarHeight);
        
        // 血量条
        const healthPercentage = Math.max(0, playerHealth / window.selectedCharacter.health);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(healthBarX, healthBarY, statBarWidth * healthPercentage, statBarHeight);
        
        // 血量文本
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${getScaledValue(9)}px Arial`; // 放大字体
        ctx.textAlign = 'right';
        ctx.fillText(`${playerHealth}/${window.selectedCharacter.health}`, healthBarX + statBarWidth + getScaledValue(4), statsY);
        
        // 绘制能量条
        const energyY = statsY + getScaledValue(16);
        const energyCount = playerEnergy;
        const maxEnergy = 10;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${getScaledValue(11)}px Arial`; // 放大字体
        ctx.textAlign = 'left';
        ctx.fillText('SP:', nameX, energyY);
        
        const energyBarX = nameX + getScaledValue(24.2); // 字体放大后相应调整位置
        const energyBarY = energyY - getScaledValue(5);
        
        // 能量方块宽度和间距调整，不要分割太开
        const blockWidth = getScaledValue(12); // 稍微增加方块宽度
        const totalBlockWidth = maxEnergy * blockWidth;
        const availableSpace = statBarWidth - totalBlockWidth;
        const blockSpacing = availableSpace / (maxEnergy + 1); // 调整间距，使方块更紧凑
        
        // 绘制能量方块
        for (let i = 0; i < maxEnergy; i++) {
            const blockX = energyBarX + blockSpacing + i * (blockWidth + blockSpacing);
            ctx.fillStyle = i < energyCount ? '#FFD700' : 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(blockX, energyBarY, blockWidth, statBarHeight);
        }
        
        // 能量文本
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${getScaledValue(9)}px Arial`; // 放大字体
        ctx.textAlign = 'right';
        ctx.fillText(`${energyCount}/${maxEnergy}`, energyBarX + statBarWidth + getScaledValue(4), energyY);
    }
    
    // 绘制敌人信息（包含到主框体内并调整大小）
    if (currentEnemy) {
        // 敌人信息面板位置（位于战斗框体内）
        const panelX = battleBoxX + battleBoxWidth - getScaledValue(270); // 调整位置以适应新的宽度
        const panelY = battleBoxY + getScaledValue(20);
        const panelWidth = getScaledValue(250); // 宽度调整到250
        const panelHeight = getScaledValue(68); // 保持高度不变
        
        // 绘制面板背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // 绘制圆形头像框
        const avatarRadius = getScaledValue(22); // 保持大小不变
        const avatarX = panelX + getScaledValue(28);
        const avatarY = panelY + getScaledValue(34);
        
        // 绘制圆形边框
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = getScaledValue(2);
        ctx.stroke();
        
        // 绘制圆形裁剪区域
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
        ctx.clip();
        
        // 绘制敌人火柴人头像
        drawStickman(avatarX, avatarY, avatarRadius * 2);
        
        ctx.restore();
        
        // 绘制敌人名称（不显示等级）
        const nameX = panelX + getScaledValue(65);
        const nameY = panelY + getScaledValue(18);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${getScaledValue(16)}px Arial`; // 放大字体
        ctx.textAlign = 'left';
        ctx.fillText(currentEnemy.name, nameX, nameY);
        
        // 绘制属性条
        const statsY = panelY + getScaledValue(42);
        const statBarWidth = getScaledValue(150); // 状态栏宽度调整到150
        const statBarHeight = getScaledValue(8); // 稍微增加高度
        
        // 绘制血量条
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${getScaledValue(11)}px Arial`; // 放大字体
        ctx.fillText('HP:', nameX, statsY);
        
        const healthBarX = nameX + getScaledValue(24.2); // 字体放大后相应调整位置
        const healthBarY = statsY - getScaledValue(5);
        
        // 血量条背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(healthBarX, healthBarY, statBarWidth, statBarHeight);
        
        // 血量条
        const healthPercentage = Math.max(0, currentEnemy.health / currentEnemy.maxHealth);
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(healthBarX, healthBarY, statBarWidth * healthPercentage, statBarHeight);
        
        // 血量文本
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${getScaledValue(9)}px Arial`; // 放大字体
        ctx.textAlign = 'right';
        ctx.fillText(`${currentEnemy.health}/${currentEnemy.maxHealth}`, healthBarX + statBarWidth + getScaledValue(4), statsY);
        
        // 绘制能量条（如果敌人有能量）
        if (currentEnemy.energy !== undefined) {
            const energyY = statsY + getScaledValue(16);
            const energyCount = currentEnemy.energy;
            const maxEnergy = 10;
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `${getScaledValue(11)}px Arial`; // 放大字体
            ctx.textAlign = 'left';
            ctx.fillText('SP:', nameX, energyY);
            
            const energyBarX = nameX + getScaledValue(24.2); // 字体放大后相应调整位置
            const energyBarY = energyY - getScaledValue(5);
            
            // 能量方块宽度和间距调整，不要分割太开
            const blockWidth = getScaledValue(12); // 稍微增加方块宽度
            const totalBlockWidth = maxEnergy * blockWidth;
            const availableSpace = statBarWidth - totalBlockWidth;
            const blockSpacing = availableSpace / (maxEnergy + 1); // 调整间距，使方块更紧凑
            
            // 绘制能量方块
            for (let i = 0; i < maxEnergy; i++) {
                const blockX = energyBarX + blockSpacing + i * (blockWidth + blockSpacing);
                ctx.fillStyle = i < energyCount ? '#FF0000' : 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(blockX, energyBarY, blockWidth, statBarHeight);
            }
            
            // 能量文本
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `${getScaledValue(9)}px Arial`; // 放大字体
            ctx.textAlign = 'right';
            ctx.fillText(`${energyCount}/${maxEnergy}`, energyBarX + statBarWidth + getScaledValue(4), energyY);
        }
    }
    
    // 绘制战斗日志（不使用黑色框，直接显示文本）
    const logX = battleBoxX + getScaledValue(20);
    const logY = battleBoxY + getScaledValue(100);
    
    ctx.fillStyle = '#000000';
    ctx.font = `${getScaledValue(16)}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    battleLog.forEach((log, index) => {
        ctx.fillText(log, logX, logY + index * getScaledValue(30));
    });
    
    // 存储战斗界面按钮
    battleButtons = [];
    
    // 绘制左侧卡组（位于战斗框体内，自适应缩小）
    const deckX = battleBoxX + getScaledValue(20);
    const deckY = battleBoxY + battleBoxHeight - getScaledValue(120);
    const deckWidth = getScaledValue(50);
    const deckHeight = getScaledValue(100);
    
    // 绘制卡组背景
    ctx.fillStyle = 'rgba(139, 69, 19, 0.8)'; // 棕色背景
    ctx.fillRect(deckX, deckY, deckWidth, deckHeight);
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = getScaledValue(2);
    ctx.strokeRect(deckX, deckY, deckWidth, deckHeight);
    
    // 绘制卡组文本
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${getScaledValue(10)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`卡组: ${typeof deck !== 'undefined' ? deck.length : 0}`, deckX + deckWidth / 2, deckY + deckHeight / 2);
    
    // 添加卡组点击事件
    battleButtons.push({
        x: deckX,
        y: deckY,
        width: deckWidth,
        height: deckHeight,
        action: () => {
            window.previousGameState = window.gameState;
            window.gameState = 'deckView';
        }
    });
    
    // 绘制右侧消耗牌区（位于战斗框体内，自适应缩小）
    const discardX = battleBoxX + battleBoxWidth - getScaledValue(70);
    const discardY = battleBoxY + battleBoxHeight - getScaledValue(120);
    const discardWidth = getScaledValue(50);
    const discardHeight = getScaledValue(100);
    
    // 绘制消耗牌区背景
    ctx.fillStyle = 'rgba(128, 128, 128, 0.8)'; // 灰色背景
    ctx.fillRect(discardX, discardY, discardWidth, discardHeight);
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = getScaledValue(2);
    ctx.strokeRect(discardX, discardY, discardWidth, discardHeight);
    
    // 绘制消耗牌区文本
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${getScaledValue(10)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`消耗: ${typeof discardPile !== 'undefined' ? discardPile.length : 0}`, discardX + discardWidth / 2, discardY + discardHeight / 2);
    
    // 添加消耗牌区点击事件
    battleButtons.push({
        x: discardX,
        y: discardY,
        width: discardWidth,
        height: discardHeight,
        action: () => {
            window.previousGameState = window.gameState;
            window.gameState = 'discardView';
        }
    });
    
    // 技能卡牌（使用手牌，水平排列，类似打斗地主）
    const handCards = typeof hand !== 'undefined' ? hand : [];
    // 调试：输出hand数组内容
    console.log('Hand array:', handCards);
    const skillCardWidth = getScaledValue(50); // 卡牌宽度
    const skillCardHeight = getScaledValue(100); // 卡牌高度
    const skillCardSpacing = getScaledValue(8); // 卡牌间距
    const centerX = battleBoxX + battleBoxWidth / 2;
    const skillStartY = battleBoxY + battleBoxHeight - getScaledValue(110);
    
    // 水平排列手牌
    const cardCount = handCards.length;
    const totalWidth = cardCount * skillCardWidth + (cardCount - 1) * skillCardSpacing;
    const startX = centerX - totalWidth / 2;
    
    // 检查手牌是否发生变化，只有变化时才添加特效
    const handChanged = JSON.stringify(handCards) !== JSON.stringify(lastHand);
    
    // 检查是否需要添加抽牌特效
    if (handCards.length > 0 && handChanged && !isUsingCard) {
        // 清空已完成特效的卡牌集合，准备新的特效
        cardsWithCompletedEffects.clear();
        // 为每张新牌添加飞出特效，确保一张一张地飞出来
        handCards.forEach((skill, index) => {
            // 计算目标位置
            const cardX = startX + index * (skillCardWidth + skillCardSpacing);
            const cardY = skillStartY;
            
            // 添加抽牌特效（从卡组飞到手牌位置）
            // 每张牌延迟300毫秒，确保一张就位后第二张紧接着就位
            cardEffects.push({
                type: 'drawCard',
                card: skill,
                startX: deckX + deckWidth / 2,
                startY: deckY + deckHeight / 2,
                endX: cardX + skillCardWidth / 2,
                endY: cardY + skillCardHeight / 2,
                progress: 0,
                duration: 600, // 动画持续时间（毫秒）
                delay: index * 300 // 每张牌延迟300毫秒，确保一张一张地飞出来
            });
        });
    }
    
    // 更新lastHand，记录当前手牌
    lastHand = [...handCards];
    
    // 重置使用卡牌标记
    isUsingCard = false;
    
    handCards.forEach((skill, index) => {
        // 确保skill是字符串
        const skillName = typeof skill === 'object' && skill.name ? skill.name : skill;
        
        // 只有当卡牌的特效完成后，才绘制卡牌
        if (!cardsWithCompletedEffects.has(skillName)) {
            return;
        }
        
        // 计算水平位置
        const cardX = startX + index * (skillCardWidth + skillCardSpacing);
        const cardY = skillStartY;
        
        // 保存当前状态
        ctx.save();
        
        // 技能卡片背景
        ctx.fillStyle = 'rgba(70, 130, 180, 0.2)';
        ctx.fillRect(cardX, cardY, skillCardWidth, skillCardHeight);
        ctx.strokeStyle = '#4682B4';
        ctx.lineWidth = getScaledValue(2);
        ctx.strokeRect(cardX, cardY, skillCardWidth, skillCardHeight);
        
        // 技能名称
        ctx.fillStyle = '#000000';
        ctx.font = `${getScaledValue(12)}px Arial`; // 缩小字体
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(skillName, cardX + skillCardWidth / 2, cardY + getScaledValue(15));
        
        // 使用从descriptions.json加载的技能描述
        const skillDesc = descriptions.skills[skillName] || '暂无描述';
        
        // 从data.json中获取技能数据
        const foundSkill = skillData.skills.find(s => s.name === skillName);
        
        // 技能描述垂直渲染
        const descMaxHeight = skillCardHeight - getScaledValue(30);
        const descCharHeight = getScaledValue(10); // 缩小字符高度
        const maxCharsPerColumn = 6; // 减少每列字符数
        const columnSpacing = getScaledValue(12); // 缩小列间距
        
        let currentY = cardY + getScaledValue(30); // 调整起始位置
        let currentColumn = 0;
        let charCount = 0;
        let usedColumns = 1;
        
        // 解析技能描述，提取数值并渲染
        function renderSkillDescription() {
            if (!skillDesc) return;
            
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const maxColumns = 3;
            
            const drawList = [];
            
            for (let i = 0; i < skillDesc.length; i++) {
                let char = skillDesc[i];
                
                if (char === ' ') continue;
                
                // 换列（逗号）
                if (char === ',') {
                    currentColumn++;
                    if (currentColumn >= maxColumns) break;
                    
                    usedColumns = Math.max(usedColumns, currentColumn + 1);
                    currentY = cardY + getScaledValue(30); // 调整起始位置
                    charCount = 0;
                    continue;
                }
                
                // 高度溢出 → 换列
                if (currentY + descCharHeight > cardY + skillCardHeight - getScaledValue(5)) {
                    currentColumn++;
                    if (currentColumn >= maxColumns) break;
                    
                    usedColumns = Math.max(usedColumns, currentColumn + 1);
                    currentY = cardY + getScaledValue(30); // 调整起始位置
                    charCount = 0;
                }
                
                // 数字处理
                if (/[0-9]/.test(char)) {
                    let numberStr = '';
                    
                    while (
                        i < skillDesc.length &&
                        (/[0-9]/.test(skillDesc[i]) || skillDesc[i] === '.')
                    ) {
                        numberStr += skillDesc[i];
                        i++;
                    }
                    
                    i--;
                    
                    let actualValue = numberStr;
                    
                    const context = skillDesc.slice(Math.max(0, i - 2), i + 2);
                    
                    if (foundSkill) {
                        if (context.includes('伤害') && foundSkill.damage) {
                            actualValue = Math.abs(foundSkill.damage).toString();
                        } else if (context.includes('抵挡') && foundSkill.blockValue) {
                            actualValue = foundSkill.blockValue.toString();
                        } else if (context.includes('恢复') && foundSkill.damage) {
                            actualValue = Math.abs(foundSkill.damage).toString();
                        }
                    }
                    
                    if (currentY + descCharHeight > cardY + skillCardHeight - getScaledValue(5)) {
                        currentColumn++;
                        if (currentColumn >= maxColumns) break;
                        
                        usedColumns = Math.max(usedColumns, currentColumn + 1);
                        currentY = cardY + getScaledValue(30); // 调整起始位置
                        charCount = 0;
                    }
                    
                    drawList.push({
                        column: currentColumn,
                        y: currentY,
                        text: actualValue,
                        isNumber: true
                    });
                    
                    currentY += descCharHeight;
                    charCount++;
                } else {
                    drawList.push({
                        column: currentColumn,
                        y: currentY,
                        text: char,
                        isNumber: false
                    });
                    
                    currentY += descCharHeight;
                    charCount++;
                }
            }
            
            // 统一居中计算
            function getColumnX(columnIndex) {
                const totalWidth = (usedColumns - 1) * columnSpacing;
                const startX = cardX + skillCardWidth / 2 - totalWidth / 2;
                return startX + columnIndex * columnSpacing;
            }
            
            // 真正绘制
            for (const item of drawList) {
                const x = getColumnX(item.column);
                
                if (item.isNumber) {
                    ctx.fillStyle = '#FF0000';
                    ctx.font = `${getScaledValue(9)}px cursive`; // 缩小字体
                } else {
                    ctx.fillStyle = '#666666';
                    ctx.font = `${getScaledValue(8)}px Arial`; // 缩小字体
                }
                
                ctx.fillText(item.text, x, item.y);
            }
        }
        
        // 开始渲染技能描述
        renderSkillDescription();
        
        // 恢复状态
        ctx.restore();
        
        // 添加点击区域
        battleButtons.push({
            x: cardX,
            y: cardY,
            width: skillCardWidth,
            height: skillCardHeight,
            action: () => {
                if (typeof useCard === 'function') {
                    // 标记为使用卡牌操作
                    isUsingCard = true;
                    // 添加卡牌飞入消耗池的特效
                    cardEffects.push({
                        type: 'flyToDiscard',
                        card: skillName,
                        startX: cardX + skillCardWidth / 2,
                        startY: cardY + skillCardHeight / 2,
                        endX: discardX + discardWidth / 2,
                        endY: discardY + discardHeight / 2,
                        progress: 0,
                        duration: 1000 // 动画持续时间（毫秒）
                    });
                    useCard(skillName);
                }
            }
        });
    });
    
    // 道具按钮（位于主框体外面）
    if (playerItems.length > 0) {
        const itemButtonWidth = getScaledValue(100);
        const itemButtonHeight = getScaledValue(30);
        const itemStartX = (canvasWidth - (playerItems.length * itemButtonWidth + (playerItems.length - 1) * getScaledValue(20))) / 2;
        const itemStartY = canvasHeight - getScaledValue(20);
        
        playerItems.forEach((item, index) => {
            const itemBtn = drawButton(itemStartX + index * (itemButtonWidth + getScaledValue(20)), itemStartY, itemButtonWidth, itemButtonHeight, item, () => useItem(item));
            battleButtons.push({ x: itemStartX + index * (itemButtonWidth + getScaledValue(20)), y: itemStartY, width: itemButtonWidth, height: itemButtonHeight, action: itemBtn });
        });
    }
    
    // 结束回合按钮（位于主框体外面）
    const endTurnBtn = drawButton(canvasWidth - getScaledValue(150), canvasHeight - getScaledValue(100), getScaledValue(100), getScaledValue(50), '结束回合', endTurn);
    battleButtons.push({ x: canvasWidth - getScaledValue(150), y: canvasHeight - getScaledValue(100), width: getScaledValue(100), height: getScaledValue(50), action: endTurnBtn });
    
    // 齿轮设置按钮 - 使用与游戏关卡界面相同的样式
    const buttonSize = getScaledValue(54);
    const buttonMargin = getScaledValue(50);
    const settingsX = canvasWidth - buttonSize - buttonMargin;
    const settingsY = buttonMargin;
    
    const settingsBtn = drawGearButton(settingsX, settingsY, buttonSize, buttonSize, () => {
        window.previousGameState = window.gameState;
        window.gameState = 'settings';
    });
    battleButtons.push({ x: settingsX, y: settingsY, width: buttonSize, height: buttonSize, action: settingsBtn });
    
    // 绘制卡牌特效
    drawCardEffects();
}

// 绘制卡牌特效
function drawCardEffects() {
    const currentTime = Date.now();
    
    // 过滤掉已经完成的特效
    cardEffects = cardEffects.filter(effect => {
        if (!effect.startTime) {
            // 应用延迟
            effect.startTime = currentTime + (effect.delay || 0);
        }
        
        // 如果还在延迟期，不更新进度
        if (currentTime < effect.startTime) {
            return true;
        }
        
        effect.progress = Math.min(1, (currentTime - effect.startTime) / effect.duration);
        
        // 计算当前位置
        const x = effect.startX + (effect.endX - effect.startX) * effect.progress;
        const y = effect.startY + (effect.endY - effect.startY) * effect.progress;
        
        // 绘制卡牌
        let cardWidth, cardHeight;
        if (effect.type === 'drawCard') {
            // 抽牌特效：卡牌从卡组飞出，逐渐放大
            cardWidth = 50 * effect.progress; // 卡牌随飞行逐渐放大
            cardHeight = 100 * effect.progress;
        } else {
            // 飞入消耗池特效：卡牌随飞行逐渐缩小
            cardWidth = 50 * (1 - effect.progress * 0.5);
            cardHeight = 100 * (1 - effect.progress * 0.5);
        }
        
        // 保存当前状态
        ctx.save();
        
        // 绘制卡牌背景
        ctx.fillStyle = 'rgba(70, 130, 180, 0.8)';
        ctx.fillRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight);
        ctx.strokeStyle = '#4682B4';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight);
        
        // 绘制卡牌名称
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(effect.card, x, y);
        
        // 恢复状态
        ctx.restore();
        
        // 特效未完成
        if (effect.progress < 1) {
            return true;
        } else {
            // 特效完成，添加到已完成集合
            if (effect.type === 'drawCard') {
                cardsWithCompletedEffects.add(effect.card);
            }
            return false;
        }
    });
}

// 绘制游戏结束
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FF0000';
    ctx.font = `${getScaledValue(48)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('游戏失败', canvas.width / 2, getScaledValue(300));
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${getScaledValue(24)}px Arial`;
    ctx.fillText('你的角色已经倒下了', canvas.width / 2, getScaledValue(400));
    
    // 存储游戏结束界面按钮
    gameOverButtons = [];
    
    // 返回主菜单按钮
    const menuBtn = drawButton(canvas.width / 2 - getScaledValue(100), getScaledValue(500), getScaledValue(200), getScaledValue(60), '返回主菜单', () => {
        window.gameState = 'menu';
        resetGame();
    });
    gameOverButtons.push({ x: canvas.width / 2 - getScaledValue(100), y: getScaledValue(500), width: getScaledValue(200), height: getScaledValue(60), action: menuBtn });
    
    // 齿轮设置按钮
    const settingsBtn = drawGearButton(canvas.width - getScaledValue(80), getScaledValue(50), getScaledValue(54), getScaledValue(54), () => {
        window.previousGameState = window.gameState;
        window.gameState = 'settings';
    });
    gameOverButtons.push({ x: canvas.width - getScaledValue(80), y: getScaledValue(50), width: getScaledValue(54), height: getScaledValue(54), action: settingsBtn });
}

// 绘制胜利界面
function drawVictory() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFF00';
    ctx.font = `${getScaledValue(48)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('胜利！', canvas.width / 2, getScaledValue(300));
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${getScaledValue(24)}px Arial`;
    ctx.fillText('你成功击败了敌人！', canvas.width / 2, getScaledValue(400));
    ctx.fillText(`获得经验值: ${currentEnemy.exp}`, canvas.width / 2, getScaledValue(450));
    
    if (currentEnemy.type === 'boss') {
        ctx.fillText('恭喜你通关了本层！', canvas.width / 2, getScaledValue(500));
        if (currentFloor < totalFloors) {
            ctx.fillText('下一层已解锁', canvas.width / 2, getScaledValue(550));
        } else {
            ctx.fillText('你已经通关了所有楼层！', canvas.width / 2, getScaledValue(550));
            if (!unlockedDifficulties.includes('困难')) {
                unlockedDifficulties.push('困难');
                ctx.fillText('困难模式已解锁', canvas.width / 2, getScaledValue(600));
            }
        }
    }
    
    // 存储胜利界面按钮
    victoryButtons = [];
    
    // 返回地图按钮
    const mapBtn = drawButton(canvas.width / 2 - getScaledValue(150), getScaledValue(650), getScaledValue(300), getScaledValue(60), '返回地图', () => {
        window.gameState = 'game';
        battleLog = [];
        currentEnemy = null;
    });
    victoryButtons.push({ x: canvas.width / 2 - getScaledValue(150), y: getScaledValue(650), width: getScaledValue(300), height: getScaledValue(60), action: mapBtn });
    
    // 退出按钮
    const exitBtn = drawButton(getScaledValue(50), getScaledValue(50), getScaledValue(80), getScaledValue(40), '退出', () => {
        window.gameState = 'menu';
        resetGame();
    });
    victoryButtons.push({ x: getScaledValue(50), y: getScaledValue(50), width: getScaledValue(80), height: getScaledValue(40), action: exitBtn });
    
    // 齿轮设置按钮
    const settingsBtn = drawGearButton(canvas.width - getScaledValue(80), getScaledValue(50), getScaledValue(54), getScaledValue(54), () => {
        window.previousGameState = window.gameState;
        window.gameState = 'settings';
    });
    victoryButtons.push({ x: canvas.width - getScaledValue(80), y: getScaledValue(50), width: getScaledValue(54), height: getScaledValue(54), action: settingsBtn });
}

// 绘制存档确认弹窗
function drawConfirmSave() {
    // 清空按钮数组
    confirmSaveButtons = [];
    
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 弹窗背景
    const popupWidth = getScaledValue(400);
    const popupHeight = getScaledValue(200);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const popupX = centerX - popupWidth / 2;
    const popupY = centerY - popupHeight / 2;
    
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(popupX, popupY, popupWidth, popupHeight);
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = getScaledValue(2);
    ctx.strokeRect(popupX, popupY, popupWidth, popupHeight);
    
    // 标题
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${getScaledValue(24)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('是否保存游戏进度', centerX, centerY - getScaledValue(40));
    
    // 按钮
    const buttonWidth = getScaledValue(120);
    const buttonHeight = getScaledValue(40);
    
    // 取消按钮
    const cancelBtn = drawButton(centerX - buttonWidth - getScaledValue(20), centerY + getScaledValue(20), buttonWidth, buttonHeight, '取消', () => {
        // 删除当前游戏进度
        if (window.currentSaveId) {
            deleteSave(window.currentSaveId);
            console.log('当前游戏进度已删除');
        }
        // 重置游戏状态
        if (typeof resetGame === 'function') {
            resetGame();
        }
        // 返回到主界面
        window.gameState = 'menu';
    });
    confirmSaveButtons.push({ x: centerX - buttonWidth - getScaledValue(20), y: centerY + getScaledValue(20), width: buttonWidth, height: buttonHeight, action: cancelBtn });
    
    // 保存按钮
    const saveBtn = drawButton(centerX + getScaledValue(20), centerY + getScaledValue(20), buttonWidth, buttonHeight, '保存', () => {
        // 保存游戏
        if (saveGame()) {
            alert('游戏已存档');
        } else {
            alert('没有可保存的游戏进度');
        }
        // 返回主界面
        window.gameState = 'menu';
    });
    confirmSaveButtons.push({ x: centerX + getScaledValue(20), y: centerY + getScaledValue(20), width: buttonWidth, height: buttonHeight, action: saveBtn });
}

// 角色详情界面状态
let characterDetailsTab = 0; // 0: 角色信息, 1: 战力

// 将角色详情界面相关变量暴露到全局作用域
window.characterDetailsTab = characterDetailsTab;

// 描述数据
let descriptions = {
    skills: {},
    characters: {}
};

// 技能数据
let skillData = {
    skills: []
};

// 加载描述数据
async function loadDescriptions() {
    try {
        const response = await fetch('descriptions.json');
        if (response.ok) {
            descriptions = await response.json();
            console.log('描述数据加载成功');
        } else {
            console.error('描述数据加载失败');
        }
    } catch (error) {
        console.error('加载描述数据时出错:', error);
    }
}

// 加载技能数据
async function loadSkillData() {
    try {
        const response = await fetch('data.json');
        if (response.ok) {
            skillData = await response.json();
            console.log('技能数据加载成功');
        } else {
            console.error('技能数据加载失败');
        }
    } catch (error) {
        console.error('加载技能数据时出错:', error);
    }
}

// 进入战斗
function enterBattle() {
    // 随机选择一个怪物
    if (monsters.length > 0) {
        const randomIndex = Math.floor(Math.random() * monsters.length);
        currentEnemy = {...monsters[randomIndex]};
        battleLog = [];
        battleLog.push(`你遇到了${currentEnemy.name}！`);
        
        // 抽6张牌
        if (typeof drawCards === 'function') {
            drawCards(6);
        }
        
        window.gameState = 'battle';
    }
}

// 初始化时加载数据
async function loadUIData() {
    await loadDescriptions();
    await loadSkillData();
}

// 调用加载函数
loadUIData();
let skillAutoScrollCount = 0; // 自动切换次数
let isDragging = false; // 标记是否正在拖拽
let startX = 0; // 拖拽开始的x坐标
// 将描述数据暴露到全局作用域
window.descriptions = descriptions;

// 绘制角色详情界面
function drawCharacterDetails() {
    ctx.fillStyle = '#E6F3FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制按钮点击特效
    drawButtonClickEffects();
    
    if (!window.selectedCharacterDetails) {
        return;
    }
    
    // 清空按钮数组
    window.characterDetailsButtons = [];
    
    const character = window.selectedCharacterDetails;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // 标题
    ctx.fillStyle = '#4682B4';
    ctx.font = `${getScaledValue(36)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(`${character.name} 详情`, canvasWidth / 2, getScaledValue(60));
    
    // 计算主框体尺寸
    const mainBoxWidth = canvasWidth - getScaledValue(40);
    const mainBoxHeight = canvasHeight * 0.75;
    const mainBoxX = getScaledValue(20);
    const contentY = getScaledValue(100);
    
    // 绘制主体框背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(mainBoxX, contentY, mainBoxWidth, mainBoxHeight);
    ctx.strokeStyle = '#4682B4';
    ctx.lineWidth = getScaledValue(2);
    ctx.strokeRect(mainBoxX, contentY, mainBoxWidth, mainBoxHeight);
    
    // 上侧区域：头像和介绍（平分）
    const topAreaHeight = mainBoxHeight * 0.45;
    
    // 左侧：头像区域（占上侧50%宽度）
    const imageAreaWidth = (mainBoxWidth - getScaledValue(60)) * 0.5;
    const imageAreaX = mainBoxX + getScaledValue(20);
    const imageAreaY = contentY + getScaledValue(20);
    const imageAreaHeight = topAreaHeight - getScaledValue(40);
    
    // 头像背景框
    ctx.fillStyle = '#E6F3FF';
    ctx.fillRect(imageAreaX, imageAreaY, imageAreaWidth, imageAreaHeight);
    ctx.strokeStyle = '#4682B4';
    ctx.lineWidth = getScaledValue(2);
    ctx.strokeRect(imageAreaX, imageAreaY, imageAreaWidth, imageAreaHeight);
    
    // 根据角色ID显示对应的立绘
    let characterImage = null;
    if (character.id === 'martial_artist' && images.martialArtist) {
        characterImage = images.martialArtist;
    } else if (character.id === 'mage' && images.mage) {
        characterImage = images.mage;
    } else if (character.id === 'weapon_master' && images.weaponMaster) {
        characterImage = images.weaponMaster;
    }
    
    if (characterImage) {
        ctx.drawImage(
            characterImage,
            imageAreaX + getScaledValue(10),
            imageAreaY + getScaledValue(10),
            imageAreaWidth - getScaledValue(20),
            imageAreaHeight - getScaledValue(20)
        );
    }
    
    // 右侧：介绍区域（占上侧50%宽度）
    const introAreaX = imageAreaX + imageAreaWidth + getScaledValue(20);
    const introAreaWidth = imageAreaWidth;
    const introAreaY = imageAreaY;
    const introAreaHeight = imageAreaHeight;
    
    ctx.fillStyle = '#E6F3FF';
    ctx.fillRect(introAreaX, introAreaY, introAreaWidth, introAreaHeight);
    ctx.strokeStyle = '#4682B4';
    ctx.lineWidth = getScaledValue(2);
    ctx.strokeRect(introAreaX, introAreaY, introAreaWidth, introAreaHeight);
    
    // 角色介绍标题
    ctx.fillStyle = '#4682B4';
    ctx.font = `${getScaledValue(20)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('背景介绍', introAreaX + introAreaWidth / 2, introAreaY + getScaledValue(30));
    
    // 角色描述
    ctx.fillStyle = '#000000';
    ctx.font = `${getScaledValue(14)}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const description = descriptions.characters[character.id] || '暂无描述';
    const descMaxWidth = introAreaWidth - getScaledValue(20);
    const descLineHeight = getScaledValue(20);
    const descStartY = introAreaY + getScaledValue(55);
    
    let line = '';
    let currentY = descStartY;
    
    if (description.includes(' ')) {
        const words = description.split(' ');
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > descMaxWidth && i > 0) {
                ctx.fillText(line, introAreaX + getScaledValue(10), currentY);
                line = words[i] + ' ';
                currentY += descLineHeight;
            } else {
                line = testLine;
            }
        }
    } else {
        for (let i = 0; i < description.length; i++) {
            const testLine = line + description[i];
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > descMaxWidth && i > 0) {
                ctx.fillText(line, introAreaX + getScaledValue(10), currentY);
                line = description[i];
                currentY += descLineHeight;
            } else {
                line = testLine;
            }
        }
    }
    
    if (line) {
        ctx.fillText(line, introAreaX + getScaledValue(10), currentY);
    }
    
    // 下侧区域：卡牌显示（一行4张，可上下滑动）
    const cardAreaY = contentY + topAreaHeight + getScaledValue(20);
    const cardAreaHeight = mainBoxHeight - topAreaHeight - getScaledValue(70);
    const cardAreaX = mainBoxX + getScaledValue(20);
    const cardAreaWidth = mainBoxWidth - getScaledValue(40);
    
    // 卡牌区域背景
    ctx.fillStyle = '#E6F3FF';
    ctx.fillRect(cardAreaX, cardAreaY, cardAreaWidth, cardAreaHeight);
    ctx.strokeStyle = '#4682B4';
    ctx.lineWidth = getScaledValue(2);
    ctx.strokeRect(cardAreaX, cardAreaY, cardAreaWidth, cardAreaHeight);
    
    // 卡牌区域标题（竖排显示在左侧，文字从上到下）
    ctx.fillStyle = '#4682B4';
    ctx.font = `${getScaledValue(18)}px Arial`;
    ctx.textAlign = 'center';
    const titleText = '技能卡牌';
    const charSpacing = getScaledValue(25);
    const startY = cardAreaY + getScaledValue(30);
    for (let i = 0; i < titleText.length; i++) {
        ctx.fillText(titleText[i], cardAreaX + getScaledValue(15), startY + i * charSpacing);
    }
    
    // 使用角色的技能数据
    let skills = [];
    if (character.skills && character.skills.length > 0) {
        skills = character.skills.map(skill => {
            return typeof skill === 'string' ? skill : skill.name;
        });
    } else {
        skills = ['普通攻击', '防御', '技能1', '技能2', '技能3', '技能4', '技能5'];
    }
    
    // 添加基础技能（确保普通攻击和防御存在）
    if (!skills.includes('普通攻击')) skills.unshift('普通攻击');
    if (!skills.includes('防御')) {
        const idx = skills.indexOf('普通攻击');
        skills.splice(idx + 1, 0, '防御');
    }
    
    // 卡牌配置：一行4张，类似扑克牌布局（高大于宽）
    const cardsPerRow = 4;
    const cardWidth = (cardAreaWidth - getScaledValue(60)) / cardsPerRow * 0.75;
    const cardHeight = cardWidth * 1.5; // 扑克牌比例：高度约为宽度的1.5倍
    const cardSpacingX = getScaledValue(25);
    const cardSpacingY = getScaledValue(20);
    
    // 计算一行卡牌的总宽度
    const rowWidth = cardsPerRow * cardWidth + (cardsPerRow - 1) * cardSpacingX;
    // 计算起始位置（给左侧标题留出空间）
    const cardStartX = cardAreaX + getScaledValue(40) + (cardAreaWidth - rowWidth - getScaledValue(40)) / 2;
    
    // 计算总页数
    const totalCards = skills.length;
    const totalRows = Math.ceil(totalCards / cardsPerRow);
    const totalHeight = totalRows * (cardHeight + cardSpacingY) + getScaledValue(20);
    
    // 初始化垂直滑动偏移
    if (typeof window.skillVerticalOffset === 'undefined') {
        window.skillVerticalOffset = 0;
    }
    
    // 限制滑动范围
    const maxVerticalOffset = Math.max(0, totalHeight - (cardAreaHeight - getScaledValue(60)));
    window.skillVerticalOffset = Math.max(0, Math.min(window.skillVerticalOffset, maxVerticalOffset));
    
    // 设置裁剪区域
    ctx.save();
    ctx.rect(cardAreaX, cardAreaY, cardAreaWidth, cardAreaHeight);
    ctx.clip();
    
    // 绘制卡牌
    skills.forEach((skill, index) => {
        const row = Math.floor(index / cardsPerRow);
        const col = index % cardsPerRow;
        
        const cardX = cardStartX + col * (cardWidth + cardSpacingX);
        const cardY = cardAreaY + getScaledValue(50) + row * (cardHeight + cardSpacingY) - window.skillVerticalOffset;
        
        // 判断是否为初始解锁卡牌
        const isUnlocked = (skill === '普通攻击' || skill === '防御');
        
        // 保存状态
        ctx.save();
        
        // 卡牌背景
        if (isUnlocked) {
            ctx.fillStyle = 'rgba(70, 130, 180, 0.2)';
            ctx.strokeStyle = '#4682B4';
        } else {
            ctx.fillStyle = '#DDDDDD';
            ctx.strokeStyle = '#999999';
        }
        ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
        ctx.lineWidth = getScaledValue(2);
        ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
        
        // 技能名称
        ctx.fillStyle = isUnlocked ? '#000000' : '#999999';
        ctx.font = `${getScaledValue(16)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(skill, cardX + cardWidth / 2, cardY + getScaledValue(15));
        
        // 技能描述（居中显示在卡牌内部）
        const skillDesc = descriptions.skills[skill] || '暂无描述';
        ctx.fillStyle = isUnlocked ? '#666666' : '#BBBBBB';
        ctx.font = `${getScaledValue(11)}px Arial`;
        ctx.textAlign = 'center';
        
        // 文本换行并居中
        const descMaxWidth = cardWidth - getScaledValue(10);
        const descLineHeight = getScaledValue(14);
        let descLine = '';
        let descY = cardY + getScaledValue(40);
        
        for (let i = 0; i < skillDesc.length; i++) {
            const testLine = descLine + skillDesc[i];
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > descMaxWidth && i > 0) {
                ctx.fillText(descLine, cardX + cardWidth / 2, descY);
                descLine = skillDesc[i];
                descY += descLineHeight;
            } else {
                descLine = testLine;
            }
        }
        if (descLine) {
            ctx.fillText(descLine, cardX + cardWidth / 2, descY);
        }
        
        // 如果未解锁，显示锁图标
        if (!isUnlocked) {
            ctx.fillStyle = '#999999';
            ctx.font = `${getScaledValue(30)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔒', cardX + cardWidth / 2, cardY + cardHeight / 2);
        }
    });
    
    ctx.restore();
    
    // 返回按钮（位于主框体外面的红框位置）
    const btnY = contentY + mainBoxHeight + getScaledValue(30);
    
    // 返回按钮
    const backBtn = drawButton(canvasWidth / 2 - getScaledValue(100), btnY, getScaledValue(200), getScaledValue(50), '返回', () => {
        // 根据来源决定返回哪个界面
        if (window.characterSelectSource === 'map') {
            // 从地图选择进入，返回关卡选择界面
            window.gameState = 'mapSelect';
        } else {
            // 从主菜单进入，返回角色管理界面
            window.gameState = 'characterSelect';
        }
        window.selectedCharacterDetails = null;
        characterDetailsTab = 0;
        window.characterDetailsTab = 0;
    });
    
    // 添加返回按钮到数组
    window.characterDetailsButtons.push({ 
        x: canvasWidth / 2 - getScaledValue(100), 
        y: btnY, 
        width: getScaledValue(200), 
        height: getScaledValue(50), 
        action: backBtn 
    });
}

// 绘制雷达图
function drawRadarChart(centerX, centerY, radius, character) {
    // 定义统计数据，所有属性上限为100
    const stats = [
        { name: '生命值', value: character.health, max: 100 },
        { name: '物攻', value: character.PhyAtk , max: 100 },
        { name: '防御', value: character.defense, max: 100 },
        { name: '法攻', value: character.ManaAtk , max: 100 },
        { name: '支援', value: character.support ,max: 100 }
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
        
        // 绘制标签
        const labelX = centerX + Math.cos(angle) * (radius + getScaledValue(20));
        const labelY = centerY + Math.sin(angle) * (radius + getScaledValue(20));
        ctx.fillStyle = '#000000';
        ctx.font = `${getScaledValue(12)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stats[i].name, labelX, labelY);
        
        // 绘制数值（显示在维度描述文本的下方）
        const displayValue = stats[i].value.toString();
        ctx.fillStyle = '#000000';
        ctx.font = `${getScaledValue(10)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(displayValue, labelX, labelY + getScaledValue(15));
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

// 绘制存档加载界面
function drawLoadGame() {
    ctx.fillStyle = '#E6F3FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 标题
    ctx.fillStyle = '#4682B4';
    ctx.font = `${getScaledValue(36)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('游戏存档', canvas.width / 2, getScaledValue(100));
    
    // 存储存档按钮
    const loadButtons = [];
    
    // 绘制存档列表
    const canvasWidth = canvas.width;
    const startY = getScaledValue(180);
    const saveHeight = getScaledValue(100);
    const saveSpacing = getScaledValue(20);
    
    if (gameSaves.length === 0) {
        ctx.fillStyle = '#666666';
        ctx.font = `${getScaledValue(20)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('暂无存档', canvasWidth / 2, startY + getScaledValue(50));
    } else {
        gameSaves.forEach((save, index) => {
            const saveY = startY + index * (saveHeight + saveSpacing);
            
            // 绘制存档背景
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(getScaledValue(100), saveY, canvasWidth - getScaledValue(200), saveHeight);
            ctx.strokeStyle = '#4682B4';
            ctx.lineWidth = getScaledValue(2);
            ctx.strokeRect(getScaledValue(100), saveY, canvasWidth - getScaledValue(200), saveHeight);
            
            // 存档信息
            ctx.fillStyle = '#000000';
            ctx.font = `${getScaledValue(16)}px Arial`;
            ctx.textAlign = 'left';
            ctx.fillText(`角色: ${save.character.name}`, getScaledValue(120), saveY + getScaledValue(30));
            ctx.fillText(`楼层: ${save.currentFloor}/${totalFloors}`, getScaledValue(120), saveY + getScaledValue(55));
            ctx.fillText(`等级: ${save.playerLevel}`, getScaledValue(120), saveY + getScaledValue(80));
            
            // 按钮区域设置
            const buttonWidth = getScaledValue(70);
            const buttonHeight = getScaledValue(25);
            const buttonSpacing = getScaledValue(15);
            
            // 计算按钮起始位置（右对齐，确保在框体内）
            const boxRight = getScaledValue(100) + (canvasWidth - getScaledValue(200)); // 框体右边界
            
            // 调整时间显示位置，放在存档框体的右上侧
            ctx.textAlign = 'right';
            ctx.fillText(save.timestamp, boxRight - getScaledValue(10), saveY + getScaledValue(20));
            const buttonAreaWidth = buttonWidth * 2 + buttonSpacing;
            const buttonStartX = boxRight - buttonAreaWidth - getScaledValue(10); // 10px 边距
            const buttonY = saveY + (saveHeight - buttonHeight) / 2 + getScaledValue(15); // 往下移动15px
            
            // 删除按钮
            const deleteBtn = drawButton(buttonStartX, buttonY, buttonWidth, buttonHeight, '删除', () => {
                if (confirm('确定要删除这个存档吗？')) {
                    deleteSave(save.id);
                    // 重新绘制界面
                    drawLoadGame();
                }
            });
            
            // 加载按钮
            const loadBtn = drawButton(buttonStartX + buttonWidth + buttonSpacing, buttonY, buttonWidth, buttonHeight, '加载', () => {
                if (loadGame(save.id)) {
                    window.gameState = 'game';
                } else {
                    alert('加载失败');
                }
            });
            
            loadButtons.push({ x: getScaledValue(100), y: saveY, width: canvasWidth - getScaledValue(200), height: saveHeight, action: null });
            loadButtons.push({ x: buttonStartX, y: buttonY, width: buttonWidth, height: buttonHeight, action: deleteBtn });
            loadButtons.push({ x: buttonStartX + buttonWidth + buttonSpacing, y: buttonY, width: buttonWidth, height: buttonHeight, action: loadBtn });
        });
    }
    
    // 计算返回按钮位置
    let backButtonY;
    if (gameSaves.length === 0) {
        // 没有存档时，按钮往下移动50像素
        backButtonY = startY + getScaledValue(100); // 比原来多50像素
    } else {
        backButtonY = startY + gameSaves.length * (saveHeight + saveSpacing) + getScaledValue(50);
    }
    
    // 返回按钮
    const backBtn = drawButton(canvasWidth / 2 - getScaledValue(100), backButtonY, getScaledValue(200), getScaledValue(60), '返回主菜单', () => {
        window.gameState = 'menu';
    });
    
    loadButtons.push({ x: canvasWidth / 2 - getScaledValue(100), y: backButtonY, width: getScaledValue(200), height: getScaledValue(60), action: backBtn });
    
    // 存储按钮信息
    window.loadGameButtons = loadButtons;
}

// 绘制设置界面
function drawSettings() {
    ctx.fillStyle = '#E6F3FF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 标题
    ctx.fillStyle = '#4682B4';
    ctx.font = `${getScaledValue(36)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('设置', canvas.width / 2, getScaledValue(100));
    
    // 存储设置界面按钮
    settingsButtons = [];
    
    // 统一设置功能文本样式
    const textColor = '#000000';
    
    // 自适应设置
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // 计算整体居中位置
    const centerX = canvasWidth / 2;
    
    // 使用getScaledValue函数来缩放元素
    const buttonWidth = getScaledValue(120); // 统一按钮宽度
    const buttonHeight = getScaledValue(50); // 统一按钮高度
    const verticalSpacing = getScaledValue(70); // 垂直间距
    const textWidth = getScaledValue(100); // 文本区域宽度
    const textX = centerX - (textWidth + buttonWidth) / 2; // 文本在左侧，与按钮整体居中
    const buttonStartX = centerX + (textWidth - buttonWidth) / 2; // 按钮在右侧，与文本整体居中
    
    // 声音设置
    const soundY = canvasHeight * 0.2; // 自适应垂直位置
    ctx.fillStyle = textColor;
    ctx.font = `${getScaledValue(16)}px Arial`;
    ctx.textAlign = 'right';
    ctx.fillText('声音:', textX, soundY + buttonHeight/2);
    const soundBtn = drawButton(buttonStartX, soundY, buttonWidth, buttonHeight, settings.sound ? '开' : '关', () => settings.sound = !settings.sound);
    settingsButtons.push({ x: buttonStartX, y: soundY, width: buttonWidth, height: buttonHeight, action: soundBtn });
    
    // 音乐设置
    const musicY = soundY + verticalSpacing;
    ctx.fillStyle = textColor;
    ctx.font = `${getScaledValue(16)}px Arial`;
    ctx.textAlign = 'right';
    ctx.fillText('音乐:', textX, musicY + buttonHeight/2);
    const musicBtn = drawButton(buttonStartX, musicY, buttonWidth, buttonHeight, settings.music ? '开' : '关', () => settings.music = !settings.music);
    settingsButtons.push({ x: buttonStartX, y: musicY, width: buttonWidth, height: buttonHeight, action: musicBtn });
    
    // 画质设置
    const graphicsY = musicY + verticalSpacing;
    ctx.fillStyle = textColor;
    ctx.font = `${getScaledValue(16)}px Arial`;
    ctx.textAlign = 'right';
    ctx.fillText('画质:', textX, graphicsY + buttonHeight/2);
    const graphicsOptions = ['低', '中', '高'];
    const graphicsValues = ['low', 'medium', 'high'];
    // 计算画质选项的起始位置，使其与文本整体居中
    const graphicsButtonWidth = buttonWidth; // 使用统一的按钮宽度
    const graphicsStartX = centerX - (graphicsButtonWidth * graphicsOptions.length) / 2 + textWidth;
    graphicsOptions.forEach((option, index) => {
        const isSelected = settings.graphics === graphicsValues[index];
        const graphicsBtn = drawButton(graphicsStartX + index * graphicsButtonWidth, graphicsY, graphicsButtonWidth, buttonHeight, option, 
            isSelected ? null : () => settings.graphics = graphicsValues[index],
            isSelected,
            true // 标记为画质选项
        );
        settingsButtons.push({ x: graphicsStartX + index * graphicsButtonWidth, y: graphicsY, width: graphicsButtonWidth, height: buttonHeight, action: graphicsBtn });
    });
    
    // 礼包码输入
    const codeY = graphicsY + verticalSpacing;
    ctx.fillStyle = textColor;
    ctx.font = `${getScaledValue(16)}px Arial`;
    ctx.textAlign = 'right';
    ctx.fillText('礼包码:', textX, codeY + buttonHeight/2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    // 计算礼包码输入框的位置，使其与文本整体居中
    const inputWidth = getScaledValue(180); // 调大输入框宽度
    const codeInputX = centerX - (inputWidth + buttonWidth + getScaledValue(20)) / 2 + textWidth;
    ctx.fillRect(codeInputX, codeY, inputWidth, buttonHeight);
    ctx.fillStyle = textColor;
    ctx.font = `${getScaledValue(12)}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText(settings.礼包码, codeInputX + getScaledValue(10), codeY + buttonHeight/2 + 2);
    
    // 兑换按钮
    const redeemBtnX = codeInputX + inputWidth + getScaledValue(20);
    const redeemBtn = drawButton(redeemBtnX, codeY, buttonWidth, buttonHeight, '兑换', () => {
        if (settings.礼包码) {
            // 这里可以添加礼包码验证逻辑
            alert('礼包码兑换成功！');
            settings.礼包码 = '';
        } else {
            alert('请输入礼包码');
        }
    });
    settingsButtons.push({ x: redeemBtnX, y: codeY, width: buttonWidth, height: buttonHeight, action: redeemBtn });
    
    // 提示信息
    ctx.fillStyle = '#666666';
    ctx.font = `${getScaledValue(12)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('礼包码可在官方活动中获取', centerX, codeY + verticalSpacing);
    
    // 只在游戏界面或战斗界面的设置界面显示存档并返回按钮
    if (window.previousGameState === 'game' || window.previousGameState === 'battle') {
        // 存档并返回主界面按钮
        const saveExitY = codeY + verticalSpacing * 2;
        const saveExitBtn = drawButton(centerX - buttonWidth, saveExitY, buttonWidth * 2, buttonHeight, '存档并返回', () => {
            // 显示确认弹窗
            window.gameState = 'confirmSave';
        });
        settingsButtons.push({ x: centerX - buttonWidth, y: saveExitY, width: buttonWidth * 2, height: buttonHeight, action: saveExitBtn });
    }
    
    // 添加空白区域点击检测（放在所有按钮之后）
    settingsButtons.push({ x: 0, y: 0, width: canvas.width, height: canvas.height, action: () => {
        window.gameState = window.previousGameState;
    }});
}



// 绘制按钮
function drawButton(x, y, width, height, text, onClick, isSelected = false, isGraphicsOption = false) {
    // 生成按钮唯一标识符
    const buttonKey = `${x}-${y}-${width}-${height}-${text}`;
    
    // 绘制按钮背景
    if (isGraphicsOption) {
        // 画质选项：选中时蓝色，未选中时灰色
        ctx.fillStyle = isSelected ? '#4682B4' : '#808080';
    } else {
        // 其他按钮：可点击时蓝色，不可点击时灰色
        ctx.fillStyle = onClick ? '#4682B4' : '#808080';
    }
    ctx.fillRect(x, y, width, height);
    
    // 绘制按钮边框，增加可见性
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = getScaledValue(2);
    ctx.strokeRect(x, y, width, height);
    
    // 绘制文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${getScaledValue(16)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2);
    
    // 处理按钮点击
    return function() {
        if (onClick) {
            // 根据按钮大小计算特效初始大小和最大大小
            const initialSize = Math.min(width, height) * 0.3;
            const maxSize = Math.min(width, height) * 2;
            // 创建按钮特效
            buttonEffects[buttonKey] = {
                x: x + width / 2,
                y: y + height / 2,
                size: initialSize,
                maxSize: maxSize
            };
            
            // 强制立即绘制一帧，确保特效显示
            drawUI();
            
            // 执行onClick
            onClick();
        }
    };
}

// 将drawButton暴露到全局作用域
window.drawButton = drawButton;

// 绘制通用按钮（根据图片设计）
function drawStyledButton(x, y, width, height, text, type, onClick) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const buttonKey = `${type}-${x}-${y}-${width}-${height}`;
    const borderRadius = 25;
    
    // 绘制按钮阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    roundedRect(ctx, x + 3, y + 3, width, height, borderRadius);
    ctx.fill();
    
    // 绘制按钮背景（棕色渐变效果）
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, '#D2B48C');
    gradient.addColorStop(1, '#A0522D');
    ctx.fillStyle = gradient;
    roundedRect(ctx, x, y, width, height, borderRadius);
    ctx.fill();
    
    // 绘制按钮边框
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    roundedRect(ctx, x, y, width, height, borderRadius);
    ctx.stroke();
    
    // 绘制文字
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // 绘制文字描边
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.strokeText(text, centerX, centerY);
    // 绘制文字填充
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, centerX, centerY);
    
    // 绘制装饰元素 - 已移除所有装饰图标
    switch(type) {
        case 'start':
            // 开始游戏按钮 - 无装饰
            break;
            
        case 'character':
            // 角色管理按钮 - 无装饰
            break;
            
        case 'exit':
            // 退出游戏按钮 - 无装饰
            break;
    }
    
    // 处理按钮点击
    return function() {
        if (onClick) {
            // 创建按钮特效
            buttonEffects[buttonKey] = {
                x: centerX,
                y: centerY,
                size: Math.min(width, height) * 0.3,
                maxSize: Math.min(width, height) * 2
            };
            
            // 强制立即绘制一帧
            drawUI();
            
            // 执行onClick
            onClick();
        }
    };
}

// 绘制设置按钮
function drawGearButton(x, y, width, height, onClick) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2;
    const buttonKey = `gear-${x}-${y}-${width}-${height}`;
    
    // 绘制按钮背景（与其他按钮相同的棕色渐变）
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, '#D2B48C');
    gradient.addColorStop(1, '#A0522D');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制按钮边框
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 绘制三横线+圆点样式（模仿图片）
    const lineCount = 3;
    const lineHeight = height * 0.12;
    const lineWidth = width * 0.4;
    const dotRadius = width * 0.08;
    const lineSpacing = height * 0.18;
    const totalHeight = (lineCount - 1) * lineSpacing;
    
    for (let i = 0; i < lineCount; i++) {
        // 计算每条线的垂直位置，确保整体居中
        const lineY = centerY - totalHeight / 2 + i * lineSpacing;
        
        // 计算水平位置，让图标整体向右偏移
        const offset = width * 0.1; // 向右偏移的量
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
    
    // 处理按钮点击
    return function() {
        if (onClick) {
            // 创建按钮特效
            buttonEffects[buttonKey] = {
                x: centerX,
                y: centerY,
                size: Math.min(width, height) * 0.3,
                maxSize: Math.min(width, height) * 2
            };
            
            // 强制立即绘制一帧
            drawUI();
            
            // 执行onClick
            onClick();
        }
    };
}

// 在游戏场景中绘制设置按钮 - 使用与主界面相同的样式和大小
function drawSettingsButtonInGame() {
    const canvasWidth = canvas.width;
    const buttonSize = 54; // 与主界面设置按钮大小一致
    const buttonMargin = 50; // 与主界面边距一致
    
    // 按钮位置：右上角（与主界面一致）
    const x = canvasWidth - buttonSize - buttonMargin;
    const y = buttonMargin;
    
    // 使用与主界面相同的设置按钮绘制函数
    return drawGearButton(x, y, buttonSize, buttonSize, () => {
        window.previousGameState = window.gameState;
        window.gameState = 'settings';
    });
}

// 绘制游戏界面设置按钮 - 使用更鲜艳的颜色
function drawGameSettingsButton(x, y, width, height, onClick) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2;
    const buttonKey = `game-settings-${x}-${y}-${width}-${height}`;
    
    // 绘制按钮背景（使用橙色，更醒目）
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制按钮边框（黑色粗边框）
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // 绘制简单的齿轮图标（使用白色）
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${radius}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚙', centerX, centerY + radius * 0.1);
    
    // 处理按钮点击
    return function() {
        if (onClick) {
            // 创建按钮特效
            buttonEffects[buttonKey] = {
                x: centerX,
                y: centerY,
                size: Math.min(width, height) * 0.3,
                maxSize: Math.min(width, height) * 2
            };
            
            // 强制立即绘制一帧
            drawUI();
            
            // 执行onClick
            onClick();
        }
    };
}

// 按钮点击特效
function playButtonClickEffect(x, y) {
    // 创建点击特效
    const effect = {
        x: x,
        y: y,
        radius: 5,
        maxRadius: 30,
        alpha: 1,
        speed: 2,
        decay: 0.05
    };
    
    // 添加到特效列表
    buttonClickEffects.push(effect);
}

// 按钮点击特效列表
let buttonClickEffects = [];

// 绘制按钮点击特效
function drawButtonClickEffects() {
    buttonClickEffects.forEach((effect, index) => {
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 102, 255, ${effect.alpha})`; // 改为蓝色
        ctx.fill();
        
        // 更新特效
        effect.radius += effect.speed;
        effect.alpha -= effect.decay;
        
        // 移除结束的特效
        if (effect.alpha <= 0) {
            buttonClickEffects.splice(index, 1);
        }
    });
}

// 平台点击特效相关变量
let platformEffect = null;

// 开始平台点击特效
function startPlatformEffect(x, y) {
    // 初始化特效数据
    platformEffect = {
        x: x,
        y: y,
        radius: 0,
        fixedRadius: 60, // 固定的圆环大小
        angle: 0,
        rotationSpeed: 0.2, // 调整旋转速度为0.2
        alpha: 1,
        stage: 0, // 0: 生成头像, 1: 画圆特效, 2: 进入关卡
        stageTime: 0,
        stageDuration: 60 // 每个阶段的帧数
    };
}

// 更新平台点击特效
function updatePlatformEffect() {
    if (!platformEffect) return;
    
    platformEffect.stageTime++;
    
    switch(platformEffect.stage) {
        case 0: // 生成头像
            platformEffect.radius = Math.min(platformEffect.radius + 2, 40);
            if (platformEffect.stageTime >= platformEffect.stageDuration) {
                platformEffect.stage = 1;
                platformEffect.stageTime = 0;
            }
            break;
        case 1: // 画圆特效
            platformEffect.angle += platformEffect.rotationSpeed;
            // 使用固定半径，不再逐渐扩大
            platformEffect.radius = platformEffect.fixedRadius;
            
            // 当画完一圈（2π弧度）后，进入突出阶段
            if (platformEffect.angle >= Math.PI * 2) {
                // 稍微突出一点点（持续几帧）
                if (platformEffect.stageTime >= 10) {
                    // 直接进入战斗场景
                    platformEffect = null;
                    // 模拟进入关卡
                    window.gameState = 'battle';
                    // 从怪物数据中随机选择一个怪物
                    if (monsters && monsters.length > 0) {
                        const randomIndex = Math.floor(Math.random() * monsters.length);
                        const selectedMonster = monsters[randomIndex];
                        currentEnemy = {
                            name: selectedMonster.name,
                            health: selectedMonster.health,
                            maxHealth: selectedMonster.maxHealth,
                            attack: selectedMonster.attack,
                            exp: selectedMonster.exp
                        };
                    } else {
                        // 使用默认怪物作为 fallback
                        currentEnemy = {
                            name: '测试怪物',
                            health: 50,
                            maxHealth: 50,
                            attack: 10,
                            exp: 20
                        };
                    }
                }
            }
            break;
    }
}

// 绘制平台点击特效
function drawPlatformEffect() {
    if (!platformEffect) return;
    
    ctx.save();
    
    switch(platformEffect.stage) {
        case 0: // 生成头像
            // 绘制角色头像（使用角色图片生成圆形头像）
            if (window.selectedCharacter) {
                const avatarRadius = platformEffect.radius * 0.7;
                
                // 创建圆形裁剪区域
                ctx.beginPath();
                ctx.arc(platformEffect.x, platformEffect.y, avatarRadius, 0, Math.PI * 2);
                ctx.clip();
                
                // 尝试使用角色图片
                let characterImage = null;
                if (window.selectedCharacter.id === 'martial_artist' && images.martialArtist) {
                    characterImage = images.martialArtist;
                } else if (window.selectedCharacter.id === 'mage' && images.mage) {
                    characterImage = images.mage;
                } else if (window.selectedCharacter.id === 'weapon_master' && images.weaponMaster) {
                    characterImage = images.weaponMaster;
                }
                
                if (characterImage) {
                    // 等比例缩小图片
                    const imgWidth = characterImage.width;
                    const imgHeight = characterImage.height;
                    const scale = (avatarRadius * 2) / Math.max(imgWidth, imgHeight);
                    const scaledWidth = imgWidth * scale;
                    const scaledHeight = imgHeight * scale;
                    
                    // 绘制图片，使其在圆形区域内居中
                    ctx.drawImage(
                        characterImage,
                        platformEffect.x - scaledWidth / 2,
                        platformEffect.y - scaledHeight / 2,
                        scaledWidth,
                        scaledHeight
                    );
                } else {
                    // 如果没有图片，使用黄色圆形作为 fallback
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(platformEffect.x, platformEffect.y, avatarRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // 恢复裁剪区域
                ctx.restore();
                ctx.save();
            }
            break;
        case 1: // 画圆特效
            // 绘制角色头像（使用角色图片生成圆形头像）
            if (window.selectedCharacter) {
                const avatarRadius = 28;
                
                // 创建圆形裁剪区域
                ctx.beginPath();
                ctx.arc(platformEffect.x, platformEffect.y, avatarRadius, 0, Math.PI * 2);
                ctx.clip();
                
                // 尝试使用角色图片
                let characterImage = null;
                if (window.selectedCharacter.id === 'martial_artist' && images.martialArtist) {
                    characterImage = images.martialArtist;
                } else if (window.selectedCharacter.id === 'mage' && images.mage) {
                    characterImage = images.mage;
                } else if (window.selectedCharacter.id === 'weapon_master' && images.weaponMaster) {
                    characterImage = images.weaponMaster;
                }
                
                if (characterImage) {
                    // 等比例缩小图片
                    const imgWidth = characterImage.width;
                    const imgHeight = characterImage.height;
                    const scale = (avatarRadius * 2) / Math.max(imgWidth, imgHeight);
                    const scaledWidth = imgWidth * scale;
                    const scaledHeight = imgHeight * scale;
                    
                    // 绘制图片，使其在圆形区域内居中
                    ctx.drawImage(
                        characterImage,
                        platformEffect.x - scaledWidth / 2,
                        platformEffect.y - scaledHeight / 2,
                        scaledWidth,
                        scaledHeight
                    );
                } else {
                    // 如果没有图片，使用黄色圆形作为 fallback
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(platformEffect.x, platformEffect.y, avatarRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // 恢复裁剪区域
                ctx.restore();
                ctx.save();
            }
            
            // 计算当前阶段的进度
            const progress = platformEffect.stageTime / platformEffect.stageDuration;
            
            // 毛笔效果参数
            let lineWidth = 8;
            let strokeAlpha = 1;
            
            // 画完一圈后的突出效果
            if (platformEffect.angle >= Math.PI * 2) {
                // 线条变粗
                lineWidth = 15;
                // 颜色变亮
                strokeAlpha = 1;
            }
            
            // 绘制毛笔画圈效果
            ctx.strokeStyle = `rgba(255, 0, 0, ${strokeAlpha})`;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // 直接一笔成圆，保持毛笔效果
            ctx.beginPath();
            const startAngle = 0;
            const endAngle = platformEffect.angle;
            const radius = platformEffect.radius;
            
            // 绘制完整的圆弧
            ctx.arc(platformEffect.x, platformEffect.y, radius, startAngle, endAngle);
            ctx.stroke();
            
            // 绘制毛笔端点
            const circleX = platformEffect.x + Math.cos(platformEffect.angle) * platformEffect.radius;
            const circleY = platformEffect.y + Math.sin(platformEffect.angle) * platformEffect.radius;
            ctx.fillStyle = `rgba(255, 0, 0, ${strokeAlpha})`;
            ctx.beginPath();
            ctx.arc(circleX, circleY, lineWidth / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
    
    ctx.restore();
}
