package com.ergoguard.config;

import com.ergoguard.ws.CoachWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final CoachWebSocketHandler handler;
    public WebSocketConfig(CoachWebSocketHandler handler) { this.handler = handler; }
    @Override public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(handler, "/ws/coach").setAllowedOriginPatterns("*");
    }
}
