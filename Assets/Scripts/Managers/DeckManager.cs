using UnityEngine;
using System.Collections.Generic;

public class DeckManager : MonoBehaviour {
    public static DeckManager Instance;
    
    public List<CardData> deck = new List<CardData>();
    public List<CardData> drawPile = new List<CardData>();
    public List<CardData> discardPile = new List<CardData>();
    
    void Awake() {
        if (Instance == null) {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        } else {
            Destroy(gameObject);
        }
        
        InitializeStarterDeck();
    }
    
    void InitializeStarterDeck() {
        for (int i = 0; i < 4; i++) {
            deck.Add(new CardData { name = "攻击", damage = 6, cost = 1, type = "attack", description = "造成6点伤害" });
        }
        for (int i = 0; i < 4; i++) {
            deck.Add(new CardData { name = "防御", blockValue = 5, cost = 1, type = "defense", description = "获得5点护盾" });
        }
    }
    
    public void AddCard(CardData card) {
        deck.Add(card);
    }
    
    public void RemoveCard(CardData card) {
        deck.Remove(card);
    }
    
    public void PrepareForBattle() {
        drawPile.Clear();
        discardPile.Clear();
        
        drawPile.AddRange(deck);
        ShuffleDeck();
    }
    
    void ShuffleDeck() {
        for (int i = drawPile.Count - 1; i > 0; i--) {
            int j = Random.Range(0, i + 1);
            CardData temp = drawPile[i];
            drawPile[i] = drawPile[j];
            drawPile[j] = temp;
        }
    }
    
    public CardData DrawCard() {
        if (drawPile.Count == 0) {
            if (discardPile.Count == 0) return null;
            
            drawPile.AddRange(discardPile);
            discardPile.Clear();
            ShuffleDeck();
        }
        
        CardData card = drawPile[0];
        drawPile.RemoveAt(0);
        return card;
    }
    
    public void DiscardCard(CardData card) {
        discardPile.Add(card);
    }
    
    public void ReturnAllToDeck() {
        drawPile.AddRange(discardPile);
        discardPile.Clear();
        deck.AddRange(drawPile);
        drawPile.Clear();
    }
}