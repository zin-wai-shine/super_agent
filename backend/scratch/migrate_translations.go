package main

import (
	"fmt"
	"log"
	"super_real_estate/config"
	"super_real_estate/models"
	"super_real_estate/services"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env
	if err := godotenv.Load(); err != nil {
		fmt.Println("Warning: No .env file found, using system environment variables")
	}

	cfg := config.LoadConfig()
	db, err := config.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("Connected to database successfully")

	aiService := services.NewAIService(db)
	if aiService.APIKey == "" {
		log.Fatalf("Error: OPENAI_API_KEY environment variable is not set")
	}

	var listings []models.Listing
	if err := db.Find(&listings).Error; err != nil {
		log.Fatalf("Failed to fetch listings: %v", err)
	}

	fmt.Printf("Found %d listings to process\n", len(listings))

	translatedCount := 0
	for idx, listing := range listings {
		updated := false
		fmt.Printf("[%d/%d] Processing listing: %s (ID: %s)\n", idx+1, len(listings), listing.Title, listing.ID)

		// Translate Title
		if listing.TitleMY == "" && listing.Title != "" {
			fmt.Println("  -> Translating title to Myanmar...")
			if t, err := aiService.Translate(listing.Title, "my"); err == nil {
				listing.TitleMY = t
				updated = true
			} else {
				fmt.Printf("     Error translating title to my: %v\n", err)
			}
		}
		if listing.TitleZH == "" && listing.Title != "" {
			fmt.Println("  -> Translating title to Chinese...")
			if t, err := aiService.Translate(listing.Title, "zh"); err == nil {
				listing.TitleZH = t
				updated = true
			} else {
				fmt.Printf("     Error translating title to zh: %v\n", err)
			}
		}

		// Translate Description
		if listing.DescriptionMY == "" && listing.Description != "" {
			fmt.Println("  -> Translating description to Myanmar...")
			if t, err := aiService.Translate(listing.Description, "my"); err == nil {
				listing.DescriptionMY = t
				updated = true
			} else {
				fmt.Printf("     Error translating description to my: %v\n", err)
			}
		}
		if listing.DescriptionZH == "" && listing.Description != "" {
			fmt.Println("  -> Translating description to Chinese...")
			if t, err := aiService.Translate(listing.Description, "zh"); err == nil {
				listing.DescriptionZH = t
				updated = true
			} else {
				fmt.Printf("     Error translating description to zh: %v\n", err)
			}
		}

		// Translate Features
		if listing.FeaturesMY == "" && listing.Features != "" && listing.Features != "[]" {
			fmt.Println("  -> Translating features to Myanmar...")
			if t, err := aiService.Translate(listing.Features, "my"); err == nil {
				listing.FeaturesMY = t
				updated = true
			} else {
				fmt.Printf("     Error translating features to my: %v\n", err)
			}
		}
		if listing.FeaturesZH == "" && listing.Features != "" && listing.Features != "[]" {
			fmt.Println("  -> Translating features to Chinese...")
			if t, err := aiService.Translate(listing.Features, "zh"); err == nil {
				listing.FeaturesZH = t
				updated = true
			} else {
				fmt.Printf("     Error translating features to zh: %v\n", err)
			}
		}

		if updated {
			if err := db.Save(&listing).Error; err != nil {
				fmt.Printf("     Error saving listing: %v\n", err)
			} else {
				fmt.Println("  [+] Translation updated successfully")
				translatedCount++
			}
		} else {
			fmt.Println("  [=] Listing already translated or no translation needed")
		}
	}

	fmt.Printf("\nMigration finished. Successfully translated %d listings.\n", translatedCount)
}
