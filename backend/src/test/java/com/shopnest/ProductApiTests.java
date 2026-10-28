package com.shopnest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.server.ResponseStatusException;

import com.shopnest.api.ProductApi;
import com.shopnest.api.ProductApi.Login;

@SpringBootTest
class ProductApiTests {
	@Autowired
	ProductApi api;

	@Test
	void ownerDeleteIsSeenByEveryoneAndCanBeRestored() {
		String bearer = "Bearer " + api.login(new Login("AmanEcdy@gmail.com ", "test-owner-pass")).get("token");
		api.delete(3, bearer);
		api.delete(7, bearer);
		assertEquals(List.of(3L, 7L), api.deleted());
		api.restoreAll(bearer);
		assertEquals(List.of(), api.deleted());
	}

	@Test
	void othersCannotDelete() {
		assertThrows(ResponseStatusException.class, () -> api.login(new Login("amanecdy@gmail.com", "wrong")));
		assertThrows(ResponseStatusException.class, () -> api.login(new Login("someone@gmail.com", "test-owner-pass")));
		assertThrows(ResponseStatusException.class, () -> api.delete(3, null));
		assertThrows(ResponseStatusException.class, () -> api.delete(3, "Bearer made-up"));
		assertEquals(List.of(), api.deleted());
	}
}
