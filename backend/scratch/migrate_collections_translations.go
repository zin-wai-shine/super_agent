package main

import (
	"fmt"
	"log"
	"super_real_estate/config"
	"super_real_estate/models"
)

type Translation struct {
	MY string
	ZH string
}

var collectionTranslations = map[string]Translation{
	"Popular Properties":        {MY: "လူကြိုက်များသောအိမ်ခြံမြေများ", ZH: "热门房源"},
	"Explore Categories":        {MY: "အမျိုးအစားများ ရှာဖွေရန်", ZH: "探索类别"},
	"Near MRT Green Line":       {MY: "အစိမ်းရောင်ရထားလမ်းအနီး", ZH: "临近轻轨绿线"},
	"Near Hopsital":             {MY: "ဆေးရုံအနီး", ZH: "临近医院"},
	"Near Hospital":             {MY: "ဆေးရုံအနီး", ZH: "临近医院"},
	"Pet Friendly":              {MY: "အိမ်မွေးတိရစ္ဆာန်လက်ခံသော", ZH: "宠物友好"},
	"Budget Friendly":           {MY: "သင့်တင့်သောဈေးနှုန်း", ZH: "经济实惠"},
	"Studio Room":               {MY: "စတူဒီယိုအခန်း", ZH: "单身公寓"},
	"Near University / School":  {MY: "တက္ကသိုလ် / ကျောင်း အနီး", ZH: "临近大学/学校"},
	"Smart Home":                {MY: "စမတ်အိမ်ရာ", ZH: "智能家居"},
	"Rooftop Garden":            {MY: "ခေါင်မိုးပေါ်ပန်းခြံ", ZH: "屋顶花园"},
	"Short-Term Rent":           {MY: "ကာလတိုငှားရမ်းခြင်း", ZH: "短租"},
	"Ready to Move":             {MY: "အသင့်နေထိုင်နိုင်သော", ZH: "现房"},
	"Corner Unit":               {MY: "ထောင့်ခန်း", ZH: "边套"},
}

func main() {
	cfg := config.LoadConfig()
	db, err := config.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("Connected to database. Starting collection translation migration...")

	var collections []models.Collection
	if err := db.Find(&collections).Error; err != nil {
		log.Fatalf("Failed to fetch collections: %v", err)
	}

	updatedCount := 0
	for _, coll := range collections {
		trans, ok := collectionTranslations[coll.Name]
		if ok {
			coll.NameMY = trans.MY
			coll.NameZH = trans.ZH
			if err := db.Save(&coll).Error; err != nil {
				fmt.Printf("Error saving translations for collection '%s': %v\n", coll.Name, err)
			} else {
				fmt.Printf("Updated translations for '%s' -> MY: '%s', ZH: '%s'\n", coll.Name, trans.MY, trans.ZH)
				updatedCount++
			}
		} else {
			// Proper nouns (Condo names, etc.): keep translation fields empty or set to original name
			// This matches user requirement "We don't need to change language for language like Condo name and road and that location name"
			coll.NameMY = coll.Name
			coll.NameZH = coll.Name
			if err := db.Save(&coll).Error; err != nil {
				fmt.Printf("Error updating default translations for collection '%s': %v\n", coll.Name, err)
			} else {
				fmt.Printf("Set default translations (original name) for proper noun collection: '%s'\n", coll.Name)
			}
		}
	}

	fmt.Printf("\nMigration finished. Successfully updated translations for %d static categories.\n", updatedCount)
}
