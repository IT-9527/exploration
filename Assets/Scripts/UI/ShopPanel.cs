using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;

public class ShopPanel : MonoBehaviour {
    public ShopItemDisplay itemPrefab;
    public Transform itemContainer;
    public Button backButton;
    public Button refreshButton;
    public Text goldText;
    
    void Start() {
        backButton.onClick.AddListener(OnBack);
        refreshButton.onClick.AddListener(OnRefresh);
        ShopManager.Instance.GenerateShopItems();
        RefreshShopUI();
    }
    
    void OnEnable() {
        RefreshGoldUI();
    }
    
    public void RefreshShopUI() {
        foreach (Transform child in itemContainer) {
            Destroy(child.gameObject);
        }
        
        for (int i = 0; i < ShopManager.Instance.shopItems.Count; i++) {
            ShopItemDisplay display = Instantiate(itemPrefab, itemContainer);
            display.Initialize(ShopManager.Instance.shopItems[i], i);
        }
        
        RefreshGoldUI();
    }
    
    void RefreshGoldUI() {
        goldText.text = $"金币: {GameManager.Instance.playerGold}";
    }
    
    public void OnBuyItem(int index) {
        bool success = ShopManager.Instance.BuyItem(index);
        if (success) {
            RefreshShopUI();
        }
    }
    
    void OnRefresh() {
        bool success = ShopManager.Instance.RefreshShop();
        if (success) {
            RefreshShopUI();
        }
    }
    
    void OnBack() {
        UIManager.Instance.ShowPanel(UIManager.PanelType.MapSelect);
    }
}

public class ShopItemDisplay : MonoBehaviour {
    public Text nameText;
    public Text descriptionText;
    public Text priceText;
    public Button buyButton;
    
    private ShopItemData item;
    private int index;
    private ShopPanel panel;
    
    void Awake() {
        panel = GetComponentInParent<ShopPanel>();
    }
    
    public void Initialize(ShopItemData data, int idx) {
        item = data;
        index = idx;
        nameText.text = data.name;
        descriptionText.text = data.description;
        priceText.text = $"{data.price} 金币";
        buyButton.onClick.AddListener(OnBuy);
    }
    
    void OnBuy() {
        panel.OnBuyItem(index);
    }
}