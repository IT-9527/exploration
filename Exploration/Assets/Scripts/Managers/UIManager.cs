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
    
    void Awake() {
        if (Instance == null) {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        } else {
            Destroy(gameObject);
        }
    }
    
    public void ShowPanel(PanelType panelType) {
        HideAllPanels();
        
        switch (panelType) {
            case PanelType.Menu:
                menuPanel.gameObject.SetActive(true);
                break;
            case PanelType.CharacterSelect:
                characterSelectPanel.gameObject.SetActive(true);
                break;
            case PanelType.MapSelect:
                mapSelectPanel.gameObject.SetActive(true);
                break;
            case PanelType.Battle:
                battlePanel.gameObject.SetActive(true);
                break;
            case PanelType.CharacterDetails:
                characterDetailsPanel.gameObject.SetActive(true);
                break;
            case PanelType.ItemManagement:
                itemManagementPanel.gameObject.SetActive(true);
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
