package utils

import (
	"fmt"
	"log"
	"math/rand"
	"strings"
	"time"

	"super_real_estate/models"

	"github.com/go-faker/faker/v4"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SeedFakeData generates fake agents and listings if none exist
func SeedFakeData(db *gorm.DB) {
	log.Println("Checking for agents lacking fake data...")

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

	// 3. Create Fake Listings for ALL Agents (including bolthaven/staynert)
	// Listing types
	listingTypes := []string{"sale", "rent"}
	propertyTypes := []string{"condo", "house", "townhome", "land"}

	// Fetch all agents to ensure everyone has listings
	var allAgents []models.Agent
	db.Find(&allAgents)

	for _, agent := range allAgents {
		// Check if agent already has listings
		var count int64
		db.Model(&models.Listing{}).Where("agent_id = ?", agent.ID).Count(&count)
		if count > 0 {
			continue
		}

		log.Printf("Seeding 8 fake listings for agent: %s (%s)", agent.Name, agent.Subdomain)
		
		// Generate 8 listings per agent
		for j := 0; j < 8; j++ {
			// Random station
			station := stations[rand.Intn(len(stations))]

			price := float64(rand.Intn(10000000) + 1000000) // Random price between 1M and 11M
			if rand.Intn(2) == 0 {                          // 50% chance for rent
				price = float64(rand.Intn(50000) + 15000) // Rent 15k - 65k
			}

			listing := models.Listing{
				AgentID:      agent.ID,
				CreatedBy:    agent.ID, // Simplified ownership
				Title:        fmt.Sprintf("%s in %s near %s", propertyTypes[rand.Intn(len(propertyTypes))], agent.Name, station.NameEN),
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
			for k := 0; k < 5; k++ {
				imageID := rand.Intn(1000)
				media := models.Media{
					ListingID: listing.ID,
					Type:      "image",
					URL:       fmt.Sprintf("https://picsum.photos/id/%d/800/600", imageID),
					Thumbnail: fmt.Sprintf("https://picsum.photos/id/%d/200/200", imageID),
					Caption:   PHOTO_ROOM_TYPES[k%len(PHOTO_ROOM_TYPES)],
					SortOrder: k,
				}
				db.Create(&media)
			}
		}
	}

	// 4. Create Fake Notifications
	// Super Admin -> All Agents (Broadcast)
	var superAdmin models.User
	db.Where("role = ?", models.RoleSuperAdmin).First(&superAdmin)

	if superAdmin.ID != uuid.Nil {
		// Public Platform Notification
		db.Create(&models.Notification{
			Title:      "Welcome to Super Real Estate!",
			Message:    "We have updated our terms of service. Please review them.",
			SenderID:   superAdmin.ID,
			TargetRole: models.RoleAgent,
			Type:       "info",
		})

		// Direct Message to first fake agent
		if len(agents) > 0 {
			var agentUser models.User
			db.Where("agent_id = ?", agents[0].ID).First(&agentUser)
			if agentUser.ID != uuid.Nil {
				db.Create(&models.Notification{
					Title:      "Subscription Expiring Soon",
					Message:    "Your Starter plan will expire in 3 days.",
					SenderID:   superAdmin.ID,
					ReceiverID: &agentUser.ID,
					Type:       "warning",
				})
			}
		}
	}

	// 5. Create Fake Banners
	// Platform Banner
	if superAdmin.ID != uuid.Nil {
		startTime := time.Now()
		endTime := startTime.AddDate(0, 1, 0) // 1 month
		db.Create(&models.Banner{
			Title:      "Summer Sale!",
			ImageURL:   "https://picsum.photos/1200/300",
			LinkURL:    "/pricing",
			OwnerID:    superAdmin.ID,
			TargetRole: "all",
			IsActive:   true,
			StartDate:  &startTime,
			EndDate:    &endTime,
		})
	}

	// Agent Banner
	if len(agents) > 0 {
		var agentUser models.User
		db.Where("agent_id = ?", agents[0].ID).First(&agentUser)
		if agentUser.ID != uuid.Nil {
			startTime := time.Now()
			db.Create(&models.Banner{
				Title:      "Special Discount on Condos",
				ImageURL:   "https://picsum.photos/1000/300",
				LinkURL:    "/listings?type=condo",
				OwnerID:    agentUser.ID,
				AgentID:    &agents[0].ID,
				TargetRole: "public",
				IsActive:   true,
				StartDate:  &startTime,
			})
		}
	}

	log.Printf("Successfully generated %d fake agents, %d listings, notifications, and banners.", len(agents), len(agents)*5)
}
