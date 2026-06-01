using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;

public class ItemManagementPanel : MonoBehaviour {
    public PotionSlot potionSlotPrefab;
    public Transform potionContainer;
    public PotionList potionList;
    public Button backButton;
    
    public List<PotionData> playerPotions = new List<PotionData>();
    public int maxPotionSlots = 3;
    
    void Start() {
        backButton.onClick.AddListener(OnBack);
        RefreshPotions();
    }
    
    void RefreshPotions() {
        foreach (Transform child in potionContainer) {
            Destroy(child.gameObject);
        }
        
        for (int i = 0; i < maxPotionSlots; i++) {
            PotionSlot slot = Instantiate(potionSlotPrefab, potionContainer);
            if (i < playerPotions.Count) {
                slot.SetPotion(playerPotions[i]);
            } else {
                slot.ClearSlot();
            }
        }
    }
    
    public void AddPotion(PotionData potion) {
        if (playerPotions.Count < maxPotionSlots) {
            playerPotions.Add(potion);
            RefreshPotions();
        }
    }
    
    public void UsePotion(PotionData potion) {
        switch (potion.effect) {
            case "health":
                GameManager.Instance.playerHealth = Mathf.Min(
                    GameManager.Instance.playerHealth + potion.value,
                    GameManager.Instance.selectedCharacter.health
                );
                break;
            case "energy":
                GameManager.Instance.playerEnergy = Mathf.Min(GameManager.Instance.playerEnergy + potion.value, 10);
                break;
            case "attack":
                // 攻击加成逻辑
                break;
            case "gold":
                GameManager.Instance.playerGold += Mathf.FloorToInt(GameManager.Instance.playerGold * potion.value);
                break;
        }
        
        playerPotions.Remove(potion);
        RefreshPotions();
    }
    
    void OnBack() {
        UIManager.Instance.ShowPanel(UIManager.PanelType.Menu);
    }
}

public class PotionSlot : MonoBehaviour {
    public Image iconImage;
    public Text nameText;
    public Button useButton;
    public Button discardButton;
    
    private PotionData currentPotion;
    private ItemManagementPanel manager;
    
    void Awake() {
        manager = GetComponentInParent<ItemManagementPanel>();
    }
    
    public void SetPotion(PotionData potion) {
        currentPotion = potion;
        nameText.text = potion.name;
        iconImage.enabled = true;
        useButton.interactable = true;
        discardButton.interactable = true;
    }
    
    public void ClearSlot() {
        currentPotion = null;
        nameText.text = "空";
        iconImage.enabled = false;
        useButton.interactable = false;
        discardButton.interactable = false;
    }
    
    public void OnUse() {
        if (currentPotion != null) {
            manager.UsePotion(currentPotion);
        }
    }
    
    public void OnDiscard() {
        if (currentPotion != null) {
            manager.playerPotions.Remove(currentPotion);
            manager.RefreshPotions();
        }
    }
}

public class PotionList : MonoBehaviour {
    public PotionListItem itemPrefab;
    public Transform listContainer;
    
    void Start() {
        RefreshList();
    }
    
    void RefreshList() {
        foreach (Transform child in listContainer) {
            Destroy(child.gameObject);
        }
        
        foreach (PotionData potion in DataManager.Instance.potions) {
            PotionListItem item = Instantiate(itemPrefab, listContainer);
            item.Initialize(potion);
        }
    }
}

public class PotionListItem : MonoBehaviour {
    public Text nameText;
    public Text descriptionText;
    
    public void Initialize(PotionData potion) {
        nameText.text = potion.name;
        descriptionText.text = potion.description;
    }
}
