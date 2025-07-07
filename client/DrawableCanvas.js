export default function DrawableCanvas(canvas, socket) {

    this.canDraw = false;
    this.color = 'black';

    this.setColor = (newColor) => {
        this.color = newColor;
    };

    this.clearCanvas = function () {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    let prevPosition = null;

    canvas.addEventListener('mousemove', e => {
        if (e.buttons !== 1 || !this.canDraw) {
            prevPosition = null;
            return;
        }

        const newPosition = { x: e.layerX, y: e.layerY };
        if (prevPosition != null) {
            drawLine(prevPosition, newPosition, this.color);

            socket.emit('draw', {
                start: normalizeCoordinates(prevPosition),
                end: normalizeCoordinates(newPosition),
                color: this.color
            });
        }
        prevPosition = newPosition;
    });

    canvas.addEventListener('mouseleave', () => (prevPosition = null));

    socket.on('draw-line', (start, end, color) => {
        drawLine(toCanvasSpace(start), toCanvasSpace(end), color);
    });

    function drawLine(start, end, color) {
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }

    function normalizeCoordinates(position) {
        return {
            x: position.x / canvas.width,
            y: position.y / canvas.height
        };
    }

    function toCanvasSpace(position) {
        return {
            x: position.x * canvas.width,
            y: position.y * canvas.height
        };
    }
}
