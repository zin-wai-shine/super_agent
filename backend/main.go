package main

import (
	"fmt"
	"log"
	"os"
	"strings"

	"super_real_estate/config"
	"super_real_estate/middleware"
	"super_real_estate/models"
	"super_real_estate/routes"
	"super_real_estate/utils"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func main() {
	// Load .env file if exists (for local development)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Load configuration
	cfg := config.LoadConfig()

	// Initialize database
	db, err := config.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Initialize WebSocket Manager
	wsManager := utils.NewWebSocketManager()
	go wsManager.Run()

	// Auto migrate models
	if err := db.AutoMigrate(
		&models.User{},
		&models.Agent{},
		&models.Theme{},
		&models.Subscription{},
		&models.Listing{},
		&models.Media{},
		&models.Station{},
		&models.Notification{},
		&models.Banner{},
		&models.Appointment{},
		&models.SavedListing{},
		&models.Developer{},
		&models.Project{},
	); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database migration completed successfully")

	// Seed initial data
	seedInitialData(db)

	// Seed developers and projects
	seedDevelopersAndProjects(db)

	// Seed fake data (agents and listings) if needed
	utils.SeedFakeData(db)

	// Create uploads directory
	if err := os.MkdirAll(cfg.UploadPath, os.ModePerm); err != nil {
		log.Printf("Warning: Could not create uploads directory: %v", err)
	}

	// Initialize Gin router
	router := gin.Default()

	// Apply global middleware
	router.Use(middleware.CORSMiddleware())
	router.Use(middleware.RateLimitMiddleware())

	// Setup routes
	// Setup routes
	routes.SetupRoutes(router, db, cfg, wsManager)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func seedInitialData(db *gorm.DB) {
	log.Println("Seeding initial data...")

	// Create default subscription plans
	plans := []models.Subscription{
		{
			PlanName:     "Free",
			Description:  "Basic plan for getting started",
			Price:        0,
			Duration:     30,
			MaxListings:  5,
			MaxSubAgents: 0,
			Features:     "Up to 5 listings, Basic support, Subdomain access",
			IsActive:     true,
		},
		{
			PlanName:     "Starter",
			Description:  "Great for small agencies",
			Price:        999,
			Duration:     30,
			MaxListings:  25,
			MaxSubAgents: 2,
			Features:     "Up to 25 listings, 2 sub-agents, Subdomain access, Email support",
			IsActive:     true,
		},
		{
			PlanName:     "Professional",
			Description:  "For growing businesses",
			Price:        2499,
			Duration:     30,
			MaxListings:  100,
			MaxSubAgents: 10,
			Features:     "Up to 100 listings, 10 sub-agents, Custom domain, Priority support",
			IsActive:     true,
		},
		{
			PlanName:     "Enterprise",
			Description:  "Unlimited access for large agencies",
			Price:        4999,
			Duration:     30,
			MaxListings:  -1, // unlimited
			MaxSubAgents: -1, // unlimited
			Features:     "Unlimited listings, Unlimited agents, Dedicated support, Advanced analytics",
			IsActive:     true,
		},
	}

	for _, plan := range plans {
		db.FirstOrCreate(&plan, models.Subscription{PlanName: plan.PlanName})
	}

	// Create/Update super admin user
	hashedPassword, _ := utils.HashPassword("superadmin123")
	superAdmin := models.User{
		Email:        "admin@srv1534108.hstgr.cloud",
		PasswordHash: hashedPassword,
		FirstName:    "Super",
		LastName:     "Admin",
		Role:         models.RoleSuperAdmin,
		IsActive:     true,
	}
	
	var existingAdmin models.User
	if err := db.Where("email = ?", superAdmin.Email).First(&existingAdmin).Error; err == nil {
		// Update password to ensure it matches superadmin123
		db.Model(&existingAdmin).Updates(map[string]interface{}{
			"password_hash": hashedPassword,
			"role":          models.RoleSuperAdmin,
			"is_active":     true,
		})
	} else {
		db.Create(&superAdmin)
	}

	specificAgents := []struct {
		Name         string
		Subdomain    string
		Email        string
		CustomDomain string
	}{
		{Name: "Staynert Realty", Subdomain: "staynert", Email: "contact@staynert.srv1534108.hstgr.cloud", CustomDomain: ""},
		{Name: "Bolt Haven Realty", Subdomain: "bolthaven", Email: "contact@bolthaven.srv1534108.hstgr.cloud", CustomDomain: "bolthave.com"},
	}

	for _, sa := range specificAgents {
		var plan models.Subscription
		db.Where("plan_name = ?", "Professional").First(&plan)

		domainType := models.DomainTypeSubdomain
		if sa.CustomDomain != "" {
			domainType = models.DomainTypeCustom
		}

		agent := models.Agent{
			Name:           sa.Name,
			Subdomain:      sa.Subdomain,
			DomainType:     domainType,
			CustomDomain:   sa.CustomDomain,
			Email:          sa.Email,
			IsActive:       true,
			IsSuspended:    false,
			SubscriptionID: &plan.ID,
		}

		// Use FirstOrCreate with Assign to ensure existing agents are updated correctly
		if err := db.Where(models.Agent{Subdomain: sa.Subdomain}).Assign(models.Agent{
			Name:         sa.Name,
			Email:        sa.Email,
			CustomDomain: sa.CustomDomain,
			DomainType:   domainType,
			IsActive:     true,
			IsSuspended:  false,
		}).FirstOrCreate(&agent).Error; err != nil {
			log.Printf("Failed to seed/update specific agent %s: %v", sa.Subdomain, err)
			continue
		}

		// Create or Update user for this agent
		agentPassword, _ := utils.HashPassword("password123")
		var user models.User
		if err := db.Where(models.User{Email: sa.Email}).Assign(models.User{
			PasswordHash: agentPassword,
			FirstName:    strings.Split(sa.Name, " ")[0],
			LastName:     "Agent",
			Role:         models.RoleAgent,
			AgentID:      &agent.ID,
			IsActive:     true,
		}).FirstOrCreate(&user).Error; err != nil {
			log.Printf("Failed to seed/update specific agent user %s: %v", sa.Email, err)
		} else {
			fmt.Printf("[Startup] Verified/Updated agent: %s (%s)\n", sa.Name, sa.Subdomain)
		}
	}

	// Seed transit stations from the SVG map
	seedTransitStations(db)

	log.Println("Initial data seeded successfully")
	fmt.Println("[Startup] Seeding completed successfully")
}

func seedTransitStations(db *gorm.DB) {
	// Check if stations already exist
	var count int64
	db.Model(&models.Station{}).Count(&count)
	if count > 0 {
		return
	}

	log.Println("Seeding transit stations...")

	// Bangkok BTS/MRT stations from the provided SVG
	stations := []models.Station{
		// BTS Sukhumvit Line (Green)
		{ID: "N24", NameEN: "Khu Khot", NameTH: "คูคต", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N23", NameEN: "Yaek Kor Por Aor", NameTH: "แยก คปอ.", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N22", NameEN: "Royal Thai Air Force Museum", NameTH: "พิพิธภัณฑ์กองทัพอากาศ", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N21", NameEN: "Bhumibol Adulyadej Hospital", NameTH: "โรงพยาบาลภูมิพลอดุลยเดช", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N20", NameEN: "Saphan Mai", NameTH: "สะพานใหม่", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N19", NameEN: "Sai Yud", NameTH: "สายหยุด", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N18", NameEN: "Phahon Yothin 59", NameTH: "พหลโยธิน 59", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N17", NameEN: "Wat Phra Sri Mahathat", NameTH: "วัดพระศรีมหาธาตุ", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N16", NameEN: "11th Infantry Regiment", NameTH: "กรมทหารราบที่ 11", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N15", NameEN: "Bang Bua", NameTH: "บางบัว", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N14", NameEN: "Royal Forest Department", NameTH: "กรมป่าไม้", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N13", NameEN: "Kasetsart University", NameTH: "มหาวิทยาลัยเกษตรศาสตร์", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N12", NameEN: "Sena Nikhom", NameTH: "เสนานิคม", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N11", NameEN: "Ratchayothin", NameTH: "รัชโยธิน", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N10", NameEN: "Phahon Yothin 24", NameTH: "พหลโยธิน 24", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N9", NameEN: "Ha Yaek Lat Phrao", NameTH: "ห้าแยกลาดพร้าว", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N8", NameEN: "Mo Chit", NameTH: "หมอชิต", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N7", NameEN: "Saphan Khwai", NameTH: "สะพานควาย", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N5", NameEN: "Ari", NameTH: "อารีย์", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N4", NameEN: "Sanam Pao", NameTH: "สนามเป้า", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N3", NameEN: "Victory Monument", NameTH: "อนุสาวรีย์ชัยสมรภูมิ", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N2", NameEN: "Phaya Thai", NameTH: "พญาไท", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "N1", NameEN: "Ratchathewi", NameTH: "ราชเทวี", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "CEN", NameEN: "Siam", NameTH: "สยาม", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E1", NameEN: "Chit Lom", NameTH: "ชิดลม", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E2", NameEN: "Phloen Chit", NameTH: "เพลินจิต", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E3", NameEN: "Nana", NameTH: "นานา", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E4", NameEN: "Asok", NameTH: "อโศก", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E5", NameEN: "Phrom Phong", NameTH: "พร้อมพงษ์", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E6", NameEN: "Thong Lo", NameTH: "ทองหล่อ", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E7", NameEN: "Ekkamai", NameTH: "เอกมัย", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E8", NameEN: "Phra Khanong", NameTH: "พระโขนง", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E9", NameEN: "On Nut", NameTH: "อ่อนนุช", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E10", NameEN: "Bang Chak", NameTH: "บางจาก", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E11", NameEN: "Punnawithi", NameTH: "ปุณณวิถี", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E12", NameEN: "Udom Suk", NameTH: "อุดมสุข", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E13", NameEN: "Bang Na", NameTH: "บางนา", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E14", NameEN: "Bearing", NameTH: "แบริ่ง", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E15", NameEN: "Samrong", NameTH: "สำโรง", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E16", NameEN: "Pu Chao", NameTH: "ปู่เจ้า", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E17", NameEN: "Chang Erawan", NameTH: "ช้างเอราวัณ", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E18", NameEN: "Royal Thai Naval Academy", NameTH: "โรงเรียนนายเรือ", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E19", NameEN: "Pak Nam", NameTH: "ปากน้ำ", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E20", NameEN: "Srinagarindra", NameTH: "ศรีนครินทร์", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E21", NameEN: "Phraek Sa", NameTH: "แพรกษา", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E22", NameEN: "Sai Luat", NameTH: "สายลวด", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},
		{ID: "E23", NameEN: "Kheha", NameTH: "เคหะ", LineName: "BTS Sukhumvit", LineColor: "#7FBA00"},

		// BTS Silom Line (Dark Green)
		{ID: "W1", NameEN: "National Stadium", NameTH: "สนามกีฬาแห่งชาติ", LineName: "BTS Silom", LineColor: "#006633"},
		{ID: "S1", NameEN: "Ratchadamri", NameTH: "ราชดำริ", LineName: "BTS Silom", LineColor: "#006633"},
		{ID: "S2", NameEN: "Sala Daeng", NameTH: "ศาลาแดง", LineName: "BTS Silom", LineColor: "#006633"},
		{ID: "S3", NameEN: "Chong Nonsi", NameTH: "ช่องนนทรี", LineName: "BTS Silom", LineColor: "#006633"},
		{ID: "S4", NameEN: "Saint Louis", NameTH: "เซนต์หลุยส์", LineName: "BTS Silom", LineColor: "#006633"},
		{ID: "S5", NameEN: "Surasak", NameTH: "สุรศักดิ์", LineName: "BTS Silom", LineColor: "#006633"},
		{ID: "S6", NameEN: "Saphan Taksin", NameTH: "สะพานตากสิน", LineName: "BTS Silom", LineColor: "#006633"},
		{ID: "S7", NameEN: "Krung Thon Buri", NameTH: "กรุงธนบุรี", LineName: "BTS Silom", LineColor: "#006633"},
		{ID: "S8", NameEN: "Wongwian Yai", NameTH: "วงเวียนใหญ่", LineName: "BTS Silom", LineColor: "#006633"},
		{ID: "S9", NameEN: "Pho Nimit", NameTH: "โพธิ์นิมิตร", LineName: "BTS Silom", LineColor: "#006633"},
		{ID: "S10", NameEN: "Talat Phlu", NameTH: "ตลาดพลู", LineName: "BTS Silom", LineColor: "#006633"},
		{ID: "S11", NameEN: "Wutthakat", NameTH: "วุฒากาศ", LineName: "BTS Silom", LineColor: "#006633"},
		{ID: "S12", NameEN: "Bang Wa", NameTH: "บางหว้า", LineName: "BTS Silom", LineColor: "#006633"},

		// MRT Blue Line
		{ID: "BL01", NameEN: "Tha Phra", NameTH: "ท่าพระ", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL02", NameEN: "Charan 13", NameTH: "จรัญฯ 13", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL03", NameEN: "Fai Chai", NameTH: "ไฟฉาย", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL04", NameEN: "Bang Khun Non", NameTH: "บางขุนนนท์", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL05", NameEN: "Bang Yi Khan", NameTH: "บางยี่ขัน", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL06", NameEN: "Sirindhorn", NameTH: "สิรินธร", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL07", NameEN: "Bang Phlat", NameTH: "บางพลัด", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL08", NameEN: "Bang O", NameTH: "บางอ้อ", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL09", NameEN: "Bang Pho", NameTH: "บางโพ", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL10", NameEN: "Tao Poon", NameTH: "เตาปูน", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL11", NameEN: "Bang Sue", NameTH: "บางซื่อ", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL12", NameEN: "Kamphaeng Phet", NameTH: "กำแพงเพชร", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL13", NameEN: "Chatuchak Park", NameTH: "สวนจตุจักร", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL14", NameEN: "Phahon Yothin", NameTH: "พหลโยธิน", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL15", NameEN: "Lat Phrao", NameTH: "ลาดพร้าว", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL16", NameEN: "Ratchadaphisek", NameTH: "รัชดาภิเษก", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL17", NameEN: "Sutthisan", NameTH: "สุทธิสาร", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL18", NameEN: "Huai Khwang", NameTH: "ห้วยขวาง", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL19", NameEN: "Thailand Cultural Centre", NameTH: "ศูนย์วัฒนธรรมแห่งประเทศไทย", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL20", NameEN: "Phra Ram 9", NameTH: "พระราม 9", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL21", NameEN: "Phetchaburi", NameTH: "เพชรบุรี", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL22", NameEN: "Sukhumvit", NameTH: "สุขุมวิท", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL23", NameEN: "Queen Sirikit National Convention Centre", NameTH: "ศูนย์การประชุมแห่งชาติสิริกิติ์", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL24", NameEN: "Khlong Toei", NameTH: "คลองเตย", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL25", NameEN: "Lumphini", NameTH: "ลุมพินี", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL26", NameEN: "Silom", NameTH: "สีลม", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL27", NameEN: "Sam Yan", NameTH: "สามย่าน", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL28", NameEN: "Hua Lamphong", NameTH: "หัวลำโพง", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL29", NameEN: "Wat Mangkon", NameTH: "วัดมังกร", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL30", NameEN: "Sam Yot", NameTH: "สามยอด", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL31", NameEN: "Sanam Chai", NameTH: "สนามไชย", LineName: "MRT Blue", LineColor: "#1E50A0"},
		{ID: "BL32", NameEN: "Itsaraphap", NameTH: "อิสรภาพ", LineName: "MRT Blue", LineColor: "#1E50A0"},

		// MRT Purple Line
		{ID: "PP01", NameEN: "Khlong Bang Phai", NameTH: "คลองบางไผ่", LineName: "MRT Purple", LineColor: "#800080"},
		{ID: "PP02", NameEN: "Talad Bang Yai", NameTH: "ตลาดบางใหญ่", LineName: "MRT Purple", LineColor: "#800080"},
		{ID: "PP03", NameEN: "Sam Yaek Bang Yai", NameTH: "สามแยกบางใหญ่", LineName: "MRT Purple", LineColor: "#800080"},
		{ID: "PP04", NameEN: "Bang Phlu", NameTH: "บางพลู", LineName: "MRT Purple", LineColor: "#800080"},
		{ID: "PP05", NameEN: "Bang Rak Yai", NameTH: "บางรักใหญ่", LineName: "MRT Purple", LineColor: "#800080"},
		{ID: "PP06", NameEN: "Bang Rak Noi Tha It", NameTH: "บางรักน้อย-ท่าอิฐ", LineName: "MRT Purple", LineColor: "#800080"},
		{ID: "PP07", NameEN: "Sai Ma", NameTH: "ไทรม้า", LineName: "MRT Purple", LineColor: "#800080"},
		{ID: "PP08", NameEN: "Phra Nang Klao Bridge", NameTH: "สะพานพระนั่งเกล้า", LineName: "MRT Purple", LineColor: "#800080"},
		{ID: "PP09", NameEN: "Yaek Nonthaburi 1", NameTH: "แยกนนทบุรี 1", LineName: "MRT Purple", LineColor: "#800080"},
		{ID: "PP10", NameEN: "Bang Krasor", NameTH: "บางกระสอ", LineName: "MRT Purple", LineColor: "#800080"},
		{ID: "PP11", NameEN: "Nonthaburi Civic Center", NameTH: "ศูนย์ราชการนนทบุรี", LineName: "MRT Purple", LineColor: "#800080"},
		{ID: "PP12", NameEN: "Ministry of Public Health", NameTH: "กระทรวงสาธารณสุข", LineName: "MRT Purple", LineColor: "#800080"},
		{ID: "PP13", NameEN: "Yaek Tiwanon", NameTH: "แยกติวานนท์", LineName: "MRT Purple", LineColor: "#800080"},
		{ID: "PP14", NameEN: "Wong Sawang", NameTH: "วงศ์สว่าง", LineName: "MRT Purple", LineColor: "#800080"},
		{ID: "PP15", NameEN: "Bang Son", NameTH: "บางซ่อน", LineName: "MRT Purple", LineColor: "#800080"},
		{ID: "PP16", NameEN: "Tao Poon", NameTH: "เตาปูน", LineName: "MRT Purple", LineColor: "#800080"},

		// Yellow Line
		{ID: "YL01", NameEN: "Lat Phrao", NameTH: "ลาดพร้าว", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL02", NameEN: "Phawana", NameTH: "ภาวนา", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL03", NameEN: "Chok Chai 4", NameTH: "โชคชัย 4", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL04", NameEN: "Lat Phrao 71", NameTH: "ลาดพร้าว 71", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL05", NameEN: "Lat Phrao 83", NameTH: "ลาดพร้าว 83", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL06", NameEN: "Mahat Thai", NameTH: "มหาดไทย", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL07", NameEN: "Lat Phrao 101", NameTH: "ลาดพร้าว 101", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL08", NameEN: "Bang Kapi", NameTH: "บางกะปิ", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL09", NameEN: "Yaek Lam Sali", NameTH: "แยกลำสาลี", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL10", NameEN: "Si Kritha", NameTH: "ศรีกรีฑา", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL11", NameEN: "Hua Mak", NameTH: "หัวหมาก", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL12", NameEN: "Kalantan", NameTH: "กลันตัน", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL13", NameEN: "Si Nut", NameTH: "ศรีนุช", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL14", NameEN: "Srinagarindra 38", NameTH: "ศรีนครินทร์ 38", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL15", NameEN: "Suan Luang Rama IX", NameTH: "สวนหลวง ร.9", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL16", NameEN: "Si Udom", NameTH: "ศรีอุดม", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL17", NameEN: "Si Iam", NameTH: "ศรีเอี่ยม", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL18", NameEN: "Si La Salle", NameTH: "ศรีลาซาล", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL19", NameEN: "Si Bearing", NameTH: "ศรีแบริ่ง", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL20", NameEN: "Si Dan", NameTH: "ศรีด่าน", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL21", NameEN: "Si Thepha", NameTH: "ศรีเทพา", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL22", NameEN: "Thipphawan", NameTH: "ทิพวัล", LineName: "Yellow Line", LineColor: "#FFD700"},
		{ID: "YL23", NameEN: "Samrong", NameTH: "สำโรง", LineName: "Yellow Line", LineColor: "#FFD700"},

		// Pink Line
		{ID: "PK01", NameEN: "Nonthaburi Civic Center", NameTH: "ศูนย์ราชการนนทบุรี", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK02", NameEN: "Khae Rai", NameTH: "แคราย", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK03", NameEN: "Samakkhi", NameTH: "สามัคคี", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK04", NameEN: "Royal Irrigation Department", NameTH: "กรมชลประทาน", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK05", NameEN: "Pak Kret", NameTH: "ปากเกร็ด", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK06", NameEN: "Chaeng Watthana-Pak Kret 28", NameTH: "แจ้งวัฒนะ-ปากเกร็ด 28", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK07", NameEN: "Si Rat", NameTH: "ศรีรัช", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK08", NameEN: "Impact Challenger", NameTH: "อิมแพ็ค ชาเลนเจอร์", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK09", NameEN: "Muang Thong Thani", NameTH: "เมืองทองธานี", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK10", NameEN: "TOT", NameTH: "ทีโอที", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK11", NameEN: "Chaeng Watthana 14", NameTH: "แจ้งวัฒนะ 14", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK12", NameEN: "Government Complex", NameTH: "ศูนย์ราชการเฉลิมพระเกียรติ", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK13", NameEN: "Lak Si", NameTH: "หลักสี่", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK14", NameEN: "Rajabhat Phra Nakhon", NameTH: "ราชภัฏพระนคร", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK15", NameEN: "Wat Phra Sri Mahathat", NameTH: "วัดพระศรีมหาธาตุ", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK16", NameEN: "Ram Inthra 3", NameTH: "รามอินทรา 3", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK17", NameEN: "Lat Pla Khao", NameTH: "ลาดปลาเค้า", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK18", NameEN: "Ram Inthra Kilo 4", NameTH: "รามอินทรา กม.4", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK19", NameEN: "Maiyalap", NameTH: "มัยลาภ", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK20", NameEN: "Watcharaphon", NameTH: "วัชรพล", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK21", NameEN: "Khok Khram", NameTH: "คลองขวาง", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK22", NameEN: "Setthabutbamphen", NameTH: "เศรษฐบุตรบำเพ็ญ", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK23", NameEN: "Ratchawinitbangchan", NameTH: "ราชวินิตบางเขน", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK24", NameEN: "Nopparat Ratchathani", NameTH: "นพรัตนราชธานี", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK25", NameEN: "Bang Chan", NameTH: "บางชัน", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK26", NameEN: "Suwinthawong", NameTH: "สุวินทวงศ์", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK27", NameEN: "Nimit Mai", NameTH: "นิมิตใหม่", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK28", NameEN: "Khlong Sam Wa", NameTH: "คลองสามวา", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK29", NameEN: "Sai Kong Din", NameTH: "สายกองดิน", LineName: "Pink Line", LineColor: "#FF69B4"},
		{ID: "PK30", NameEN: "Min Buri", NameTH: "มีนบุรี", LineName: "Pink Line", LineColor: "#FF69B4"},

		// Gold Line
		{ID: "G1", NameEN: "Krung Thon Buri", NameTH: "กรุงธนบุรี", LineName: "Gold Line", LineColor: "#DAA520"},
		{ID: "G2", NameEN: "Charoen Nakhon", NameTH: "เจริญนคร", LineName: "Gold Line", LineColor: "#DAA520"},
		{ID: "G3", NameEN: "Khlong San", NameTH: "คลองสาน", LineName: "Gold Line", LineColor: "#DAA520"},
		{ID: "RIVER", NameEN: "Riverside", NameTH: "ริมน้ำ", LineName: "Chao Phraya River", LineColor: "#B8E5FA"},
	}

	for _, station := range stations {
		db.FirstOrCreate(&station, models.Station{ID: station.ID})
	}

	log.Printf("Seeded %d transit stations", len(stations))
}

func seedDevelopersAndProjects(db *gorm.DB) {
	// Only seed if no developers exist yet
	var count int64
	db.Model(&models.Developer{}).Count(&count)
	if count > 0 {
		return
	}

	// Find agent to associate with
	var agent models.Agent
	if err := db.First(&agent).Error; err != nil {
		log.Println("No agent found, skipping developer/project seeding")
		return
	}

	log.Println("Seeding developers and projects...")

	type devProject struct {
		dev     string
		project string
	}

	data := []devProject{
		{"Sansiri", "Life Asoke"},
		{"Sansiri", "The Base Rama 9"},
		{"AP Thailand", "Aspire Erawan Prime"},
		{"AP Thailand", "Rhythm Asoke 2"},
		{"Origin Property", "KnightsBridge Prime Sathorn"},
		{"Supalai", "Supalai Veranda Rama 9"},
		{"LPN Development", "Lumpini Park Rama 9 \u2013 Ratchada"},
		{"Noble Development", "Noble Ploenchit"},
		{"Ananda Development", "Ideo Mobi Sukhumvit Eastgate"},
		{"Magnolia Quality Development Corporation", "The Residences at Mandarin Oriental"},
	}

	// Collect unique developers
	devMap := make(map[string]*models.Developer)
	for _, dp := range data {
		if _, exists := devMap[dp.dev]; !exists {
			dev := &models.Developer{
				AgentID: agent.ID,
				Name:    dp.dev,
			}
			db.Create(dev)
			devMap[dp.dev] = dev
		}
	}

	// Create projects
	for _, dp := range data {
		dev := devMap[dp.dev]
		project := models.Project{
			AgentID:     agent.ID,
			DeveloperID: dev.ID,
			Name:        dp.project,
		}
		db.Create(&project)
	}

	log.Printf("Seeded %d developers and %d projects", len(devMap), len(data))
}
