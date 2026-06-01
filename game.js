// Game initialization and flow control

let canvas;
let ctx;

let gameState = 'menu';
let previousGameState = 'menu';
let selectedCharacterDetails = null;

let settings = {
    sound: true,
    music: true,
    graphics: 'high',
    礼包码: ''
};

window.buttonEffects = {};

let menuButtons = [];
let mapButtons = [];
let characterButtons = [];
let characterDetailsButtons = [];
let gameButtons = [];
let battleButtons = [];
let gameOverButtons = [];
let victoryButtons = [];
let settingsButtons = [];
let confirmSaveButtons = [];

let codeInputX = 0;
let inputWidth = 0;
let codeY = 0;
let buttonHeight = 0;

let characterSelectSource = 'menu';
let currentFloor = 1;
const totalFloors = 5;
let selectedMap = 1;
let selectedCharacter = null;
let playerLevel = 1;
let playerExp = 0;
let playerHealth = 100;
let playerEnergy = 5;
let playerSkills = ['基础攻击'];
let playerItems = [];
let unlockedCharacters = ['拳法家'];
let unlockedDifficulties = ['普通'];
let clearedLevels = new Set();

let deck = [];
let hand = [];
let discardPile = [];
let isDrawingCards = false;

let characters = [];
let monsters = [];
let items = [];
let randomLevels = [];

let data = {
    skills: [],
    monsters: []
};

const imageConfig = {
    weaponMaster: 'pictures/wuqi.png',
    martialArtist: 'pictures/quanfa.png',
    mage: 'pictures/mofa.png'
};

const images = {};

function loadImages(imageMap) {
    const entries = Object.entries(imageMap);
    let loaded = 0;

    return new Promise((resolve) => {
        if (entries.length === 0) {
            resolve(images);
            return;
        }

        entries.forEach(([key, src]) => {
            const img = new Image();
            img.src = src;

            img.onload = () => {
                images[key] = img;
                loaded++;
                if (loaded === entries.length) {
                    resolve(images);
                }
            };

            img.onerror = () => {
                loaded++;
                if (loaded === entries.length) {
                    resolve(images);
                }
            };
        });
    });
}

async function loadCharacters() {
    try {
        const response = await fetch('./characters.json', { cache: 'no-store' });
        const charData = await response.json();
        characters = charData.characters;
    } catch (error) {
        characters = [
            { id: 'martial_artist', name: '拳法家', type: 'free', health: 90, defense: 12, skills: [{name: '直拳', unlockLevel: 1}, {name: '连环踢', unlockLevel: 2}] },
            { id: 'mage', name: '魔法师', type: 'locked', health: 70, defense: 10, skills: [{name: '火球术', unlockLevel: 1}, {name: '冰锥术', unlockLevel: 2}] },
            { id: 'weapon_master', name: '武器大师', type: 'locked', health: 85, defense: 18, skills: [{name: '武器精通', unlockLevel: 1}, {name: '旋风斩', unlockLevel: 2}] }
        ];
    }
}

async function loadItems() {
    try {
        const response = await fetch('./potion.json', { cache: 'no-store' });
        items = await response.json();
        window.items = items;
    } catch (error) {
        items = [
            {"id": 1, "name": "治疗药水", "type": "consumable", "effect": "health", "value": 30, "description": "恢复30点生命值"},
            {"id": 2, "name": "能量药水", "type": "consumable", "effect": "energy", "value": 3, "description": "恢复3点能量"},
            {"id": 3, "name": "攻击力提升", "type": "consumable", "effect": "attack", "value": 5, "duration": 3, "description": "3回合内增加5点攻击力"},
            {"id": 4, "name": "防御力提升", "type": "consumable", "effect": "defense", "value": 5, "duration": 3, "description": "3回合内增加5点防御力"}
        ];
        window.items = items;
    }
}

