using UnityEngine;
using System.IO;

public class ResourceMigrator : MonoBehaviour {
    [Header("资源迁移设置")]
    public string sourcePath = "Assets/Resources";
    public string picturesFolder = "pictures";
    
    [ContextMenu("迁移图片资源")]
    void MigrateImages() {
        string sourceFolder = Path.Combine(Application.dataPath, picturesFolder);
        string targetFolder = Path.Combine(Application.dataPath, sourcePath, "Sprites");
        
        if (!Directory.Exists(targetFolder)) {
            Directory.CreateDirectory(targetFolder);
        }
        
        string[] imageFiles = Directory.GetFiles(sourceFolder, "*.png");
        foreach (string file in imageFiles) {
            string fileName = Path.GetFileName(file);
            string targetPath = Path.Combine(targetFolder, fileName);
            
            if (!File.Exists(targetPath)) {
                File.Copy(file, targetPath);
                Debug.Log($"迁移图片: {fileName}");
            }
        }
        
        Debug.Log("图片迁移完成！");
    }
    
    [ContextMenu("迁移数据文件")]
    void MigrateDataFiles() {
        string targetFolder = Path.Combine(Application.dataPath, sourcePath, "Data");
        
        if (!Directory.Exists(targetFolder)) {
            Directory.CreateDirectory(targetFolder);
        }
        
        MigrateDataFile("characters.json", targetFolder);
        MigrateDataFile("potion.json", targetFolder);
        MigrateDataFile("data.json", targetFolder);
        
        Debug.Log("数据文件迁移完成！");
    }
    
    void MigrateDataFile(string fileName, string targetFolder) {
        string sourcePath = Path.Combine(Application.dataPath, "..", fileName);
        string targetPath = Path.Combine(targetFolder, fileName);
        
        if (File.Exists(sourcePath) && !File.Exists(targetPath)) {
            File.Copy(sourcePath, targetPath);
            Debug.Log($"迁移数据文件: {fileName}");
        }
    }
}
