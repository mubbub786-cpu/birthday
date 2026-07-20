const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 420;
canvas.height = 500;

const startX = canvas.width / 2;
const startY = canvas.height - 40;
const trunkHeight = 110;
const buttonStartY = canvas.height / 2 - 40; 

const colors = [
    '#ff0a54', '#ff477e', '#ff7096', '#ff85a1', 
    '#f72585', '#ff3366', '#e63946',           
    '#ffb703', '#fb8500', '#ffe494'            
];

let leaves = [];
let ballY = buttonStartY; 
let ballSpeed = 1; 
let stage = 'waiting'; 
let trunkProgress = 0;
let dynamicCharSpeed = 80; 
let isAnimationActive = true; 

const textLines = [
    { text: "Hey Sarah...✨" },
    { text: "My beloved Bestie ... 💓" },
    { text: "Tumhe janam din bohot bohot badhai ho ... 🫠💞" },
    { text: "Bhagwan kare tum hamesha khush raho ... 💕" },
    { text: "Tumhe zindagi me bohot sari khushiya mile ... 💫" },
    { text: "Zindagi ke is haseen safar me tumhe bohot sare khushi ke pal mile ," },
    { text: "naye log , naye lamhe our naye dost jo sabse behtar ho ..✨" },
    { text: "And at last ," },
    { text: "You are the bestest friend I ever meet in my life 💓" },
    { text: "And thank you for being a part of my life .... 💖🥀" },
    { text: "Once again , from the bottom of the heart ❤️ Happy Birthday day 🎉🎉🎊" }
];

const totalChars = textLines.reduce((acc, line) => acc + line.text.length, 0);

document.getElementById('heartBtn').addEventListener('click', () => {
    const music = document.getElementById('bgMusic');
    music.loop = false; 

    const messagePanel = document.querySelector('.message-panel');
    messagePanel.innerHTML = ''; 
    
    textLines.forEach((line, index) => {
        const p = document.createElement('p');
        p.id = `dynamic_l_${index}`;
        // Enforcing white/pink color styling directly via code to fix color issue
        p.style.color = '#fff0f3';
        p.style.textShadow = '0 0 8px rgba(255, 71, 126, 0.6)';
        p.style.margin = '10px 0';
        p.style.fontSize = '16px';
        p.style.fontFamily = 'Arial, sans-serif';
        messagePanel.appendChild(p);
    });
    
    music.play().then(() => {
        const typingTimeAvailable = 35; 
        dynamicCharSpeed = (typingTimeAvailable * 1000) / totalChars;
    }).catch(error => {
        console.log("Audio play blocked:", error);
    });

    setTimeout(() => {
        music.pause();
        music.currentTime = 0; 
        isAnimationActive = false; 
    }, 50000); 

    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('mainWorkspace').classList.remove('hidden');
    
    stage = 'ballDropping';
    initHeartCanopy();
    animateSequence();
});

function runTypewriter(lineIdx, charIdx) {
    if (!isAnimationActive) return; 

    if (lineIdx < textLines.length) {
        const lineData = textLines[lineIdx];
        const targetElement = document.getElementById(`dynamic_l_${lineIdx}`);
        
        if (targetElement && charIdx < lineData.text.length) {
            if(lineIdx === textLines.length - 1) {
                targetElement.innerHTML = lineData.text.substring(0, charIdx + 1) + '<span class="cursor" style="color:#ff477e;">|</span>';
            } else {
                targetElement.innerHTML = lineData.text.substring(0, charIdx + 1);
            }
            setTimeout(() => runTypewriter(lineIdx, charIdx + 1), dynamicCharSpeed);
        } else {
            setTimeout(() => runTypewriter(lineIdx + 1, 0), dynamicCharSpeed * 2);
        }
    }
}

function initHeartCanopy() {
    const heartCount = 780;
    const centerX = startX;
    const centerY = startY - trunkHeight - 85; 

    for (let i = 0; i < heartCount; i++) {
        const t = Math.random() * Math.PI * 2;
        const scaleX = 7.5;
        const scaleY = 7.5;
        let targetX = 16 * Math.pow(Math.sin(t), 3) * scaleX;
        let targetY = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scaleY;

        const scatter = Math.random();
        targetX *= scatter;
        targetY *= scatter;

        leaves.push({
            x: centerX + targetX,
            y: centerY - targetY,
            maxSize: Math.random() * 5.5 + 4,
            size: 0,
            color: colors[Math.floor(Math.random() * colors.length)],
            delay: Math.random() * 260, 
            scale: 0
        });
    }
}

function drawMiniHeart(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
    ctx.bezierCurveTo(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
    ctx.closePath();
    ctx.fill();
}

function animateSequence() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (stage === 'ballDropping') {
        ballY += ballSpeed;
        ballSpeed += 0.35; 

        ctx.fillStyle = '#ffccd5';
        ctx.beginPath();
        ctx.arc(startX, ballY, 11, 0, Math.PI * 2);
        ctx.fill();

        if (ballY >= startY) {
            stage = 'trunkGrowing';
        }
    }

    if (stage === 'trunkGrowing' || stage === 'canopyBlooming' || stage === 'shifting' || stage === 'typing') {
        if (stage === 'trunkGrowing') {
            trunkProgress += 0.018; 
            if (trunkProgress >= 1) {
                stage = 'canopyBlooming';
            }
        }
        
        ctx.fillStyle = '#ffccd5';
        ctx.beginPath();
        const currentHeight = trunkHeight * Math.min(trunkProgress, 1);
        ctx.moveTo(startX - 11, startY);
        ctx.lineTo(startX - 5, startY - currentHeight);
        ctx.lineTo(startX + 5, startY - currentHeight);
        ctx.lineTo(startX + 11, startY);
        ctx.closePath();
        ctx.fill();
    }

    if (stage === 'canopyBlooming' || stage === 'shifting' || stage === 'typing') {
        let allBloomed = true;
        
        leaves.forEach(l => {
            if (l.delay > 0) {
                l.delay--;
                allBloomed = false;
                return;
            }
            if (l.scale < 1) {
                l.scale += 0.009; 
                l.size = l.maxSize * l.scale;
                allBloomed = false;
            }
            if (l.size > 0) {
                drawMiniHeart(l.x, l.y, l.size, l.color);
            }
        });

        if (allBloomed && stage === 'canopyBlooming') {
            stage = 'shifting';
            
            const canvasPanel = document.querySelector('.canvas-panel');
            const messagePanel = document.querySelector('.message-panel');
            
            canvasPanel.classList.add('shift-right');
            
            setTimeout(() => {
                messagePanel.classList.add('show');
                stage = 'typing';
                runTypewriter(0, 0);
            }, 1000); 
        }
    }

    requestAnimationFrame(animateSequence);
}
