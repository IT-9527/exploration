using UnityEngine;
using UnityEngine.UI;
using System.Collections;

public class BattlePanel : MonoBehaviour {
    public Text playerHealthText;
    public Text playerEnergyText;
    public Text enemyHealthText;
    public Text enemyNameText;
    public CardHand cardHand;
    public Button endTurnButton;
    public Text battleLogText;
    
    private Enemy currentEnemy;
    private int turnCount = 1;
    
    void Start() {
        endTurnButton.onClick.AddListener(EndTurn);
    }
    
    void OnEnable() {
        StartBattle();
    }
    
    void StartBattle() {
        currentEnemy = SpawnEnemy();
        UpdateUI();
        DrawInitialCards();
        battleLogText.text = "战斗开始！第 " + turnCount + " 回合";
    }
    
    Enemy SpawnEnemy() {
        Enemy enemy = new Enemy();
        enemy.name = "普通怪物";
        enemy.maxHealth = 50;
        enemy.currentHealth = 50;
        enemy.attack = 10;
        enemy.defense = 2;
        return enemy;
    }
    
    void DrawInitialCards() {
        cardHand.DrawCards(6);
    }
    
    public void UseCard(CardData card) {
        if (GameManager.Instance.playerEnergy < card.cost) {
            AddBattleLog("能量不足！");
            return;
        }
        
        GameManager.Instance.playerEnergy -= card.cost;
        int damage = card.damage;
        
        currentEnemy.currentHealth -= damage;
        AddBattleLog($"使用 {card.name}，造成 {damage} 点伤害");
        
        if (currentEnemy.currentHealth <= 0) {
            BattleVictory();
        }
        
        UpdateUI();
        cardHand.RemoveCard(card);
    }
    
    void EndTurn() {
        turnCount++;
        GameManager.Instance.playerEnergy = Mathf.Min(GameManager.Instance.playerEnergy + 2, 10);
        
        EnemyTurn();
        
        if (GameManager.Instance.playerHealth <= 0) {
            BattleDefeat();
            return;
        }
        
        cardHand.DrawCards(2);
        AddBattleLog("第 " + turnCount + " 回合");
        UpdateUI();
    }
    
    void EnemyTurn() {
        int damage = Mathf.Max(1, currentEnemy.attack - 5);
        GameManager.Instance.playerHealth -= damage;
        AddBattleLog($"敌人攻击，造成 {damage} 点伤害");
    }
    
    void BattleVictory() {
        AddBattleLog("战斗胜利！获得金币和经验");
        GameManager.Instance.playerGold += 20;
        GameManager.Instance.AddExp(20);
        StartCoroutine(ReturnToMap());
    }
    
    void BattleDefeat() {
        AddBattleLog("战斗失败...");
        StartCoroutine(GameOver());
    }
    
    IEnumerator ReturnToMap() {
        yield return new WaitForSeconds(2f);
        UIManager.Instance.ShowPanel(UIManager.PanelType.MapSelect);
    }
    
    IEnumerator GameOver() {
        yield return new WaitForSeconds(2f);
        GameManager.Instance.ChangeState(GameManager.GameState.GameOver);
    }
    
    void AddBattleLog(string message) {
        battleLogText.text += "\n" + message;
    }
    
    void UpdateUI() {
        playerHealthText.text = $"生命: {GameManager.Instance.playerHealth}/{GameManager.Instance.selectedCharacter.health}";
        playerEnergyText.text = $"能量: {GameManager.Instance.playerEnergy}/10";
        enemyHealthText.text = $"生命: {currentEnemy.currentHealth}/{currentEnemy.maxHealth}";
        enemyNameText.text = currentEnemy.name;
    }
}

public class Enemy {
    public string name;
    public int maxHealth;
    public int currentHealth;
    public int attack;
    public int defense;
}

public class CardData {
    public string name;
    public int damage;
    public int cost;
    public string description;
    public string type;
    public int blockValue;
    public int heal;
    public int hits;
    public bool lifesteal;
    public int energyRestore;
    public string characterType;
}

public class CardHand : MonoBehaviour {
    public CardDisplay cardPrefab;
    public Transform handContainer;
    private System.Collections.Generic.List<CardData> hand = new System.Collections.Generic.List<CardData>();
    
    public void DrawCards(int count) {
        for (int i = 0; i < count; i++) {
            CardData card = GenerateCard();
            hand.Add(card);
            CardDisplay display = Instantiate(cardPrefab, handContainer);
            display.Initialize(card);
        }
    }
    
    CardData GenerateCard() {
        string[] names = { "普通攻击", "防御", "连环踢", "旋风腿" };
        int[] damages = { 15, 5, 24, 20 };
        int[] costs = { 1, 1, 2, 2 };
        
        int index = Random.Range(0, names.Length);
        return new CardData {
            name = names[index],
            damage = damages[index],
            cost = costs[index],
            description = GetCardDescription(names[index])
        };
    }
    
    string GetCardDescription(string name) {
        switch (name) {
            case "普通攻击": return "基础攻击";
            case "防御": return "减少伤害";
            case "连环踢": return "3段攻击";
            case "旋风腿": return "范围攻击";
            default: return "";
        }
    }
    
    public void RemoveCard(CardData card) {
        hand.Remove(card);
        foreach (Transform child in handContainer) {
            CardDisplay display = child.GetComponent<CardDisplay>();
            if (display.card == card) {
                Destroy(child.gameObject);
                break;
            }
        }
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
        battlePanel.UseCard(card);
    }
}
