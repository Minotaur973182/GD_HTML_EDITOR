let player = {

    x: 1,

    y: 0,

    velocityY: 0,

    size: 0.8,

    speed: 0.12,

    gravity: -0.025,

    jumpForce: 0.48,

    grounded: true,

    alive: true

};


let playtesting = false;

let paused = false;

let playerAnimation = null;

let deathTimer = null;

let playerRotation = 0;

const playerKeys = new Set();


/* START */

function startPlaytest() {

    if (playerAnimation !== null) {

        cancelAnimationFrame(playerAnimation);

        playerAnimation = null;

    }

    if (deathTimer !== null) {

        clearTimeout(deathTimer);

        deathTimer = null;

    }

    playtesting = true;
    paused = false;

    resetPlayer();

    document.getElementById("playTest").style.display = "none";

    document.getElementById("playtestControls").style.display = "flex";

    document.getElementById("statusText").textContent = "PLAYTEST MODE";

    document.getElementById("pauseTest").textContent = "PAUSE";

    document.getElementById("playtestControls").style.display = "flex";

    activeTool = "select";

    renderPlayer();

    playerAnimation = requestAnimationFrame(playerLoop);

}


/* RESET PLAYER */

function resetPlayer() {

    player = {

        x: 1,

        y: 0,

        velocityY: 0,

        size: 0.8,

        speed: 0.12,

        gravity: -0.025,

        jumpForce: 0.48,

        grounded: true,

        alive: true

    };

    playerRotation = 0;

}


/* EXIT */

function exitPlaytest() {

    playtesting = false;
    paused = false;

    if (playerAnimation !== null) {

        cancelAnimationFrame(playerAnimation);

        playerAnimation = null;

    }

    if (deathTimer !== null) {

        clearTimeout(deathTimer);

        deathTimer = null;

    }

    playerKeys.clear();

    document.getElementById("playTest").style.display = "";

    document.getElementById("playtestControls").style.display = "none";

    document.getElementById("statusText").textContent = "BUILD MODE";

    renderEditor();

}


/* RESTART */

function restartPlaytest() {

    if (!playtesting) return;

    if (deathTimer !== null) {

        clearTimeout(deathTimer);

        deathTimer = null;

    }

    resetPlayer();

    paused = false;

    document.getElementById("pauseTest").textContent = "PAUSE";

    if (playerAnimation !== null) {

        cancelAnimationFrame(playerAnimation);

    }

    playerAnimation = requestAnimationFrame(playerLoop);

}


/* JUMP */

function jump() {

    if (!playtesting || paused || !player.alive) return;

    if (player.grounded) {

        player.velocityY = player.jumpForce;

        player.grounded = false;

    }

}


/* COLLISION */

function checkPlayerCollision(previousY) {

    const playerLeft = player.x;
    const playerRight = player.x + player.size;

    const playerBottom = player.y;
    const playerTop = player.y + player.size;


    for (const object of level.objects) {

        const type = getObjectType(object.type);

        if (!type) continue;

        if (object.type === "start") continue;

        const objectLeft = object.x;
        const objectRight = object.x + type.width;

        const objectBottom = object.y;
        const objectTop = object.y + type.height;


        const overlapX =
            playerRight > objectLeft &&
            playerLeft < objectRight;

        const overlapY =
            playerTop > objectBottom &&
            playerBottom < objectTop;

        if (!overlapX || !overlapY) continue;


        /* SPIKES KILL THE PLAYER */

        if (object.type === "spike") {

            return "dead";

        }


        /* BLOCK COLLISION */

        if (
            player.velocityY <= 0 &&
            previousY >= objectTop - 0.05
        ) {

            player.y = objectTop;

            player.velocityY = 0;

            player.grounded = true;

        }

        else {

            return "dead";

        }

    }

    return "safe";

}


/* PLAYER LOOP */

function playerLoop() {

    if (!playtesting) return;

    if (paused) {

        playerAnimation = requestAnimationFrame(playerLoop);

        return;

    }


    if (player.alive) {

        const previousY = player.y;


        /* MOVE FORWARD */

        player.x += player.speed;


        /* GRAVITY */

        player.velocityY += player.gravity;

        player.y += player.velocityY;

        player.grounded = false;


        /* GROUND COLLISION */

        if (player.y <= 0) {

            player.y = 0;

            player.velocityY = 0;

            player.grounded = true;

        }


        /* OBJECT COLLISION */

        const collision = checkPlayerCollision(previousY);

        if (collision === "dead") {

            killPlayer();

        }


        /* ROTATION */

        if (!player.grounded) {

            playerRotation += 0.08;

        }

        else {

            playerRotation = Math.round(
                playerRotation / (Math.PI / 2)
            ) * (Math.PI / 2);

        }

    }


    renderPlayer();

    playerAnimation = requestAnimationFrame(playerLoop);

}


/* DEATH */

function killPlayer() {

    if (!player.alive) return;

    player.alive = false;

    deathTimer = setTimeout(() => {

        if (playtesting) {

            restartPlaytest();

        }

    }, 700);

}


/* DRAW PLAYER */

function renderPlayer() {

    renderWorld();


    const position = worldToScreen(player.x, player.y);

    const size = player.size * gridSize;

    const centerX = position.x + size / 2;
    const centerY = position.y - size / 2;


    ctx.save();

    ctx.translate(centerX, centerY);

    ctx.rotate(-playerRotation);


    /* PLAYER BODY */

    ctx.fillStyle = player.alive ? "#37d9ed" : "#d94b4b";

    ctx.fillRect(
        -size / 2,
        -size / 2,
        size,
        size
    );


    /* PLAYER BORDER */

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;

    ctx.strokeRect(
        -size / 2,
        -size / 2,
        size,
        size
    );


    /* PLAYER EYES */

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
        -size * 0.25,
        -size * 0.2,
        size * 0.15,
        size * 0.15
    );

    ctx.fillRect(
        size * 0.1,
        -size * 0.2,
        size * 0.15,
        size * 0.15
    );


    ctx.restore();


    /* PROGRESS */

    const progress = Math.floor(player.x);

    ctx.fillStyle = "white";
    ctx.font = "bold 15px Arial";

    ctx.fillText(
        "DISTANCE: " + progress,
        15,
        25
    );


    if (paused) {

        ctx.fillStyle = "rgba(0,0,0,0.5)";

        ctx.fillRect(
            0,
            0,
            canvas.clientWidth,
            canvas.clientHeight
        );

        ctx.fillStyle = "white";

        ctx.font = "bold 35px Arial";

        ctx.textAlign = "center";

        ctx.fillText(
            "PAUSED",
            canvas.clientWidth / 2,
            canvas.clientHeight / 2
        );

        ctx.textAlign = "left";

    }

}


/* PAUSE */

function togglePause() {

    if (!playtesting) return;

    paused = !paused;

    document.getElementById("pauseTest").textContent =
        paused ? "RESUME" : "PAUSE";

    renderPlayer();

}


/* KEYBOARD */

window.addEventListener("keydown", event => {

    if (!playtesting) return;

    if (
        event.code === "Space" ||
        event.code === "ArrowUp" ||
        event.code === "KeyW"
    ) {

        event.preventDefault();

        if (!event.repeat) {
            jump();
        }

    }

});


window.addEventListener("keyup", event => {

    playerKeys.delete(event.code);

});


window.addEventListener("blur", () => {

    playerKeys.clear();

});
