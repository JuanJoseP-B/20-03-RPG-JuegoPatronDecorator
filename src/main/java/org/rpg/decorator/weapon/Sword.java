package org.rpg.decorator.weapon;

import org.rpg.decorator.HeroDecorator;
import org.rpg.model.Hero;

public class Sword extends HeroDecorator {
    public Sword(Hero hero) { super(hero); }

    @Override
    public String getDescription() { return super.getDescription() + " | Espada de Hierro"; }

    @Override
    public int getAttack() { return super.getAttack() + 15; }
}