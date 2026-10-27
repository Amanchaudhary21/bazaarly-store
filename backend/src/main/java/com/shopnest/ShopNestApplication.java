package com.shopnest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/** ShopNest: the online store's Java backend. Start it with start.bat or ./mvnw spring-boot:run */
@SpringBootApplication
@ConfigurationPropertiesScan
@EnableJpaRepositories(considerNestedRepositories = true)
public class ShopNestApplication {
	public static void main(String[] args) {
		SpringApplication.run(ShopNestApplication.class, args);
	}
}
