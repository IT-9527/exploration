using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;

public class CharacterSelectPanel : MonoBehaviour {
    public CharacterCard cardPrefab;
    public Transform cardContainer;
    public Button backButton;
    
    void Start() {
        backButton.onClick.AddListener(OnBack);
        RefreshCharacters();
    }
    
    void RefreshCharacters() {
        foreach (Transform child in cardContainer) {
            Destroy(child.gameObject);
        }
        
        foreach (CharacterData character in DataManager.Instance.characters) {
            CharacterCard card = Instantiate(cardPrefab, cardContainer);
            card.Initialize(character);
        }
    }
    
    public void OnSelectCharacter(CharacterData character) {
        GameManager.Instance.SelectCharacter(character);
    }
    
    void OnBack() {
        UIManager.Instance.ShowPanel(UIManager.PanelType.Menu);
    }
}

public class CharacterCard : MonoBehaviour {
    public Text nameText;
    public Image avatarImage;
    public Text healthText;
    public Text attackText;
    public Button selectButton;
    
    private CharacterData character;
    
    public void Initialize(CharacterData data) {
        character = data;
        nameText.text = data.name;
        healthText.text = $"生命: {data.health}";
        attackText.text = $"攻击: {data.PhyAtk}";
        selectButton.onClick.AddListener(OnSelect);
    }
    
    void OnSelect() {
        CharacterSelectPanel panel = GetComponentInParent<CharacterSelectPanel>();
        panel.OnSelectCharacter(character);
    }
}
