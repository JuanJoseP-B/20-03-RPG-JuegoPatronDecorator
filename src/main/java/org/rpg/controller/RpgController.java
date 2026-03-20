package org.rpg.controller;

import org.rpg.service.EquipmentService;
import org.rpg.model.Hero;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

public class RpgController {
    private final EquipmentService equipmentService;

    public RpgController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    public void registerEndpoints(HttpServer server) {
        server.createContext("/api/hero", this::handleGetHero);
        server.createContext("/api/equip", this::handleEquip);
        server.createContext("/api/unequip", this::handleUnequip);
        server.createContext("/api/combat", this::handleCombat);
    }

    private void handleGetHero(HttpExchange exchange) throws IOException {
        setCorsHeaders(exchange);
        if (isOptionsRequest(exchange)) return;

        Hero hero = equipmentService.buildEquippedHero();
        String json = String.format(
                "{\"description\":\"%s\", \"hp\":%d, \"attack\":%d, \"defense\":%d, \"speed\":%d, \"items\":%s}",
                hero.getDescription(), hero.getHp(), hero.getAttack(), hero.getDefense(), hero.getSpeed(),
                listToJsonArray(equipmentService.getActiveEquipment())
        );
        sendJsonResponse(exchange, json);
    }

    private void handleEquip(HttpExchange exchange) throws IOException {
        setCorsHeaders(exchange);
        if (isOptionsRequest(exchange)) return;

        String item = exchange.getRequestURI().getQuery().split("=")[1];
        equipmentService.equip(item);
        sendJsonResponse(exchange, "{\"status\":\"equipped\"}");
    }

    private void handleUnequip(HttpExchange exchange) throws IOException {
        setCorsHeaders(exchange);
        if (isOptionsRequest(exchange)) return;

        String item = exchange.getRequestURI().getQuery().split("=")[1];
        equipmentService.unequip(item);
        sendJsonResponse(exchange, "{\"status\":\"unequipped\"}");
    }

    private void handleCombat(HttpExchange exchange) throws IOException {
        setCorsHeaders(exchange);
        if (isOptionsRequest(exchange)) return;

        String log = equipmentService.simulateCombat();
        sendJsonResponse(exchange, "{\"log\":\"" + log + "\"}");
    }

    private boolean isOptionsRequest(HttpExchange exchange) throws IOException {
        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return true;
        }
        return false;
    }

    private void setCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    }

    private void sendJsonResponse(HttpExchange exchange, String json) throws IOException {
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        byte[] bytes = json.getBytes("UTF-8");
        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private String listToJsonArray(List<String> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            sb.append("\"").append(list.get(i)).append("\"");
            if (i < list.size() - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }
}