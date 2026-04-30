package main

import (
	"fmt"
	"log"
	"super_real_estate/config"
	"super_real_estate/models"
	"github.com/google/uuid"
)

func main() {
	cfg := config.LoadConfig()
	db, err := config.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	var agent models.Agent
	if err := db.First(&agent).Error; err != nil {
		log.Fatalf("No agent found: %v", err)
	}

	var user models.User
	if err := db.Where("role IN (?)", []string{"agent", "super_admin"}).First(&user).Error; err != nil {
		db.First(&user)
	}

	// 1. Ensure "Explore Categories" exists
	var exploreParent models.Collection
	err = db.Where("name = ? AND is_parent = ?", "Explore Categories", true).First(&exploreParent).Error
	if err != nil {
		exploreParent = models.Collection{
			ID:        uuid.New(),
			AgentID:   agent.ID,
			Name:      "Explore Categories",
			Type:      "icon",
			IsParent:  true,
			CreatedBy: user.ID,
		}
		db.Create(&exploreParent)
		fmt.Println("Created 'Explore Categories'")
	}

	// 2. Ensure "Popular Properties" exists as a REAL parent
	var popularParent models.Collection
	err = db.Where("name = ? AND is_parent = ?", "Popular Properties", true).First(&popularParent).Error
	if err != nil {
		popularParent = models.Collection{
			ID:        uuid.New(),
			AgentID:   agent.ID,
			Name:      "Popular Properties",
			Type:      "image",
			IsParent:  true,
			CreatedBy: user.ID,
		}
		db.Create(&popularParent)
		fmt.Println("Created 'Popular Properties' as real parent")
	}

	// 3. Move icon-based items to "Explore Categories"
	db.Model(&models.Collection{}).Where("icon != ? AND is_parent = ?", "", false).Update("parent_id", exploreParent.ID)
	fmt.Println("Moved icon collections to 'Explore Categories'")

	// 4. Move remaining top-level items to "Popular Properties"
	db.Model(&models.Collection{}).Where("parent_id IS NULL AND is_parent = ?", false).Update("parent_id", popularParent.ID)
	fmt.Println("Moved remaining collections to 'Popular Properties'")

	fmt.Println("Migration complete.")
}
