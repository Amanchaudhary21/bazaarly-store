package com.shopnest.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;

/**
 * A product in the shop. The 32 sample products are added by CatalogSeed; the owner can add more
 * ("mine" = added on the Sell page, with a photo) and delete any of them ("deleted" hides it from everyone).
 */
@Entity
public class Product {
	@Id
	public Long id;
	public String cat;
	/** which drawing to show (headphones, phone, ...) when there is no photo */
	public String art;
	public String title;
	public double price;
	/** old price, 0 = not on sale */
	public double was;
	public double rating;
	/** number of (sample) ratings */
	public int n;
	public int stock;
	/** extra search words */
	public String kw = "";
	/** how many days ago it was added (for "New" and "Newest arrivals") */
	public int age;
	@Column(columnDefinition = "TEXT")
	public String photo;
	public boolean mine;
	public boolean deleted;
	public Instant created = Instant.now();

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "product_color", joinColumns = @JoinColumn(name = "product_id"))
	@OrderColumn(name = "pos")
	public List<Color> colors = new ArrayList<>();

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "product_bullet", joinColumns = @JoinColumn(name = "product_id"))
	@OrderColumn(name = "pos")
	@Column(name = "text", length = 600)
	public List<String> bullets = new ArrayList<>();

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "product_spec", joinColumns = @JoinColumn(name = "product_id"))
	@OrderColumn(name = "pos")
	public List<Spec> specs = new ArrayList<>();

	@Embeddable
	public record Color(String name, String hex) {
	}

	@Embeddable
	public record Spec(@Column(name = "label") String k, @Column(name = "val") String v) {
	}
}
