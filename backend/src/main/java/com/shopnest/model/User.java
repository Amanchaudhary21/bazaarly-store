package com.shopnest.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

/**
 * A shopper's account. Phone accounts get the ID "last 6 digits + first name" (like 810521aman),
 * other accounts a random one; every ID is unique.
 */
@Entity
@Table(name = "app_user")
public class User {
	@Id
	public String id;
	public String first;
	public String last = "";
	@Column(unique = true)
	public String email;
	@Column(unique = true)
	public String phone;
	/** BCrypt hash; null = signs in without a password */
	public String passHash;
	public Instant passSet;
	public Instant emailSet;
	/** Google account ID (the "sub" in Google's token) */
	@Column(unique = true)
	public String google;
	@Column(length = 1000)
	public String picture;
	public Instant created = Instant.now();

	/** demo social sign-ins: network (facebook, tiktok, ...) -> email */
	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "user_social", joinColumns = @JoinColumn(name = "user_id"))
	@MapKeyColumn(name = "network")
	@Column(name = "email")
	public Map<String, String> social = new HashMap<>();

	/** the last 5 sign-ins, newest first */
	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "user_login", joinColumns = @JoinColumn(name = "user_id"))
	@OrderColumn(name = "pos")
	public List<Login> logins = new ArrayList<>();

	@Embeddable
	public record Login(Instant at, String via) {
	}

	public void addLogin(String via) {
		logins.add(0, new Login(Instant.now(), via));
		while (logins.size() > 5) logins.remove(logins.size() - 1);
	}
}
