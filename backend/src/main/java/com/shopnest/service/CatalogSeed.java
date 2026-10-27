package com.shopnest.service;

import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.shopnest.model.Product;
import com.shopnest.model.Product.Color;
import com.shopnest.model.Product.Spec;
import com.shopnest.repo.Repos;

/** Fills an empty database with the 32 sample products (only the first time the store starts). */
@Component
public class CatalogSeed implements ApplicationRunner {
	private final Repos.Products products;

	public CatalogSeed(Repos.Products products) {
		this.products = products;
	}

	@Override
	public void run(ApplicationArguments args) {
		if (products.count() == 0) products.saveAll(sample());
	}

	private static Product p(long id, String cat, String art, String title, double price, double was, double rating, int n,
			int stock, List<Color> colors, List<String> bullets, List<Spec> specs, String kw, int age) {
		Product p = new Product();
		p.id = id; p.cat = cat; p.art = art; p.title = title; p.price = price; p.was = was; p.rating = rating;
		p.n = n; p.stock = stock; p.kw = kw; p.age = age;
		p.colors.addAll(colors); p.bullets.addAll(bullets); p.specs.addAll(specs);
		return p;
	}

	static List<Product> sample() {
		return List.of(
			p(1, "electronics", "headphones", "Wireless Over-Ear Headphones with Noise Cancelling", 79.99, 109.99, 4.6, 2841, 38,
					List.of(new Color("Midnight", "#2F3E52"), new Color("Sand", "#C9A25F"), new Color("Sage", "#6E9C7F")),
					List.of("Active noise cancelling for flights and busy commutes", "Up to 40 hours of playtime on one charge", "Foldable frame with a hard carry case"),
					List.of(new Spec("Connection", "Bluetooth 5.3"), new Spec("Battery", "40 hours"), new Spec("Weight", "254 g")), "audio music earphones bluetooth sound", 12),
			p(2, "electronics", "phone", "Smartphone 6.5\" 128 GB with Dual Camera", 249, 299, 4.3, 1520, 21,
					List.of(new Color("Graphite", "#3A4350"), new Color("Ocean", "#2F6FD0"), new Color("Mint", "#4DB49A")),
					List.of("Bright 6.5 inch display with a smooth 90 Hz refresh rate", "Dual rear camera with night mode", "Two-day battery and 33 W fast charging"),
					List.of(new Spec("Storage", "128 GB"), new Spec("Screen", "6.5 inch"), new Spec("Battery", "5000 mAh")), "mobile cellphone android", 30),
			p(3, "electronics", "laptop", "Slim Laptop 14\" with 16 GB RAM and 512 GB SSD", 629, 749, 4.5, 864, 9,
					List.of(new Color("Silver", "#9AA7B5"), new Color("Space Gray", "#4B5563")),
					List.of("Light 1.3 kg body that fits in any bag", "Fast 512 GB solid state drive", "Full HD anti-glare screen, up to 12 hours of battery"),
					List.of(new Spec("Memory", "16 GB"), new Spec("Storage", "512 GB SSD"), new Spec("Weight", "1.3 kg")), "computer notebook pc work", 25),
			p(4, "electronics", "watch", "Fitness Smartwatch with Heart-Rate Monitor", 59.99, 89.99, 4.2, 3302, 64,
					List.of(new Color("Black", "#262B33"), new Color("Rose", "#D98A9B"), new Color("Teal", "#2A8F95")),
					List.of("Tracks steps, sleep and heart rate all day", "Water resistant to 50 metres", "Calls and message alerts on your wrist"),
					List.of(new Spec("Display", "1.69 inch"), new Spec("Battery", "10 days"), new Spec("Water rating", "5 ATM")), "wearable fitness tracker band", 8),
			p(5, "electronics", "speaker", "Portable Bluetooth Speaker, Waterproof", 34.99, 49.99, 4.7, 5120, 120,
					List.of(new Color("Coral", "#E4604A"), new Color("Navy", "#2B4A7A"), new Color("Forest", "#3F7D5A")),
					List.of("Loud, clear 20 W sound with deep bass", "Floats and survives splashes (IP67)", "12 hours of playtime"),
					List.of(new Spec("Power", "20 W"), new Spec("Battery", "12 hours"), new Spec("Rating", "IP67")), "audio music wireless bluetooth", 40),
			p(6, "electronics", "camera", "Compact Mirrorless Camera Kit with 16-50 mm Lens", 449, 0, 4.4, 612, 0,
					List.of(new Color("Black", "#2B2F36"), new Color("Silver", "#A5AEB8")),
					List.of("24 megapixel sensor for sharp detail in low light", "Tilting touch screen for vlogs and selfies", "Shoots 4K video"),
					List.of(new Spec("Sensor", "24 MP"), new Spec("Video", "4K 30p"), new Spec("Kit lens", "16-50 mm")), "photo photography vlog", 90),
			p(7, "fashion", "sneaker", "Lightweight Running Shoes", 54.99, 74.99, 4.4, 2210, 80,
					List.of(new Color("Coral", "#E8664F"), new Color("Ink", "#2D3A5C"), new Color("Lime", "#9BC53D")),
					List.of("Breathable mesh upper keeps feet cool", "Cushioned sole for daily runs", "Weighs only 240 g per shoe"),
					List.of(new Spec("Type", "Road running"), new Spec("Drop", "8 mm"), new Spec("Weight", "240 g")), "shoes trainers footwear jogging", 18),
			p(8, "fashion", "tshirt", "Organic Cotton T-Shirt, Pack of 2", 24.99, 0, 4.5, 4033, 150,
					List.of(new Color("Navy", "#2B3A63"), new Color("Olive", "#6F7B45"), new Color("Clay", "#C27A5A")),
					List.of("Soft 100% organic cotton", "Relaxed fit that keeps its shape after washing", "Two shirts in every pack"),
					List.of(new Spec("Material", "Organic cotton"), new Spec("Fit", "Regular"), new Spec("Care", "Machine wash")), "clothes shirt top clothing", 55),
			p(9, "fashion", "backpack", "Water-Resistant Travel Backpack 30 L", 39.99, 54.99, 4.6, 3710, 44,
					List.of(new Color("Charcoal", "#3C434D"), new Color("Forest", "#3C6E55"), new Color("Rust", "#B5573A")),
					List.of("Padded compartment fits a 15.6 inch laptop", "USB charging port on the outside", "Water-resistant fabric and strong zips"),
					List.of(new Spec("Capacity", "30 L"), new Spec("Laptop", "Up to 15.6 inch"), new Spec("Weight", "0.9 kg")), "bag travel school commute", 22),
			p(10, "fashion", "sunglasses", "Polarized Sunglasses with UV400 Protection", 19.99, 29.99, 4.1, 1288, 90,
					List.of(new Color("Black", "#1F2227"), new Color("Tortoise", "#8A5A2B")),
					List.of("Polarized lenses cut glare on road and water", "Blocks 100% of UVA and UVB light", "Flexible, lightweight frame"),
					List.of(new Spec("Lens", "Polarized"), new Spec("Protection", "UV400"), new Spec("Frame", "Nylon")), "shades eyewear summer", 70),
			p(11, "home", "lamp", "Dimmable LED Desk Lamp with USB Charging Port", 27.99, 0, 4.5, 2540, 52,
					List.of(new Color("White", "#E9ECEF"), new Color("Black", "#2D3138")),
					List.of("Five brightness levels and three light colours", "Built-in USB port charges your phone", "Flexible neck points light where you need it"),
					List.of(new Spec("Power", "10 W"), new Spec("Colour modes", "3"), new Spec("Cable", "1.5 m")), "light office study reading", 35),
			p(12, "home", "mug", "Insulated Stainless Steel Travel Mug 16 oz", 18.99, 24.99, 4.7, 6120, 140,
					List.of(new Color("Teal", "#2A8A8F"), new Color("Pink", "#D9708F"), new Color("Steel", "#9AA3AD")),
					List.of("Keeps drinks hot for 6 hours or cold for 12", "Leak-resistant lid with a one-hand sip opening", "Fits most car cup holders"),
					List.of(new Spec("Volume", "473 ml"), new Spec("Material", "Stainless steel"), new Spec("Lid", "Leak-resistant")), "coffee tea cup flask", 48),
			p(13, "home", "kettle", "Electric Gooseneck Kettle 1 L", 42, 59, 4.6, 1760, 27,
					List.of(new Color("Matte Black", "#2C3036"), new Color("Cream", "#D9CDB4")),
					List.of("Precise pour spout for tea and coffee", "Set the exact temperature from 40 to 100 C", "Auto shut-off when the water boils"),
					List.of(new Spec("Capacity", "1 L"), new Spec("Power", "1200 W"), new Spec("Cord", "Swivel base")), "kitchen boil water appliance", 14),
			p(14, "home", "pan", "Non-Stick Frying Pan 28 cm", 23.5, 0, 4.3, 3015, 75,
					List.of(new Color("Graphite", "#3B4048"), new Color("Red", "#C2412F")),
					List.of("Durable non-stick coating needs little oil", "Works on gas, electric and induction hobs", "Heat-safe handle stays cool"),
					List.of(new Spec("Diameter", "28 cm"), new Spec("Hobs", "All, incl. induction"), new Spec("Oven safe", "To 180 C")), "kitchen cookware cooking", 66),
			p(15, "books", "book", "The Little Book of Budgeting", 12.99, 0, 4.4, 982, 61,
					List.of(new Color("Blue", "#2F5FA8"), new Color("Green", "#3C8061")),
					List.of("Simple monthly money plans you can start today", "Worksheets for savings goals and debt", "224 pages, paperback"),
					List.of(new Spec("Format", "Paperback"), new Spec("Pages", "224"), new Spec("Language", "English")), "money finance savings guide", 100),
			p(16, "books", "notebook", "Dotted Notebook A5, Hardcover, 2-Pack", 14.99, 0, 4.7, 2640, 110,
					List.of(new Color("Forest", "#31665A"), new Color("Plum", "#7A3E6B"), new Color("Ink", "#2A3552")),
					List.of("Thick 120 gsm paper that resists ink bleed", "Dotted pages for notes, sketches and planning", "Ribbon bookmark and back pocket"),
					List.of(new Spec("Size", "A5"), new Spec("Pages", "192 each"), new Spec("Paper", "120 gsm")), "stationery journal planner diary writing", 20),
			p(17, "books", "book", "Everyday Cooking for Beginners", 16.49, 21.99, 4.5, 1420, 33,
					List.of(new Color("Orange", "#D9792B"), new Color("Teal", "#2A8590")),
					List.of("120 easy recipes with short ingredient lists", "Step-by-step photos for every dish", "Hardcover with a lay-flat spine"),
					List.of(new Spec("Format", "Hardcover"), new Spec("Pages", "288"), new Spec("Recipes", "120")), "cookbook recipes food kitchen", 45),
			p(18, "sports", "ball", "Official Size Soccer Ball", 21.99, 0, 4.5, 1980, 95,
					List.of(new Color("Classic", "#E9ECEF"), new Color("Neon", "#C8E04B")),
					List.of("Size 5 ball for matches and training", "Machine-stitched panels hold their shape", "Air-retaining bladder stays firm longer"),
					List.of(new Spec("Size", "5"), new Spec("Panels", "32"), new Spec("Surface", "Grass and turf")), "football soccer outdoor team", 33),
			p(19, "sports", "dumbbell", "Adjustable Dumbbell Pair, 2 x 10 kg", 64, 85, 4.6, 740, 4,
					List.of(new Color("Black", "#2B2E34"), new Color("Blue", "#2F63B5")),
					List.of("Add or remove plates to train at any level", "Non-slip grip with a secure collar lock", "Includes a pair of 2.5 kg plates"),
					List.of(new Spec("Weight", "2 x 10 kg"), new Spec("Grip", "Knurled steel"), new Spec("Use", "Home gym")), "weights fitness gym strength training", 17),
			p(20, "sports", "bottle", "Leakproof Sports Water Bottle 750 ml", 11.99, 0, 4.6, 8120, 210,
					List.of(new Color("Aqua", "#2FA4C2"), new Color("Lime", "#8DBE3A"), new Color("Grape", "#7C58B8")),
					List.of("Flip lid opens with one hand and locks shut", "BPA-free and easy to clean", "Fits standard bike and car holders"),
					List.of(new Spec("Volume", "750 ml"), new Spec("Material", "BPA-free plastic"), new Spec("Lid", "Flip-top")), "hydration gym cycling drink", 52),
			p(21, "sports", "mat", "Non-Slip Yoga Mat, 6 mm", 22, 32, 4.4, 2310, 58,
					List.of(new Color("Plum", "#7B4B94"), new Color("Ocean", "#2A7DA6"), new Color("Moss", "#5E8F4E")),
					List.of("Textured surface grips in every pose", "6 mm cushioning protects knees and wrists", "Comes with a carry strap"),
					List.of(new Spec("Thickness", "6 mm"), new Spec("Length", "183 cm"), new Spec("Material", "TPE foam")), "yoga pilates exercise fitness", 28),
			p(22, "beauty", "jar", "Daily Moisturizing Face Cream 50 ml", 15.5, 0, 4.3, 1870, 72,
					List.of(new Color("Cream", "#E4D8C2"), new Color("Rose", "#E3A6A6")),
					List.of("Light cream that absorbs in seconds", "Glycerin and vitamin E keep skin soft", "Fragrance-free"),
					List.of(new Spec("Size", "50 ml"), new Spec("Skin type", "All"), new Spec("Scent", "None")), "skincare lotion cream face", 41),
			p(23, "beauty", "perfume", "Eau de Parfum, Citrus and Cedar, 50 ml", 38, 52, 4.2, 530, 3,
					List.of(new Color("Amber", "#C98A32"), new Color("Mist", "#8EB3C7")),
					List.of("Fresh citrus opening with a warm cedar base", "Long-lasting for up to 8 hours", "Refillable glass bottle"),
					List.of(new Spec("Size", "50 ml"), new Spec("Notes", "Citrus, cedar"), new Spec("Type", "Eau de parfum")), "fragrance scent cologne", 9),
			p(24, "beauty", "dropper", "Argan Hair Oil with Dropper, 100 ml", 13.99, 0, 4.4, 990, 85,
					List.of(new Color("Gold", "#C9962E"), new Color("Green", "#5E8F6B")),
					List.of("Smooths frizz and adds shine", "Lightweight, non-greasy feel", "Dropper for easy, exact use"),
					List.of(new Spec("Size", "100 ml"), new Spec("Hair type", "All"), new Spec("Main oil", "Argan")), "haircare serum oil", 60),
			p(25, "toys", "blocks", "Wooden Building Blocks, 100 Pieces", 26.99, 0, 4.7, 3050, 66,
					List.of(new Color("Primary", "#E2573F"), new Color("Pastel", "#6DB5A8")),
					List.of("Smooth, rounded blocks in 8 shapes", "Stored in a tidy cotton bag", "Great for ages 3 and up"),
					List.of(new Spec("Pieces", "100"), new Spec("Age", "3+"), new Spec("Material", "Beech wood")), "kids children educational play", 38),
			p(26, "toys", "robot", "Remote-Control Robot Toy with Lights and Sound", 31.99, 44.99, 4.2, 770, 29,
					List.of(new Color("Silver", "#9BA8B6"), new Color("Red", "#D44A3A")),
					List.of("Walks, turns and dances on command", "Flashing eyes and fun sound effects", "Rechargeable with a USB cable"),
					List.of(new Spec("Age", "5+"), new Spec("Range", "10 m"), new Spec("Battery", "Rechargeable")), "kids children remote control gift", 11),
			p(27, "toys", "box", "Family Board Game Night Set, 4 Games in 1", 19.99, 0, 4.5, 1210, 47,
					List.of(new Color("Blue", "#2F5FA8"), new Color("Red", "#C2412F")),
					List.of("Four classic games in a single box", "For 2 to 6 players, ages 6 and up", "Sturdy boards and pieces"),
					List.of(new Spec("Players", "2 to 6"), new Spec("Age", "6+"), new Spec("Games", "4")), "family party kids games", 80),
			p(28, "grocery", "pouch", "Medium Roast Coffee Beans, 1 kg", 17.99, 22.99, 4.6, 4410, 130,
					List.of(new Color("Brown", "#6B4A32"), new Color("Terracotta", "#B5603B")),
					List.of("Smooth medium roast with notes of cocoa", "Roasted in small batches, sealed for freshness", "Resealable 1 kg bag"),
					List.of(new Spec("Roast", "Medium"), new Spec("Weight", "1 kg"), new Spec("Form", "Whole beans")), "coffee drink breakfast", 15),
			p(29, "grocery", "tea", "Green Tea Bags, 100 Count", 8.99, 0, 4.5, 3320, 175,
					List.of(new Color("Green", "#4F8F54"), new Color("Jade", "#3E8C80")),
					List.of("Light, grassy taste with no bitterness", "100 individually sealed tea bags", "Great hot or iced"),
					List.of(new Spec("Count", "100 bags"), new Spec("Caffeine", "Low"), new Spec("Type", "Green tea")), "drink beverage herbal", 62),
			p(30, "grocery", "bottle", "Extra Virgin Olive Oil 750 ml", 14.49, 0, 4.6, 2290, 88,
					List.of(new Color("Olive", "#6E7C2F"), new Color("Gold", "#B8932F")),
					List.of("Cold-pressed from first-harvest olives", "Fruity flavour for salads and dipping", "Dark glass bottle protects freshness"),
					List.of(new Spec("Volume", "750 ml"), new Spec("Grade", "Extra virgin"), new Spec("Pressing", "Cold")), "cooking oil kitchen pantry", 75),
			p(31, "grocery", "jar", "Mixed Nuts and Dried Fruit Jar 500 g", 9.99, 12.99, 4.4, 1660, 54,
					List.of(new Color("Amber", "#C2832F"), new Color("Berry", "#9A3E5A")),
					List.of("Almonds, cashews, raisins and cranberries", "No added sugar or salt", "Resealable jar"),
					List.of(new Spec("Weight", "500 g"), new Spec("Added sugar", "None"), new Spec("Pack", "Jar")), "snack healthy dried fruit", 26),
			p(32, "grocery", "pouch", "Long Grain Basmati Rice 5 kg", 13.99, 0, 4.7, 2750, 99,
					List.of(new Color("Cream", "#D8C79B"), new Color("Gold", "#C9A23A")),
					List.of("Aged grains cook up long, fluffy and fragrant", "Naturally gluten free", "5 kg family bag"),
					List.of(new Spec("Weight", "5 kg"), new Spec("Grain", "Long"), new Spec("Origin", "Sample")), "staple pantry cooking food", 85));
	}
}
