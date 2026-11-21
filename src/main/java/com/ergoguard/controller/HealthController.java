package com.ergoguard.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
public class HealthController {
    @GetMapping("/api/health")
    public Map<String,String> health() { return Map.of("application","ErgoGuard AI","status","UP","version","1.0.0"); }
}
