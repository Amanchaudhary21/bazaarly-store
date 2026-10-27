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
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

/** The smaller tables: sign-in sessions, one-time codes, cart lines, wish list, orders and reviews. */
public final class Records {
	private Records() {
	}

	/** A signed-in browser. The token is sent as "Authorization: Bearer <token>". */
	@Entity
	public static class Session {
		@Id
		public String token;
		public String userId;
		public Instant created = Instant.now();
	}

	/**
	 * A 6-digit code (sign in, reset password, confirm a new email) or a "ticket"
	 * (code already checked, now waiting for the new shopper's name).
	 */
	@Entity
	@Table(indexes = @Index(columnList = "target"))
	public static class Otp {
		@Id
		@GeneratedValue
		public Long id;
		/** what the code is for, like "signin:email:a@b.com" or "email-change:<user id>:a@b.com" */
		public String target;
		public String code;
		public Instant expires;
		public int tries;
	}

	@Entity
	@Table(indexes = @Index(columnList = "userId"))
	public static class CartLine {
		@Id
		@GeneratedValue
		public Long id;
		public String userId;
		public long productId;
		/** colour index */
		public int v;
		public int q;
	}

	@Entity
	@Table(indexes = @Index(columnList = "userId"))
	public static class WishItem {
		@Id
		@GeneratedValue
		public Long id;
		public String userId;
		public long productId;
		public Instant added = Instant.now();
	}

	@Entity
	@Table(name = "shop_order", indexes = @Index(columnList = "userId"))
	public static class Order {
		@Id
		public String id;
		public String userId;
		public Instant date = Instant.now();
		public double sub, off, ship, total;
		public String coupon = "";
		public String speed;
		public String eta;
		public String toName;
		public String toPlace;

		@ElementCollection(fetch = FetchType.EAGER)
		@CollectionTable(name = "order_item", joinColumns = @JoinColumn(name = "order_id"))
		@OrderColumn(name = "pos")
		public List<Item> items = new ArrayList<>();

		/** the title is kept so the order still reads right if the product is deleted later */
		@Embeddable
		public record Item(long productId, int v, int q, double price, String title) {
		}
	}

	@Entity
	@Table(indexes = @Index(columnList = "productId"))
	public static class Review {
		@Id
		@GeneratedValue
		public Long id;
		public long productId;
		public String userId;
		public String author;
		public int stars;
		@Column(length = 500)
		public String text;
		public Instant date = Instant.now();
	}
}
