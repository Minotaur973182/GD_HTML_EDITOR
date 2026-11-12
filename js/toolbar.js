/* OBJECT CATEGORIES */

function loadObjectCategory(category) {

    const container = document.getElementById("objectList");

    container.innerHTML = "";

    const objects = OBJECT_TYPES[category];

    if (!objects) return;


    for (const object of objects) {

        const card = document.createElement("div");

        card.className = "object-card";

        if (selectedObjectType === object.id) {
            card.classList.add("active");
        }

        const preview = document.createElement("div");

        preview.className = "object-preview";

        preview.style.background = object.color;

        if (object.id === "spike") {

            preview.style.clipPath =
                "polygon(50% 0%, 100% 100%, 0% 100%)";

        }

        const name = document.createElement("div");

        name.className = "object-name";

        name.textContent = object.name;


        card.appendChild(preview);
        card.appendChild(name);


        card.addEventListener("click", () => {

            selectedObjectType = object.id;

            activeTool = "place";

            updateToolButtons();

            loadObjectCategory(category);

            renderEditor();

        });


        container.appendChild(card);

    }

}


/* TOOL BUTTONS */

function updateToolButtons() {

    document.querySelectorAll(".tool[data-tool]").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.tool === activeTool
        );

    });

}


/* CATEGORIES */

document.querySelectorAll(".category").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".category").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        loadObjectCategory(button.dataset.category);

    });

});


/* TOOLS */

document.querySelectorAll(".tool[data-tool]").forEach(button => {

    button.addEventListener("click", () => {

        activeTool = button.dataset.tool;

        selectedObjectType = null;

        updateToolButtons();

        loadObjectCategory(
            document.querySelector(".category.active").dataset.category
        );

        renderEditor();

    });

});


/* UNDO AND REDO */

document.getElementById("undoButton").addEventListener("click", () => {

    if (!playtesting) undo();

});


document.getElementById("redoButton").addEventListener("click", () => {

    if (!playtesting) redo();

});


/* ZOOM */

document.getElementById("zoomIn").addEventListener("click", () => {
    zoom(3);
});


document.getElementById("zoomOut").addEventListener("click", () => {
    zoom(-3);
});


/* PLAYTEST BUTTONS */

document.getElementById("playTest").addEventListener("click", () => {

    startPlaytest();

});


document.getElementById("pauseTest").addEventListener("click", () => {

    togglePause();

});


document.getElementById("restartTest").addEventListener("click", () => {

    restartPlaytest();

});


document.getElementById("exitTest").addEventListener("click", () => {

    exitPlaytest();

});


/* KEYBOARD CONTROLS */

window.addEventListener("keydown", event => {

    if (playtesting) {

        if (event.code === "Escape") {

            exitPlaytest();

        }

        return;

    }


    if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
    ) {
        return;
    }


    if (event.code === "Escape") {

        activeTool = "select";

        selectedObjectType = null;

        updateToolButtons();

        loadObjectCategory(
            document.querySelector(".category.active").dataset.category
        );

        renderEditor();

    }


    if (event.code === "Delete" || event.code === "Backspace") {

        if (level.selected) {

            removeObject(level.selected);

            renderEditor();

        }

    }


    if (event.ctrlKey && event.code === "KeyZ") {

        event.preventDefault();

        undo();

    }


    if (event.ctrlKey && event.code === "KeyY") {

        event.preventDefault();

        redo();

    }

});
