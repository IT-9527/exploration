using UnityEngine;
using UnityEngine.UI;

public static class UIConfig {
    public static class Colors {
        public static readonly Color MainBackground = new Color(0.902f, 0.952f, 1.0f);
        public static readonly Color TitleText = new Color(0.2745f, 0.5098f, 0.7059f);
        public static readonly Color ButtonGradientTop = new Color(0.8235f, 0.7059f, 0.549f);
        public static readonly Color ButtonGradientBottom = new Color(0.6275f, 0.3216f, 0.1765f);
        public static readonly Color ButtonBorder = new Color(0.5451f, 0.2706f, 0.0745f);
        public static readonly Color ButtonText = Color.white;
        public static readonly Color Accent = new Color(1.0f, 0.8431f, 0.0f);
        public static readonly Color Danger = Color.red;
        public static readonly Color Success = Color.green;
        public static readonly Color Disabled = Color.gray;
        public static readonly Color PanelBackground = new Color(1.0f, 1.0f, 1.0f, 0.9f);
        public static readonly Color HealthBar = Color.red;
        public static readonly Color EnergyBar = new Color(1.0f, 0.8431f, 0.0f);
    }
    
    public static class Dimensions {
        public const float BaseWidth = 800f;
        public const float BaseHeight = 1000f;
        public const float ButtonBorderRadius = 25f;
        public const float ButtonBorderWidth = 2f;
        public const float PanelBorderWidth = 2f;
        public const float StandardButtonWidth = 200f;
        public const float StandardButtonHeight = 60f;
        public const float SettingsButtonSize = 54f;
        public const float CardWidth = 50f;
        public const float CardHeight = 100f;
    }
    
    public static class Fonts {
        public static readonly int TitleSize = 48;
        public static readonly int ButtonTextSize = 32;
        public static readonly int ButtonTextOutline = 2;
        public static readonly int NormalTextSize = 16;
        public static readonly int SmallTextSize = 12;
        public static readonly int LargeTextSize = 24;
    }
    
    public static float GetScaledValue(float value) {
        float scaleX = Screen.width / Dimensions.BaseWidth;
        float scaleY = Screen.height / Dimensions.BaseHeight;
        return value * Mathf.Min(scaleX, scaleY);
    }
    
    public static Vector2 GetScaledPosition(float x, float y) {
        float scaleX = Screen.width / Dimensions.BaseWidth;
        float scaleY = Screen.height / Dimensions.BaseHeight;
        float scale = Mathf.Min(scaleX, scaleY);
        return new Vector2(x * scale, y * scale);
    }
    
    public static Vector2 GetScaledSize(float width, float height) {
        float scaleX = Screen.width / Dimensions.BaseWidth;
        float scaleY = Screen.height / Dimensions.BaseHeight;
        float scale = Mathf.Min(scaleX, scaleY);
        return new Vector2(width * scale, height * scale);
    }
}

public static class UIHelper {
    public static void SetButtonStyle(Button button, ColorBlock colors) {
        button.colors = colors;
    }
    
    public static void SetTextStyle(Text text, int fontSize, Color textColor, bool bold = false) {
        text.fontSize = fontSize;
        text.color = textColor;
        text.alignment = TextAnchor.MiddleCenter;
        
        if (bold) {
            text.fontStyle = FontStyle.Bold;
        }
    }
    
    public static void CreateRoundedRect(Image image, float borderRadius) {
        if (image == null) return;
        
        RectTransform rect = image.GetComponent<RectTransform>();
        if (rect == null) return;
        
        image.type = Image.Type.Sliced;
        image.pixelsPerUnitMultiplier = 1;
    }
    
    public static float GetHealthPercentage(int current, int max) {
        return Mathf.Clamp01((float)current / (float)max);
    }
    
    public static float GetEnergyPercentage(int current, int max) {
        return Mathf.Clamp01((float)current / (float)max);
    }
}

public class UIPanel : MonoBehaviour {
    protected virtual void Start() {
        InitializePanel();
    }
    
    protected virtual void InitializePanel() {
        Image background = GetComponent<Image>();
        if (background != null) {
            background.color = UIConfig.Colors.MainBackground;
        }
    }
    
    protected void SetPanelActive(bool active) {
        gameObject.SetActive(active);
    }
}

public class UIButton : MonoBehaviour {
    public enum ButtonType {
        Standard,
        Settings,
        Card,
        Tab
    }
    
    public ButtonType buttonType = ButtonType.Standard;
    
    void Start() {
        SetupButton();
    }
    
    protected virtual void SetupButton() {
        Button button = GetComponent<Button>();
        if (button == null) return;
        
        ColorBlock colors = button.colors;
        colors.highlightedColor = UIConfig.Colors.ButtonGradientTop;
        colors.pressedColor = UIConfig.Colors.ButtonGradientBottom;
        colors.disabledColor = UIConfig.Colors.Disabled;
        colors.normalColor = UIConfig.Colors.ButtonGradientTop;
        button.colors = colors;
    }
}

public class UIHealthBar : MonoBehaviour {
    public Image fillImage;
    public Text valueText;
    
    public void UpdateHealth(int current, int max) {
        if (fillImage != null) {
            fillImage.fillAmount = UIHelper.GetHealthPercentage(current, max);
        }
        
        if (valueText != null) {
            valueText.text = $"{current}/{max}";
        }
    }
}

public class UIEnergyBar : MonoBehaviour {
    public Image[] energyBlocks;
    public Text valueText;
    
    public void UpdateEnergy(int current, int max) {
        for (int i = 0; i < energyBlocks.Length; i++) {
            if (energyBlocks[i] != null) {
                energyBlocks[i].color = i < current ? 
                    UIConfig.Colors.EnergyBar : 
                    UIConfig.Colors.Disabled;
            }
        }
        
        if (valueText != null) {
            valueText.text = $"{current}/{max}";
        }
    }
}
