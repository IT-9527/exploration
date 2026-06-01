using UnityEngine;

public class SaveManager : MonoBehaviour {
    public static SaveManager Instance;
    
    void Awake() {
        if (Instance == null) {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        } else {
            Destroy(gameObject);
        }
    }
    
    public void SaveGame(int saveSlot = 0) {
        SaveData data = new SaveData();
        data.currentFloor = GameManager.Instance.currentFloor;
        data.playerLevel = GameManager.Instance.playerLevel;
        data.playerExp = GameManager.Instance.playerExp;
        data.playerHealth = GameManager.Instance.playerHealth;
        data.playerEnergy = GameManager.Instance.playerEnergy;
        data.playerGold = GameManager.Instance.playerGold;
        
        if (GameManager.Instance.selectedCharacter != null) {
            data.selectedCharacterId = GameManager.Instance.selectedCharacter.id;
        }
        
        string json = JsonUtility.ToJson(data);
        PlayerPrefs.SetString($"Save_{saveSlot}", json);
        PlayerPrefs.Save();
        
        Debug.Log("游戏保存成功！");
    }
    
    public bool LoadGame(int saveSlot = 0) {
        string json = PlayerPrefs.GetString($"Save_{saveSlot}", "");
        if (string.IsNullOrEmpty(json)) {
            return false;
        }
        
        SaveData data = JsonUtility.FromJson<SaveData>(json);
        
        GameManager.Instance.currentFloor = data.currentFloor;
        GameManager.Instance.playerLevel = data.playerLevel;
        GameManager.Instance.playerExp = data.playerExp;
        GameManager.Instance.playerHealth = data.playerHealth;
        GameManager.Instance.playerEnergy = data.playerEnergy;
        GameManager.Instance.playerGold = data.playerGold;
        
        if (!string.IsNullOrEmpty(data.selectedCharacterId)) {
            CharacterData character = DataManager.Instance.GetCharacterById(data.selectedCharacterId);
            if (character != null) {
                GameManager.Instance.selectedCharacter = character;
            }
        }
        
        Debug.Log("游戏加载成功！");
        return true;
    }
    
    public bool HasSaveData(int saveSlot = 0) {
        return PlayerPrefs.HasKey($"Save_{saveSlot}");
    }
}

[System.Serializable]
public class SaveData {
    public int currentFloor;
    public int playerLevel;
    public int playerExp;
    public int playerHealth;
    public int playerEnergy;
    public int playerGold;
    public string selectedCharacterId;
}
