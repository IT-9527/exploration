using UnityEngine;
using System.Collections.Generic;

public class ShopManager : MonoBehaviour {
    public static ShopManager Instance;
    
    public List<ShopItemData> shopItems = new List<ShopItemData>();
    
    public List<CardData> cardTemplates = new List<CardData>();
    public List<ShopItemData> potionTemplates = new List<ShopItemData>();
    
    void Awake() {
        if (Instance == null) {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        } else {
            Destroy(gameObject);
        }
        
        InitializeTemplates();
    }
    
    void InitializeTemplates() {
        InitializeCardTemplates();
        InitializePotionTemplates();
    }
    
    void InitializeCardTemplates() {
        cardTemplates.Add(new CardData { name = "猛击", damage = 18, cost = 1, type = "attack", characterType = "martial_artist" });
        cardTemplates.Add(new CardData { name = "连环踢", damage = 12, cost = 1, type = "attack", hits = 2, characterType = "martial_artist" });
        cardTemplates.Add(new CardData { name = "旋风腿", damage = 22, cost = 2, type = "attack", characterType = "martial_artist" });
        cardTemplates.Add(new CardData { name = "升龙击", damage = 25, cost = 2, type = "attack", characterType = "martial_artist" });
        cardTemplates.Add(new CardData { name = "降龙掌", damage = 32, cost = 3, type = "attack", characterType = "martial_artist" });
        cardTemplates.Add(new CardData { name = "护体真气", blockValue = 15, cost = 2, type = "defense", characterType = "martial_artist" });
        cardTemplates.Add(new CardData { name = "暴击拳", damage = 35, cost = 2, type = "attack", characterType = "martial_artist" });
        cardTemplates.Add(new CardData { name = "吸血拳", damage = 15, cost = 1, type = "attack", lifesteal = true, characterType = "martial_artist" });
        
        cardTemplates.Add(new CardData { name = "火球术", damage = 22, cost = 2, type = "attack", characterType = "mage" });
        cardTemplates.Add(new CardData { name = "冰锥术", damage = 18, cost = 1, type = "attack", characterType = "mage" });
        cardTemplates.Add(new CardData { name = "雷电术", damage = 28, cost = 3, type = "attack", characterType = "mage" });
        cardTemplates.Add(new CardData { name = "魔法护盾", blockValue = 18, cost = 1, type = "defense", characterType = "mage" });
        cardTemplates.Add(new CardData { name = "冰风暴", damage = 20, cost = 2, type = "attack", characterType = "mage" });
        cardTemplates.Add(new CardData { name = "火焰爆发", damage = 30, cost = 3, type = "attack", characterType = "mage" });
        cardTemplates.Add(new CardData { name = "魔法增幅", damage = 25, cost = 2, type = "attack", characterType = "mage" });
        cardTemplates.Add(new CardData { name = "治愈术", heal = 20, cost = 2, type = "heal", characterType = "mage" });
        
        cardTemplates.Add(new CardData { name = "武器精通", damage = 20, cost = 1, type = "attack", characterType = "weapon_master" });
        cardTemplates.Add(new CardData { name = "旋风斩", damage = 30, cost = 3, type = "attack", characterType = "weapon_master" });
        cardTemplates.Add(new CardData { name = "突刺", damage = 25, cost = 2, type = "attack", characterType = "weapon_master" });
        cardTemplates.Add(new CardData { name = "拔刀斩", damage = 28, cost = 3, type = "attack", characterType = "weapon_master" });
        cardTemplates.Add(new CardData { name = "飞剑之术", damage = 22, cost = 2, type = "attack", characterType = "weapon_master" });
        cardTemplates.Add(new CardData { name = "横扫千军", damage = 25, cost = 2, type = "attack", characterType = "weapon_master" });
        cardTemplates.Add(new CardData { name = "武器强化", damage = 32, cost = 2, type = "attack", characterType = "weapon_master" });
        cardTemplates.Add(new CardData { name = "盾墙", blockValue = 22, cost = 1, type = "defense", characterType = "weapon_master" });
        
        cardTemplates.Add(new CardData { name = "攻击", damage = 12, cost = 1, type = "attack", characterType = "all" });
        cardTemplates.Add(new CardData { name = "格挡", blockValue = 10, cost = 1, type = "defense", characterType = "all" });
        cardTemplates.Add(new CardData { name = "连击", damage = 8, cost = 1, type = "attack", hits = 2, characterType = "all" });
        cardTemplates.Add(new CardData { name = "小型治愈", heal = 12, cost = 1, type = "heal", characterType = "all" });
        cardTemplates.Add(new CardData { name = "闪避", blockValue = 8, cost = 1, type = "defense", characterType = "all" });
        cardTemplates.Add(new CardData { name = "愤怒", damage = 15, cost = 1, type = "attack", characterType = "all" });
    }
    
