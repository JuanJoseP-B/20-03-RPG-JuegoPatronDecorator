package org.rpg.decorator.power;

import org.rpg.decorator.HeroDecorator;
import org.rpg.model.Hero;

public class DragonBlood extends HeroDecorator {
    public DragonBlood(Hero hero) { super(hero); }

    @Override
    public String getDescription() { return super.getDescription() + " | PODER: Sangre de Dragón"; }

    @Override
    public int getHp() { return super.getHp() + 100; }

    @Override
    public int getAttack() { return super.getAttack() + 30; }

    @Override
    public int getDefense() { return super.getDefense() + 15; }
}