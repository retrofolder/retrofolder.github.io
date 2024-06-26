document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('backgroundCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Canvas context not found!');
        return;
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log('Canvas resized:', canvas.width, canvas.height);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const symbols = ['ip', '.com', '.org', 'www', 'func', 'main', 'cve', 'error', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'ddos', 'access', 'denied', 'root', 'shell', 'hack', 'mail', 'sql'];
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = [];
    const textMap = [];

    for (let x = 0; x < columns; x++) {
        drops[x] = Math.random() * canvas.height;
        textMap[x] = {
            text: symbols[Math.floor(Math.random() * symbols.length)],
            x: x * fontSize + (Math.random() * fontSize - fontSize / 2), // Добавим случайное смещение по горизонтали
        };
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Очистка canvas перед рисованием

        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Увеличенная прозрачность фона
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        console.log('Drawing on canvas');

        ctx.fillStyle = 'rgba(169, 169, 169, 0.6)'; // Менее отвлекающий цвет
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const { text, x } = textMap[i];
            ctx.fillText(text, x, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
                textMap[i].text = symbols[Math.floor(Math.random() * symbols.length)]; // Меняем текст при перезапуске
            }

            if (Math.random() > 0.991) { // Случайное исчезновение с малой вероятностью
                textMap[i].text = '';
            }

            drops[i] += 0.25; // Еще более медленное падение
        }
    }

    setInterval(draw, 50); // Увеличиваем интервал для плавности
});
