const SAVE_KEY = "geometryDashEditorSave";


/* SAVE */

function saveLevel() {

    level.name = document.getElementById("levelName").value;

    const data = {

        name: level.name,

        objects: level.objects

    };

    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(data)
    );

    document.getElementById("statusText").textContent =
        "LEVEL SAVED";

}


/* LOAD */

function loadLevel() {

    const saved = localStorage.getItem(SAVE_KEY);

    if (!saved) return;

    try {

        const data = JSON.parse(saved);

        if (!data || !Array.isArray(data.objects)) {
            return;
        }

        level.name = data.name || "Untitled Level";

        level.objects = data.objects.filter(object => {

            return (
                getObjectType(object.type) &&
                Number.isFinite(object.x) &&
                Number.isFinite(object.y)
            );

        }).map(object => ({

            id: object.id || crypto.randomUUID(),

            type: object.type,

            x: object.x,

            y: object.y

        }));

        document.getElementById("levelName").value = level.name;

        level.selected = null;

        level.history = [];

        level.historyIndex = -1;

        saveHistory();

        updateObjectCount();

    }

    catch (error) {

        console.error("Could not load saved level:", error);

    }

}


/* EXPORT */

function exportLevel() {

    const data = {

        name: document.getElementById("levelName").value,

        objects: level.objects

    };

    const blob = new Blob(
        [JSON.stringify(data, null, 4)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "level.json";

    link.click();

    URL.revokeObjectURL(url);

}


/* IMPORT */

function importLevel(file) {

    const reader = new FileReader();

    reader.onload = () => {

        try {

            const data = JSON.parse(reader.result);

            if (!data || !Array.isArray(data.objects)) {

                alert("Invalid level file.");

                return;

            }


            const importedObjects = [];

            for (const object of data.objects) {

                if (
                    !getObjectType(object.type) ||
                    !Number.isFinite(object.x) ||
                    !Number.isFinite(object.y)
                ) {
                    continue;
                }

                importedObjects.push({

                    id: crypto.randomUUID(),

                    type: object.type,

                    x: object.x,

                    y: Math.max(0, object.y)

                });

            }


            level.objects = importedObjects;

            level.name = data.name || "Imported Level";

            level.selected = null;

            document.getElementById("levelName").value = level.name;

            level.history = [];

            level.historyIndex = -1;

            saveHistory();

            updateObjectCount();

            renderEditor();

            document.getElementById("statusText").textContent =
                "LEVEL IMPORTED";

        }

        catch (error) {

            alert("Could not import this level.");

            console.error(error);

        }

    };

    reader.readAsText(file);

}


/* BUTTONS */

document.getElementById("saveLevel").addEventListener("click", () => {

    saveLevel();

});


document.getElementById("exportLevel").addEventListener("click", () => {

    exportLevel();

});


document.getElementById("importLevel").addEventListener("click", () => {

    document.getElementById("fileInput").click();

});


document.getElementById("fileInput").addEventListener("change", event => {

    const file = event.target.files[0];

    if (file) {

        importLevel(file);

        event.target.value = "";

    }

});


/* NEW LEVEL */

document.getElementById("newLevel").addEventListener("click", () => {

    if (!confirm("Create a new level? Unsaved changes will be lost.")) {
        return;
    }

    level.objects = [];

    level.selected = null;

    level.name = "Untitled Level";

    document.getElementById("levelName").value = level.name;

    level.history = [];

    level.historyIndex = -1;

    saveHistory();

    updateObjectCount();

    renderEditor();

});


/* LEVEL NAME */

document.getElementById("levelName").addEventListener("input", event => {

    level.name = event.target.value;

});
