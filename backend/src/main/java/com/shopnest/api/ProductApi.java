package com.shopnest.api;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.shopnest.config.AppProperties;
import com.shopnest.model.Product;
import com.shopnest.model.Records.Session;
import com.shopnest.repo.Repos;

/**
 * Products the owner deletes. Every visitor's store asks GET /api/products/deleted and hides those
 * products, so a delete made by the owner shows up for everyone.
 * Deleting and restoring need the owner's token from POST /api/owner/login.
 */
@RestController
@RequestMapping("/api")
public class ProductApi {
	private static final Logger log = LoggerFactory.getLogger(ProductApi.class);
	private static final SecureRandom RANDOM = new SecureRandom();

	private final AppProperties props;
	private final Repos.Products products;
	private final Repos.Sessions sessions;
	private final Repos.CartLines cartLines;
	private final Repos.WishItems wishItems;
	private final String ownerPassword;

	public ProductApi(AppProperties props, Repos.Products products, Repos.Sessions sessions, Repos.CartLines cartLines,
			Repos.WishItems wishItems) {
		this.props = props;
		this.products = products;
		this.sessions = sessions;
		this.cartLines = cartLines;
		this.wishItems = wishItems;
		if (props.ownerPassword().isEmpty()) {
			ownerPassword = randomText(9);
			log.warn("No app.owner-password set. Owner password for this run: {}", ownerPassword);
		} else ownerPassword = props.ownerPassword();
	}

	public record Login(String email, String password) {
	}

	/** The owner types their email and the server's owner password once on the Sell page. */
	@PostMapping("/owner/login")
	public Map<String, String> login(@RequestBody Login body) {
		String email = body.email() == null ? "" : body.email().trim().toLowerCase();
		if (!props.isOwnerEmail(email) || !sameText(body.password(), ownerPassword))
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong owner email or password.");
		Session s = new Session();
		s.token = randomText(32);
		s.userId = email;
		sessions.save(s);
		return Map.of("token", s.token);
	}

	/** IDs of deleted products, for every visitor */
	@GetMapping("/products/deleted")
	public List<Long> deleted() {
		return products.findByDeletedTrueOrderByIdAsc().stream().map(p -> p.id).toList();
	}

	@DeleteMapping("/products/{id}")
	@Transactional
	public List<Long> delete(@PathVariable long id, @RequestHeader(name = "Authorization", required = false) String auth) {
		requireOwner(auth);
		Product p = products.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No product " + id));
		p.deleted = true;
		products.save(p);
		cartLines.deleteByProductId(id);
		wishItems.deleteByProductId(id);
		return deleted();
	}

	/** "Restore all" on the Sell page */
	@PostMapping("/products/restore")
	@Transactional
	public List<Long> restoreAll(@RequestHeader(name = "Authorization", required = false) String auth) {
		requireOwner(auth);
		List<Product> gone = products.findByDeletedTrueOrderByIdAsc();
		gone.forEach(p -> p.deleted = false);
		products.saveAll(gone);
		return List.of();
	}

	private void requireOwner(String auth) {
		String token = auth != null && auth.startsWith("Bearer ") ? auth.substring(7) : "";
		boolean ok = !token.isEmpty() && sessions.findById(token).map(s -> props.isOwnerEmail(s.userId)).orElse(false);
		if (!ok) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Connect to the shop server as the owner first.");
	}

	private static String randomText(int bytes) {
		byte[] b = new byte[bytes];
		RANDOM.nextBytes(b);
		return HexFormat.of().formatHex(b);
	}

	/** compares in constant time, so the password can't be guessed from how long a check takes */
	private static boolean sameText(String a, String b) {
		return a != null && MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
	}
}
