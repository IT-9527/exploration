using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System.Collections.Generic;

public class BattlePanel : MonoBehaviour {
    public Text playerHealthText;
    public Text playerEnergyText;
    public Text playerLevelText;
    public Text enemyHealthText;
    public Text enemyNameText;
    public Image playerAvatarImage;
    public Image enemyAvatarImage;
    public CardHand cardHand;
    public Button endTurnButton;
    public Text battleLogText;
    public Image deckDisplay;
    public Image discardDisplay;
    public Text deckCountText;
    public Text discardCountText;
    public Button settingsButton;
    
    private Enemy currentEnemy;
    private int turnCount = 1;
    private List<string> battleLog = new List<string>();
    private List<CardData> deck = new List<CardData>();
    private List<CardData> discardPile = new List<CardData>();
    
    void Start() {
        endTurnButton.onClick.AddListener(EndTurn);
        settingsButton.onClick.AddListener(OnSettings);
        
        deckDisplay.transform.GetComponent<Button>().onClick.AddListener(OnViewDeck);
        discardDisplay.transform.GetComponent<Button>().onClick.AddListener(OnViewDiscard);
    }
    
    void OnEnable() {
        StartBattle();
    }
    
    void OnSettings() {
        GameManager.Instance.ChangeState(GameManager.GameState.Settings);
    }
    
    void OnViewDeck() {
        GameManager.Instance.ChangeState(GameManager.GameState.DeckView);
    }
    
    void OnViewDiscard() {
        GameManager.Instance.ChangeState(GameManager.GameState.DiscardView);
    }
    
    void StartBattle() {
        currentEnemy = SpawnEnemy();
        InitializeDeck();
        UpdateDeckDisplay();
        UpdateDiscardDisplay();
        UpdateUI();
        DrawInitialCards();
        AddBattleLog($"战斗开始！遇到 {currentEnemy.name}！");
        AddBattleLog($"第 {turnCount} 回合");
    }
    
    void InitializeDeck() {
        deck.Clear();
        discardPile.Clear();
        
        foreach (string skillName in GameManager.Instance.playerSkills) {
            SkillData skill = DataManager.Instance.GetSkillByName(skillName);
            if (skill != null) {
                deck.Add(new CardData {
                    name = skill.name,
                    damage = skill.damage,
                    cost = skill.cost,
                    description = skill.description
                });
            }
        }
        
        ShuffleDeck();
    }
    
    void ShuffleDeck() {
        for (int i = 0; i < deck.Count; i++) {
            CardData temp = deck[i];
            int randomIndex = Random.Range(i, deck.Count);
            deck[i] = deck[randomIndex];
            deck[randomIndex] = temp;
        }
    }
    
    Enemy SpawnEnemy() {
        Enemy enemy = new Enemy();
        enemy.name = GetRandomEnemyName();
        enemy.maxHealth = 50 + GameManager.Instance.currentFloor * 10;
        enemy.currentHealth = enemy.maxHealth;
        enemy.attack = 10 + GameManager.Instance.currentFloor * 2;
        enemy.defense = 2 + GameManager.Instance.currentFloor;
        enemy.exp = 20 + GameManager.Instance.currentFloor * 5;
        return enemy;
    }
    
    string GetRandomEnemyName() {
        string[] names = { "哥布林", "骷髅战士", "狼人", "食人魔", "暗影刺客" };
        return names[Random.Range(0, names.Length)];
    }
    
    void DrawInitialCards() {
        DrawCards(6);
    }
    
    void DrawCards(int count) {
        for (int i = 0; i < count; i++) {
            if (deck.Count == 0) {
                if (discardPile.Count == 0) break;
                deck.AddRange(discardPile);
                discardPile.Clear();
                ShuffleDeck();
                AddBattleLog("卡组已重洗");
            }
            
            CardData card = deck[0];
            deck.RemoveAt(0);
            cardHand.AddCard(card);
            UpdateDeckDisplay();
        }
    }
    
    public void UseCard(CardData card) {
        if (GameManager.Instance.playerEnergy < card.cost) {
            AddBattleLog("能量不足！");
            return;
        }
        
        GameManager.Instance.UseEnergy(card.cost);
        int damage = Mathf.Max(1, card.damage - currentEnemy.defense);
        
        currentEnemy.currentHealth -= damage;
        AddBattleLog($"使用 {card.name}，造成 {damage} 点伤害");
        
        cardHand.RemoveCard(card);
        discardPile.Add(card);
        UpdateDiscardDisplay();
        
        if (currentEnemy.currentHealth <= 0) {
            BattleVictory();
            return;
        }
        
        UpdateUI();
    }
    