async function loadRandomLevels() {
    try {
        const response = await fetch('./Random-level.json', { cache: 'no-store' });
        randomLevels = await response.json();
    } catch (error) {
        randomLevels = [
            {"id": 1, "name": "普通关卡", "type": "normal", "monsterId": 1, "itemDropChance": 0.3},
            {"id": 2, "name": "精英关卡", "type": "elite", "monsterId": 2, "itemDropChance": 0.6},
            {"id": 3, "name": "宝藏关卡", "type": "treasure", "monsterId": 4, "itemDropChance": 0.8, "guaranteedItemId": 1},
            {"id": 4, "name": "休息关卡", "type": "rest", "monsterId": null, "itemDropChance": 0, "healAmount": 50, "energyRestore": 5}
        ];
    }
}

async function loadMonsters() {
    try {
        const response = await fetch('./monsters.json', { cache: 'no-store' });
        monsters = await response.json();
    } catch (error) {
        monsters = [
            {"id": 1, "name": "普通怪物", "health": 30, "maxHealth": 30, "attack": 8, "exp": 20, "type": "normal"},
            {"id": 2, "name": "小BOSS", "health": 100, "maxHealth": 100, "attack": 15, "exp": 50, "type": "mini-boss"},
            {"id": 3, "name": "最终BOSS", "health": 200, "maxHealth": 200, "attack": 25, "exp": 100, "type": "boss"},
            {"id": 4, "name": "神秘怪物", "health": 50, "maxHealth": 50, "attack": 10, "exp": 30, "type": "normal"}
        ];
    }
}

async function loadData() {
    try {
        const response = await fetch('./data.json', { cache: 'no-store' });
        const jsonData = await response.json();
        data = jsonData;
    } catch (error) {
        data = {
            skills: [
                {"id": 1, "name": "基础攻击", "damage": 10, "characterType": "all"},
                {"id": 2, "name": "格挡", "damage": 0, "blockValue": 10, "characterType": "all"}
            ]
        };
    }
}

const maps = [
    { id: 1, name: '森林迷宫', difficulty: '普通', unlocked: true },
    { id: 2, name: '火山洞穴', difficulty: '困难', unlocked: false },
    { id: 3, name: '暗黑城堡', difficulty: '专家', unlocked: false }
];

function generatePlatforms(canvasWidth, canvasHeight) {
    const centerX = canvasWidth / 2;
    const startY = canvasHeight * 0.85 + 90;
    const bossY = canvasHeight * 0.1 + 65;
    const levelHeight = (startY - bossY) / 5;
    const sideOffset = canvasWidth * 0.15;
    
    return [
        { x: centerX, y: startY, type: 'start', unlocked: true, cleared: false },
        { x: centerX, y: bossY, type: 'boss', unlocked: false, cleared: false },
        { x: centerX, y: bossY + levelHeight, type: 'rest', unlocked: false, cleared: false },
        { x: centerX + sideOffset, y: bossY + levelHeight * 1.5, type: 'mystery', unlocked: true, cleared: false },
        { x: centerX - sideOffset, y: bossY + levelHeight * 1.5, type: 'normal', unlocked: true, cleared: false },
        { x: centerX - sideOffset, y: bossY + levelHeight * 2.5, type: 'normal', unlocked: true, cleared: false },
        { x: centerX + sideOffset, y: bossY + levelHeight * 2.5, type: 'normal', unlocked: true, cleared: false },
        { x: centerX - sideOffset, y: bossY + levelHeight * 3.5, type: 'mini-boss', unlocked: true, cleared: false },
        { x: centerX + sideOffset, y: bossY + levelHeight * 3.5, type: 'mystery', unlocked: true, cleared: false },
        { x: centerX - sideOffset, y: bossY + levelHeight * 4.5, type: 'normal', unlocked: true, cleared: false },
        { x: centerX + sideOffset, y: bossY + levelHeight * 4.5, type: 'normal', unlocked: true, cleared: false }
    ];
}

let platforms = [];

