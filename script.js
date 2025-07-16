const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Ajusta o tamanho do canvas para a tela
let raioBase = 25;
function ajustarCanvas() {
    const main = document.getElementById('jogo');
    canvas.width = main.clientWidth;
    canvas.height = main.clientHeight;
     // Ajusta o raio base
    if (canvas.width < 600) {
        raioBase = 15;  // menor para celular
    } else {
        raioBase = 20;  // maior para computador
    }
}

function criarCelulaPrincipal() {
    return {
        x: 100,
        y: 100,
        raio: raioBase,
        cor: 'blue',
        corContorno: '#00ffff', // Azul neon
        grossuraContorno: 3,
        vel: 5,
        teclas: {}
    };
}

const npcs = [];
const quantNPCs = 10;

function criarNPCs() {
    for (let i = 0; i < quantNPCs; i++) {
        npcs.push({
            x: Math.random() * (canvas.width - 50) + 25,
            y: Math.random() * (canvas.height - 50) + 25,
            raio: raioBase,
            cor: 'blue',
            vel: 5,
            dirX: (Math.random() - 0.5) * 2,
            dirY: (Math.random() - 0.5) * 2,
            mudarDirContador: 0,
            limiteParaMudarDir: Math.random() * 100
        });
    }
}

function limparTela() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function desenharCelula(c) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.raio, 0, Math.PI * 2);
    ctx.fillStyle = c.cor;
    ctx.fill();
    if (c === celula) {
        ctx.shadowColor = c.corContorno;
        ctx.shadowBlur = 15;
        ctx.strokeStyle = c.corContorno;
        ctx.lineWidth = 4;
        ctx.stroke();
    }
    ctx.closePath();
}

function desenharTudo() {
    for (let npc of npcs) {
        desenharCelula(npc);
    }
    desenharCelula(celula);
}

function estaColidindo(a, b) {
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    return dist < (a.raio + b.raio);
}

function moverCelula() {
    // Guarda posição anterior
    let anteriorX = celula.x;
    let anteriorY = celula.y;

    // Guarda estado de movimentação anterior
    let anterior_arrowright = celula.teclas['arrowright'];
    let anterior_arrowleft = celula.teclas['arrowleft'];
    let anterior_arrowup = celula.teclas['arrowup'];
    let anterior_arrowdown = celula.teclas['arrowdown'];

    // Movimentos
    if (celula.teclas['arrowup']) celula.y -= celula.vel;
    if (celula.teclas['arrowdown']) celula.y += celula.vel;
    if (celula.teclas['arrowleft']) celula.x -= celula.vel;
    if (celula.teclas['arrowright']) celula.x += celula.vel;

    // Limites da tela
    celula.x = Math.max(celula.raio, Math.min(canvas.width - celula.raio, celula.x));
    celula.y = Math.max(celula.raio, Math.min(canvas.height - celula.raio, celula.y));

    // Verifica colisão
    for (let npc of npcs) {
        if (estaColidindo(celula, npc)) {
            // colidiu? volta para onde estava
            celula.x = anteriorX;
            celula.y = anteriorY;

            // contornando as células
            if (celula.teclas['arrowup'] || celula.teclas['arrowdown']) {
                celula.teclas['arrowright'] = false;
                celula.teclas['arrowleft'] = false;
                if (celula.x > npc.x) celula.x += celula.vel / 2;
                if (celula.x < npc.x) celula.x -= celula.vel / 2;
            }
            if (celula.teclas['arrowright'] || celula.teclas['arrowleft']) {
                celula.teclas['arrowup'] = false;
                celula.teclas['arrowdown'] = false;
                if (celula.y < npc.y) celula.y -= celula.vel / 2;
                if (celula.y > npc.y) celula.y += celula.vel / 2;
            }

            // Limites
            celula.x = Math.max(celula.raio, Math.min(canvas.width - celula.raio, celula.x));
            celula.y = Math.max(celula.raio, Math.min(canvas.height - celula.raio, celula.y));
        }
    }
    
    celula.teclas['arrowright'] = anterior_arrowright;
    celula.teclas['arrowleft'] = anterior_arrowleft;
    celula.teclas['arrowup'] = anterior_arrowup;
    celula.teclas['arrowdown'] = anterior_arrowdown;
}

