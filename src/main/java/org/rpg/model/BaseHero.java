package org.rpg.model;

public class BaseHero implements Hero {
    @Override
    public String getDescription() { return "Héroe Novato"; }

    @Override
    public int getHp() { return 100; }

    @Override
    public int getAttack() { return 10; }

    @Override
    public int getDefense() { return 5; }

    @Override
    public int getSpeed() { return 10; }
}