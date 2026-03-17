import uuid
import random

agent_id = '0cccb54d-327e-40f5-8c82-e710de3d88d8'
user_id = '4e0c4b8e-c331-4f58-9b9b-3eb7ac0c5841'

listings_data = [
    ('Luxury Sky Villa at Thong Lo', 'Exquisite sky villa with 360-degree city views. Private pool and elevator.', 'sale', 'condo', 125000000, 4, 5, 420, 'Sukhumvit 55', 'Watthana', 'Bangkok', 'N5', 'Ari', 'true', 'true', 450, 'Ready to Move'),
    ('Modern Minimalist House in Phra Khanong', 'Sleek design with smart home integration and sustainable features.', 'sale', 'house', 48000000, 3, 4, 320, 'Sukhumvit 71', 'Watthana', 'Bangkok', 'N9', 'Ha Yaek Lat Phrao', 'true', 'true', 120, 'Available'),
    ('Urban Oasis Condo near Ekkamai', 'Hidden gem with private garden and resort-style amenities.', 'rent', 'condo', 85000, 2, 2, 110, 'Sukhumvit 63', 'Watthana', 'Bangkok', 'N5', 'Ari', 'true', 'false', 89, 'Ready to Move'),
    ('Riverside Penthouse with Dock Access', 'Direct access to the Chao Phraya river with a private pier.', 'sale', 'condo', 95000000, 3, 4, 280, 'Charoen Nakhon Rd', 'Khlong San', 'Bangkok', 'N5', 'Ari', 'true', 'true', 65, 'Ready to Move'),
    ('Colonial Style Mansion in Sathorn', 'Historic mansion beautifully restored with modern comfort.', 'sale', 'house', 220000000, 6, 8, 1200, 'South Sathon Rd', 'Sathon', 'Bangkok', 'N5', 'Ari', 'true', 'true', 25, 'Available'),
    ('Cozy Artist Studio in Ari', 'Inspirational space with high ceilings and abundant natural light.', 'rent', 'condo', 42000, 1, 1, 65, 'Phahonyothin Soi 7', 'Phaya Thai', 'Bangkok', 'N5', 'Ari', 'true', 'false', 310, 'Ready to Move'),
    ('Luxury Tech Condo at Rama 9', 'The most advanced smart home system in the city.', 'rent', 'condo', 60000, 1, 1, 55, 'Rama 9 Rd', 'Huai Khwang', 'Bangkok', 'N9', 'Ha Yaek Lat Phrao', 'true', 'true', 150, 'Ready to Move'),
    ('Spacious Family Villa in Bang Na', 'Near international schools with a private playground.', 'sale', 'house', 32000000, 5, 5, 450, 'Bang Na-Trad Rd', 'Bang Na', 'Bangkok', 'N5', 'Ari', 'true', 'false', 48, 'Available'),
    ('Modern Loft in Silom', 'Open floor plan with industrial aesthetic in the financial district.', 'rent', 'condo', 55000, 1, 2, 95, 'Silom Rd', 'Bang Rak', 'Bangkok', 'N5', 'Ari', 'true', 'true', 110, 'Ready to Move'),
    ('Serene Lakefront Property', 'Calm and peaceful living by a private lake.', 'sale', 'land', 150000000, 0, 0, 3200, 'Krungthep Kreetha', 'Saphan Sung', 'Bangkok', 'N5', 'Ari', 'true', 'true', 15, 'Available'),
    ('Boutique Condo at Phrom Phong', 'Exclusive low-rise with only 10 units. Ultimate privacy.', 'rent', 'condo', 120000, 3, 3, 180, 'Sukhumvit 24', 'Khlong Toei', 'Bangkok', 'N5', 'Ari', 'true', 'true', 56, 'Ready to Move'),
    ('Classic Thai House with Garden', 'Traditional architecture with modern interior upgrades.', 'sale', 'house', 55000000, 4, 3, 400, 'Sukhumvit 49', 'Watthana', 'Bangkok', 'N5', 'Ari', 'true', 'false', 74, 'Available'),
    ('High-Yield Investment Unit', 'Proven rental history in a high-demand area.', 'sale', 'condo', 8500000, 1, 1, 35, 'Phaya Thai Rd', 'Ratchathewi', 'Bangkok', 'N5', 'Ari', 'true', 'true', 180, 'Available'),
    ('Designer Townhome in On Nut', 'Contemporary design with rooftop garden.', 'rent', 'townhome', 45000, 3, 3, 200, 'Sukhumvit 77', 'Watthana', 'Bangkok', 'N5', 'Ari', 'true', 'false', 95, 'Ready to Move'),
    ('Luxury Studio at Asoke Intersection', 'The center of it all. Perfect for urban living.', 'rent', 'condo', 38000, 1, 1, 42, 'Asoke Rd', 'Watthana', 'Bangkok', 'N5', 'Ari', 'true', 'true', 230, 'Ready to Move'),
    ('Family Estate in Ladprao', 'Massive plot with main house and guest house.', 'sale', 'house', 68000000, 7, 8, 800, 'Lat Phrao Soi 71', 'Huai Khwang', 'Bangkok', 'N9', 'Ha Yaek Lat Phrao', 'true', 'true', 42, 'Available'),
    ('Compact Condo at Ha Yaek Lat Phrao', 'Direct link to both BTS and MRT lines.', 'rent', 'condo', 18000, 1, 1, 32, 'Phahonyothin Rd', 'Chatuchak', 'Bangkok', 'N9', 'Ha Yaek Lat Phrao', 'true', 'false', 156, 'Ready to Move'),
    ('Modern Office Building in Ari', 'Prime commercial space for headquarters.', 'rent', 'house', 250000, 0, 10, 1500, 'Phahonyothin Rd', 'Phaya Thai', 'Bangkok', 'N5', 'Ari', 'true', 'true', 28, 'Available'),
    ('Zen Style Apartment in Thong Lo', 'Meditative spaces and tranquil environment.', 'rent', 'condo', 95000, 2, 3, 140, 'Sukhumvit 55', 'Watthana', 'Bangkok', 'N5', 'Ari', 'true', 'true', 34, 'Occupied until Jun'),
    ('Commercial Land for Hotel Project', 'Strategic location for hospitality development.', 'sale', 'land', 350000000, 0, 0, 4800, 'Phetchaburi Rd', 'Ratchathewi', 'Bangkok', 'N5', 'Ari', 'true', 'true', 19, 'Available'),
]

