using UnityEngine;

public class GameManager : MonoBehaviour {
    public static GameManager Instance;
    
    public GameState currentState;
    public CharacterData selectedCharacter;
    public int playerHealth;
    public int playerEnergy;
    public int playerGold;
    public int playerAttack;
    public int currentFloor;
    public int playerLevel;
    public int playerExp;
    
    public string characterSelectSource;
    
    public enum GameState {
        Menu,
        CharacterSelect,
        MapSelect,
        Game,
        Battle,
        CharacterDetails,
        Victory,
        GameOver,
        ItemManagement,
        LoadGame
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
    }   
    
    public void ChangeState(GameState newState) {
        currentState = newState;
        Debug.Log($"Game state changed to: {newState}");
    }

    public void SelectCharacter(CharacterData character) {
        selectedCharacter = character;
        playerHealth = character.health;
        ChangeState(GameState.MapSelect);
    }
    
    public void AddExp(int exp) {
        playerExp += exp;
        if (playerExp >= playerLevel * 100) {
            playerLevel++;
            playerExp -= playerLevel * 100;
            playerEnergy++;
        }
    }
}
