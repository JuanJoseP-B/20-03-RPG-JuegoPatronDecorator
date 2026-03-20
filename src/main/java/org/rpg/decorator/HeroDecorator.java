package org.rpg.decorator;

import org.rpg.model.Hero;

public abstract class HeroDecorator implements Hero {
    protected Hero hero;

    public HeroDecorator(Hero hero) {
        this.hero = hero;
    }

    @Override
    public String getDescription() { return hero.getDescription(); }

    @Override
    public int getHp() { return hero.getHp(); }

    @Override
    public int getAttack() { return hero.getAttack(); }

    @Override
    public int getDefense() { return hero.getDefense(); }

    @Override
    public int getSpeed() { return hero.getSpeed(); }
}