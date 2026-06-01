using UnityEngine;
using UnityEngine.UI;

public class MenuPanel : MonoBehaviour {
    public Button startButton;
    public Button characterButton;
    public Button itemButton;
    public Button loadButton;
    
    void Start() {
        startButton.onClick.AddListener(OnStartGame);
        characterButton.onClick.AddListener(OnCharacterSelect);
        itemButton.onClick.AddListener(OnItemManagement);
        loadButton.onClick.AddListener(OnLoadGame);
    }
    
    void OnStartGame() {
        GameManager.Instance.characterSelectSource = "map";
        UIManager.Instance.ShowPanel(UIManager.PanelType.CharacterSelect);
    }
    
    void OnCharacterSelect() {
        GameManager.Instance.characterSelectSource = "menu";
        UIManager.Instance.ShowPanel(UIManager.PanelType.CharacterSelect);
    }
    
    void OnItemManagement() {
        UIManager.Instance.ShowPanel(UIManager.PanelType.ItemManagement);
    }
    
    void OnLoadGame() {
        GameManager.Instance.ChangeState(GameManager.GameState.LoadGame);
    }
}
