package com.ergoguard.dto;

import java.util.List;

public record CoachMessage(String type, List<Point> landmarks, Integer imageWidth, Integer imageHeight) {
    public record Point(int index, double x, double y, double visibility) {}
}
