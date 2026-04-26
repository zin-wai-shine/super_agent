package utils

import (
	"log"
	"super_real_estate/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func SeedMasterDevelopersAndProjects(db *gorm.DB) {
	// Association with Bolt Haven Realty
	agentID, _ := uuid.Parse("7d0c4b8e-c331-4f58-9b9b-3eb7ac0c5841")

	data := map[string][]string{
		"Sansiri Public Company Limited": {
			"XT Phayathai", "XT Ekkamai", "XT Huaikhwang", "THE BASE Phetchaburi-Thonglor",
			"THE BASE Height Mittraphap", "KHUN by YOO Inspired by Starck", "98 Wireless",
			"Via Ari", "Baan Sansiri Sukhumvit", "Siri at Sukhumvit", "Mori Haus",
			"Taka Haus", "Hasu Haus", "D Condo Campus", "Saransiri", "Setthasiri",
			"Narasiri", "BuGaan",
		},
		"AP (Thailand) Public Company Limited": {
			"LIFE Asoke Rama 9", "LIFE Ladprao Valley", "LIFE Sathorn Sierra",
			"RHYTHM Sukhumvit", "RHYTHM Ekkamai", "RHYTHM Charoennakhon Iconic",
			"ASPIRE Ratchada-Wongsawang", "ASPIRE Sukhumvit-Onnut", "CENTRO Bangna",
			"CENTRO Ratchapruek", "THE CITY Bangna", "THE CITY Rama 9",
			"PLENO Townhome", "MODEN Housing",
		},
		"Land and Houses Public Company Limited": {
			"Mantana Bangna", "Mantana Westgate", "Chaiyapruek Rangsit",
			"Chaiyapruek Pinklao", "Indy Bangna", "Indy Westgate", "Inizio Rama 2",
			"Vive Krungthep Kreetha", "The Key Sathorn", "The Key Rama 3",
			"The Room Sukhumvit", "The Room Charoenkrung",
		},
		"Pruksa Holding Public Company Limited": {
			"Plum Condo Ramkhamhaeng", "Plum Condo Chaengwattana", "The Tree Sukhumvit",
			"The Tree Charan", "Chapter One Midtown Ladprao", "Chapter Chula-Samyan",
			"The Reserve Sukhumvit", "The Reserve Sathorn", "Passorn Housing",
			"Pruklada Housing", "Pruksaville Townhome",
		},
		"SC Asset Corporation Public Company Limited": {
			"Grand Bangkok Boulevard Sathorn", "Grand Bangkok Boulevard Rama 9",
			"Bangkok Boulevard Signature", "Venue ID Motorway-Rama 9",
			"Reference Sathorn-Wongwianyai", "Reference Kaset District",
			"COBE Kaset-Sripatum", "CENTRIC Ari Station", "SALADAENG ONE",
		},
		"Ananda Development Public Company Limited": {
			"IDEO Q Victory", "IDEO Mobi Rangnam", "IDEO Sukhumvit Rama 4",
			"IDEO Charan 70", "ELIO Del Moss", "ELIO Sathorn-Wutthakat",
			"Ashton Asoke", "Ashton Chula-Silom", "Ashton Residence 41", "Culture Chula",
		},
		"Origin Property Public Company Limited": {
			"Knightsbridge Prime Sathorn", "Knightsbridge Space Sukhumvit",
			"Park Origin Phromphong", "Park Origin Thonglor", "Park Origin Chula-Samyan",
			"Origin Plug & Play Sirindhorn", "Origin Place Bangna", "Brixton Pet & Play",
			"Hampton Residence", "So Origin Pattaya",
		},
		"Noble Development Public Company Limited": {
			"Noble Ploenchit", "Noble Around Ari", "Noble State 39", "Noble Recole",
			"Noble Refine", "Noble Revolve Ratchada", "Noble Form Thonglor", "Noble Create",
		},
		"Supalai Public Company Limited": {
			"Supalai Premier Charoennakhon", "Supalai Oriental Sukhumvit",
			"Supalai Loft Sathorn", "Supalai Veranda Rama 9", "Supalai Garden Ville",
			"Supalai Bella", "Supalai Park",
		},
		"Major Development Public Company Limited": {
			"Metris Ladprao", "Metris Rama 9", "Maru Ekkamai 2", "Maru Ladprao 15",
			"Maestro 19", "Reflection Jomtien Beach Pattaya", "Mavista Prestige Village",
		},
		"AssetWise Public Company Limited": {
			"Modiz Launch", "Modiz Sukhumvit 50", "Atmoz Oasis Onnut",
			"Atmoz Kanaal Rangsit", "Kave Town Space", "Kave TU", "Kave Seed Kaset",
			"Este Ratchada",
		},
		"L.P.N. Development Public Company Limited": {
			"Lumpini Place Rama 9", "Lumpini Ville Sukhumvit", "Lumpini Park Riverside",
			"EARN by LPN",
		},
		"Central Pattana Residence Company Limited": {
			"ESCENT Ville Chiangmai", "ESCENT Nakhon Sawan", "Phyll Phuket",
			"\u0e19\u0e34\u0e23\u0e15\u0e34 Chiangmai",
		},
		"Frasers Property (Thailand) Public Company Limited": {
			"The Grand Riverfront Ratchapruek", "Golden Prestige", "Gramour Sathorn",
			"Klos Ramintra",
		},
		"Singha Estate Public Company Limited": {
			"The ESSE Asoke", "The ESSE Singha Complex", "EYSE Sukhumvit 43",
			"SIRANINN Residences", "Santiburi The Residences",
		},
		"Magnolia Quality Development Corporation Limited (MQDC)": {
			"ICONSIAM Residences", "The Residences at Mandarin Oriental Bangkok",
			"Whizdom Avenue Ratchada-Ladprao", "Whizdom Inspire Sukhumvit",
			"Mulberry Grove Sukhumvit", "The Forestias", "Six Senses Residences The Forestias",
		},
		"Raimon Land Public Company Limited": {
			"The River Charoennakhon", "185 Rajadamri", "The Lofts Asoke",
			"The Estelle Phrom Phong", "Tait Sathorn 12",
		},
		"Britania Public Company Limited": {
			"Britania Bangna", "Britania Ratchapruek", "Grand Britania Wongwaen",
			"Belgravia Exclusive Pool Villa",
		},
		"Sena Development Public Company Limited": {
			"Sena Kith MRT Bangkae", "Sena Eco Town", "Cozi MRT Phetkasem",
		},
		"Chewathai Public Company Limited": {
			"Chewathai Residence Asoke", "Chewathai Hallmark Ladprao",
			"Chewathai Kaset-Nawamin",
		},
	}

	log.Println("Seeding master list of Thailand developers and projects...")

	for devName, projects := range data {
		var developer models.Developer
		if err := db.Where(models.Developer{Name: devName, AgentID: agentID}).FirstOrCreate(&developer).Error; err != nil {
			log.Printf("Failed to create developer %s: %v", devName, err)
			continue
		}

		for _, projName := range projects {
			var project models.Project
			if err := db.Where(models.Project{Name: projName, DeveloperID: developer.ID, AgentID: agentID}).FirstOrCreate(&project).Error; err != nil {
				log.Printf("Failed to create project %s for %s: %v", projName, devName, err)
			}
		}
	}

	log.Println("Master list seeding completed.")
}
