function calcBaseDamageinX() { baseDamage = calcOurDmg("avg", !1, !0), baseBlock = game.global.soldierCurrentBlock, baseHealth = game.global.soldierHealthMax }
function calcBaseDamageinX2() { baseDamage = calcOurDmg("avg", !1, !0), baseBlock = calcOurBlock(), baseHealth = calcOurHealth() }

function autoStanceNew() {
    if (game.global.gridArray.length === 0) return;
    if (game.global.soldierHealth <= 0) return;
    if (!game.upgrades.Formations.done) return;

    if (game.global.formation == 2 && game.global.soldierHealth <= game.global.soldierHealthMax * 0.25) {
        setFormation('0');
    }
    else if (game.global.formation == 0 && game.global.soldierHealth <= game.global.soldierHealthMax * 0.25) {
        setFormation('1')
    }
    else if (game.global.formation == 1 && game.global.soldierHealth == game.global.soldierHealthMax) {
        setFormation('2');
    }
}

function autoStance() {
    calcBaseDamageinX2();
    if (game.global.gridArray.length === 0) return true;
    if (game.global.soldierHealth <= 0) return;
    if (!getPageSetting('AutoStance')) return true;
    if (!game.upgrades.Formations.done) return true;

    var missingHealth = game.global.soldierHealthMax - game.global.soldierHealth;
    var newSquadRdy = game.resources.trimps.realMax() <= game.resources.trimps.owned + 1;
    var dHealth = baseHealth / 2;
    var xHealth = baseHealth;
    var bHealth = baseHealth / 2;
    var corrupt = game.global.world >= mutations.Corruption.start();
    var enemy = getCurrentEnemy();
    if (typeof enemy === 'undefined') return true;
    var enemyHealth = enemy.health;
    var enemyDamage = calcBadGuyDmg(enemy, null, true, true);
    var critMulti = 1;
    const ignoreCrits = getPageSetting('IgnoreCrits');
    var isCrushed = false;
    var isCritVoidMap = false;
    var isCritDaily = false;
    if (ignoreCrits != 2) {
        (isCrushed = (game.global.challengeActive == "Crushed") && game.global.soldierHealth > game.global.soldierCurrentBlock)
            && (critMulti *= 5);
        (isCritVoidMap = (!ignoreCrits && game.global.voidBuff == 'getCrit') || (enemy.corrupted == 'corruptCrit') || (enemy.corrupted == 'healthyCrit'))
            && (critMulti *= (enemy.corrupted == 'healthyCrit' ? 7 : 5));
        (isCritDaily = (game.global.challengeActive == "Daily") && (typeof game.global.dailyChallenge.crits !== 'undefined'))
            && (critMulti *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength));
        enemyDamage *= critMulti;
    }
    var isDoubleAttack = game.global.voidBuff == 'doubleAttack' || (enemy.corrupted == 'corruptDbl') || enemy.corrupted == 'healthyDbl';
    var enemyFast = (game.global.challengeActive == "Slow" || ((game.badGuys[enemy.name].fast || enemy.mutation == "Corruption") && game.global.challengeActive != "Coordinate" && game.global.challengeActive != "Nom")) || isDoubleAttack;
    if (enemy.corrupted == 'corruptStrong')
        enemyDamage *= 2;
    if (enemy.corrupted == 'corruptTough')
        enemyHealth *= 5;
    if (enemy.corrupted == 'healthyStrong')
        enemyDamage *= 2.5;
    if (enemy.corrupted == 'healthyTough')
        enemyHealth *= 7.5;

    var xDamage = (enemyDamage - baseBlock);
    var dDamage = (enemyDamage - baseBlock / 2);
    var bDamage = (enemyDamage - baseBlock * 4);
    var dDamageNoCrit = (enemyDamage / critMulti - baseBlock / 2);
    var xDamageNoCrit = (enemyDamage / critMulti - baseBlock);
    var pierce = 0;
    if (game.global.brokenPlanet && !game.global.mapsActive) {
        pierce = getPierceAmt();
        var atkPierce = pierce * enemyDamage;
        var atkPierceNoCrit = pierce * (enemyDamage / critMulti);
        if (xDamage < atkPierce) xDamage = atkPierce;
        if (dDamage < atkPierce) dDamage = atkPierce;
        if (bDamage < atkPierce) bDamage = atkPierce;
        if (dDamageNoCrit < atkPierceNoCrit) dDamageNoCrit = atkPierceNoCrit;
        if (xDamageNoCrit < atkPierceNoCrit) xDamageNoCrit = atkPierceNoCrit;
    }
    if (xDamage < 0) xDamage = 0;
    if (dDamage < 0) dDamage = 0;
    if (bDamage < 0) bDamage = 0;
    if (dDamageNoCrit < 0) dDamageNoCrit = 0;
    if (xDamageNoCrit < 0) xDamageNoCrit = 0;
    var isdba = isDoubleAttack ? 2 : 1;
    xDamage *= isdba;
    dDamage *= isdba;
    bDamage *= isdba;
    dDamageNoCrit *= isdba;
    xDamageNoCrit *= isdba;

    var drainChallenge = game.global.challengeActive == 'Nom' || game.global.challengeActive == "Toxicity";
    var dailyPlague = game.global.challengeActive == 'Daily' && (typeof game.global.dailyChallenge.plague !== 'undefined');
    var dailyBogged = game.global.challengeActive == 'Daily' && (typeof game.global.dailyChallenge.bogged !== 'undefined');
    var leadChallenge = game.global.challengeActive == 'Lead';
    if (drainChallenge) {
        var hplost = 0.20;
        dDamage += dHealth * hplost;
        xDamage += xHealth * hplost;
        bDamage += bHealth * hplost;
    } else if (dailyPlague) {
        drainChallenge = true;
        var hplost = dailyModifiers.plague.getMult(game.global.dailyChallenge.plague.strength, 1 + game.global.dailyChallenge.plague.stacks);
        dDamage += dHealth * hplost;
        xDamage += xHealth * hplost;
        bDamage += bHealth * hplost;
    } else if (dailyBogged) {
        drainChallenge = true;
        var hplost = dailyModifiers.bogged.getMult(game.global.dailyChallenge.bogged.strength);
        dDamage += dHealth * hplost;
        xDamage += xHealth * hplost;
        bDamage += bHealth * hplost;
    } else if (leadChallenge) {
        var leadDamage = game.challenges.Lead.stacks * 0.0003;
        var added = game.global.soldierHealthMax * leadDamage;
        dDamage += added;
        xDamage += added;
        bDamage += added;
    }
    if (game.global.voidBuff == "bleed" || (enemy.corrupted == 'corruptBleed') || enemy.corrupted == 'healthyBleed') {
        var added = game.global.soldierHealth * (enemy.corrupted == 'healthyBleed' ? 0.30 : 0.20);
        dDamage += added;
        xDamage += added;
        bDamage += added;
    }
    var xExplosionOK = true;
    var dExplosionOK = true;
    if (typeof game.global.dailyChallenge['explosive'] !== 'undefined') {
        var explosionDmg = 0;
        var explosiveDamage = 1 + game.global.dailyChallenge['explosive'].strength;
        var playerDCritDmg = calcOurDmg("max", false, true) * 4;
        var playerXCritDmg = calcOurDmg("max", false, true);
        explosionDmg = calcBadGuyDmg(enemy, null, true, true) * explosiveDamage;
        xExplosionOK = ((xHealth - missingHealth > explosionDmg) || (enemyHealth > playerXCritDmg));
        dExplosionOK = (newSquadRdy || (dHealth - missingHealth > explosionDmg) || (enemyHealth > playerDCritDmg));
    }
    var oneshotFast = enemyFast ? enemyHealth <= baseDamage : false;
    var surviveD = ((newSquadRdy && dHealth > dDamage) || (dHealth - missingHealth > dDamage));
    var surviveX = ((newSquadRdy && xHealth > xDamage) || (xHealth - missingHealth > xDamage));
    var surviveB = ((newSquadRdy && bHealth > bDamage) || (bHealth - missingHealth > bDamage));
    var leadAttackOK = !leadChallenge || oneshotFast || surviveD;
    var drainAttackOK = !drainChallenge || oneshotFast || surviveD;
    var isCritThing = isCritVoidMap || isCritDaily || isCrushed;
    var voidCritinDok = !isCritThing || oneshotFast || surviveD;
    var voidCritinXok = !isCritThing || oneshotFast || surviveX;

    if (!game.global.preMapsActive && game.global.soldierHealth > 0) {

        if (game.upgrades.Dominance.done && surviveD && leadAttackOK && drainAttackOK && voidCritinDok && dExplosionOK) {
            setFormation(2);

        } else if (isCritThing && !voidCritinDok) {

            if (game.global.formation == "0" && game.global.soldierHealth - xDamage < bHealth) {
                if (game.upgrades.Barrier.done && (newSquadRdy || missingHealth < bHealth))
                    setFormation(3);
            }
            else if (xDamage == 0 || ((game.global.formation == 2 || game.global.formation == 4) && voidCritinXok)) {
                setFormation("0");
            }
            else {
                if (game.global.formation == "0") {
                    if (game.upgrades.Barrier.done && (newSquadRdy || missingHealth < bHealth))
                        setFormation(3);
                    else
                        setFormation(1);
                }
                else if (game.upgrades.Barrier.done && (game.global.formation == 2 || game.global.formation == 4))
                    setFormation(3);
            }
        } else if (game.upgrades.Formations.done && !xExplosionOK) {
            setFormation(1);
        } else if (game.upgrades.Formations.done && surviveX) {
            if ((game.global.challengeActive == 'Lead') && (xHealth - missingHealth < xDamage + (xHealth * leadDamage)))
                setFormation(1);
            else
                setFormation("0");
        } else if (game.upgrades.Barrier.done && surviveB) {
            if (game.global.formation != 3) {
                setFormation(3);
                debug("AutoStance B/3", "other");
            }
        } else {
            if (game.global.formation != 1)
                setFormation(1);
        }
    }
    return true;
}

