package com.ergoguard.service;

import com.ergoguard.dto.CoachMessage;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PostureAnalyzer {
    public Map<String, Object> analyze(CoachMessage input) {
        Map<Integer, CoachMessage.Point> p = input.landmarks() == null ? Map.of() :
            input.landmarks().stream().filter(v -> v.visibility() >= .45)
                .collect(Collectors.toMap(CoachMessage.Point::index, Function.identity(), (a,b) -> a));
        CoachMessage.Point left = p.get(11), right = p.get(12);
        CoachMessage.Point nose = p.get(0);
        if (left == null || right == null) return Map.of("status","CALIBRATING","message","Move into view so both shoulders are visible.");
        double tilt = Math.toDegrees(Math.atan2(right.y()-left.y(), right.x()-left.x()));
        double shoulderMidY = (left.y()+right.y())/2.0;
        double shoulderSpan = Math.abs(right.x()-left.x());
        boolean slouch = nose != null && (nose.y() - shoulderMidY) < -0.02; // face/shoulder geometry sanity signal
        boolean tilted = Math.abs(tilt) > 8.0;
        String status = tilted ? "WARNING" : "GOOD";
        String message = tilted ? "Your shoulders look uneven. Relax and level your shoulders." :
            "Posture looks balanced. Keep your shoulders relaxed.";
        // Normalized shoulder width is a rough proximity proxy, not a calibrated physical distance.
        boolean tooClose = shoulderSpan > .62;
        if (tooClose) { status = "WARNING"; message = "You may be too close to the screen. Move back to a comfortable distance."; }
        Map<String,Object> result = new LinkedHashMap<>();
        result.put("status", status); result.put("message", message);
        result.put("shoulderTiltDegrees", Math.round(tilt * 10.0) / 10.0);
        result.put("shoulderSpan", Math.round(shoulderSpan * 100.0) / 100.0);
        result.put("screenTooClose", tooClose);
        result.put("slouchSignal", slouch);
        result.put("score", Math.max(0, 100 - (int)(Math.abs(tilt)*3) - (tooClose ? 25 : 0)));
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }
}
