// 商店系统
let shopItems = [];
let gold = 50; // 初始金币

// 从外部JSON文件加载数据
let cardTemplates = {};
let potionTemplates = [];

// 初始化商店数据
async function initShopData() {
    try {
        // 加载技能/卡牌数据
        const skillsResponse = await fetch('./data.json', { cache: 'no-store' });
        const skillsData = await skillsResponse.json();
        
        // 按角色类型分组卡牌
        cardTemplates = skillsData.skills.reduce((acc, skill) => {
            const type = skill.characterType;
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push({
                name: skill.name,
                damage: skill.damage,
                blockValue: skill.blockValue,
                energyCost: skill.energyCost,
                type: skill.damage > 0 ? 'attack' : (skill.blockValue ? 'defense' : (skill.damage < 0 ? 'heal' : 'utility')),
                characterType: skill.characterType
            });
            return acc;
        }, {});
        
        // 添加通用卡牌列表（合并所有 'all' 类型的卡牌）
        cardTemplates.all = cardTemplates.all || [];
        
        console.log('商店卡牌数据加载成功');
    } catch (error) {
        console.error('加载卡牌数据失败:', error);
        // 使用默认卡牌模板作为fallback
        cardTemplates = {
            martial_artist: [
                { name: '猛击', damage: 18, energyCost: 1, type: 'attack', characterType: 'martial_artist' },
                { name: '连环踢', damage: 12, hits: 2, energyCost: 1, type: 'attack', characterType: 'martial_artist' },
                { name: '旋风腿', damage: 22, energyCost: 2, type: 'attack', characterType: 'martial_artist' },
                { name: '升龙击', damage: 25, energyCost: 2, type: 'attack', characterType: 'martial_artist' },
                { name: '降龙掌', damage: 32, energyCost: 3, type: 'attack', characterType: 'martial_artist' },
                { name: '护体真气', blockValue: 15, energyCost: 2, type: 'defense', characterType: 'martial_artist' },
                { name: '暴击拳', damage: 35, energyCost: 2, type: 'attack', characterType: 'martial_artist' },
                { name: '吸血拳', damage: 15, lifesteal: true, energyCost: 1, type: 'attack', characterType: 'martial_artist' },
            ],
            mage: [
                { name: '火球术', damage: 22, energyCost: 2, type: 'attack', characterType: 'mage' },
                { name: '冰锥术', damage: 18, energyCost: 1, type: 'attack', characterType: 'mage' },
                { name: '雷电术', damage: 28, energyCost: 3, type: 'attack', characterType: 'mage' },
                { name: '魔法护盾', blockValue: 18, energyCost: 1, type: 'defense', characterType: 'mage' },
                { name: '冰风暴', damage: 20, energyCost: 2, type: 'attack', characterType: 'mage' },
                { name: '火焰爆发', damage: 30, energyCost: 3, type: 'attack', characterType: 'mage' },
                { name: '魔法增幅', damage: 25, energyCost: 2, type: 'attack', characterType: 'mage' },
                { name: '治愈术', heal: 20, energyCost: 2, type: 'heal', characterType: 'mage' },
            ],
            weapon_master: [
                { name: '武器精通', damage: 20, energyCost: 1, type: 'attack', characterType: 'weapon_master' },
                { name: '旋风斩', damage: 30, energyCost: 3, type: 'attack', characterType: 'weapon_master' },
                { name: '突刺', damage: 25, energyCost: 2, type: 'attack', characterType: 'weapon_master' },
                { name: '拔刀斩', damage: 28, energyCost: 3, type: 'attack', characterType: 'weapon_master' },
                { name: '飞剑之术', damage: 22, energyCost: 2, type: 'attack', characterType: 'weapon_master' },
                { name: '横扫千军', damage: 25, energyCost: 2, type: 'attack', characterType: 'weapon_master' },
                { name: '武器强化', damage: 32, energyCost: 2, type: 'attack', characterType: 'weapon_master' },
                { name: '盾墙', blockValue: 22, energyCost: 1, type: 'defense', characterType: 'weapon_master' },
            ],
            all: [
                { name: '攻击', damage: 12, energyCost: 1, type: 'attack', characterType: 'all' },
                { name: '格挡', blockValue: 10, energyCost: 1, type: 'defense', characterType: 'all' },
                { name: '连击', damage: 8, hits: 2, energyCost: 1, type: 'attack', characterType: 'all' },
                { name: '小型治愈', heal: 12, energyCost: 1, type: 'heal', characterType: 'all' },
                { name: '闪避', blockValue: 8, energyCost: 1, type: 'defense', characterType: 'all' },
                { name: '愤怒', damage: 15, energyCost: 1, type: 'attack', characterType: 'all' },
            ]
        };
    }
    
    try {
        // 加载药水数据
        const potionResponse = await fetch('./potion.json', { cache: 'no-store' });
        const potionData = await potionResponse.json();
        
        potionTemplates = potionData.map(potion => ({
            name: potion.name,
            effect: potion.effect,
            value: potion.value,
            description: potion.description
        }));
        
        console.log('商店药水数据加载成功');
    } catch (error) {
        console.error('加载药水数据失败:', error);
        // 使用默认药水模板作为fallback
        potionTemplates = [
            { name: '小型生命药水', effect: 'heal', value: 20, description: '恢复20点生命值' },
            { name: '中型生命药水', effect: 'heal', value: 40, description: '恢复40点生命值' },
            { name: '大型生命药水', effect: 'heal', value: 60, description: '恢复60点生命值' },
            { name: '能量药水', effect: 'energy', value: 3, description: '恢复3点能量' },
            { name: '力量药水', effect: 'tempAttack', value: 5, description: '战斗中攻击力+5' },
            { name: '防御药水', effect: 'tempDefense', value: 5, description: '战斗中防御力+5' },
            { name: '幸运药水', effect: 'luck', value: 10, description: '增加10%暴击率' },
            { name: '经验药水', effect: 'exp', value: 20, description: '获得20点额外经验' },
        ];
    }
}

