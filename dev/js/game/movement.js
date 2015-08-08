function Movement(renderer, img, sfx, objects, settings, rnd) {
    "use strict";

    this.steer_player = function (p) {
        var s1, s2;
        if (p.action_left && !(p.action_right && p.direction == 0)) {
            player_action_left(p);
        } else if (p.action_right) {
            player_action_right(p);
        } else {
            var below_left, below, below_right;

            s1 = (p.x.pos >> 16);
            s2 = (p.y.pos >> 16);
            below_left = GET_BAN_MAP_XY(s1, s2 + 16);
            below = GET_BAN_MAP_XY(s1 + 8, s2 + 16);
            below_right = GET_BAN_MAP_XY(s1 + 15, s2 + 16);
            if (below == BAN_SOLID || below == BAN_SPRING || (((below_left == BAN_SOLID || below_left == BAN_SPRING) && below_right != BAN_ICE) || (below_left != BAN_ICE && (below_right == BAN_SOLID || below_right == BAN_SPRING)))) {
                if (p.x.velocity < 0) {
                    p.x.velocity += 16384;
                    if (p.x.velocity > 0)
                        p.x.velocity = 0;
                } else {
                    p.x.velocity -= 16384;
                    if (p.x.velocity < 0)
                        p.x.velocity = 0;
                }
                if (p.x.velocity != 0 && GET_BAN_MAP_XY((s1 + 8), (s2 + 16)) == BAN_SOLID)
                    objects.add(objects.SMOKE, (p.x.pos >> 16) + 2 + rnd(9), (p.y.pos >> 16) + 13 + rnd(5), 0, -16384 - rnd(8192), objects.ANIM_SMOKE, 0);
            }
            if (p.anim == 1) {
                p.set_anim(0);
            }
        }

        if (settings.jetpack == 0) {
            /* no jetpack */
            if (settings.pogostick == 1 || (p.jump_ready == 1 && p.action_up)) {
                s1 = (p.x.pos >> 16);
                s2 = (p.y.pos >> 16);
                if (s2 < -16)
                    s2 = -16; //Allow player to jump off screen but not negative overflow if using jetpack
                /* jump */
                if (GET_BAN_MAP_XY(s1, (s2 + 16)) == BAN_SOLID || GET_BAN_MAP_XY(s1, (s2 + 16)) == BAN_ICE || GET_BAN_MAP_XY((s1 + 15), (s2 + 16)) == BAN_SOLID || GET_BAN_MAP_XY((s1 + 15), (s2 + 16)) == BAN_ICE) {
                    p.y.velocity = -280000;
                    p.set_anim(2);
                    p.jump_ready = 0;
                    p.jump_abort = 1;
                    if (settings.pogostick == 0)
                        sfx.jump();
                    else
                        sfx.spring();
                }
                /* jump out of water */
                if (GET_BAN_MAP_IN_WATER(s1, s2)) {
                    p.y.velocity = -196608;
                    p.in_water = 0;
                    p.set_anim(2);
                    p.jump_ready = 0;
                    p.jump_abort = 1;
                    if (settings.pogostick == 0)
                        sfx.jump();
                    else
                        sfx.spring();
                }
            }
            /* fall down by gravity */
            if (settings.pogostick == 0 && (!p.action_up)) {
                p.jump_ready = 1;
                if (p.in_water == 0 && p.y.velocity < 0 && p.jump_abort == 1) {
                    if (settings.bunnies_in_space == 0)
                        /* normal gravity */
                        p.y.velocity += 32768;
                    else
                        /* light gravity */
                        p.y.velocity += 16384;
                    if (p.y.velocity > 0)
                        p.y.velocity = 0;
                }
            }
        } else {
            /* with jetpack */
            if (p.action_up) {
                p.y.velocity -= 16384;
                if (p.y.velocity < -400000)
                    p.y.velocity = -400000;
                if (GET_BAN_MAP_IN_WATER(s1, s2))
                    p.in_water = 0;
                if (rnd(100) < 50)
                    objects.add(objects.SMOKE, (p.x.pos >> 16) + 6 + rnd(5), (p.y.pos >> 16) + 10 + rnd(5), 0, 16384 + rnd(8192), objects.ANIM_SMOKE, 0);
            }
        }

        p.x.pos += p.x.velocity;
        if ((p.x.pos >> 16) < 0) {
            p.x.pos = 0;
            p.x.velocity = 0;
        }
        if ((p.x.pos >> 16) + 15 > 351) {
            p.x.pos = 336 << 16;
            p.x.velocity = 0;
        }
        {
            if (p.y.pos > 0) {
                s2 = (p.y.pos >> 16);
            } else {
                /* check top line only */
                s2 = 0;
            }

            s1 = (p.x.pos >> 16);
            if (GET_BAN_MAP_XY(s1, s2) == BAN_SOLID || GET_BAN_MAP_XY(s1, s2) == BAN_ICE || GET_BAN_MAP_XY(s1, s2) == BAN_SPRING || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_SOLID || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_ICE || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_SPRING) {
                p.x.pos = (((s1 + 16) & 0xfff0)) << 16;
                p.x.velocity = 0;
            }

            s1 = (p.x.pos >> 16);
            if (GET_BAN_MAP_XY((s1 + 15), s2) == BAN_SOLID || GET_BAN_MAP_XY((s1 + 15), s2) == BAN_ICE || GET_BAN_MAP_XY((s1 + 15), s2) == BAN_SPRING || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_SOLID || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_ICE || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_SPRING) {
                p.x.pos = (((s1 + 16) & 0xfff0) - 16) << 16;
                p.x.velocity = 0;
            }
        }

        p.y.pos += p.y.velocity;

        s1 = (p.x.pos >> 16);
        s2 = (p.y.pos >> 16);
        if (GET_BAN_MAP_XY((s1 + 8), (s2 + 15)) == BAN_SPRING || ((GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_SPRING && GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) != BAN_SOLID) || (GET_BAN_MAP_XY(s1, (s2 + 15)) != BAN_SOLID && GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_SPRING))) {
            p.y.pos = ((p.y.pos >> 16) & 0xfff0) << 16;
            p.y.velocity = -400000;
            p.set_anim(2);
            p.jump_ready = 0;
            p.jump_abort = 0;
            for (var c2 = 0; c2 < env.MAX_OBJECTS; c2++) {
                var obj = objects.objects[c2];
                if (obj.used == 1 && obj.type == objects.SPRING) {
                    if (GET_BAN_MAP_XY((s1 + 8), (s2 + 15)) == BAN_SPRING) {
                        if ((obj.x.pos >> 20) == ((s1 + 8) >> LEVEL_SCALE_FACTOR) && (obj.y.pos >> 20) == ((s2 + 15) >> LEVEL_SCALE_FACTOR)) {
                            start_anim(obj);
                            break;
                        }
                    } else if (GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_SPRING) {
                            if ((obj.x.pos >> 20) == (s1 >> LEVEL_SCALE_FACTOR) && (obj.y.pos >> 20) == ((s2 + 15) >> LEVEL_SCALE_FACTOR)) {
                                start_anim(obj);
                                break;
                            }
                    } else if (GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_SPRING) {
                        if ((obj.x.pos >> 20) == ((s1 + 15) >> LEVEL_SCALE_FACTOR) && (obj.y.pos >> 20) == ((s2 + 15) >> LEVEL_SCALE_FACTOR)) {
                            start_anim(obj);
                            break;
                        }
                    }                    
                }
            }
            sfx.spring();
        }
        s1 = (p.x.pos >> 16);
        s2 = (p.y.pos >> 16);
        if (s2 < 0)
            s2 = 0;
        if (GET_BAN_MAP_XY(s1, s2) == BAN_SOLID || GET_BAN_MAP_XY(s1, s2) == BAN_ICE || GET_BAN_MAP_XY(s1, s2) == BAN_SPRING || GET_BAN_MAP_XY((s1 + 15), s2) == BAN_SOLID || GET_BAN_MAP_XY((s1 + 15), s2) == BAN_ICE || GET_BAN_MAP_XY((s1 + 15), s2) == BAN_SPRING) {
            p.y.pos = (((s2 + 16) & 0xfff0)) << 16;
            p.y.velocity = 0;
            p.set_anim(0);
        }
        s1 = (p.x.pos >> 16);
        s2 = (p.y.pos >> 16);
        if (s2 < 0)
            s2 = 0;
        if (GET_BAN_MAP_XY((s1 + 8), (s2 + 8)) == BAN_WATER) {
            if (p.in_water == 0) {
                /* falling into water */
                p.in_water = 1;
                p.set_anim(4);
                if (p.y.velocity >= 32768) {
                    objects.add(objects.SPLASH, (p.x.pos >> 16) + 8, ((p.y.pos >> 16) & 0xfff0) + 15, 0, 0, objects.ANIM_SPLASH, 0);
                    sfx.splash();
                }
            }
            /* slowly move up to water surface */
            p.y.velocity -= 1536;
            if (p.y.velocity < 0 && p.anim != 5) {
                p.set_anim(5);
            }
            if (p.y.velocity < -65536)
                p.y.velocity = -65536;
            if (p.y.velocity > 65535)
                p.y.velocity = 65535;
            if (GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_SOLID || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_ICE || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_SOLID || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_ICE) {
                p.y.pos = (((s2 + 16) & 0xfff0) - 16) << 16;
                p.y.velocity = 0;
            }
        } else if (GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_SOLID || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_ICE || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_SPRING || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_SOLID || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_ICE || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_SPRING) {
            p.in_water = 0;
            p.y.pos = (((s2 + 16) & 0xfff0) - 16) << 16;
            p.y.velocity = 0;
            if (p.anim != 0 && p.anim != 1) {
                p.set_anim(0);
            }
        } else {
            if (p.in_water == 0) {
                if (settings.bunnies_in_space == 0)
                    p.y.velocity += 12288;
                else
                    p.y.velocity += 6144;
                if (p.y.velocity > 327680)
                    p.y.velocity = 327680;
            } else {
                p.y.pos = (p.y.pos & 0xffff0000) + 0x10000;
                p.y.velocity = 0;
            }
            p.in_water = 0;
        }
        if (p.y.velocity > 36864 && p.anim != 3 && p.in_water == 0) {
            p.set_anim(3);
        }
    }
    
    this.collision_check = function() {
        /* collision check */
        for (var c1 = 0; c1 < 3; c1++) {
            for (var c2 = c1 + 1; c2 < 4; c2++) {
                var p1 = player[c1];
                var p2 = player[c2];
                if (p1.enabled && p2.enabled) {
                    if (Math.abs(p1.x.pos - p2.x.pos) < 0xC0000 && Math.abs(p1.y.pos - p2.y.pos) < 0xC0000) {
                        player_collision_check(p1, p2);
                    }
                }
            }
        }
    }

    function player_collision_check(p1, p2) {
        if ((Math.abs(p1.y.pos - p2.y.pos) >> 16) > 5) {
            if (p1.y.pos < p2.y.pos) {
                player_kill(p1, p2);
            } else {
                player_kill(p2, p1);
            }
        } else {
            if (p1.x.pos < p2.x.pos) {
                repel_each_other(p1, p2);
            } else {
                repel_each_other(p2, p1);
            }
        }
    }

    function repel_each_other(left_player, right_player){
        if (right_player.x.velocity > 0)
            left_player.x.pos = right_player.x.pos - 0xC0000;
        else if (left_player.x.velocity < 0)
            right_player.x.pos = left_player.x.pos + 0xC0000;
        else {
            left_player.x.pos -= left_player.x.velocity;
            right_player.x.pos -= right_player.x.velocity;
        }
        var l1 = left_player.x.velocity;
        left_player.x.velocity = right_player.x.velocity;
        right_player.x.velocity = l1;
        if (right_player.x.velocity < 0)
            right_player.x.velocity = -right_player.x.velocity;
        if (left_player.x.velocity > 0)
            left_player.x.velocity = -left_player.x.velocity;
    }

    function start_anim(obj) {
        obj.frame = 0;
        obj.ticks = env.animation_data.objects[obj.anim].frame[obj.frame].ticks;
        obj.image = env.animation_data.objects[obj.anim].frame[obj.frame].image;
    }


    function player_kill(killer, victim) {
        killer.y.velocity = -killer.y.velocity;
        if (killer.y.velocity > -262144)
            killer.y.velocity = -262144;
        killer.jump_abort = true;
        victim.dead_flag = true;
        if (victim.anim != 6) {
            victim.set_anim(6);
            if (!settings.no_gore) {
                objects.add_gore(victim.x.pos, victim.y.pos, victim.player_index);
            }
            sfx.death();
            killer.bumps++;
            killer.bumped[victim.player_index]++;
            var s1 = killer.bumps % 100;
            if (s1 % 10 == 0) {
                renderer.add_leftovers(360, 34 + killer.player_index * 64, img.numbers, number_gobs[Math.floor(s1 / 10) % 10]);
            }
            renderer.add_leftovers(376, 34 + killer.player_index * 64, img.numbers, number_gobs[s1 % 10]);
        }
    }
    
    function player_action_left(p) {
        var sx = (p.x.pos >> 16);
        var sy = (p.y.pos >> 16);
        var below_left = GET_BAN_MAP_XY(sx, sy + 16);
        var below = GET_BAN_MAP_XY(sx + 8, sy + 16);
        var below_right = GET_BAN_MAP_XY(sx + 15, sy + 16);
        var moving_right = p.x.velocity > 0;
        var is_ice_below = below == BAN_ICE || (below_left != BAN_SOLID && below_right == BAN_ICE) || (below_left == BAN_ICE && below_right != BAN_SOLID);
        var acceleration = is_ice_below ? 1 : 8;

        if (moving_right) {
            p.x.velocity -= (1024 * acceleration);
            if (p.in_water == 0 && below == BAN_SOLID) {
                objects.add(objects.SMOKE, (p.x.pos >> 16) + 2 + rnd(9), (p.y.pos >> 16) + 13 + rnd(5), 0, -16384 - rnd(8192), objects.ANIM_SMOKE, 0);
            }
        } else {
            p.x.velocity -= (768 * acceleration);
        }

        if (p.x.velocity < -98304) {
            p.x.velocity = -98304;
        }
        p.direction = 1;
        if (p.anim == 0) {
            p.set_anim(1);
        }
    }

    function player_action_right(p) {
        var sx = (p.x.pos >> 16);
        var sy = (p.y.pos >> 16);
        var below_left = GET_BAN_MAP_XY(sx, sy + 16);
        var below = GET_BAN_MAP_XY(sx + 8, sy + 16);
        var below_right = GET_BAN_MAP_XY(sx + 15, sy + 16);
        var moving_left = p.x.velocity < 0;
        var is_ice_below = below == BAN_ICE || (below_left != BAN_SOLID && below_right == BAN_ICE) || (below_left == BAN_ICE && below_right != BAN_SOLID);
        var acceleration = is_ice_below ? 1 : 8;

        if (moving_left) {
            p.x.velocity += (1024 * acceleration);
            if (p.in_water == 0 && below == BAN_SOLID) {
                objects.add(objects.SMOKE, (p.x.pos >> 16) + 2 + rnd(9), (p.y.pos >> 16) + 13 + rnd(5), 0, -16384 - rnd(8192), objects.ANIM_SMOKE, 0);
            }
        } else {
            p.x.velocity += (768 * acceleration);
        }
        
        if (p.x.velocity > 98304) {
            p.x.velocity = 98304;
        }
        p.direction = 0;
        if (p.anim == 0) {
            p.set_anim(1);
        }
    }
}