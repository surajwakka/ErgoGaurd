package com.ergoguard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ErgoGuardApplication {
    public static void main(String[] args) {
        nu.pattern.OpenCV.loadLocally();
        SpringApplication.run(ErgoGuardApplication.class, args);
    }
}
