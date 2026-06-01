using UnityEngine;
using UnityEngine.UI;

public class CharacterDetailsPanel : MonoBehaviour {
    public Text nameText;
    public Image avatarImage;
    public Text descriptionText;
    public SkillCard skillCardPrefab;
    public Transform skillContainer;
    public Button backButton;
    
    void Start() {
        backButton.onClick.AddListener(OnBack);
    }
    
    void OnEnable() {
        RefreshDetails();
    }
    
    void RefreshDetails() {
        CharacterData character = GameManager.Instance.selectedCharacter;
        if (character == null) return;
        
        nameText.text = $"{character.name} 详情";
        descriptionText.text = GetDescription(character.id);
        
        foreach (Transform child in skillContainer) {
            Destroy(child.gameObject);
        }
        
        foreach (string skillName in character.skills) {
            SkillCard card = Instantiate(skillCardPrefab, skillContainer);
            card.Initialize(skillName);
        }
    }
    
    string GetDescription(string characterId) {
        switch (characterId) {
            case "martial_artist":
                return "拳法家是一个精通格斗技巧的近战职业，拥有快速的攻击速度和灵活的身法。";
            case "mage":
                return "法师是一位精通元素魔法的远程职业，能够释放强大的法术攻击敌人。";
            case "weapon_master":
                return "武器大师是一位擅长各种武器的全能战士，攻守兼备。";
            default:
                return "暂无描述";
        }
    }
    
    void OnBack() {
        if (GameManager.Instance.characterSelectSource == "map") {
            UIManager.Instance.ShowPanel(UIManager.PanelType.MapSelect);
        } else {
            UIManager.Instance.ShowPanel(UIManager.PanelType.CharacterSelect);
        }
    }
}

public class SkillCard : MonoBehaviour {
    public Text skillName;
    public Text skillDescription;
    
    public void Initialize(string skillNameText) {
        skillName.text = skillNameText;
        skillDescription.text = GetSkillDescription(skillNameText);
    }
    
    string GetSkillDescription(string skillName) {
        switch (skillName) {
            case "普通攻击":
                return "基础攻击技能，造成15点伤害";
            case "防御":
                return "防御姿态，减少受到的伤害";
            case "格挡":
                return "基础防御技能，格挡5点伤害";
            case "连环踢":
                return "进阶技能，造成3段伤害，每段8点";
            case "旋风腿":
                return "高级技能，造成范围伤害";
            case "火箭拳":
                return "强力拳击，造成25点伤害";
            case "升龙击":
                return "向上攻击，击飞敌人";
            case "治愈术":
                return "恢复技能，恢复15点生命值";
            default:
                return "暂无描述";
        }
    }
}
