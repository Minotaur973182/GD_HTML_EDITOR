function initializeEditor() {

    resizeCanvas();

    loadLevel();

    updateObjectCount();

    updateZoom();

    loadObjectCategory("blocks");

    renderEditor();

    console.log("Geometry Dash Editor initialized.");

}


initializeEditor();
