package com.shopnest.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Settings from application.properties (or environment variables on the server).
 *
 * @param ownerEmails    accounts that can add, delete and restore products
 * @param ownerPassword  password for the owner account (OWNER_PASSWORD); if empty, one is made up and printed at start-up
 * @param corsOrigins    web addresses allowed to call the API (the GitHub Pages site, the Vite dev server)
 * @param googleClientId Google sign-in client ID (optional)
 * @param demoCodes      show sign-in codes on screen, because this demo sends no real texts or emails
 */
@ConfigurationProperties("app")
public record AppProperties(List<String> ownerEmails, String ownerPassword, List<String> corsOrigins,
		String googleClientId, boolean demoCodes) {

	public AppProperties {
		ownerEmails = ownerEmails == null ? List.of() : ownerEmails.stream().map(s -> s.trim().toLowerCase()).toList();
		corsOrigins = corsOrigins == null ? List.of() : corsOrigins;
		ownerPassword = ownerPassword == null ? "" : ownerPassword;
		googleClientId = googleClientId == null ? "" : googleClientId;
	}

	public boolean isOwnerEmail(String email) {
		return email != null && ownerEmails.contains(email.toLowerCase());
	}
}