function generateConnections() {
    return [
        [0, 9], [0, 10],
        [9, 7], [7, 5], [5, 4], [4, 2],
        [10, 8], [8, 6], [6, 3], [3, 2],
        [2, 1]
    ];
}

let connections = [];

let battleTimer = 0;
let battleTurn = 0;
let currentEnemy = null;
let battleLog = [];

function gameLoop() {
    if (!canvas || !ctx) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!platforms || platforms.length === 0) {
        platforms = generatePlatforms(canvas.width, canvas.height);
        connections = generateConnections();
    }
    
    drawUI();
    
    if (gameState === 'battle') {
        updateBattle();
    }
    
    requestAnimationFrame(gameLoop);
}

function updateBattle() {
    if (battleTimer > 0) {
        battleTimer--;
        if (battleTimer === 0) {
            enemyTurn();
        }
    }
}

function enemyTurn() {
    let defense = 0;
    if (selectedCharacter) {
        defense = selectedCharacter.defense || 0;
    }
    
    let damage = Math.max(1, currentEnemy.attack - defense / 2);
    playerHealth -= damage;
    battleLog.push(`${currentEnemy.name}攻击了你，造成${damage}点伤害`);
    
    if (playerHealth <= 0) {
        playerHealth = 0;
        gameState = 'gameOver';
    } else {
        battleTurn++;
        battleTimer = 0;
    }
}

function useSkill(skill) {
    if (playerEnergy <= 0) {
        battleLog.push('能量不足！');
        return;
    }
    
    let damage = 0;
    
    if (typeof data !== 'undefined' && data.skills) {
        const skillData = data.skills.find(s => s.name === skill);
        if (skillData && skillData.damage) {
            damage = Math.abs(skillData.damage);
        }
    }
    
    if (damage === 0) {
        switch(skill) {
            case '基础攻击': damage = 15; break;
            case '直拳': damage = 18; break;
            case '连环踢': damage = 8 * 3; battleLog.push('你使用了连环踢，造成3段伤害'); break;
            case '火球术': damage = 25; break;
            case '冰锥术': damage = 20; currentEnemy.attack -= 3; battleLog.push('你使用了冰锥术，敌人攻击降低3点'); break;
            case '武器精通': damage = 22; break;
            case '旋风斩': damage = 18 * 2; break;
            default: damage = 10;
        }
    }
    
    currentEnemy.health -= damage;
    playerEnergy--;
    battleLog.push(`你使用了${skill}，造成${damage}点伤害`);
    
    if (currentEnemy.health <= 0) {
        currentEnemy.health = 0;
        playerExp += currentEnemy.exp;
        if (playerExp >= playerLevel * 100) {
            playerLevel++;
            playerExp -= playerLevel * 100;
            playerEnergy++;
            battleLog.push(`恭喜你升级到${playerLevel}级！`);
        }
        gameState = 'victory';
    }
}

function useItem(item) {
    switch(item) {
        case '治疗药水':
            playerHealth = Math.min(playerHealth + 50, selectedCharacter.health);
            battleLog.push('你使用了治疗药水，恢复了50点生命值');
            break;
        case '能量药水':
            playerEnergy = Math.min(playerEnergy + 3, 10);
            battleLog.push('你使用了能量药水，恢复了3点能量');
            break;
    }
    playerItems = playerItems.filter(i => i !== item);
}

function endTurn() {
    playerEnergy = Math.min(playerEnergy + 2, 10);
    battleLog.push('你结束了回合，恢复了2点能量');
    battleTimer = 180;
    
    setTimeout(() => {
        drawCards(6);
    }, 1000);
}

