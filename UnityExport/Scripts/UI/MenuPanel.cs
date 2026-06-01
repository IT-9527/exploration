using UnityEngine;
using UnityEngine.UI;

public class MenuPanel : MonoBehaviour {
    public Button startButton;
    public Button characterButton;
    public Button saveButton;
    public Button itemButton;
    public Button settingsButton;
    
    void Start() {
        startButton.onClick.AddListener(OnStartGame);
        characterButton.onClick.AddListener(OnCharacterSelect);
        saveButton.onClick.AddListener(OnSaveGame);
        itemButton.onClick.AddListener(OnItemManagement);
        settingsButton.onClick.AddListener(OnSettings);
    }
    
    void OnStartGame() {
        GameManager.Instance.characterSelectSource = "map";
        GameManager.Instance.ChangeState(GameManager.GameState.MapSelect);
    }
    
    void OnCharacterSelect() {
        GameManager.Instance.characterSelectSource = "menu";
        GameManager.Instance.ChangeState(GameManager.GameState.CharacterSelect);
    }
    
    void OnSaveGame() {
        if (GameManager.Instance.selectedCharacter != null && 
            GameManager.Instance.currentState == GameManager.GameState.Game) {
            SaveManager.Instance.SaveGame();
            Debug.Log("游戏已存档");
        } else {
            GameManager.Instance.ChangeState(GameManager.GameState.LoadGame);
        }
    }
    
    void OnItemManagement() {
        GameManager.Instance.ChangeState(GameManager.GameState.ItemManagement);
    }
    
    void OnSettings() {
        GameManager.Instance.ChangeState(GameManager.GameState.Settings);
    }
}