function moverNPC(npc, indice) {
    // Guarda posição anterior
    let anteriorX = npc.x;
    let anteriorY = npc.y;

    // Anda na direção atual
    npc.x += npc.dirX * npc.vel;
    npc.y += npc.dirY * npc.vel;

    // Limites da tela
    npc.x = Math.max(npc.raio, Math.min(canvas.width - npc.raio, npc.x));
    npc.y = Math.max(npc.raio, Math.min(canvas.height - npc.raio, npc.y));

    // Colisão com PLAYER
    if (estaColidindo(npc, celula)) {
        npc.x = anteriorX;
        npc.y = anteriorY;

        if (npc.dirY !== 0) {
            if (npc.x > celula.x) npc.x += npc.vel / 2;
            if (npc.x < celula.x) npc.x -= npc.vel / 2;
        }
        if (npc.dirX !== 0) {
            if (npc.y > celula.y) npc.y += npc.vel / 2;
            if (npc.y < celula.y) npc.y -= npc.vel / 2;
        }

        // Limites da tela
        npc.x = Math.max(npc.raio, Math.min(canvas.width - npc.raio, npc.x));
        npc.y = Math.max(npc.raio, Math.min(canvas.height - npc.raio, npc.y));
    }

    // Colisão com OUTROS NPCs
    for (let j = 0; j < npcs.length; j++) {
        if (j === indice) continue;
        const outro = npcs[j];
        if (estaColidindo(npc, outro)) {
            npc.x = anteriorX;
            npc.y = anteriorY;

            if (npc.dirY !== 0 && npc.x !== outro.x) {
                if (npc.x > outro.x) npc.x += npc.vel / 2;
                if (npc.x < outro.x) npc.x -= npc.vel / 2;
            }
            if (npc.dirX !== 0 && npc.y !== outro.y) {
                if (npc.y > outro.y) npc.y += npc.vel / 2;
                if (npc.y < outro.y) npc.y -= npc.vel / 2;
            }

            // Limites da tela
            npc.x = Math.max(npc.raio, Math.min(canvas.width - npc.raio, npc.x));
            npc.y = Math.max(npc.raio, Math.min(canvas.height - npc.raio, npc.y));
        }
    }

    // Mudar direção de vez em quando
    npc.mudarDirContador++;
    if (npc.mudarDirContador > npc.limiteParaMudarDir) {
        npc.limiteParaMudarDir = Math.random() * 100;
        npc.dirX = (Math.random() - 0.5) * 2;
        npc.dirY = (Math.random() - 0.5) * 2;
        npc.mudarDirContador = 0;
    }
}

function moverTodosNPCs() {
    for (let i = 0; i < npcs.length; i++) {
        moverNPC(npcs[i], i);
    }
}

// Evento de teclado
// Escuta pressionar
document.addEventListener('keydown', (e) => {
  celula.teclas[e.key.toLowerCase()] = true;
});
// Escuta soltar
document.addEventListener('keyup', (e) => {
  celula.teclas[e.key.toLowerCase()] = false;
});

// Simula pressionar e soltar tecla com toques nos botões
document.querySelectorAll('#controles button').forEach(botao => {
    const direcao = botao.getAttribute('data-direcao');

    botao.addEventListener('touchstart', (e) => {
        e.preventDefault(); // evita clique duplo no mobile
        celula.teclas[direcao] = true;
    });

    botao.addEventListener('touchend', (e) => {
        e.preventDefault();
        celula.teclas[direcao] = false;
    });

    // Suporte opcional para mouse
    botao.addEventListener('mousedown', () => celula.teclas[direcao] = true);
    botao.addEventListener('mouseup', () => celula.teclas[direcao] = false);
    botao.addEventListener('mouseleave', () => celula.teclas[direcao] = false);
});

function rodar_jogo() {
    limparTela();
    moverCelula();
    moverTodosNPCs();
    desenharTudo();
    requestAnimationFrame(rodar_jogo);
}

let celula = {};

// Espera o DOM carregar para garantir que os elementos existam
window.addEventListener('load', () => {
    // Ajusta o canvas ao tamanho da tela
    ajustarCanvas();

    // Cria a célula principal após o canvas ter sido ajustado
    celula = criarCelulaPrincipal();

    // Cria os NPCs APÓS o canvas ter sido ajustado
    criarNPCs();

    // Inicia o jogo só depois disso tudo
    rodar_jogo();
});

window.addEventListener('resize', ajustarCanvas);