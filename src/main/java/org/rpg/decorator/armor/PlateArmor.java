package org.rpg.decorator.armor;

import org.rpg.decorator.HeroDecorator;
import org.rpg.model.Hero;

public class PlateArmor extends HeroDecorator {
    public PlateArmor(Hero hero) { super(hero); }

    @Override
    public String getDescription() { return super.getDescription() + " | Armadura de Placas"; }

    @Override
    public int getDefense() { return super.getDefense() + 25; }

    @Override
    public int getSpeed() { return super.getSpeed() - 10; }
}