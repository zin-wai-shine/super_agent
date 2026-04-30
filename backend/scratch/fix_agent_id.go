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

	correctAgentID := uuid.MustParse("ef90a644-db1f-42bf-826a-3f96580da395")

	// Update all collections to the correct AgentID
	result := db.Model(&models.Collection{}).Where("agent_id != ?", correctAgentID).Update("agent_id", correctAgentID)
	if result.Error != nil {
		log.Fatalf("Failed to update AgentID: %v", result.Error)
	}
	fmt.Printf("Updated %d collections to the correct AgentID.\n", result.RowsAffected)

	fmt.Println("Fix complete.")
}
