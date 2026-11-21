package com.ergoguard.ws;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ergoguard.dto.CoachMessage;
import com.ergoguard.service.PostureAnalyzer;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.util.Map;

@Component
public class CoachWebSocketHandler extends TextWebSocketHandler {
    private final ObjectMapper mapper;
    private final PostureAnalyzer analyzer;
    public CoachWebSocketHandler(ObjectMapper mapper, PostureAnalyzer analyzer) {
        this.mapper = mapper; this.analyzer = analyzer;
    }
    @Override protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            CoachMessage request = mapper.readValue(message.getPayload(), CoachMessage.class);
            Map<String,Object> response = analyzer.analyze(request);
            session.sendMessage(new TextMessage(mapper.writeValueAsString(response)));
        } catch (Exception ex) {
            session.sendMessage(new TextMessage("{\"status\":\"ERROR\",\"message\":\"Unable to analyze this frame. Please reposition your camera.\"}"));
        }
    }
}
