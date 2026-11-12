const objectList = document.getElementById("objectList");

let currentCategory = "blocks";


function loadObjectCategory(category) {

    currentCategory = category;

    objectList.innerHTML = "";

    document.querySelectorAll(".category").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.category === category
        );

    });


    const objects = OBJECT_TYPES[category];

    objects.forEach(object => {

        const button = document.createElement("button");

        button.className = "object-button";

        const preview = document.createElement("canvas");

        preview.width = 40;
        preview.height = 40;

        preview.className = "object-preview";

        const previewCtx = preview.getContext("2d");

        drawObject(
            previewCtx,
            { type: object.id },
            5,
            32,
            24
        );


        const label = document.createElement("span");

        label.className = "object-label";
        label.textContent = object.name;

        button.appendChild(preview);
        button.appendChild(label);


        button.addEventListener("click", () => {

            selectedObjectType = object.id;

            activeTool = "place";

            updateToolButtons();

            renderEditor();

        });


        objectList.appendChild(button);

    });

}


function updateToolButtons() {

    document.getElementById("selectTool").classList.toggle(
        "active",
        activeTool === "select"
    );

    document.getElementById("deleteTool").classList.toggle(
        "active",
        activeTool === "delete"
    );

}


document.querySelectorAll(".category").forEach(button => {

    button.addEventListener("click", () => {

        loadObjectCategory(button.dataset.category);

    });

});


document.getElementById("selectTool").addEventListener("click", () => {

    activeTool = "select";
    selectedObjectType = null;

    updateToolButtons();
    renderEditor();

});


document.getElementById("deleteTool").addEventListener("click", () => {

    activeTool = "delete";
    selectedObjectType = null;

    updateToolButtons();
    renderEditor();

});


document.getElementById("undo").addEventListener("click", () => {

    undo();
    renderEditor();

});


document.getElementById("redo").addEventListener("click", () => {

    redo();
    renderEditor();

});


document.getElementById("zoomIn").addEventListener("click", () => {

    zoom(5);

});


document.getElementById("zoomOut").addEventListener("click", () => {

    zoom(-5);

});


document.addEventListener("keydown", event => {

    if (event.target.matches("input, textarea")) return;

    if (event.key === "Escape") {

        activeTool = "select";
        selectedObjectType = null;

        updateToolButtons();
        renderEditor();

    }

    if (event.key === "Delete" || event.key === "Backspace") {

        if (level.selected) {

            removeObject(level.selected);
            renderEditor();

        }

    }

    if (event.ctrlKey && event.key.toLowerCase() === "z") {

        event.preventDefault();

        undo();
        renderEditor();

    }

    if (event.ctrlKey && event.key.toLowerCase() === "y") {

        event.preventDefault();

        redo();
        renderEditor();

    }

});


loadObjectCategory("blocks");
