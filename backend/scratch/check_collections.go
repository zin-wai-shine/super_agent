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
	db.Where("parent_id IS NULL AND is_parent = ?", false).Find(&items)
	fmt.Printf("Found %d top-level collections.\n", len(items))
	for _, it := range items {
		fmt.Println("-", it.Name)
	}
}
