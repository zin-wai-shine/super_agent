package routes

import (
	"super_real_estate/config"
	"super_real_estate/controllers"
	"super_real_estate/middleware"
	"super_real_estate/models"
	"super_real_estate/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.Engine, db *gorm.DB, cfg *config.Config, wsManager *utils.WebSocketManager) {
	// Initialize controllers
	authController := controllers.NewAuthController(db)
	superAdminController := controllers.NewSuperAdminController(db)
	agentController := controllers.NewAgentController(db, cfg)
	publicController := controllers.NewPublicController(db)
	uploadController := controllers.NewUploadController(db, cfg)
	appointmentController := controllers.NewAppointmentController(db)

	// Apply tenant middleware globally
	router.Use(middleware.TenantMiddleware(db))

	// API routes group
	api := router.Group("/api")
	{
		// Health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "version": "1.0.0"})
		})

		// Auth routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authController.Register)
			auth.POST("/login", authController.Login)
			auth.POST("/refresh", authController.RefreshToken)
		}

		// Public routes
		public := api.Group("/public")
		{
			public.GET("/listings", publicController.GetListings)
			public.GET("/listings/:id", publicController.GetListing)
			public.GET("/stations", publicController.GetStations)
			public.GET("/listings/by-station/:stationId", publicController.GetListingsByStation)
			public.GET("/agent/info", publicController.GetAgentInfo)
			public.GET("/plans", publicController.GetPlans)
			public.POST("/appointments", appointmentController.CreateAppointment)
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// User profile
			protected.GET("/me", authController.GetProfile)
			protected.PUT("/me", authController.UpdateProfile)
			protected.PUT("/me/password", authController.ChangePassword)
			protected.GET("/appointments/my", appointmentController.GetMyAppointments)

			// WebSocket Route
			protected.GET("/ws", func(c *gin.Context) {
				wsManager.ServeWS(c)
			})

			// Super Admin routes
			superAdmin := protected.Group("/admin")
			superAdmin.Use(middleware.RoleMiddleware(models.RoleSuperAdmin))
			{
				// Agent management
				superAdmin.GET("/agents", superAdminController.GetAgents)
				superAdmin.POST("/agents", superAdminController.CreateAgent)
				superAdmin.GET("/agents/:id", superAdminController.GetAgent)
				superAdmin.PUT("/agents/:id", superAdminController.UpdateAgent)
				superAdmin.DELETE("/agents/:id", superAdminController.DeleteAgent)
				superAdmin.POST("/agents/:id/suspend", superAdminController.SuspendAgent)
				superAdmin.POST("/agents/:id/activate", superAdminController.ActivateAgent)

				// Subscription plans
				superAdmin.GET("/plans", superAdminController.GetPlans)
				superAdmin.POST("/plans", superAdminController.CreatePlan)
				superAdmin.PUT("/plans/:id", superAdminController.UpdatePlan)
				superAdmin.DELETE("/plans/:id", superAdminController.DeletePlan)

				// Users management
				superAdmin.GET("/users", superAdminController.GetUsers)

				// Dashboard stats
				superAdmin.GET("/stats", superAdminController.GetDashboardStats)

				// Appointment management (admin)
				superAdmin.GET("/appointments", appointmentController.GetAllAppointments)
				superAdmin.GET("/appointment-stats", appointmentController.GetAppointmentStats)
			}

			// Agent routes
			agent := protected.Group("/agent")
			agent.Use(middleware.RoleMiddleware(models.RoleAgent, models.RoleSubAgent))
			{
				// Listings management
				agent.GET("/listings", agentController.GetListings)
				agent.POST("/listings", agentController.CreateListing)
				agent.GET("/listings/:id", agentController.GetListing)
				agent.PUT("/listings/:id", agentController.UpdateListing)
				agent.DELETE("/listings/:id", agentController.DeleteListing)
				agent.POST("/listings/:id/publish", agentController.PublishListing)
				agent.POST("/listings/:id/unpublish", agentController.UnpublishListing)

				// Sub-agent management (Agent only)
				agent.GET("/sub-agents", middleware.RoleMiddleware(models.RoleAgent), agentController.GetSubAgents)
				agent.POST("/sub-agents", middleware.RoleMiddleware(models.RoleAgent), agentController.CreateSubAgent)
				agent.PUT("/sub-agents/:id", middleware.RoleMiddleware(models.RoleAgent), agentController.UpdateSubAgent)
				agent.DELETE("/sub-agents/:id", middleware.RoleMiddleware(models.RoleAgent), agentController.DeleteSubAgent)

				// Theme management
				agent.GET("/theme", agentController.GetTheme)
				agent.PUT("/theme", middleware.RoleMiddleware(models.RoleAgent), agentController.UpdateTheme)

				// Settings management
				agent.GET("/settings", agentController.GetSettings)
				agent.PUT("/settings", middleware.RoleMiddleware(models.RoleAgent), agentController.UpdateSettings)

				// Dashboard
				agent.GET("/dashboard", agentController.GetDashboard)

				// Appointment management (agent)
				agent.GET("/appointments", appointmentController.GetAppointments)
				agent.GET("/appointments/:id", appointmentController.GetAppointment)
				agent.PUT("/appointments/:id", appointmentController.UpdateAppointmentStatus)
				agent.DELETE("/appointments/:id", appointmentController.DeleteAppointment)
			}

			// Upload routes
			upload := protected.Group("/upload")
			{
				upload.POST("/image", uploadController.UploadImage)
				upload.POST("/video", uploadController.UploadVideo)
				upload.POST("/logo", uploadController.UploadLogo)
				upload.POST("/banner", uploadController.UploadBanner)
				upload.DELETE("/:id", uploadController.DeleteMedia)
			}

			// Notification routes
			notificationController := controllers.NewNotificationController(db, wsManager)
			notifications := protected.Group("/notifications")
			{
				notifications.GET("", notificationController.GetMyNotifications)
				notifications.GET("/sent", notificationController.GetSentNotifications)
				notifications.POST("", notificationController.CreateNotification)
				notifications.POST("/:id/read", notificationController.MarkRead)
			}

			// Banner routes
			bannerController := controllers.NewBannerController(db)
			banners := protected.Group("/banners")
			{
				banners.GET("", bannerController.GetBanners)
				banners.GET("/:id", bannerController.GetBanner)
				banners.POST("", bannerController.CreateBanner)
				banners.PUT("/:id", bannerController.UpdateBanner)
				banners.DELETE("/:id", bannerController.DeleteBanner)
			}

			// Public Banner Route (override protected for fetching)
			api.GET("/public/banners", bannerController.GetBanners)
			api.GET("/public/banners/:id", bannerController.GetBanner)
		}
	}

	// Serve uploaded files
	router.Static("/uploads", cfg.UploadPath)
}
