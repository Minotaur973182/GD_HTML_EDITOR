const OBJECT_TYPES = {

    blocks: [

        {
            id: "block",
            name: "Block",
            width: 1,
            height: 1,
            color: "#3978c5"
        },

        {
            id: "block2",
            name: "Block 2",
            width: 1,
            height: 1,
            color: "#7450bd"
        },

        {
            id: "halfblock",
            name: "Half Block",
            width: 1,
            height: 0.5,
            color: "#398c9c"
        }

    ],

    spikes: [

        {
            id: "spike",
            name: "Spike",
            width: 1,
            height: 1,
            color: "#e5e5e5"
        }

    ],

    special: [

        {
            id: "start",
            name: "Start Position",
            width: 1,
            height: 1,
            color: "#45cc80"
        }

    ]

};


function getObjectType(id) {

    for (const category of Object.values(OBJECT_TYPES)) {

        const object = category.find(item => item.id === id);

        if (object) {
            return object;
        }

    }

    return null;

}


function drawObject(ctx, object, x, y, size) {

    const type = getObjectType(object.type);

    if (!type) return;

    const width = type.width * size;
    const height = type.height * size;

    const screenY = y - height;


    if (object.type === "spike") {

        ctx.fillStyle = type.color;
        ctx.strokeStyle = "#aab7c5";
        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.moveTo(x, y);
        ctx.lineTo(x + width / 2, screenY);
        ctx.lineTo(x + width, y);

        ctx.closePath();

        ctx.fill();
        ctx.stroke();

    }


    else if (object.type === "start") {

        ctx.fillStyle = "#45cc80";
        ctx.fillRect(x + width * 0.4, screenY, width * 0.2, height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px Arial";
        ctx.fillText("START", x - 5, screenY - 8);

    }


    else {

        ctx.fillStyle = type.color;
        ctx.fillRect(x, screenY, width, height);

        ctx.strokeStyle = "#172d48";
        ctx.lineWidth = 2;

        ctx.strokeRect(x, screenY, width, height);

        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(x + 3, screenY + 3);
        ctx.lineTo(x + width - 3, screenY + 3);
        ctx.stroke();

    }

}
