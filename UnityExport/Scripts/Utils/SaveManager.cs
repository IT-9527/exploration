using UnityEngine;
using System;
using System.Collections.Generic;

public class SaveManager : MonoBehaviour {
    public static SaveManager Instance;
    
    public const int MAX_SAVES = 5;
    public static string currentSaveId;
    
    void Awake() {
        if (Instance == null) {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        } else {
            Destroy(gameObject);
        }
    }
    
    public void SaveGame(int saveSlot = 0) {
        SaveData data = CreateSaveData();
        data.id = System.DateTime.Now.Ticks.ToString();
        
        string json = JsonUtility.ToJson(data);
        PlayerPrefs.SetString($"Save_{saveSlot}", json);
        PlayerPrefs.Save();
        
        currentSaveId = data.id;
        Debug.Log($"游戏保存成功！存档ID: {currentSaveId}");
    }
    
    SaveData CreateSaveData() {
        SaveData data = new SaveData();
        data.id = currentSaveId != null ? currentSaveId : System.DateTime.Now.Ticks.ToString();
        data.timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        data.currentFloor = GameManager.Instance.currentFloor;
        data.playerLevel = GameManager.Instance.playerLevel;
        data.playerExp = GameManager.Instance.playerExp;
        data.playerHealth = GameManager.Instance.playerHealth;
        data.playerEnergy = GameManager.Instance.playerEnergy;
        data.playerGold = GameManager.Instance.playerGold;
        data.playerSkills = new List<string>(GameManager.Instance.playerSkills);
        data.playerItems = new List<string>(GameManager.Instance.playerItems);
        data.selectedMap = GameManager.Instance.selectedMap;
        data.unlockedCharacters = new List<string>(GameManager.Instance.unlockedCharacters);
        data.unlockedDifficulties = new List<string>(GameManager.Instance.unlockedDifficulties);
        data.clearedLevels = new List<int>(GameManager.Instance.clearedLevels);
        
        if (GameManager.Instance.selectedCharacter != null) {
            data.selectedCharacterId = GameManager.Instance.selectedCharacter.id;
        }
        
        return data;
    }
    
    public bool LoadGame(int saveSlot = 0) {
        string json = PlayerPrefs.GetString($"Save_{saveSlot}", "");
        if (string.IsNullOrEmpty(json)) {
            Debug.Log("没有找到存档数据");
            return false;
        }
        
        SaveData data = JsonUtility.FromJson<SaveData>(json);
        
        currentSaveId = data.id;
        GameManager.Instance.currentFloor = data.currentFloor;
        GameManager.Instance.playerLevel = data.playerLevel;
        GameManager.Instance.playerExp = data.playerExp;
        GameManager.Instance.playerHealth = data.playerHealth;
        GameManager.Instance.playerEnergy = data.playerEnergy;
        GameManager.Instance.playerGold = data.playerGold;
        
        if (data.playerSkills != null) {
            GameManager.Instance.playerSkills = new List<string>(data.playerSkills);
        }
        
        if (data.playerItems != null) {
            GameManager.Instance.playerItems = new List<string>(data.playerItems);
        }
        
        GameManager.Instance.selectedMap = data.selectedMap;
        
        if (data.unlockedCharacters != null) {
            GameManager.Instance.unlockedCharacters = new List<string>(data.unlockedCharacters);
        }
        
        if (data.unlockedDifficulties != null) {
            GameManager.Instance.unlockedDifficulties = new List<string>(data.unlockedDifficulties);
        }
        
        if (data.clearedLevels != null) {
            GameManager.Instance.clearedLevels = new HashSet<int>(data.clearedLevels);
        }
        
        if (!string.IsNullOrEmpty(data.selectedCharacterId)) {
            CharacterData character = DataManager.Instance.GetCharacterById(data.selectedCharacterId);
            if (character != null) {
                GameManager.Instance.selectedCharacter = character;
            }
        }
        
        Debug.Log($"游戏加载成功！存档ID: {currentSaveId}");
        return true;
    }
    
    public bool HasSaveData(int saveSlot = 0) {
        return PlayerPrefs.HasKey($"Save_{saveSlot}");
    }
    
    public void DeleteSave(int saveSlot = 0) {
        PlayerPrefs.DeleteKey($"Save_{saveSlot}");
        PlayerPrefs.Save();
        Debug.Log($"存档 {saveSlot} 已删除");
    }
    
    public List<SaveData> GetAllSaves() {
        List<SaveData> saves = new List<SaveData>();
        
        for (int i = 0; i < MAX_SAVES; i++) {
            string json = PlayerPrefs.GetString($"Save_{i}", "");
            if (!string.IsNullOrEmpty(json)) {
                SaveData data = JsonUtility.FromJson<SaveData>(json);
                saves.Add(data);
            }
        }
        
        return saves;
    }
}

[System.Serializable]
public class SaveData {
    public string id;
    public string timestamp;
    public int currentFloor;
    public int playerLevel;
    public int playerExp;
    public int playerHealth;
    public int playerEnergy;
    public int playerGold;
    public string selectedCharacterId;
    public List<string> playerSkills;
    public List<string> playerItems;
    public string selectedMap;
    public List<string> unlockedCharacters;
    public List<string> unlockedDifficulties;
    public List<int> clearedLevels;
}
