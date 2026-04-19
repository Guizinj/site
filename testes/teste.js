// --- 1. CONFIGURAÇÃO INICIAL ---
let carrinho = JSON.parse(localStorage.getItem('theClosetCarrinho')) || [];

function salvarCarrinhoNoNavegador() {
    localStorage.setItem('theClosetCarrinho', JSON.stringify(carrinho));
}

document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById("hamburger");
    const menu = document.getElementById("menu");
    const btnAbrirCarrinho = document.getElementById('abrir-carrinho');
    const sidebar = document.getElementById('carrinho-sidebar');
    const overlay = document.getElementById('overlay');

    atualizarVisualCarrinho();

    // --- LÓGICA DO MENU (Igual anterior) ---
    if (hamburger && menu) {
        hamburger.addEventListener("click", (e) => {
            e.stopPropagation(); 
            menu.classList.toggle("active");
            hamburger.innerHTML = menu.classList.contains("active") ? "&times;" : "&#9776;";
        });
    }

    // --- FECHAR AO CLICAR FORA ---
    document.addEventListener("click", (e) => {
        if (menu && menu.classList.contains("active")) {
            if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
                menu.classList.remove("active");
                hamburger.innerHTML = "&#9776;"; 
            }
        }
    });

    // --- FUNÇÕES DE ABRIR/FECHAR CARRINHO ---
    const toggleCarrinho = () => {
        if(sidebar && overlay) {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    };

    if (btnAbrirCarrinho) btnAbrirCarrinho.onclick = toggleCarrinho;
    if (overlay) overlay.onclick = toggleCarrinho;
    if (document.getElementById('fechar-carrinho')) {
        document.getElementById('fechar-carrinho').onclick = toggleCarrinho;
    }

    // --- ADICIONAR AO CARRINHO (COM LÓGICA DE QUANTIDADE) ---
    document.querySelectorAll('.add-to-cart').forEach(botao => {
        botao.onclick = () => {
            const card = botao.closest('.card-produto');
            const nome = botao.getAttribute('data-nome');
            const preco = parseFloat(botao.getAttribute('data-preco'));
            const img = card.querySelector('img').src; 

            // VERIFICAÇÃO: O item já está no carrinho?
            const itemExistente = carrinho.find(item => item.nome === nome);

            if (itemExistente) {
                // Se já existe, apenas aumenta a quantidade
                itemExistente.quantidade += 1;
            } else {
                // Se é novo, adiciona com quantidade 1
                carrinho.push({ nome, preco, img, quantidade: 1 });
            }
            
            salvarCarrinhoNoNavegador();
            atualizarVisualCarrinho();
            
            sidebar.classList.add('active');
            overlay.classList.add('active');
        };
    });

    // --- FINALIZAR NO WHATSAPP (COM QUANTIDADES) ---
    const btnFinalizar = document.getElementById('finalizar-pedido');
    if (btnFinalizar) {
        btnFinalizar.onclick = () => {
            if (carrinho.length === 0) return alert("Sua sacola está vazia!");

            let mensagem = "*SOLICITAÇÃO DE COMPRA - THE CLOSET RB*\n";
            mensagem += "------------------------------------------\n\n";
            
            carrinho.forEach((item) => {
                const subtotal = item.preco * item.quantidade;
                mensagem += `*${item.quantidade}x* ${item.nome}\n`;
                mensagem += `   Unit: R$ ${item.preco.toFixed(2)} | Sub: R$ ${subtotal.toFixed(2)}\n\n`;
            });
            
            const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
            mensagem += "------------------------------------------\n";
            mensagem += `*TOTAL DO PEDIDO: R$ ${total.toFixed(2)}*\n\n`;
            mensagem += "Olá! Gostaria de verificar a disponibilidade desses itens.";

            const numero = "5581973258150"; 
            window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`, '_blank');
        };
    }
});

// --- ATUALIZAÇÃO VISUAL (MOSTRANDO O "2x") ---
function atualizarVisualCarrinho() {
    const listaCarrinho = document.getElementById('lista-carrinho');
    const totalValor = document.getElementById('total-valor');
    const cartCount = document.getElementById('cart-count');
    
    if(!listaCarrinho) return;

    listaCarrinho.innerHTML = '';
    let totalGeral = 0;
    let totalItens = 0;

    carrinho.forEach((item, index) => {
        const subtotal = item.preco * item.quantidade;
        totalGeral += subtotal;
        totalItens += item.quantidade;

        listaCarrinho.innerHTML += `
            <li class="item-carrinho">
                <img src="${item.img}" class="img-mini">
                <div class="detalhes-item">
                    <p class="nome-item"> ${item.nome} <br> ${item.quantidade}x</p>
                    <p class="preco-item">R$ ${subtotal.toFixed(2)}</p>
                    <button onclick="removerUmItem(${index})" class="btn-remover">Remover</button>
                </div>
            </li>`;
    });

    if (cartCount) cartCount.innerText = totalItens;
    if (totalValor) totalValor.innerText = `R$ ${totalGeral.toFixed(2)}`;
}

// --- REMOVER UM POR UM ---
window.removerUmItem = function(index) {
    if (carrinho[index].quantidade > 1) {
        carrinho[index].quantidade -= 1;
    } else {
        carrinho.splice(index, 1);
    }
    salvarCarrinhoNoNavegador();
    atualizarVisualCarrinho();
};