    void InitializePotionTemplates() {
        potionTemplates.Add(new ShopItemData { name = "小型生命药水", effect = "health", value = 20, description = "恢复20点生命值" });
        potionTemplates.Add(new ShopItemData { name = "中型生命药水", effect = "health", value = 40, description = "恢复40点生命值" });
        potionTemplates.Add(new ShopItemData { name = "大型生命药水", effect = "health", value = 60, description = "恢复60点生命值" });
        potionTemplates.Add(new ShopItemData { name = "能量药水", effect = "energy", value = 3, description = "恢复3点能量" });
        potionTemplates.Add(new ShopItemData { name = "力量药水", effect = "tempAttack", value = 5, description = "战斗中攻击力+5" });
        potionTemplates.Add(new ShopItemData { name = "防御药水", effect = "tempDefense", value = 5, description = "战斗中防御力+5" });
        potionTemplates.Add(new ShopItemData { name = "幸运药水", effect = "luck", value = 10, description = "增加10%暴击率" });
        potionTemplates.Add(new ShopItemData { name = "经验药水", effect = "exp", value = 20, description = "获得20点额外经验" });
    }
    
    public void GenerateShopItems() {
        shopItems.Clear();
        
        string characterType = GameManager.Instance.selectedCharacter?.id ?? "martial_artist";
        
        List<CardData> characterCards = cardTemplates.FindAll(c => c.characterType == characterType);
        List<CardData> allCards = cardTemplates.FindAll(c => c.characterType == "all");
        
        List<CardData> availableCards = new List<CardData>();
        availableCards.AddRange(characterCards);
        availableCards.AddRange(allCards);
        
        for (int i = 0; i < 4; i++) {
            bool useCharacterCard = Random.value < 0.7f && characterCards.Count > 0;
            List<CardData> sourceCards = useCharacterCard ? characterCards : availableCards;
            
            CardData cardTemplate = sourceCards[Random.Range(0, sourceCards.Count)];
            ShopItemData cardItem = new ShopItemData {
                id = $"card_{Time.time}_{i}",
                type = "card",
                name = cardTemplate.name,
                damage = cardTemplate.damage,
                blockValue = cardTemplate.blockValue,
                heal = cardTemplate.heal,
                hits = cardTemplate.hits,
                energyCost = cardTemplate.cost,
                lifesteal = cardTemplate.lifesteal,
                energyRestore = cardTemplate.energyRestore,
                characterType = cardTemplate.characterType,
                price = Random.Range(15, 41),
                description = GetCardDescription(cardTemplate)
            };
            shopItems.Add(cardItem);
        }
        
        for (int i = 0; i < 4; i++) {
            ShopItemData potionTemplate = potionTemplates[Random.Range(0, potionTemplates.Count)];
            ShopItemData potionItem = new ShopItemData {
                id = $"potion_{Time.time}_{i}",
                type = "potion",
                name = potionTemplate.name,
                effect = potionTemplate.effect,
                value = potionTemplate.value,
                price = Random.Range(10, 31),
                description = potionTemplate.description
            };
            shopItems.Add(potionItem);
        }
        
        ShuffleList(shopItems);
    }
    
    string GetCardDescription(CardData card) {
        switch (card.type) {
            case "attack":
                return card.hits > 1 ? $"造成{card.damage}点伤害，攻击{card.hits}次" : $"造成{card.damage}点伤害";
            case "defense":
                return $"获得{card.blockValue}点护盾";
            case "heal":
                return $"恢复{card.heal}点生命值";
            default:
                return "特殊效果";
        }
    }
    
    void ShuffleList<T>(List<T> list) {
        for (int i = list.Count - 1; i > 0; i--) {
            int j = Random.Range(0, i + 1);
            T temp = list[i];
            list[i] = list[j];
            list[j] = temp;
        }
    }
    
    public bool BuyItem(int index) {
        if (index < 0 || index >= shopItems.Count) return false;
        
        ShopItemData item = shopItems[index];
        
        if (GameManager.Instance.playerGold < item.price) return false;
        
        GameManager.Instance.playerGold -= item.price;
        
        if (item.type == "card") {
            CardData newCard = new CardData {
                name = item.name,
                damage = item.damage,
                cost = item.energyCost,
                description = item.description
            };
            
            if (DeckManager.Instance != null) {
                DeckManager.Instance.AddCard(newCard);
            }
            
            shopItems.RemoveAt(index);
            return true;
        } else if (item.type == "potion") {
            ApplyPotionEffect(item);
            shopItems.RemoveAt(index);
            return true;
        }
        
        return false;
    }
    
    void ApplyPotionEffect(ShopItemData potion) {
        switch (potion.effect) {
            case "health":
            case "heal":
                GameManager.Instance.playerHealth = Mathf.Min(
                    GameManager.Instance.playerHealth + potion.value,
                    GameManager.Instance.selectedCharacter.health
                );
                break;
            case "energy":
                GameManager.Instance.playerEnergy = Mathf.Min(GameManager.Instance.playerEnergy + potion.value, 12);
                break;
            case "exp":
                GameManager.Instance.AddExp(potion.value);
                break;
        }
    }
    
    public bool RefreshShop() {
        int refreshCost = 10;
        if (GameManager.Instance.playerGold < refreshCost) return false;
        
        GameManager.Instance.playerGold -= refreshCost;
        GenerateShopItems();
        return true;
    }
}