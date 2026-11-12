const OBJECT_TYPES = {

    blocks: [
        {
            id: "block",
            name: "Block",
            width: 1,
            height: 1,
            color: "#43b7d9"
        },
        {
            id: "block2",
            name: "Dark Block",
            width: 1,
            height: 1,
            color: "#367fae"
        },
        {
            id: "halfblock",
            name: "Half Block",
            width: 1,
            height: 0.5,
            color: "#43b7d9"
        }
    ],

    spikes: [
        {
            id: "spike",
            name: "Spike",
            width: 1,
            height: 1,
            color: "#dce9f2"
        }
    ],

    special: [
        {
            id: "start",
            name: "Start Position",
            width: 1,
            height: 1,
            color: "#58df78"
        }
    ]

};


function getObjectType(id) {

    for (const category of Object.values(OBJECT_TYPES)) {

        const object = category.find(item => item.id === id);

        if (object) return object;

    }

    return null;

}


function drawObject(ctx, object, x, y, size) {

    const type = getObjectType(object.type);

    if (!type) return;

    const w = type.width * size;
    const h = type.height * size;

    if (object.type === "spike") {

        ctx.fillStyle = type.color;

        ctx.beginPath();

        ctx.moveTo(x, y);
        ctx.lineTo(x + w / 2, y - h);
        ctx.lineTo(x + w, y);

        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#172c3c";
        ctx.lineWidth = 2;
        ctx.stroke();

    }

    else if (object.type === "start") {

        ctx.fillStyle = "#58df78";
        ctx.fillRect(x, y - h, w, h);

        ctx.strokeStyle = "#b4ffc5";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y - h, w, h);

    }

    else {

        ctx.fillStyle = type.color;
        ctx.fillRect(x, y - h, w, h);

        ctx.strokeStyle = "#17374e";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y - h, w, h);

        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(x + 3, y - h + 3, w - 6, 4);

    }

}
