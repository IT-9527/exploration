using UnityEngine;
using System.Collections.Generic;

public class DataManager : MonoBehaviour {
    public static DataManager Instance;
    
    public List<CharacterData> characters = new List<CharacterData>();
    public List<SkillData> skills = new List<SkillData>();
    public List<PotionData> potions = new List<PotionData>();
    
    void Awake() {
        if (Instance == null) {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        } else {
            Destroy(gameObject);
        }
    }
    
    void Start() {
        LoadAllData();
    }
    
    void LoadAllData() {
        LoadCharacters();
        LoadSkills();
        LoadPotions();
    }
    
    void LoadCharacters() {
        TextAsset jsonFile = Resources.Load<TextAsset>("Data/characters");
        if (jsonFile != null) {
            CharacterData[] data = JsonHelper.FromJson<CharacterData>(jsonFile.text);
            characters.AddRange(data);
        }
    }
    
    void LoadSkills() {
        TextAsset jsonFile = Resources.Load<TextAsset>("Data/data");
        if (jsonFile != null) {
            // 需要根据实际JSON结构解析技能数据
        }
    }
    
    void LoadPotions() {
        TextAsset jsonFile = Resources.Load<TextAsset>("Data/potion");
        if (jsonFile != null) {
            PotionData[] data = JsonHelper.FromJson<PotionData>(jsonFile.text);
            potions.AddRange(data);
        }
    }
    
    public CharacterData GetCharacterById(string id) {
        return characters.Find(c => c.id == id);
    }
}

public static class JsonHelper {
    public static T[] FromJson<T>(string json) {
        string newJson = "{\"items\":" + json + "}";
        Wrapper<T> wrapper = JsonUtility.FromJson<Wrapper<T>>(newJson);
        return wrapper.items;
    }
    
    [System.Serializable]
    private class Wrapper<T> {
        public T[] items;
    }
}
