const level = {

    name: "Untitled Level",

    objects: [],

    selected: null,

    history: [],

    historyIndex: -1

};


function saveHistory() {

    const snapshot = JSON.stringify(level.objects);

    if (
        level.historyIndex >= 0 &&
        level.history[level.historyIndex] === snapshot
    ) {
        return;
    }

    level.history = level.history.slice(0, level.historyIndex + 1);

    level.history.push(snapshot);

    level.historyIndex = level.history.length - 1;

    if (level.history.length > 100) {

        level.history.shift();
        level.historyIndex--;

    }

}


function addObject(type, x, y) {

    const objectType = getObjectType(type);

    if (!objectType) return;

    const object = {

        id: crypto.randomUUID(),

        type,

        x,

        y

    };

    level.objects.push(object);

    level.selected = object.id;

    saveHistory();

    updateObjectCount();

}


function removeObject(id) {

    level.objects = level.objects.filter(object => object.id !== id);

    if (level.selected === id) {
        level.selected = null;
    }

    saveHistory();

    updateObjectCount();

}


function moveObject(id, x, y) {

    const object = level.objects.find(item => item.id === id);

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
    renderEditor();

}


function redo() {

    if (level.historyIndex >= level.history.length - 1) return;

    level.historyIndex++;

    level.objects = JSON.parse(level.history[level.historyIndex]);

    level.selected = null;

    updateObjectCount();
    renderEditor();

}


function updateObjectCount() {

    document.getElementById("objectCount").textContent =
        "Objects: " + level.objects.length;

}


saveHistory();
