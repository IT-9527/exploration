using UnityEngine;
using UnityEngine.UI;

public class MenuPanel : MonoBehaviour {
    public Button startButton;
    public Button characterButton;
    public Button itemButton;
    public Button shopButton;
    public Button loadButton;
    
    void Start() {
        startButton.onClick.AddListener(OnStartGame);
        characterButton.onClick.AddListener(OnCharacterSelect);
        itemButton.onClick.AddListener(OnItemManagement);
        shopButton.onClick.AddListener(OnShop);
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
    
    void OnShop() {
        UIManager.Instance.ShowPanel(UIManager.PanelType.Shop);
    }
    
    void OnLoadGame() {
        GameManager.Instance.ChangeState(GameManager.GameState.LoadGame);
    }
}