function autoStanceCheck(enemyCrit) {
    if (game.global.gridArray.length === 0) return [true, true];
    var ourDamage = calcOurDmg("min", false, true);
    var ourBlock = game.global.soldierCurrentBlock;
    var ourHealth = game.global.soldierHealthMax;
    var missingHealth = game.global.soldierHealthMax - game.global.soldierHealth;
    var newSquadRdy = game.resources.trimps.realMax() <= game.resources.trimps.owned + 1;

    var corrupt = game.global.world >= mutations.Corruption.start();
    var enemy = getCurrentEnemy();
    if (typeof enemy === 'undefined') return [true, true];
    var enemyHealth = enemy.health;
    var enemyDamage = calcBadGuyDmg(enemy, null, true, true, true);
    var critMulti = 1;
    const ignoreCrits = getPageSetting('IgnoreCrits');
    var isCrushed = false;
    var isCritVoidMap = false;
    var isCritDaily = false;
    if (ignoreCrits != 2) {
        (isCrushed = game.global.challengeActive == "Crushed" && game.global.soldierHealth > game.global.soldierCurrentBlock)
            && enemyCrit && (critMulti *= 5);
        (isCritVoidMap = (!ignoreCrits && game.global.voidBuff == 'getCrit') || (enemy.corrupted == 'corruptCrit') || (enemy.corrupted == 'healthyCrit'))
            && enemyCrit && (critMulti *= (enemy.corrupted == 'healthyCrit' ? 7 : 5));
        (isCritDaily = game.global.challengeActive == "Daily" && typeof game.global.dailyChallenge.crits !== 'undefined')
            && enemyCrit && (critMulti *= dailyModifiers.crits.getMult(game.global.dailyChallenge.crits.strength));
        if (enemyCrit)
            enemyDamage *= critMulti;
    }
    var isDoubleAttack = game.global.voidBuff == 'doubleAttack' || (enemy.corrupted == 'corruptDbl') || (enemy.corrupted == 'healthyDbl');
    var enemyFast = (game.global.challengeActive == "Slow" || ((game.badGuys[enemy.name].fast || enemy.mutation == "Corruption") && game.global.challengeActive != "Coordinate" && game.global.challengeActive != "Nom")) || isDoubleAttack;
    if (enemy.corrupted == 'corruptStrong')
        enemyDamage *= 2;
    if (enemy.corrupted == 'corruptTough')
        enemyHealth *= 5;
    if (enemy.corrupted == 'healthyStrong')
        enemyDamage *= 2.5;
    if (enemy.corrupted == 'healthyTough')
        enemyHealth *= 7.5;
    enemyDamage -= ourBlock;
    var pierce = 0;
    if (game.global.brokenPlanet && !game.global.mapsActive) {
        pierce = getPierceAmt();
        var atkPierce = pierce * enemyDamage;
        if (enemyDamage < atkPierce) enemyDamage = atkPierce;
    }
    if (enemyDamage < 0) enemyDamage = 0;
    var isdba = isDoubleAttack ? 2 : 1;
    enemyDamage *= isdba;
    var drainChallenge = game.global.challengeActive == 'Nom' || game.global.challengeActive == "Toxicity";
    var dailyPlague = game.global.challengeActive == 'Daily' && (typeof game.global.dailyChallenge.plague !== 'undefined');
    var dailyBogged = game.global.challengeActive == 'Daily' && (typeof game.global.dailyChallenge.bogged !== 'undefined');
    var leadChallenge = game.global.challengeActive == 'Lead';
    if (drainChallenge) {
        var hplost = 0.20;
        enemyDamage += ourHealth * hplost;
    } else if (dailyPlague) {
        drainChallenge = true;
        var hplost = dailyModifiers.plague.getMult(game.global.dailyChallenge.plague.strength, 1 + game.global.dailyChallenge.plague.stacks);
        enemyDamage += ourHealth * hplost;
    } else if (dailyBogged) {
        drainChallenge = true;
        var hplost = dailyModifiers.bogged.getMult(game.global.dailyChallenge.bogged.strength);
        enemyDamage += ourHealth * hplost;
    } else if (leadChallenge) {
        var leadDamage = game.challenges.Lead.stacks * 0.0003;
        enemyDamage += game.global.soldierHealthMax * leadDamage;
    }

    if (game.global.voidBuff == "bleed" || (enemy.corrupted == 'corruptBleed') || enemy.corrupted == 'healthyBleed') {
        enemyDamage += game.global.soldierHealth * (enemy.corrupted == 'healthyBleed' ? 0.30 : 0.20);
    }
    ourDamage *= (game.global.titimpLeft > 0 ? 2 : 1);
    ourDamage *= (!game.global.mapsActive && game.global.mapBonus > 0) ? ((game.global.mapBonus * .2) + 1) : 1;

    var oneshotFast = enemyFast ? enemyHealth <= ourDamage : false;
    var survive = ((newSquadRdy && ourHealth > enemyDamage) || (ourHealth - missingHealth > enemyDamage));
    var leadAttackOK = !leadChallenge || oneshotFast || survive;
    var drainAttackOK = !drainChallenge || oneshotFast || survive;
    var isCritThing = isCritVoidMap || isCritDaily || isCrushed;
    var voidCritok = !isCritThing || oneshotFast || survive;

    if (!game.global.preMapsActive) {
        var enoughDamage2 = enemyHealth <= ourDamage;
        var enoughHealth2 = survive && leadAttackOK && drainAttackOK && voidCritok;
        ourDamage /= (game.global.titimpLeft > 0 ? 2 : 1);
        ourDamage /= (!game.global.mapsActive && game.global.mapBonus > 0) ? ((game.global.mapBonus * .2) + 1) : 1;
        return [enoughHealth2, enoughDamage2];
    } else
        return [true, true];
}

