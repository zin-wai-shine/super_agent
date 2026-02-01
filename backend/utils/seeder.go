package utils

import (
	"fmt"
	"log"
	"math/rand"
	"strings"

	"super_real_estate/models"

	"github.com/go-faker/faker/v4"
	"gorm.io/gorm"
)

// SeedFakeData generates fake agents and listings if none exist
func SeedFakeData(db *gorm.DB) {
	var listingCount int64
	db.Model(&models.Listing{}).Count(&listingCount)

	if listingCount > 0 {
		log.Println("Listings already exist, skipping fake data seeding.")
		return
	}

	log.Println("Seeding fake data (Agents and Listings)...")

	// 1. Get existing Plans and Stations for reference
	var plans []models.Subscription
	if err := db.Find(&plans).Error; err != nil {
		log.Printf("Error fetching plans: %v", err)
		return
	}

	var stations []models.Station
	if err := db.Find(&stations).Error; err != nil {
		log.Printf("Error fetching stations: %v", err)
		return
	}

	if len(plans) == 0 || len(stations) == 0 {
		log.Println("Cannot seed data: Plans or Stations missing.")
		return
	}

	// 2. Create Fake Agents
	agents := make([]models.Agent, 0)
	for i := 0; i < 10; i++ {
		agentName := faker.Name()
		subdomain := strings.ToLower(strings.ReplaceAll(agentName, " ", "")) + fmt.Sprintf("%d", rand.Intn(1000))

		// Random plan
		plan := plans[rand.Intn(len(plans))]

		agent := models.Agent{
			Name:           agentName,
			Subdomain:      subdomain, // e.g., johndoe123
			DomainType:     models.DomainTypeSubdomain,
			Description:    faker.Sentence(),
			Phone:          faker.Phonenumber(),
			Email:          faker.Email(),
			Address:        faker.Word(), // Simple address
			IsActive:       true,
			SubscriptionID: &plan.ID,
		}

		if err := db.Create(&agent).Error; err != nil {
			log.Printf("Error creating fake agent %s: %v", agent.Name, err)
			continue
		}

		// Create a User for this agent login
		hashedPassword, _ := HashPassword("password123")
		user := models.User{
			Email:        agent.Email,
			PasswordHash: hashedPassword,
			FirstName:    strings.Split(agent.Name, " ")[0],
			LastName:     strings.Split(agent.Name, " ")[1], // Simple split
			Role:         models.RoleAgent,
			AgentID:      &agent.ID,
			IsActive:     true,
		}
		db.Create(&user)

		agents = append(agents, agent)
	}

	// 3. Create Fake Listings for each Agent
	// Listing types
	listingTypes := []string{"sale", "rent"}
	propertyTypes := []string{"condo", "house", "townhome", "land"}

	for _, agent := range agents {
		// Generate 5 listings per agent
		for j := 0; j < 5; j++ {
			// Random station
			station := stations[rand.Intn(len(stations))]

			price := float64(rand.Intn(10000000) + 1000000) // Random price between 1M and 11M
			if rand.Intn(2) == 0 {                          // 50% chance for rent
				price = float64(rand.Intn(50000) + 5000) // Rent 5k - 55k
			}

			listing := models.Listing{
				AgentID:      agent.ID,
				CreatedBy:    agent.ID, // Simplified ownership
				Title:        fmt.Sprintf("Beautiful %s near %s", propertyTypes[rand.Intn(len(propertyTypes))], station.NameEN),
				Description:  faker.Paragraph(),
				PropertyType: propertyTypes[rand.Intn(len(propertyTypes))],
				ListingType:  listingTypes[rand.Intn(len(listingTypes))],
				Price:        price,
				Bedrooms:     rand.Intn(4) + 1,
				Bathrooms:    rand.Intn(3) + 1,
				Area:         float64(rand.Intn(100) + 30),
				Address:      faker.Word(),
				District:     "Bangkok",
				Province:     "Bangkok",
				StationID:    station.ID,
				StationName:  station.NameEN,
				IsPublished:  true,
				IsFeatured:   rand.Intn(5) == 0, // 20% chance featured
			}

			if err := db.Create(&listing).Error; err != nil {
				log.Printf("Error creating listing for agent %s: %v", agent.Name, err)
				continue
			}

			// Add fake images (using picsum)
			for k := 0; k < 3; k++ {
				imageID := rand.Intn(1000)
				media := models.Media{
					ListingID: listing.ID,
					Type:      "image",
					URL:       fmt.Sprintf("https://picsum.photos/id/%d/800/600", imageID),
					Thumbnail: fmt.Sprintf("https://picsum.photos/id/%d/200/200", imageID),
					Caption:   "Living Room",
					SortOrder: k,
				}
				db.Create(&media)
			}
		}
	}

	log.Printf("Successfully generated %d fake agents and %d fake listings.", len(agents), len(agents)*5)
}
