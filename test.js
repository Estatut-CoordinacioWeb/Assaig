function project(x, y, z, width, height) {
    x = (x / z + 1) / 2 * width;
    y = (1 - (y / z + 1) / 2) * height;

    return {
        x: x,
        y: y
    }
}

/**
 * 
 * @param {number} width 
 * @param {number} height 
 * @returns {Array<Array<string>>}
 */
function createCanvas(width, height) {
    let canvas = Array(height).fill(null);
    canvas = canvas.map(v => Array(width).fill(" "));

    return canvas;
}

function addLine(canvas, x1, y1, x2, y2) {
    [x1, x2] = [Math.min(x1, x2), Math.max(x1, x2)];
    [y1, y2] = [Math.min(y1, y2), Math.max(y1, y2)];

    while (x1 <= x2 || y1 <= y2) {
        canvas[y1][x1] = "-"
        if (x1 < x2) {
            x1++;
        }
        if (y1 < y2) {
            y1++;
        }
    }
}

function draw(canvas) {
    for (let row of canvas) {
        console.log("|" + row.join(" ") + "|");
    }
}

function clear(canvas) {
    console.clear();
    for (let i = 0; i < canvas.length; i++) {
        for (let j = 0; j < canvas[i].length; j++) {
            canvas[i][j] = " ";
        }
    }
}

function update(canvas, dots) {
    for (let dot of dots) {
        let { x, y } = project(...dot, canvas[0].length, canvas.length);

        canvas[~~y][~~x] = "o";
    }
}

let dots = [
    [-0.5, -0.5, 1],
    [0.5, -0.5, 1],
    [-0.5, 0.5, 1],
    [0.5, 0.5, 1],
    [-0.7, -0.7, 2],
    [0.7, -0.7, 2],
    [-0.7, 0.7, 2],
    [0.7, 0.7, 2],
];

let canvas = createCanvas(30, 20);



async function main() {
    for (let i = 1; i < 100; i++) {
        await new Promise(r => setTimeout(r, 1000 / 3));
        clear(canvas);

        for (let dot of dots) {
            dot[2] = i % 10;
        }

        update(canvas, dots);
        draw(canvas);
    }
}




main();