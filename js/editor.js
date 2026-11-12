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
let dragOffset = { x: 0, y: 0 };

let panStart = { x: 0, camera: 0 };

let pointerDown = false;


function resizeCanvas() {

    const rect = canvas.getBoundingClientRect();

    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

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


function getObjectAt(x, y) {

    for (let i = level.objects.length - 1; i >= 0; i--) {

        const object = level.objects[i];

        const type = getObjectType(object.type);

        if (!type) continue;

        const insideX =
            x >= object.x &&
            x <= object.x + type.width;

        const insideY =
            y >= object.y &&
            y <= object.y + type.height;

        if (insideX && insideY) {
            return object;
        }

    }

    return null;

}


function renderEditor() {

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    // BACKGROUND

    ctx.fillStyle = "#263e55";
    ctx.fillRect(0, 0, width, height);


    // GRID

    const origin = worldToScreen(0, 0);

    ctx.strokeStyle = "rgba(130,180,210,0.12)";
    ctx.lineWidth = 1;

    const startX = Math.floor(cameraX - width / gridSize / 2) - 2;
    const endX = Math.ceil(cameraX + width / gridSize / 2) + 2;

    for (let x = startX; x <= endX; x++) {

        const sx = worldToScreen(x, 0).x;

        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, height);
        ctx.stroke();

    }


    for (let y = 0; y < height / gridSize + 2; y++) {

        const sy = worldToScreen(0, y).y;

        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(width, sy);
        ctx.stroke();

    }


    // GROUND

    ctx.fillStyle = "#132a3c";
    ctx.fillRect(0, origin.y, width, height - origin.y);

    ctx.strokeStyle = "#70b7d5";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, origin.y);
    ctx.lineTo(width, origin.y);
    ctx.stroke();


    // OBJECTS

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


    // SELECTION

    if (level.selected) {

        const object = level.objects.find(
            obj => obj.id === level.selected
        );

        if (object) {

            const type = getObjectType(object.type);

            const position = worldToScreen(object.x, object.y);

            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 3]);

            ctx.strokeRect(
                position.x,
                position.y - type.height * gridSize,
                type.width * gridSize,
                type.height * gridSize
            );

            ctx.setLineDash([]);

        }

    }


    // PLACEMENT PREVIEW

    if (selectedObjectType && activeTool === "place" && !pointerDown) {

        const world = screenToWorld(mouseX, mouseY);

        const type = getObjectType(selectedObjectType);

        if (type) {

            const x = snap(world.x);
            const y = Math.max(0, snap(world.y));

            const position = worldToScreen(x, y);

            ctx.globalAlpha = 0.5;

            drawObject(
                ctx,
                { type: selectedObjectType },
                position.x,
                position.y,
                gridSize
            );

            ctx.globalAlpha = 1;

        }

    }

}


canvas.addEventListener("pointermove", event => {

    const rect = canvas.getBoundingClientRect();

    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    const world = screenToWorld(mouseX, mouseY);

    document.getElementById("coordinates").textContent =
        `X: ${snap(world.x)} | Y: ${snap(world.y)}`;


    if (panning) {

        cameraX = panStart.camera -
            (event.clientX - panStart.x) / gridSize;

        renderEditor();
        return;

    }


    if (dragging && dragObject) {

        const world = screenToWorld(mouseX, mouseY);

        const type = getObjectType(dragObject.type);

        moveObject(

            dragObject.id,

            snap(world.x - dragOffset.x),

            Math.max(0, snap(world.y - dragOffset.y))

        );

        renderEditor();
        return;

    }


    renderEditor();

});


canvas.addEventListener("pointerdown", event => {

    pointerDown = true;

    const rect = canvas.getBoundingClientRect();

    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;


    // Middle mouse = PAN

    if (event.button === 1) {

        panning = true;

        panStart = {
            x: event.clientX,
            camera: cameraX
        };

        return;

    }


    if (event.button !== 0) return;

    const world = screenToWorld(mouseX, mouseY);


    // DELETE TOOL

    if (activeTool === "delete") {

        const object = getObjectAt(world.x, world.y);

        if (object) {
            removeObject(object.id);
        }

        renderEditor();
        return;

    }


    // PLACE OBJECT

    if (activeTool === "place" && selectedObjectType) {

        addObject(

            selectedObjectType,

            snap(world.x),

            Math.max(0, snap(world.y))

        );

        renderEditor();
        return;

    }


    // SELECT OBJECT

    if (activeTool === "select") {

        const object = getObjectAt(world.x, world.y);

        if (object) {

            level.selected = object.id;

            saveHistory();

            dragObject = object;

            const type = getObjectType(object.type);

            dragOffset.x = world.x - object.x;
            dragOffset.y = world.y - object.y;

            dragging = true;

        } else {

            level.selected = null;

        }

        renderEditor();

    }

});


window.addEventListener("pointerup", () => {

    dragging = false;
    panning = false;
    dragObject = null;
    pointerDown = false;

    renderEditor();

});


canvas.addEventListener("wheel", event => {

    event.preventDefault();

    const oldSize = gridSize;

    const factor = event.deltaY < 0 ? 1.1 : 0.9;

    const newSize = Math.max(
        10,
        Math.min(90, gridSize * factor)
    );

    const worldBefore = screenToWorld(mouseX, mouseY);

    gridSize = newSize;

    const worldAfter = screenToWorld(mouseX, mouseY);

    cameraX += worldBefore.x - worldAfter.x;

    updateZoom();

    renderEditor();

}, { passive: false });


function updateZoom() {

    document.getElementById("zoomValue").textContent =
        Math.round(gridSize / 30 * 100) + "%";

}


function zoom(amount) {

    gridSize = Math.max(
        10,
        Math.min(90, gridSize + amount)
    );

    updateZoom();
    renderEditor();

}


window.addEventListener("resize", resizeCanvas);
