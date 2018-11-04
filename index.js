import { initGamePad, gamepadNormalize, controllers, scangamepads } from './gamepad';

const DEBUG_GAME_PAD = !true;

window.viewConfig = {x: 0, y: 300, rotation: 0, zoom: 0.7};

void async function main() {
    const wasm = await import("./pkg");

    initGamePad(DEBUG_GAME_PAD);

    const canvas = document.createElement('canvas');
    canvas.style.border = "1px solid black";
    const [width, height] = [800, 800];
    canvas.width = width;
    canvas.height = height;

    document.body.appendChild(canvas);

    const game = new wasm.Game(canvas, { width, height });
    window.game = game;

    const margin = 0.00000000001;
    game.set_scene({
        margin,
        gravity: 9.81,
        box_radx: 0.15 - margin,
        box_rady: 0.09 - margin,
        ground_radx: 125 - margin,
        ground_rady: 1 - margin,
        ground_x: 0,
        ground_y: 9,
        f1: 1,
        f2: 2,

        buildings: [
            {x: 0.2, w: 5, h: 17},
            {x: 2.2, w: 5, h: 18},
            {x: 7.3, w: 5, h: 34},
            {x: 8.9, w: 5, h: 31},
            {x: 10.5, w: 6, h: 35},
            // {x: 8.2, w: 8, h: 69},
        ],

        player_a: {x: 1.3, y: 3.9, radx: 0.2, rady: 0.3, inertia: 0.1 },
        player_b: {x: 7.8,   y: 1.4, radx: 0.2, rady: 0.3, inertia: 0.1 },
    });

    const loop = () => {
        try { scangamepads(); } catch {}

        if (controllers[0]) controlPlayer(0, controllers[0]);
        if (controllers[1]) controlPlayer(1, controllers[1]);

        game.step();
        game.render_scene(viewConfig);

        requestAnimationFrame(loop);
    }
    loop();


    function controlPlayer(player, gamePad) {
        const input = gamepadNormalize(gamePad);

        const [ hori1, vert1, l2, hori2, vert2, r2, hori3, vert3 ] = input;

        window.viewConfig.zoom += 0.01 * (-l2 + r2);

        if (gamePad.buttons[0].pressed) {
            const shot = {
                x: 1.3,
                y: 3,
                rot: vert1 && hori1 ? Math.atan2(vert1, hori1) : 0,
                power: 20,
                config: {
                    w: 0.4,
                    h: 0.08,
                    inertia: 0.1,
                    ttl: 5,
                }
            };
            game.shoot(shot, (Math.random() - 0.5) * 100);
        }
    }

}()
