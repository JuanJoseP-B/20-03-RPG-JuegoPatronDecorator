package org.rpg.decorator.buff;

import org.rpg.decorator.HeroDecorator;
import org.rpg.model.Hero;

public class SwiftnessAura extends HeroDecorator {
    public SwiftnessAura(Hero hero) { super(hero); }

    @Override
    public String getDescription() { return super.getDescription() + " | Buff: Rapidez"; }

    @Override
    public int getSpeed() { return super.getSpeed() + 20; }
}