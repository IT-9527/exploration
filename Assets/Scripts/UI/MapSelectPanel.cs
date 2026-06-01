using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;

public class MapSelectPanel : MonoBehaviour {
    public PlatformButton platformPrefab;
    public Transform platformContainer;
    public Button backButton;
    public Button characterDetailsButton;
    
    void Start() {
        backButton.onClick.AddListener(OnBack);
        characterDetailsButton.onClick.AddListener(OnCharacterDetails);
        GeneratePlatforms();
    }
    
    void GeneratePlatforms() {
        foreach (Transform child in platformContainer) {
            Destroy(child.gameObject);
        }
        
        int totalLevels = 10;
        for (int i = 1; i <= totalLevels; i++) {
            PlatformButton button = Instantiate(platformPrefab, platformContainer);
            bool isUnlocked = i <= GameManager.Instance.currentFloor;
            bool isCurrent = i == GameManager.Instance.currentFloor;
            button.Initialize(i, isUnlocked, isCurrent);
        }
    }
    
    public void OnSelectLevel(int level) {
        if (level > GameManager.Instance.currentFloor) {
            return;
        }
        
        GameManager.Instance.currentFloor = level;
        GameManager.Instance.ChangeState(GameManager.GameState.Battle);
        UIManager.Instance.ShowPanel(UIManager.PanelType.Battle);
    }
    
    void OnBack() {
        UIManager.Instance.ShowPanel(UIManager.PanelType.Menu);
    }
    
    void OnCharacterDetails() {
        UIManager.Instance.ShowPanel(UIManager.PanelType.CharacterDetails);
    }
}

public class PlatformButton : MonoBehaviour {
    public Text levelText;
    public Image backgroundImage;
    public Button button;
    
    private int level;
    
    public void Initialize(int levelNum, bool isUnlocked, bool isCurrent) {
        level = levelNum;
        levelText.text = levelNum.ToString();
        
        if (!isUnlocked) {
            backgroundImage.color = Color.gray;
            button.interactable = false;
        } else if (isCurrent) {
            backgroundImage.color = Color.blue;
        }
        
        button.onClick.AddListener(OnClick);
    }
    
    void OnClick() {
        MapSelectPanel panel = GetComponentInParent<MapSelectPanel>();
        panel.OnSelectLevel(level);
    }
}
