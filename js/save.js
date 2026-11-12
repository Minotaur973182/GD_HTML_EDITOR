function saveLevel() {

    const data = {

        version: "0.1",

        name: level.name,

        objects: level.objects

    };

    localStorage.setItem(
        "geometryDashEditorSave",
        JSON.stringify(data)
    );

    alert("Level saved!");

}


function loadLevel() {

    const saved = localStorage.getItem(
        "geometryDashEditorSave"
    );

    if (!saved) return;

    try {

        const data = JSON.parse(saved);

        level.name = data.name || "Untitled Level";

        level.objects = data.objects || [];

        level.selected = null;

        level.history = [];
        level.historyIndex = -1;

        saveHistory();

        document.getElementById("levelName").textContent =
            level.name;

        updateObjectCount();

    } catch (error) {

        alert("Could not load saved level.");

    }

}


function exportLevel() {

    const data = {

        version: "0.1",

        name: level.name,

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


function importLevel(file) {

    const reader = new FileReader();

    reader.onload = event => {

        try {

            const data = JSON.parse(event.target.result);

            if (!Array.isArray(data.objects)) {
                throw new Error("Invalid level format");
            }

            for (const object of data.objects) {

                const type = getObjectType(object.type);

                if (
                    !type ||
                    !Number.isFinite(object.x) ||
                    !Number.isFinite(object.y)
                ) {
                    throw new Error("Invalid object data");
                }

            }

            level.name = data.name || "Imported Level";

            level.objects = data.objects.map(object => ({
                ...object,
                id: crypto.randomUUID()
            }));

            level.selected = null;

            level.history = [];
            level.historyIndex = -1;

            saveHistory();

            document.getElementById("levelName").textContent =
                level.name;

            updateObjectCount();

            renderEditor();

            alert("Level imported!");

        } catch (error) {

            alert("Invalid level file.");

        }

    };

    reader.readAsText(file);

}


document.getElementById("saveLevel").addEventListener(
    "click",
    saveLevel
);


document.getElementById("exportLevel").addEventListener(
    "click",
    exportLevel
);


document.getElementById("importLevel").addEventListener(
    "click",
    () => document.getElementById("importFile").click()
);


document.getElementById("importFile").addEventListener(
    "change",
    event => {

        if (event.target.files.length) {
            importLevel(event.target.files[0]);
        }

        event.target.value = "";

    }
);


document.getElementById("newLevel").addEventListener("click", () => {

    if (!confirm("Create a new level? Unsaved changes will be lost.")) {
        return;
    }

    level.objects = [];
    level.name = "Untitled Level";
    level.selected = null;

    level.history = [];
    level.historyIndex = -1;

    saveHistory();

    document.getElementById("levelName").textContent =
        level.name;

    updateObjectCount();

    renderEditor();

});