function autoStance2() {
    if (game.global.gridArray.length === 0) return;
    if (game.global.soldierHealth <= 0) return;
    if (getPageSetting('AutoStance') == 0) return;
    if (!game.upgrades.Formations.done) return;
    if (game.global.world <= 70) return;
    if (game.global.formation != 2)
        setFormation(2);
}

function windStance() {
    //Fail safes
    if (game.global.gridArray.length === 0) return;
    if (game.global.soldierHealth <= 0) return;
    if (!game.upgrades.Formations.done) return;
    if (game.global.world <= 70) return;
    var stancey = 2;
    if (game.global.challengeActive != "Daily") {
        if (calcCurrentStance() == 5) {
            stancey = 5;
            lowHeirloom();
        }
        if (calcCurrentStance() == 2) {
            stancey = 2;
            lowHeirloom();
        }
        if (calcCurrentStance() == 0) {
            stancey = 0;
            lowHeirloom();
        }
        if (calcCurrentStance() == 1) {
            stancey = 1;
            lowHeirloom();
        }
        if (calcCurrentStance() == 15) {
            stancey = 5;
            highHeirloom();
        }
        if (calcCurrentStance() == 12) {
            stancey = 2;
            highHeirloom();
        }
        if (calcCurrentStance() == 10) {
            stancey = 0;
            highHeirloom();
        }
        if (calcCurrentStance() == 11) {
            stancey = 1;
            highHeirloom();
        }
    }
    if (game.global.challengeActive == "Daily") {
        if (calcCurrentStance() == 5) {
            stancey = 5;
            dlowHeirloom();
        }
        if (calcCurrentStance() == 2) {
            stancey = 2;
            dlowHeirloom();
        }
        if (calcCurrentStance() == 0) {
            stancey = 0;
            dlowHeirloom();
        }
        if (calcCurrentStance() == 1) {
            stancey = 1;
            dlowHeirloom();
        }
        if (calcCurrentStance() == 15) {
            stancey = 5;
            dhighHeirloom();
        }
        if (calcCurrentStance() == 12) {
            stancey = 2;
            dhighHeirloom();
        }
        if (calcCurrentStance() == 10) {
            stancey = 0;
            dhighHeirloom();
        }
        if (calcCurrentStance() == 11) {
            stancey = 1;
            dhighHeirloom();
        }
    }
    setFormation(stancey);
}
