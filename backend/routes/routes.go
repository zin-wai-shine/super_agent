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
	superAdminController := controllers.NewSuperAdminController(db, cfg)
	agentController := controllers.NewAgentController(db, cfg)
	publicController := controllers.NewPublicController(db)
	uploadController := controllers.NewUploadController(db, cfg)
	appointmentController := controllers.NewAppointmentController(db, wsManager)
	developerController := controllers.NewDeveloperController(db, cfg)
	googleAuthController := controllers.NewGoogleAuthController(db, cfg)
	facebookAuthController := controllers.NewFacebookAuthController(db, cfg)
	collectionController := controllers.NewCollectionController(db, cfg)
	translationController := controllers.NewTranslationController(db)

	// Public static files (Move before tenant middleware)
	router.Static("/uploads", cfg.UploadPath)

	// Apply tenant middleware globally
	router.Use(middleware.TenantMiddleware(db, cfg))

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
			auth.GET("/google", googleAuthController.GoogleLogin)
			auth.GET("/google/callback", googleAuthController.GoogleCallback)
			auth.GET("/facebook", facebookAuthController.FacebookLogin)
			auth.GET("/facebook/callback", facebookAuthController.FacebookCallback)
		}

		// Public routes
		public := api.Group("/public")
		{
			public.GET("/projects", publicController.GetProjects)
			public.GET("/listings", publicController.GetListings)
			public.GET("/listings/:id", publicController.GetListing)
			public.GET("/stations", publicController.GetStations)
			public.GET("/developers", publicController.GetDevelopers)
			public.GET("/listings/by-station/:stationId", publicController.GetListingsByStation)
			public.GET("/agent/info", publicController.GetAgentInfo)
			public.GET("/tenant/config", publicController.GetTenantConfig)
			public.GET("/plans", publicController.GetPlans)
			public.GET("/appointments/slots", appointmentController.GetAvailableSlots)
			public.POST("/appointments/lock", appointmentController.SoftLockSlot)
			public.POST("/appointments", appointmentController.CreateAppointment)
			public.GET("/collections", collectionController.GetCollections)
			public.GET("/collections/:id", collectionController.GetCollection)
			public.GET("/resolve-url", publicController.ResolveURL)

			// Share routes (for social media crawlers)
			share := public.Group("/share")
			{
				share.GET("/listing/:id", publicController.ServeListingMeta)
				share.GET("/agent", publicController.ServeAgentMeta)
			}
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
			protected.POST("/appointments/:id/cancel", appointmentController.CancelAppointment)

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

				// System & Tools
				superAdmin.POST("/system/migrate-translations", translationController.MigrateListings)
			}

			// Agent routes
			agent := protected.Group("/agent")
			agent.Use(middleware.RoleMiddleware(models.RoleAgent, models.RoleSubAgent))
			{
				// Listings management
				agent.GET("/listings", middleware.PermissionMiddleware(db, "/dashboard/listings", ""), agentController.GetListings)
				agent.POST("/listings", middleware.PermissionMiddleware(db, "", "listings:create"), agentController.CreateListing)
				agent.GET("/listings/:id", middleware.PermissionMiddleware(db, "/dashboard/listings", ""), agentController.GetListing)
				agent.PUT("/listings/:id", middleware.PermissionMiddleware(db, "", "listings:update"), agentController.UpdateListing)
				agent.DELETE("/listings/:id", middleware.PermissionMiddleware(db, "", "listings:delete"), agentController.DeleteListing)
				agent.POST("/listings/:id/publish", middleware.PermissionMiddleware(db, "", "listings:update"), agentController.PublishListing)
				agent.POST("/listings/:id/unpublish", middleware.PermissionMiddleware(db, "", "listings:update"), agentController.UnpublishListing)
				agent.POST("/listings/:id/repost", middleware.PermissionMiddleware(db, "", "listings:update"), agentController.RepostListing)
				agent.PUT("/listings/:id/toggle-viewing", middleware.PermissionMiddleware(db, "", "listings:update"), agentController.ToggleViewingRequests)

				// Facility media management
				agent.GET("/facilities", middleware.PermissionMiddleware(db, "/dashboard/facilities", ""), agentController.GetFacilityMedia)
				agent.PUT("/facilities/:id", middleware.PermissionMiddleware(db, "", "facilities:update"), agentController.UpdateFacilityMedia)
				agent.DELETE("/facilities/:id", middleware.PermissionMiddleware(db, "", "facilities:delete"), agentController.DeleteFacilityMedia)
				agent.PUT("/facilities/reorder", middleware.PermissionMiddleware(db, "", "facilities:update"), agentController.ReorderFacilityMedia)


				// Sub-agent management (Agent only)
				subAgents := agent.Group("/sub-agents")
				subAgents.Use(middleware.RoleMiddleware(models.RoleAgent), middleware.FeatureMiddleware(db, "sub_agents"))
				{
					subAgents.GET("", agentController.GetSubAgents)
					subAgents.POST("", agentController.CreateSubAgent)
					subAgents.PUT("/:id", agentController.UpdateSubAgent)
					subAgents.DELETE("/:id", agentController.DeleteSubAgent)
				}

				// Theme management
				theme := agent.Group("/theme")
				theme.Use(middleware.FeatureMiddleware(db, "theme"))
				{
					theme.GET("", middleware.PermissionMiddleware(db, "/dashboard/theme", ""), agentController.GetTheme)
					theme.PUT("", middleware.PermissionMiddleware(db, "", "theme:update"), agentController.UpdateTheme)
				}

				// Settings management
				agent.GET("/settings", middleware.PermissionMiddleware(db, "/dashboard/settings", ""), agentController.GetSettings)
				agent.PUT("/settings", middleware.PermissionMiddleware(db, "", "settings:update"), agentController.UpdateSettings)

				// Dashboard
				agent.GET("/dashboard", middleware.PermissionMiddleware(db, "/dashboard", ""), agentController.GetDashboard)

				// Appointment management (agent)
				appointments := agent.Group("/appointments")
				appointments.Use(middleware.FeatureMiddleware(db, "appointments"))
				{
					appointments.GET("", middleware.PermissionMiddleware(db, "/dashboard/appointments", ""), appointmentController.GetAppointments)
					appointments.GET("/:id", middleware.PermissionMiddleware(db, "/dashboard/appointments", ""), appointmentController.GetAppointment)
					appointments.PUT("/:id", middleware.PermissionMiddleware(db, "", "appointments:update"), appointmentController.UpdateAppointmentStatus)
					appointments.DELETE("/:id", middleware.PermissionMiddleware(db, "", "appointments:delete"), appointmentController.DeleteAppointment)
				}

				// User management
				users := agent.Group("/users")
				{
					users.GET("", middleware.PermissionMiddleware(db, "/dashboard/users", ""), agentController.GetUsers)
					users.PUT("/:id/toggle", middleware.PermissionMiddleware(db, "", "users:update"), agentController.ToggleUserStatus)
					agent.DELETE("/users/:id", middleware.PermissionMiddleware(db, "", "users:delete"), agentController.DeleteUser)
				}

				// Developer management
				developers := agent.Group("/developers")
				{
					developers.GET("", middleware.PermissionMiddleware(db, "/dashboard/developers", ""), developerController.GetDevelopers)
					developers.POST("", middleware.PermissionMiddleware(db, "", "developers:create"), developerController.CreateDeveloper)
					developers.PUT("/:id", middleware.PermissionMiddleware(db, "", "developers:update"), developerController.UpdateDeveloper)
					developers.DELETE("/:id", middleware.PermissionMiddleware(db, "", "developers:delete"), developerController.DeleteDeveloper)
				}

				// Project management
				projects := agent.Group("/projects")
				{
					projects.GET("", middleware.PermissionMiddleware(db, "/dashboard/projects", ""), developerController.GetProjects)
					projects.POST("", middleware.PermissionMiddleware(db, "", "projects:create"), developerController.CreateProject)
					projects.PUT("/:id", middleware.PermissionMiddleware(db, "", "projects:update"), developerController.UpdateProject)
					projects.DELETE("/:id", middleware.PermissionMiddleware(db, "", "projects:delete"), developerController.DeleteProject)
				}

				// Collection management
				collections := agent.Group("/collections")
				{
					collections.GET("", middleware.PermissionMiddleware(db, "/dashboard/collections", ""), collectionController.GetCollections)
					collections.PUT("/reorder", middleware.PermissionMiddleware(db, "", "collections:update"), collectionController.ReorderCollections)
					collections.POST("", middleware.PermissionMiddleware(db, "", "collections:create"), collectionController.CreateCollection)
					collections.GET("/:id", middleware.PermissionMiddleware(db, "/dashboard/collections", ""), collectionController.GetCollection)
					collections.PUT("/:id", middleware.PermissionMiddleware(db, "", "collections:update"), collectionController.UpdateCollection)
					collections.DELETE("/:id", middleware.PermissionMiddleware(db, "", "collections:delete"), collectionController.DeleteCollection)
					collections.POST("/:id/listings/:listingId", middleware.PermissionMiddleware(db, "", "collections:update"), collectionController.AddListingToCollection)
					collections.DELETE("/:id/listings/:listingId", middleware.PermissionMiddleware(db, "", "collections:update"), collectionController.RemoveListingFromCollection)
				}
			}

			// Upload routes
			upload := protected.Group("/upload")
			{
				upload.POST("/image", uploadController.UploadImage)
				upload.POST("/video", uploadController.UploadVideo)
				upload.POST("/logo", uploadController.UploadLogo)
				upload.POST("/banner", uploadController.UploadBanner)
				upload.POST("/collection-image", uploadController.UploadCollectionImage)
				upload.POST("/avatar", uploadController.UploadAvatar)
				upload.POST("/facility-image", uploadController.UploadFacilityImage)
				upload.POST("/link-facility", uploadController.LinkFacilityMedia)
				upload.PUT("/reorder", uploadController.ReorderMedia)

				upload.PATCH("/:id", uploadController.UpdateMedia)
				upload.DELETE("/:id", uploadController.DeleteMedia)
			}

			// Notification routes
			notificationController := controllers.NewNotificationController(db, wsManager)
			notifications := protected.Group("/notifications")
			{
				notifications.GET("", middleware.PermissionMiddleware(db, "/dashboard/notifications", ""), notificationController.GetMyNotifications)
				notifications.GET("/sent", middleware.PermissionMiddleware(db, "/dashboard/notifications", ""), notificationController.GetSentNotifications)
				notifications.POST("", middleware.FeatureMiddleware(db, "notifications"), middleware.PermissionMiddleware(db, "", "notifications:create"), notificationController.CreateNotification)
				notifications.POST("/:id/read", notificationController.MarkRead)
			}

			// Banner routes
			bannerController := controllers.NewBannerController(db, cfg)
			banners := protected.Group("/banners")
			banners.Use(middleware.FeatureMiddleware(db, "banners"))
			{
				banners.GET("", middleware.PermissionMiddleware(db, "/dashboard/banners", ""), bannerController.GetBanners)
				banners.GET("/:id", middleware.PermissionMiddleware(db, "/dashboard/banners", ""), bannerController.GetBanner)
				banners.POST("", middleware.PermissionMiddleware(db, "", "banners:create"), bannerController.CreateBanner)
				banners.PUT("/:id", middleware.PermissionMiddleware(db, "", "banners:update"), bannerController.UpdateBanner)
				banners.DELETE("/:id", middleware.PermissionMiddleware(db, "", "banners:delete"), bannerController.DeleteBanner)
			}

			// Saved Listings routes
			savedListingsController := controllers.NewSavedListingsController(db)
			savedListings := protected.Group("/saved-listings")
			{
				savedListings.POST("", savedListingsController.SaveListing)
				savedListings.DELETE("/:listingId", savedListingsController.UnsaveListing)
				savedListings.GET("", savedListingsController.GetSavedListings)
				savedListings.GET("/check/:listingId", savedListingsController.CheckIfSaved)
			}

			// Public Banner Route (override protected for fetching)
			api.GET("/public/banners", bannerController.GetBanners)
			api.GET("/public/banners/:id", bannerController.GetBanner)
		}
	}

}
