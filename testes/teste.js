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

    // --- LÓGICA DO MENU ---
    if (hamburger && menu) {
        hamburger.addEventListener("click", (e) => {
            e.stopPropagation(); 
            menu.classList.toggle("active");
            hamburger.innerHTML = menu.classList.contains("active") ? "&times;" : "&#9776;";
        });
    }

    // --- FECHAR AO CLICAR EM UM LINK DO MENU (NOVO) ---
    const linksMenu = document.querySelectorAll(".menu a");
    linksMenu.forEach(link => {
        link.addEventListener("click", () => {
            menu.classList.remove("active");
            if (hamburger) hamburger.innerHTML = "&#9776;";
        });
    });

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

    // --- ADICIONAR AO CARRINHO ---
    document.querySelectorAll('.add-to-cart').forEach(botao => {
        botao.onclick = () => {
            const card = botao.closest('.card-produto');
            const nome = botao.getAttribute('data-nome');
            const preco = parseFloat(botao.getAttribute('data-preco'));
            const img = card.querySelector('img').src; 

            const itemExistente = carrinho.find(item => item.nome === nome);

            if (itemExistente) {
                itemExistente.quantidade += 1;
            } else {
                carrinho.push({ nome, preco, img, quantidade: 1 });
            }
            
            salvarCarrinhoNoNavegador();
            atualizarVisualCarrinho();
            
            sidebar.classList.add('active');
            overlay.classList.add('active');
        };
    });



    // --- TROCA DE COR (IMAGEM + NOME) ---
document.querySelectorAll('.card-produto').forEach(card => {

    const img = card.querySelector('.img-produto');
    const nomeTitulo = card.querySelector('.nome-produto');
    const botao = card.querySelector('.add-to-cart');

    card.querySelectorAll('.cor').forEach(cor => {
        cor.addEventListener('click', () => {

            // troca imagem
            const novaImg = cor.getAttribute('data-img');
            img.src = novaImg;

            // troca nome
            const novoNome = cor.getAttribute('data-nome');
            nomeTitulo.innerText = novoNome;

            // atualiza botão (IMPORTANTE pro carrinho)
            botao.setAttribute('data-nome', novoNome);

            // efeito visual (bolinha ativa)
            card.querySelectorAll('.cor').forEach(c => c.classList.remove('ativa'));
            cor.classList.add('ativa');
        });
    });

});



    // --- FINALIZAR NO WHATSAPP ---


    const btnFinalizar = document.getElementById('finalizar-pedido');

    if (btnFinalizar) {
        btnFinalizar.onclick = () => {
            // 1. Verificação de segurança: O carrinho existe e tem itens?
            if (typeof carrinho === 'undefined' || carrinho.length === 0) {
                return alert("Sua sacola de compras ainda está vazia. Que tal escolher algo incrível? ✨");
            }

            // 2. Construção da Mensagem Premium
            let mensagem = "✨ *NOVO PEDIDO - THE CLOSET RB* ✨\n";
            mensagem += "━━━━━━━━━━━━━━━━━━━━━\n\n";
            mensagem += "Olá! Gostaria de finalizar a reserva das seguintes peças:\n\n";
            
            carrinho.forEach((item) => {
                const preco = Number(item.preco); // Garante que é número
                const qtd = Number(item.quantidade);
                const subtotal = preco * qtd;

                mensagem += `🛍️ *${item.nome}*\n`;
                mensagem += `   ${qtd} un. × R$ ${preco.toFixed(2)}\n`;
                mensagem += `   *Subtotal:* R$ ${subtotal.toFixed(2)}\n\n`;
            });
            
            const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
            
            mensagem += "━━━━━━━━━━━━━━━━━━━━━\n";
            mensagem += `💰 *VALOR TOTAL: R$ ${total.toFixed(2)}*\n\n`;
            mensagem += "Aguardo o link para pagamento e a confirmação do meu look! ✨";

            // 3. Configuração do WhatsApp
            const numero = "5581973258150"; 
            const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
            
            // 4. Execução
            window.open(url, '_blank');
        };
    }
});

// --- ATUALIZAÇÃO VISUAL ---
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

const btnLimpar = document.getElementById('limpar-carrinho');

if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
        if (carrinho.length === 0) return;

        const lista = document.getElementById('lista-carrinho');

        // micro animação
        if (lista) {
            lista.style.transition = "opacity 0.2s ease";
            lista.style.opacity = "0.3";
        }

        setTimeout(() => {
            carrinho = [];
            salvarCarrinhoNoNavegador();
            atualizarVisualCarrinho();

            if (lista) lista.style.opacity = "1";
        }, 150);
    });
}





// --- MODAL DE IMAGEM ---
const modal = document.getElementById('modal-img');
const imgGrande = document.getElementById('img-grande');
const fecharModal = document.querySelector('.fechar-modal');

// abrir ao clicar na imagem do card
document.querySelectorAll('.card-produto img').forEach(img => {
    img.addEventListener('click', () => {
        imgGrande.src = img.src;
        modal.classList.add('active');
    });
});

// fechar ao clicar no X
if (fecharModal) {
    fecharModal.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

// fechar clicando fora da imagem
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});