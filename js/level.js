const level = {

    name: "Untitled Level",

    objects: [],

    selected: null,

    history: [],
    historyIndex: -1

};


function saveHistory() {

    const snapshot = JSON.stringify(level.objects);

    level.history = level.history.slice(0, level.historyIndex + 1);

    level.history.push(snapshot);

    if (level.history.length > 100) {
        level.history.shift();
    }

    level.historyIndex = level.history.length - 1;

}


function addObject(type, x, y) {

    saveHistory();

    level.objects.push({

        id: crypto.randomUUID(),
        type: type,
        x: x,
        y: y,
        rotation: 0

    });

    updateObjectCount();

}


function removeObject(id) {

    const index = level.objects.findIndex(obj => obj.id === id);

    if (index === -1) return;

    saveHistory();

    level.objects.splice(index, 1);

    level.selected = null;

    updateObjectCount();

}


function moveObject(id, x, y) {

    const object = level.objects.find(obj => obj.id === id);

    if (!object) return;

    object.x = x;
    object.y = y;

}


function undo() {

    if (level.historyIndex <= 0) return;

    level.historyIndex--;

    level.objects = JSON.parse(level.history[level.historyIndex]);

    level.selected = null;

    updateObjectCount();

}


function redo() {

    if (level.historyIndex >= level.history.length - 1) return;

    level.historyIndex++;

    level.objects = JSON.parse(level.history[level.historyIndex]);

    level.selected = null;

    updateObjectCount();

}


function updateObjectCount() {

    document.getElementById("objectCount").textContent =
        "Objects: " + level.objects.length;

}


// Initialize history

saveHistory();
