package org.rpg.service;

import org.rpg.model.Hero;
import org.rpg.model.BaseHero;
import org.rpg.decorator.weapon.*;
import org.rpg.decorator.armor.*;
import org.rpg.decorator.buff.*;
import org.rpg.decorator.power.*;

import java.util.ArrayList;
import java.util.List;

public class EquipmentService {
    private final List<String> activeEquipment = new ArrayList<>();

    public void equip(String item) {
        if (!activeEquipment.contains(item)) {
            activeEquipment.add(item);
        }
    }

    public void unequip(String item) {
        activeEquipment.remove(item);
    }

    public List<String> getActiveEquipment() {
        return activeEquipment;
    }

    public Hero buildEquippedHero() {
        Hero hero = new BaseHero();
        for (String item : activeEquipment) {
            switch (item) {
                case "sword": hero = new Sword(hero); break;
                case "axe": hero = new Axe(hero); break;
                case "leather": hero = new LeatherArmor(hero); break;
                case "plate": hero = new PlateArmor(hero); break;
                case "str_potion": hero = new StrengthPotion(hero); break;
                case "spd_aura": hero = new SwiftnessAura(hero); break;
                case "dragon": hero = new DragonBlood(hero); break;
            }
        }
        return hero;
    }

    public String simulateCombat() {
        Hero hero = buildEquippedHero();
        int enemyHp = 150;
        int enemyDef = 10;

        int dmgDealt = Math.max(0, hero.getAttack() - enemyDef);
        boolean win = dmgDealt > 0 && (enemyHp / dmgDealt) < 5;

        return String.format("Atacas a un Orco. Tu ataque: %d. Defensa Orco: %d. Daño: %d. %s",
                hero.getAttack(), enemyDef, dmgDealt, win ? "¡Victoria!" : "El orco resiste y te derrota.");
    }
}