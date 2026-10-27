package com.shopnest.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.shopnest.model.Product;
import com.shopnest.model.Records.CartLine;
import com.shopnest.model.Records.Order;
import com.shopnest.model.Records.Otp;
import com.shopnest.model.Records.Review;
import com.shopnest.model.Records.Session;
import com.shopnest.model.Records.WishItem;
import com.shopnest.model.User;

/** Database access, one repository per table. Spring writes the code from the method names. */
public final class Repos {
	private Repos() {
	}

	public interface Products extends JpaRepository<Product, Long> {
		List<Product> findByDeletedFalseOrderByIdAsc();

		List<Product> findByDeletedTrueOrderByIdAsc();

		@Query("select coalesce(max(p.id), 0) from Product p")
		long maxId();
	}

	public interface Users extends JpaRepository<User, String> {
		Optional<User> findByEmail(String email);

		Optional<User> findByPhone(String phone);

		Optional<User> findByGoogle(String google);

		@Query("select u from User u join u.social s where key(s) = ?1 and s = ?2")
		Optional<User> findBySocial(String network, String email);
	}

	public interface Sessions extends JpaRepository<Session, String> {
		@Transactional
		void deleteByUserId(String userId);
	}

	public interface Otps extends JpaRepository<Otp, Long> {
		Optional<Otp> findFirstByTargetOrderByIdDesc(String target);

		@Transactional
		void deleteByTarget(String target);
	}

	public interface CartLines extends JpaRepository<CartLine, Long> {
		List<CartLine> findByUserIdOrderByIdAsc(String userId);

		@Transactional
		void deleteByUserId(String userId);

		@Transactional
		void deleteByProductId(long productId);
	}

	public interface WishItems extends JpaRepository<WishItem, Long> {
		List<WishItem> findByUserIdOrderByIdAsc(String userId);

		@Transactional
		void deleteByUserId(String userId);

		@Transactional
		void deleteByProductId(long productId);
	}

	public interface Orders extends JpaRepository<Order, String> {
		List<Order> findByUserIdOrderByDateDesc(String userId);

		@Transactional
		void deleteByUserId(String userId);
	}

	public interface Reviews extends JpaRepository<Review, Long> {
		List<Review> findByProductIdOrderByDateDesc(long productId);
	}
}
