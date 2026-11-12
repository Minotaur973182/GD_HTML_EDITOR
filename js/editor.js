const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gridSize = 30;

let cameraX = 0;

let activeTool = "select";

let selectedObjectType = null;

let mouseX = 0;
let mouseY = 0;

let dragging = false;
let panning = false;

let dragObject = null;

let dragOffset = {
    x: 0,
    y: 0
};

let panStart = {
    x: 0,
    camera: 0
};


function resizeCanvas() {

    const rect = canvas.getBoundingClientRect();

    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    renderEditor();

}


function screenToWorld(x, y) {

    return {

        x: (x - canvas.clientWidth / 2) / gridSize + cameraX,

        y: (canvas.clientHeight - 70 - y) / gridSize

    };

}


function worldToScreen(x, y) {

    return {

        x: canvas.clientWidth / 2 + (x - cameraX) * gridSize,

        y: canvas.clientHeight - 70 - y * gridSize

    };

}


function snap(value) {

    return Math.round(value);

}


function getObjectAt(worldX, worldY) {

    for (let i = level.objects.length - 1; i >= 0; i--) {

        const object = level.objects[i];

        const type = getObjectType(object.type);

        if (!type) continue;

        if (
            worldX >= object.x &&
            worldX <= object.x + type.width &&
            worldY >= object.y - type.height &&
            worldY <= object.y
        ) {
            return object;
        }

    }

    return null;

}


/* DRAW GRID AND WORLD */

function renderWorld() {

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#202f40";
    ctx.fillRect(0, 0, width, height);


    /* GRID */

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;

    const startX = Math.floor(cameraX - width / gridSize / 2) - 1;
    const endX = Math.ceil(cameraX + width / gridSize / 2) + 1;

    for (let x = startX; x <= endX; x++) {

        const screen = worldToScreen(x, 0);

        ctx.beginPath();

        ctx.moveTo(screen.x, 0);
        ctx.lineTo(screen.x, height);

        ctx.stroke();

    }


    for (let y = 0; y < height / gridSize + 2; y++) {

        const screen = worldToScreen(0, y);

        ctx.beginPath();

        ctx.moveTo(0, screen.y);
        ctx.lineTo(width, screen.y);

        ctx.stroke();

    }


    /* GROUND */

    const ground = worldToScreen(0, 0);

    ctx.fillStyle = "#344a60";

    ctx.fillRect(
        0,
        ground.y,
        width,
        height - ground.y
    );

    ctx.fillStyle = "#83b8e8";

    ctx.fillRect(
        0,
        ground.y,
        width,
        3
    );


    /* OBJECTS */

    for (const object of level.objects) {

        const position = worldToScreen(object.x, object.y);

        drawObject(
            ctx,
            object,
            position.x,
            position.y,
            gridSize
        );

    }

}


/* EDITOR RENDER */

function renderEditor() {

    if (playtesting) return;

    renderWorld();


    /* SELECTION */

    const selected = level.objects.find(
        object => object.id === level.selected
    );

    if (selected) {

        const type = getObjectType(selected.type);

        if (type) {

            const position = worldToScreen(selected.x, selected.y);

            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;

            ctx.setLineDash([5, 4]);

            ctx.strokeRect(
                position.x,
                position.y - type.height * gridSize,
                type.width * gridSize,
                type.height * gridSize
            );

            ctx.setLineDash([]);

        }

    }


    /* PLACEMENT PREVIEW */

    if (selectedObjectType && activeTool === "place") {

        const world = screenToWorld(mouseX, mouseY);

        const x = snap(world.x);
        const y = Math.max(0, snap(world.y));

        const position = worldToScreen(x, y);

        const preview = {

            type: selectedObjectType

        };

        ctx.globalAlpha = 0.5;

        drawObject(
            ctx,
            preview,
            position.x,
            position.y,
            gridSize
        );

        ctx.globalAlpha = 1;

    }

}


/* POINTER EVENTS */

canvas.addEventListener("pointermove", event => {

    const rect = canvas.getBoundingClientRect();

    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    if (playtesting) return;


    if (panning) {

        cameraX = panStart.camera -
            (event.clientX - panStart.x) / gridSize;

        renderEditor();

        return;

    }


    const world = screenToWorld(mouseX, mouseY);

    document.getElementById("coordinates").textContent =
        `X: ${world.x.toFixed(1)} | Y: ${world.y.toFixed(1)}`;


    if (dragging && dragObject) {

        const x = snap(world.x - dragOffset.x);
        const y = Math.max(0, snap(world.y - dragOffset.y));

        moveObject(dragObject.id, x, y);

    }

    renderEditor();

});


canvas.addEventListener("pointerdown", event => {

    if (playtesting) return;

    const rect = canvas.getBoundingClientRect();

    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    if (event.button === 1 || event.button === 2) {

        panning = true;

        panStart.x = event.clientX;
        panStart.camera = cameraX;

        event.preventDefault();

        return;

    }

    const world = screenToWorld(mouseX, mouseY);

    const x = snap(world.x);
    const y = Math.max(0, snap(world.y));


    if (activeTool === "place" && selectedObjectType) {

        addObject(selectedObjectType, x, y);

        renderEditor();

        return;

    }


    const clicked = getObjectAt(world.x, world.y);


    if (activeTool === "delete") {

        if (clicked) {
            removeObject(clicked.id);
        }

        renderEditor();

        return;

    }


    if (clicked) {

        level.selected = clicked.id;

        dragObject = clicked;

        dragOffset.x = world.x - clicked.x;
        dragOffset.y = world.y - clicked.y;

        dragging = true;

    }

    else {

        level.selected = null;

    }

    renderEditor();

});


function finishPointerAction() {

    if (dragging && dragObject) {

        saveHistory();

    }

    dragging = false;
    panning = false;
    dragObject = null;

    renderEditor();

}


window.addEventListener("pointerup", finishPointerAction);

canvas.addEventListener("contextmenu", event => {
    event.preventDefault();
});


/* ZOOM */

function updateZoom() {

    document.getElementById("zoomValue").textContent =
        Math.round(gridSize / 30 * 100) + "%";

    renderEditor();

}


function zoom(amount) {

    gridSize = Math.max(12, Math.min(90, gridSize + amount));

    updateZoom();

}


canvas.addEventListener("wheel", event => {

    event.preventDefault();

    const oldGridSize = gridSize;

    const rect = canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const worldBefore = screenToWorld(mouseX, mouseY);

    gridSize = Math.max(
        12,
        Math.min(90, gridSize + (event.deltaY < 0 ? 3 : -3))
    );

    const worldAfter = screenToWorld(mouseX, mouseY);

    cameraX += worldBefore.x - worldAfter.x;

    updateZoom();

}, { passive: false });


/* RESIZE */

const resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
});

resizeObserver.observe(canvas);

window.addEventListener("resize", resizeCanvas);