sql = "-- Generate dummy listings with media\n"
sql += "BEGIN;\n"

images = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1628014902195-257a09886475?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600607688969-a5bfcd64bd13?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1605276374104-a6283e6026ce?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?q=80&w=2000&auto=format&fit=crop"
]

for item in listings_data:
    l_id = str(uuid.uuid4())
    sql += f"INSERT INTO listings (id, created_at, updated_at, agent_id, created_by, title, description, listing_type, property_type, price, bedrooms, bathrooms, area, address, district, province, station_id, station_name, is_published, is_featured, view_count, availability_status) VALUES ('{l_id}', NOW(), NOW(), '{agent_id}', '{user_id}', '{item[0]}', '{item[1]}', '{item[2]}', '{item[3]}', {item[4]}, {item[5]}, {item[6]}, {item[7]}, '{item[8]}', '{item[9]}', '{item[10]}', '{item[11]}', '{item[12]}', {item[13]}, {item[14]}, {item[15]}, '{item[16]}');\n"
    
    # generate 5 images
    used_images = random.sample(images, 5)
    for i in range(5):
        m_id = str(uuid.uuid4())
        img_url = used_images[i]
        room_types = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Additional Photos']
        rt = room_types[i % len(room_types)]
        sql += f"INSERT INTO media (id, created_at, updated_at, listing_id, type, url, thumbnail, caption, room_type, sort_order) VALUES ('{m_id}', NOW(), NOW(), '{l_id}', 'image', '{img_url}', '{img_url}', '{rt}', '{rt}', {i});\n"

sql += "COMMIT;\n"

with open("seed_new.sql", "w") as f:
    f.write(sql)
