package org.rpg.decorator.weapon;

import org.rpg.decorator.HeroDecorator;
import org.rpg.model.Hero;

public class Axe extends HeroDecorator {
    public Axe(Hero hero) { super(hero); }

    @Override
    public String getDescription() { return super.getDescription() + " | Hacha Pesada"; }

    @Override
    public int getAttack() { return super.getAttack() + 25; }

    @Override
    public int getSpeed() { return super.getSpeed() - 5; }
}