function resetGame() {
    currentFloor = 1;
    playerLevel = 1;
    playerExp = 0;
    playerHealth = selectedCharacter ? selectedCharacter.health : 100;
    playerEnergy = 5;
    
    if (selectedCharacter && selectedCharacter.skills) {
        playerSkills = selectedCharacter.skills.map(skill => {
            return typeof skill === 'string' ? skill : skill.name;
        });
    } else {
        playerSkills = ['基础攻击'];
    }
    
    playerItems = [];
    clearedLevels = new Set();
    battleLog = [];
    
    if (window.currentSaveId) {
        window.currentSaveId = null;
    }
    
    platforms = generatePlatforms(canvas.width, canvas.height);
    connections = generateConnections();
    
    initializeDeck();
}

function initializeDeck() {
    deck = [];
    hand = [];
    discardPile = [];
    
    if (playerSkills.length > 0) {
        playerSkills.forEach(skill => {
            const skillName = typeof skill === 'object' && skill.name ? skill.name : skill;
            const cardCount = (skillName === '基础攻击' || skillName === '格挡') ? 5 : 1;
            
            for (let i = 0; i < cardCount; i++) {
                deck.push(skillName);
            }
        });
        
        shuffleDeck();
    }
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function drawCards(count = 6) {
    hand = [];
    
    for (let i = 0; i < count; i++) {
        if (deck.length === 0) {
            deck = [...discardPile];
            discardPile = [];
            shuffleDeck();
        }
        
        if (deck.length > 0) {
            hand.push(deck.pop());
        }
    }
}

function useCard(card) {
    useSkill(card);
    discardPile.push(card);
    hand = hand.filter(c => c !== card);
}

function initializeEventListeners() {
    if (!canvas) {
        return;
    }
    
    let touchStartY = 0;
    let touchStartX = 0;
    
    canvas.addEventListener('touchstart', function(e) {
        try {
            const rect = canvas.getBoundingClientRect();
            touchStartY = e.touches[0].clientY - rect.top;
            touchStartX = e.touches[0].clientX - rect.left;
        } catch (error) {
            console.error('Error in touchstart handler:', error);
        }
    });
    
    canvas.addEventListener('touchmove', function(e) {
        try {
            const rect = canvas.getBoundingClientRect();
            const currentY = e.touches[0].clientY - rect.top;
            const deltaY = touchStartY - currentY;
            
            if (window.gameState === 'characterDetails' && typeof window.skillVerticalOffset !== 'undefined') {
                window.skillVerticalOffset += deltaY;
                
                const totalCards = window.selectedCharacterDetails && window.selectedCharacterDetails.skills ? 
                    window.selectedCharacterDetails.skills.length : 8;
                const cardsPerRow = 4;
                const totalRows = Math.ceil(totalCards / cardsPerRow);
                const cardWidth = (canvas.width - 100) / cardsPerRow * 0.75;
                const cardHeight = cardWidth * 1.5;
                const cardSpacingY = 20;
                const totalHeight = totalRows * (cardHeight + cardSpacingY) + 20;
                const cardAreaHeight = canvas.height * 0.75 - canvas.height * 0.45 - 50;
                const maxVerticalOffset = Math.max(0, totalHeight - (cardAreaHeight - 60));
                
                window.skillVerticalOffset = Math.max(0, Math.min(window.skillVerticalOffset, maxVerticalOffset));
            }
            
            touchStartY = currentY;
            touchStartX = e.touches[0].clientX - rect.left;
        } catch (error) {
            console.error('Error in touchmove handler:', error);
        }
    });
    
    canvas.addEventListener('wheel', function(e) {
        try {
            if (window.gameState === 'characterDetails' && typeof window.skillVerticalOffset !== 'undefined') {
                e.preventDefault();
                
                const deltaY = e.deltaY * 0.5;
                window.skillVerticalOffset += deltaY;
                
                const totalCards = window.selectedCharacterDetails && window.selectedCharacterDetails.skills ? 
                    window.selectedCharacterDetails.skills.length : 8;
                const cardsPerRow = 4;
                const totalRows = Math.ceil(totalCards / cardsPerRow);
                const cardWidth = (canvas.width - 100) / cardsPerRow * 0.75;
                const cardHeight = cardWidth * 1.5;
                const cardSpacingY = 20;
                const totalHeight = totalRows * (cardHeight + cardSpacingY) + 20;
                const cardAreaHeight = canvas.height * 0.75 - canvas.height * 0.45 - 50;
                const maxVerticalOffset = Math.max(0, totalHeight - (cardAreaHeight - 60));
                
                window.skillVerticalOffset = Math.max(0, Math.min(window.skillVerticalOffset, maxVerticalOffset));
            }
        } catch (error) {
            console.error('Error in wheel handler:', error);
        }
    });
    
    canvas.addEventListener('click', function(e) {
        try {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            switch(window.gameState) {
                case 'menu':
                    const currentMenuButtons = window.menuButtons || menuButtons;
                    if (currentMenuButtons) {
                        for (let button of currentMenuButtons) {
                            if (x >= button.x && x <= button.x + button.width && 
                                y >= button.y && y <= button.y + button.height) {
                                button.action();
                                return;
                            }
                        }
                    }
                    break;
                case 'mapSelect':
                    for (let button of mapButtons) {
                        if (x >= button.x && x <= button.x + button.width && 
                            y >= button.y && y <= button.y + button.height) {
                            button.action();
                            return;
                        }
                    }
                    break;
                case 'characterSelect':
                    for (let button of window.characterButtons) {
                        if (x >= button.x && x <= button.x + button.width && 
                            y >= button.y && y <= button.y + button.height) {
                            button.action();
                            return;
                        }
                    }
                    break;
                case 'game':
                    for (let button of gameButtons) {
                        if (x >= button.x && x <= button.x + button.width && 
                            y >= button.y && y <= button.y + button.height) {
                            button.action();
                            return;
                        }
                    }
                    
                    for (let i = 0; i < platforms.length; i++) {
                        const platform = platforms[i];
                        if (platform.unlocked) {
                            let platformRadius;
                            switch(platform.type) {
                                case 'start': platformRadius = 100; break;
                                case 'boss': platformRadius = 60; break;
                                default: platformRadius = 30;
                            }
                            
                            const distance = Math.sqrt((x - platform.x) ** 2 + (y - platform.y) ** 2);
                            if (distance <= platformRadius) {
                                gameState = 'battle';
                                
                                switch(platform.type) {
                                    case 'boss':
                                        currentEnemy = { name: '最终BOSS', health: 200, maxHealth: 200, attack: 20, defense: 10, exp: 100 };
                                        break;
                                    case 'mini-boss':
                                        currentEnemy = { name: '小BOSS', health: 100, maxHealth: 100, attack: 15, defense: 5, exp: 50 };
                                        break;
                                    case 'normal':
                                        currentEnemy = { name: '普通怪物', health: 50, maxHealth: 50, attack: 10, defense: 2, exp: 20 };
                                        break;
                                    case 'mystery':
                                        currentEnemy = { name: '神秘怪物', health: 80, maxHealth: 80, attack: 12, defense: 3, exp: 30 };
                                        break;
                                    case 'rest':
                                        playerHealth = selectedCharacter.health;
                                        gameState = 'game';
                                        return;
                                    default:
                                        currentEnemy = { name: '普通怪物', health: 50, maxHealth: 50, attack: 10, defense: 2, exp: 20 };
                                }
                                
                                if (hand.length === 0) {
                                    drawCards(6);
                                }
                                
                                return;
                            }
                        }
                    }
                    break;
                case 'battle':
                    for (let button of battleButtons) {
                        if (x >= button.x && x <= button.x + button.width && 
                            y >= button.y && y <= button.y + button.height) {
                            button.action();
                            return;
                        }
                    }
                    break;
                case 'gameOver':
                    for (let button of gameOverButtons) {
                        if (x >= button.x && x <= button.x + button.width && 
                            y >= button.y && y <= button.y + button.height) {
                            button.action();
                            return;
                        }
                    }
                    break;
                case 'victory':
                    for (let button of victoryButtons) {
                        if (x >= button.x && x <= button.x + button.width && 
                            y >= button.y && y <= button.y + button.height) {
                            button.action();
                            return;
                        }
                    }
                    break;
                case 'settings':
                    for (let button of settingsButtons) {
                        if (x >= button.x && x <= button.x + button.width && 
                            y >= button.y && y <= button.y + button.height) {
                            button.action();
                            return;
                        }
                    }
                    break;
                case 'characterDetails':
                    for (let button of window.characterDetailsButtons) {
                        if (x >= button.x && x <= button.x + button.width && 
                            y >= button.y && y <= button.y + button.height) {
                            button.action();
                            return;
                        }
                    }
                    break;
                case 'itemManagement':
                    for (let button of window.itemButtons) {
                        if (x >= button.x && x <= button.x + button.width && 
                            y >= button.y && y <= button.y + button.height) {
                            button.action();
                            return;
                        }
                    }
                    for (let button of window.characterDetailsButtons) {
                        if (x >= button.x && x <= button.x + button.width && 
                            y >= button.y && y <= button.y + button.height) {
                            button.action();
                            return;
                        }
                    }
                    break;
                case 'loadGame':
                    for (let button of window.loadGameButtons) {
                        if (x >= button.x && x <= button.x + button.width && 
                            y >= button.y && y <= button.y + button.height && 
                            button.action) {
                            button.action();
                            return;
                        }
                    }
                    break;
                case 'confirmSave':
                    for (let button of confirmSaveButtons) {
                        if (x >= button.x && x <= button.x + button.width && 
                            y >= button.y && y <= button.y + button.height) {
                            button.action();
                            return;
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error('Error in click handler:', error);
        }
    });
}

window.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('gameCanvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
        initializeEventListeners();
        
        globalThis.ctx = ctx;
        globalThis.canvas = canvas;
        globalThis.gameState = gameState;
        globalThis.previousGameState = previousGameState;
        globalThis.selectedCharacter = selectedCharacter;
        globalThis.selectedCharacterDetails = selectedCharacterDetails;
        globalThis.playerHealth = playerHealth;
        globalThis.playerEnergy = playerEnergy;
        globalThis.currentEnemy = currentEnemy;
        globalThis.battleLog = battleLog;
        globalThis.deck = deck;
        globalThis.discardPile = discardPile;
        globalThis.hand = hand;
        globalThis.battleButtons = battleButtons;
        globalThis.characterButtons = characterButtons;
        globalThis.characterDetailsButtons = characterDetailsButtons;
        globalThis.gameButtons = gameButtons;
        globalThis.menuButtons = menuButtons;
        globalThis.mapButtons = mapButtons;
        globalThis.gameOverButtons = gameOverButtons;
        globalThis.victoryButtons = victoryButtons;
        globalThis.settingsButtons = settingsButtons;
        globalThis.confirmSaveButtons = confirmSaveButtons;
        globalThis.settings = settings;
        globalThis.characterSelectSource = characterSelectSource;
        globalThis.characters = characters;
        globalThis.images = images;
        globalThis.endTurn = endTurn;
        globalThis.useCard = useCard;
        globalThis.getScaledValue = getScaledValue;
        globalThis.drawButton = drawButton;
    }
});

window.gameState = gameState;

Promise.all([
    loadCharacters(),
    loadMonsters(),
    loadData(),
    loadItems(),
    loadRandomLevels(),
    loadImages(imageConfig)
]).then(() => {
    if (typeof loadSaveData === 'function') {
        loadSaveData();
    }
    if (canvas && ctx) {
        gameLoop();
    }
}).catch((error) => {
    if (canvas && ctx) {
        gameLoop();
    }
});

setTimeout(() => {
    if (canvas && ctx && typeof gameLoop === 'function') {
        gameLoop();
    }
}, 100);