    void EndTurn() {
        turnCount++;
        GameManager.Instance.RestoreEnergy(2);
        
        EnemyTurn();
        
        if (GameManager.Instance.playerHealth <= 0) {
            BattleDefeat();
            return;
        }
        
        DrawCards(2);
        AddBattleLog($"第 {turnCount} 回合");
        UpdateUI();
    }
    
    void EnemyTurn() {
        int damage = Mathf.Max(1, currentEnemy.attack - 5);
        GameManager.Instance.playerHealth -= damage;
        AddBattleLog($"{currentEnemy.name} 攻击，造成 {damage} 点伤害");
    }
    
    void BattleVictory() {
        AddBattleLog("战斗胜利！");
        GameManager.Instance.AddGold(20);
        GameManager.Instance.AddExp(currentEnemy.exp);
        
        if (GameManager.Instance.currentFloor >= GameManager.Instance.totalFloors) {
            AddBattleLog("恭喜通关所有楼层！");
        }
        
        StartCoroutine(ReturnToMap());
    }
    
    void BattleDefeat() {
        AddBattleLog("战斗失败...");
        StartCoroutine(GameOver());
    }
    
    IEnumerator ReturnToMap() {
        yield return new WaitForSeconds(2f);
        GameManager.Instance.EnterNextFloor();
        GameManager.Instance.ChangeState(GameManager.GameState.MapSelect);
    }
    
    IEnumerator GameOver() {
        yield return new WaitForSeconds(2f);
        GameManager.Instance.ChangeState(GameManager.GameState.GameOver);
    }
    
    void AddBattleLog(string message) {
        battleLog.Add(message);
        if (battleLog.Count > 10) {
            battleLog.RemoveAt(0);
        }
        
        battleLogText.text = string.Join("\n", battleLog);
    }
    
    void UpdateDeckDisplay() {
        deckCountText.text = $"卡组: {deck.Count}";
    }
    
    void UpdateDiscardDisplay() {
        discardCountText.text = $"消耗: {discardPile.Count}";
    }
    
    void UpdateUI() {
        if (GameManager.Instance.selectedCharacter != null) {
            playerHealthText.text = $"HP: {GameManager.Instance.playerHealth}/{GameManager.Instance.selectedCharacter.health}";
            playerLevelText.text = $"等级: {GameManager.Instance.playerLevel}";
        }
        playerEnergyText.text = $"能量: {GameManager.Instance.playerEnergy}/{GameManager.Instance.maxEnergy}";
        
        if (currentEnemy != null) {
            enemyHealthText.text = $"HP: {currentEnemy.currentHealth}/{currentEnemy.maxHealth}";
            enemyNameText.text = currentEnemy.name;
        }
    }
}

public class Enemy {
    public string name;
    public int maxHealth;
    public int currentHealth;
    public int attack;
    public int defense;
    public int exp;
    public int energy;
    public string type;
}

public class CardData {
    public string name;
    public int damage;
    public int cost;
    public string description;
}

public class CardHand : MonoBehaviour {
    public CardDisplay cardPrefab;
    public Transform handContainer;
    private List<CardData> hand = new List<CardData>();
    
    public void AddCard(CardData card) {
        hand.Add(card);
        CardDisplay display = Instantiate(cardPrefab, handContainer);
        display.Initialize(card);
    }
    
    public void RemoveCard(CardData card) {
        hand.Remove(card);
        foreach (Transform child in handContainer) {
            CardDisplay display = child.GetComponent<CardDisplay>();
            if (display != null && display.card == card) {
                Destroy(child.gameObject);
                break;
            }
        }
    }
    
    public void ClearHand() {
        hand.Clear();
        foreach (Transform child in handContainer) {
            Destroy(child.gameObject);
        }
    }
    
    public List<CardData> GetHand() {
        return new List<CardData>(hand);
    }
}

public class CardDisplay : MonoBehaviour {
    public CardData card;
    public Text nameText;
    public Text costText;
    public Text descriptionText;
    public Button useButton;
    
    public void Initialize(CardData data) {
        card = data;
        nameText.text = data.name;
        costText.text = data.cost.ToString();
        descriptionText.text = data.description;
        useButton.onClick.AddListener(UseCard);
    }
    
    void UseCard() {
        BattlePanel battlePanel = GetComponentInParent<BattlePanel>();
        if (battlePanel != null) {
            battlePanel.UseCard(card);
        }
    }
}
