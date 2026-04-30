package main

import (
	"fmt"
	"log"
	"super_real_estate/config"
	"super_real_estate/models"
)

func main() {
	cfg := config.LoadConfig()
	db, err := config.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	var items []models.Collection
	db.Find(&items)
	fmt.Printf("Found %d collections total.\n", len(items))
	for _, it := range items {
		fmt.Printf("- %s (ID: %s, IsParent: %v, ParentID: %v, AgentID: %s)\n", it.Name, it.ID, it.IsParent, it.ParentID, it.AgentID)
	}
}
