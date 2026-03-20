package org.rpg.decorator.buff;

import org.rpg.decorator.HeroDecorator;
import org.rpg.model.Hero;

public class StrengthPotion extends HeroDecorator {
    public StrengthPotion(Hero hero) { super(hero); }

    @Override
    public String getDescription() { return super.getDescription() + " | Buff: Fuerza"; }

    @Override
    public int getAttack() { return (int)(super.getAttack() * 1.5); }
}