using UnityEngine;
using System.Collections.Generic;

public class GameManager : MonoBehaviour {
    public static GameManager Instance;
    
    public GameState currentState;
    public CharacterData selectedCharacter;
    public int playerHealth;
    public int playerEnergy;
    public int playerGold;
    public int currentFloor;
    public int totalFloors = 10;
    public int playerLevel;
    public int playerExp;
    public int maxEnergy = 10;
    
    public string characterSelectSource;
    public CharacterData selectedCharacterDetails;
    
    public List<string> playerSkills = new List<string>();
    public List<string> playerItems = new List<string>();
    public string selectedMap;
    public List<string> unlockedCharacters = new List<string>();
    public List<string> unlockedDifficulties = new List<string>();
    public HashSet<int> clearedLevels = new HashSet<int>();
    
    public enum GameState {
        Menu,
        MapSelect,
        CharacterSelect,
        CharacterDetails,
        Game,
        Battle,
        GameOver,
        Victory,
        Settings,
        ConfirmSave,
        LoadGame,
        ItemManagement,
        DeckView,
        DiscardView
    }
    
    void Awake() {
        if (Instance == null) {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        } else {
            Destroy(gameObject);
        }
        
        InitializeGame();
    }
    
    void InitializeGame() {
        currentState = GameState.Menu;
        currentFloor = 1;
        playerLevel = 1;
        playerExp = 0;
        playerEnergy = 5;
        playerGold = 0;
        
        unlockedCharacters = new List<string> { "martial_artist" };
        unlockedDifficulties = new List<string> { "普通" };
        clearedLevels = new HashSet<int>();
    }
    
    public void ChangeState(GameState newState) {
        currentState = newState;
        Debug.Log($"Game state changed to: {newState}");
    }
    
    public void SelectCharacter(CharacterData character) {
        selectedCharacter = character;
        playerHealth = character.health;
        playerSkills = new List<string>(character.skills);
        
        if (characterSelectSource == "map") {
            ChangeState(GameState.Game);
        } else {
            ChangeState(GameState.MapSelect);
        }
    }
    
    public void AddExp(int exp) {
        playerExp += exp;
        while (playerExp >= playerLevel * 100) {
            playerExp -= playerLevel * 100;
            playerLevel++;
            playerEnergy = Mathf.Min(playerEnergy + 1, maxEnergy);
            Debug.Log($"升级！当前等级: {playerLevel}");
        }
    }
    
    public void AddGold(int amount) {
        playerGold += amount;
        Debug.Log($"获得 {amount} 金币，当前: {playerGold}");
    }
    
    public void UseEnergy(int amount) {
        playerEnergy = Mathf.Max(0, playerEnergy - amount);
    }
    
    public void RestoreEnergy(int amount) {
        playerEnergy = Mathf.Min(playerEnergy + amount, maxEnergy);
    }
    
    public void AddItem(string item) {
        if (!playerItems.Contains(item)) {
            playerItems.Add(item);
            Debug.Log($"获得道具: {item}");
        }
    }
    
    public void RemoveItem(string item) {
        if (playerItems.Contains(item)) {
            playerItems.Remove(item);
            Debug.Log($"使用道具: {item}");
        }
    }
    
    public void ResetGame() {
        currentFloor = 1;
        playerLevel = 1;
        playerExp = 0;
        playerGold = 0;
        playerItems.Clear();
        clearedLevels.Clear();
        
        if (selectedCharacter != null) {
            playerHealth = selectedCharacter.health;
            playerEnergy = 5;
            playerSkills = new List<string>(selectedCharacter.skills);
        }
        
        ChangeState(GameState.Menu);
    }
    
    public void EnterNextFloor() {
        if (currentFloor < totalFloors) {
            currentFloor++;
            clearedLevels.Add(currentFloor - 1);
            
            if (currentFloor > GameManager.Instance.currentFloor) {
                GameManager.Instance.currentFloor = currentFloor;
            }
            
            Debug.Log($"进入第 {currentFloor} 层");
        }
    }
}
