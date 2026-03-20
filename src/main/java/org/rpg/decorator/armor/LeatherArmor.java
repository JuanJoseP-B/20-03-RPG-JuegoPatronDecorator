package org.rpg.decorator.armor;

import org.rpg.decorator.HeroDecorator;
import org.rpg.model.Hero;

public class LeatherArmor extends HeroDecorator {
    public LeatherArmor(Hero hero) { super(hero); }

    @Override
    public String getDescription() { return super.getDescription() + " | Armadura de Cuero"; }

    @Override
    public int getDefense() { return super.getDefense() + 10; }

    @Override
    public int getHp() { return super.getHp() + 20; }
}