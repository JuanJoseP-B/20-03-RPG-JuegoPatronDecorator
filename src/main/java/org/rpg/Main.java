package org.rpg;

import org.rpg.controller.RpgController;
import org.rpg.service.EquipmentService;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;

public class Main {
    public static void main(String[] args) {
        try {
            EquipmentService equipmentService = new EquipmentService();
            RpgController controller = new RpgController(equipmentService);

            HttpServer server = HttpServer.create(new InetSocketAddress(8081), 0);

            controller.registerEndpoints(server);

            server.setExecutor(null);
            server.start();
            System.out.println("Servidor Backend RPG iniciado correctamente en http://localhost:8080");

        } catch (IOException e) {
            System.err.println("Error al iniciar el servidor: " + e.getMessage());
        }
    }
}