// 生成随机商店物品（根据角色类型）
function generateShopItems() {
    shopItems = [];
    
    // 获取当前选择的角色类型
    const selectedCharacter = globalThis.selectedCharacter;
    const characterType = selectedCharacter ? selectedCharacter.id : 'martial_artist';
    
    // 获取该角色类型的专属卡牌模板
    const characterCards = cardTemplates[characterType] || cardTemplates.martial_artist;
    const allCards = cardTemplates.all || [];
    
    // 合并专属卡牌和通用卡牌
    const availableCards = [...characterCards, ...allCards];
    
    // 随机生成4张卡牌（优先选择角色专属卡牌）
    for (let i = 0; i < 4; i++) {
        // 70%概率选择角色专属卡牌，30%概率选择通用卡牌
        const useCharacterCard = Math.random() < 0.7 && characterCards.length > 0;
        const sourceCards = useCharacterCard ? characterCards : availableCards;
        
        const cardTemplate = sourceCards[Math.floor(Math.random() * sourceCards.length)];
        const cardItem = {
            id: `card_${Date.now()}_${i}`,
            type: 'card',
            name: cardTemplate.name,
            damage: cardTemplate.damage,
            blockValue: cardTemplate.blockValue,
            heal: cardTemplate.heal,
            hits: cardTemplate.hits,
            energyCost: cardTemplate.energyCost,
            lifesteal: cardTemplate.lifesteal,
            energyRestore: cardTemplate.energyRestore,
            characterType: cardTemplate.characterType,
            price: Math.floor(15 + Math.random() * 25),
            description: cardTemplate.type === 'attack' ? `造成${cardTemplate.damage}点伤害` :
                        cardTemplate.type === 'defense' ? `获得${cardTemplate.blockValue}点护盾` :
                        cardTemplate.type === 'heal' ? `恢复${cardTemplate.heal}点生命值` :
                        cardTemplate.type === 'utility' ? '特殊效果' : '攻击卡牌'
        };
        shopItems.push(cardItem);
    }
    
    // 随机生成4瓶药水
    for (let i = 0; i < 4; i++) {
        const potionTemplate = potionTemplates[Math.floor(Math.random() * potionTemplates.length)];
        const potionItem = {
            id: `potion_${Date.now()}_${i}`,
            type: 'potion',
            name: potionTemplate.name,
            effect: potionTemplate.effect,
            value: potionTemplate.value,
            price: Math.floor(10 + Math.random() * 20),
            description: potionTemplate.description
        };
        shopItems.push(potionItem);
    }
    
    // 随机打乱顺序
    shopItems.sort(() => Math.random() - 0.5);
    
    globalThis.shopItems = shopItems;
}

// 购买物品
function buyItem(itemIndex) {
    const item = shopItems[itemIndex];
    if (!item) return false;
    
    if (gold < item.price) {
        return false;
    }
    
    gold -= item.price;
    globalThis.gold = gold;
    
    if (item.type === 'card') {
        const newCard = {
            id: item.id,
            name: item.name,
            damage: item.damage,
            blockValue: item.blockValue,
            heal: item.heal,
            hits: item.hits,
            energyCost: item.energyCost,
            lifesteal: item.lifesteal,
            energyRestore: item.energyRestore
        };
        
        if (typeof globalThis.deck !== 'undefined') {
            globalThis.deck.push(newCard);
        }
        
        shopItems.splice(itemIndex, 1);
        globalThis.shopItems = shopItems;
        
        return true;
    } else if (item.type === 'potion') {
        applyPotionEffect(item);
        
        shopItems.splice(itemIndex, 1);
        globalThis.shopItems = shopItems;
        
        return true;
    }
    
    return false;
}

// 应用药水效果
function applyPotionEffect(potion) {
    switch(potion.effect) {
        case 'health':
        case 'heal':
            if (typeof globalThis.playerHealth !== 'undefined' && typeof globalThis.selectedCharacter !== 'undefined') {
                globalThis.playerHealth = Math.min(globalThis.playerHealth + potion.value, globalThis.selectedCharacter.health);
            }
            break;
        case 'energy':
            if (typeof globalThis.playerEnergy !== 'undefined') {
                globalThis.playerEnergy = Math.min(globalThis.playerEnergy + potion.value, 12);
            }
            break;
        case 'exp':
            if (typeof globalThis.battleLog !== 'undefined') {
                globalThis.battleLog.push(`使用${potion.name}，获得${potion.value}点额外经验`);
            }
            break;
        default:
            break;
    }
}

// 关闭商店
function closeShop() {
    globalThis.gameState = 'game';
}

// 刷新商店（需要消耗金币）
function refreshShop() {
    const refreshCost = 10;
    if (gold < refreshCost) {
        return false;
    }
    gold -= refreshCost;
    globalThis.gold = gold;
    generateShopItems();
    return true;
}

// 初始化数据
initShopData();

// 暴露到全局
globalThis.shopItems = shopItems;
globalThis.gold = gold;
globalThis.generateShopItems = generateShopItems;
globalThis.buyItem = buyItem;
globalThis.closeShop = closeShop;
globalThis.refreshShop = refreshShop;
globalThis.initShopData = initShopData;