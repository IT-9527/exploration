using UnityEngine;
using UnityEngine.UI;

public class UIManager : MonoBehaviour {
    public static UIManager Instance;
    
    public Canvas mainCanvas;
    public MenuPanel menuPanel;
    public CharacterSelectPanel characterSelectPanel;
    public MapSelectPanel mapSelectPanel;
    public BattlePanel battlePanel;
    public CharacterDetailsPanel characterDetailsPanel;
    public ItemManagementPanel itemManagementPanel;
    
    public GameObject settingsPanel;
    public GameObject loadGamePanel;
    public GameObject confirmSavePanel;
    public GameObject deckViewPanel;
    public GameObject discardViewPanel;
    public GameObject gameOverPanel;
    public GameObject victoryPanel;
    
    void Awake() {
        if (Instance == null) {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        } else {
            Destroy(gameObject);
        }
    }
    
    void Update() {
        UpdatePanelsByState();
    }
    
    void UpdatePanelsByState() {
        HideAllPanels();
        
        switch (GameManager.Instance.currentState) {
            case GameManager.GameState.Menu:
                menuPanel.gameObject.SetActive(true);
                break;
                
            case GameManager.GameState.MapSelect:
                mapSelectPanel.gameObject.SetActive(true);
                break;
                
            case GameManager.GameState.CharacterSelect:
                characterSelectPanel.gameObject.SetActive(true);
                break;
                
            case GameManager.GameState.CharacterDetails:
                characterDetailsPanel.gameObject.SetActive(true);
                break;
                
            case GameManager.GameState.Game:
                menuPanel.gameObject.SetActive(false);
                break;
                
            case GameManager.GameState.Battle:
                battlePanel.gameObject.SetActive(true);
                break;
                
            case GameManager.GameState.GameOver:
                gameOverPanel.SetActive(true);
                break;
                
            case GameManager.GameState.Victory:
                victoryPanel.SetActive(true);
                break;
                
            case GameManager.GameState.Settings:
                settingsPanel.SetActive(true);
                break;
                
            case GameManager.GameState.LoadGame:
                loadGamePanel.SetActive(true);
                break;
                
            case GameManager.GameState.ConfirmSave:
                confirmSavePanel.SetActive(true);
                break;
                
            case GameManager.GameState.ItemManagement:
                itemManagementPanel.gameObject.SetActive(true);
                break;
                
            case GameManager.GameState.DeckView:
                deckViewPanel.SetActive(true);
                break;
                
            case GameManager.GameState.DiscardView:
                discardViewPanel.SetActive(true);
                break;
        }
    }
    
    void HideAllPanels() {
        menuPanel.gameObject.SetActive(false);
        characterSelectPanel.gameObject.SetActive(false);
        mapSelectPanel.gameObject.SetActive(false);
        battlePanel.gameObject.SetActive(false);
        characterDetailsPanel.gameObject.SetActive(false);
        itemManagementPanel.gameObject.SetActive(false);
        
        if (settingsPanel != null) settingsPanel.SetActive(false);
        if (loadGamePanel != null) loadGamePanel.SetActive(false);
        if (confirmSavePanel != null) confirmSavePanel.SetActive(false);
        if (deckViewPanel != null) deckViewPanel.SetActive(false);
        if (discardViewPanel != null) discardViewPanel.SetActive(false);
        if (gameOverPanel != null) gameOverPanel.SetActive(false);
        if (victoryPanel != null) victoryPanel.SetActive(false);
    }
    
    public void ShowPanel(PanelType panelType) {
        switch (panelType) {
            case PanelType.Menu:
                GameManager.Instance.ChangeState(GameManager.GameState.Menu);
                break;
            case PanelType.CharacterSelect:
                GameManager.Instance.ChangeState(GameManager.GameState.CharacterSelect);
                break;
            case PanelType.MapSelect:
                GameManager.Instance.ChangeState(GameManager.GameState.MapSelect);
                break;
            case PanelType.Battle:
                GameManager.Instance.ChangeState(GameManager.GameState.Battle);
                break;
            case PanelType.CharacterDetails:
                GameManager.Instance.ChangeState(GameManager.GameState.CharacterDetails);
                break;
            case PanelType.ItemManagement:
                GameManager.Instance.ChangeState(GameManager.GameState.ItemManagement);
                break;
        }
    }
    
    public enum PanelType {
        Menu,
        CharacterSelect,
        MapSelect,
        Battle,
        CharacterDetails,
        ItemManagement
    }
}
