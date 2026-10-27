package com.shopnest.shop;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Store settings: departments, coupons, delivery prices and the home page banners. */
public final class Shop {
	private Shop() {
	}

	public static final String BRAND = "ShopNest";
	public static final double FREE_SHIP_MIN = 35, SHIP_STD = 4.99, SHIP_EXP = 12.99;
	public static final int MAX_QTY = 10;

	public record Category(String id, String name, String blurb) {
	}

	public static final List<Category> CATEGORIES = List.of(
			new Category("electronics", "Electronics", "Audio, phones and computers"),
			new Category("fashion", "Fashion", "Shoes, tees and bags"),
			new Category("home", "Home & Kitchen", "Lighting and cookware"),
			new Category("books", "Books & Stationery", "Read, plan and write"),
			new Category("sports", "Sports & Outdoors", "Training and travel gear"),
			new Category("beauty", "Beauty & Care", "Skin, hair and scent"),
			new Category("toys", "Toys & Games", "Play for every age"),
			new Category("grocery", "Grocery & Pantry", "Staples and treats"));

	public record Coupon(String kind, double value, String label) {
	}

	public static final Map<String, Coupon> COUPONS = Map.of(
			"WELCOME10", new Coupon("pct", 10, "10% off your items"),
			"FREESHIP", new Coupon("ship", 0, "Free standard delivery"));

	/** art = [product id, colour index] for the drawing on the banner */
	public record Hero(String id, String h, String t, String cta, String to, List<Integer> art, String bg, String ink) {
	}

	public static final List<Hero> HERO = List.of(
			new Hero("audio", "Sound that goes where you go", "Headphones and speakers, with deals on the most loved models.",
					"Shop audio", "/c/electronics", List.of(1, 0), "var(--brand-2)", "var(--on-brand)"),
			new Hero("pantry", "Fill the pantry, skip the delivery fee",
					"Free delivery on every order over $35. Stock up on coffee, tea, oil and rice.", "Shop grocery",
					"/c/grocery", List.of(28, 0), "var(--tag)", "var(--on-tag)"),
			new Hero("move", "Move more this season", "Mats, weights, balls and bottles to get you started.",
					"Shop sports", "/c/sports", List.of(21, 1), "var(--accent)", "var(--on-accent)"));

	public static boolean isCategory(String id) {
		return CATEGORIES.stream().anyMatch(c -> c.id().equals(id));
	}

	public static double round2(double n) {
		return Math.round(n * 100) / 100.0;
	}

	private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("EEE, MMM d", Locale.ENGLISH);

	/** "Thu, Oct 30 to Sat, Nov 1" */
	public static String deliveryRange(boolean express) {
		LocalDate now = LocalDate.now();
		return express ? DAY.format(now.plusDays(1)) + " to " + DAY.format(now.plusDays(2))
				: DAY.format(now.plusDays(3)) + " to " + DAY.format(now.plusDays(5));
	}
}
