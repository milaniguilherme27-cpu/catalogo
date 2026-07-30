//=====================================================
// CONFIGURAÇÕES
//=====================================================

const API = "https://script.google.com/macros/s/AKfycbz-dkjLRjj_SZ5IoJa0a5FHhuDUGiWhABw92if24ZK8Zjb0K4xl0Wos38sAYw2sBCHw/exec";

const BASE_IMAGENS = "https://raw.githubusercontent.com/milaniguilherme27-cpu/acessorios-utensilios/main/img/";

const TELEFONE = "5518996926192";

//=====================================================

let produtos = [];

//=====================================================
// CARREGA PRODUTOS
//=====================================================

async function carregarProdutos() {

    try {

        const cache = localStorage.getItem("catalogo");

        if (cache) {

            produtos = JSON.parse(cache);
            mostrar(produtos);

        }

        const resposta = await fetch(API);

        if (!resposta.ok) {
            throw new Error("Erro ao acessar API.");
        }

        produtos = await resposta.json();
        preencherFiltroSecao();

        localStorage.setItem("catalogo", JSON.stringify(produtos));

        mostrar(produtos);

    } catch (erro) {

        console.error("Erro:", erro);

    }

}

carregarProdutos();

//=====================================================
// MOSTRAR PRODUTOS
//=====================================================

function mostrar(lista) {

    const container = document.getElementById("produtos");

    let html = "";

    lista.forEach(prod => {

        //------------------------------------------------
        // PREÇO
        //------------------------------------------------

        let preco = "";

        if (prod["PREÇO"] != null && !isNaN(prod["PREÇO"])) {

            preco = Number(prod["PREÇO"]).toLocaleString("pt-BR", {

                style: "currency",

                currency: "BRL"

            });

        }

        //------------------------------------------------
        // IMAGEM
        //------------------------------------------------

        const imagem = prod.IMAGEM

            ? BASE_IMAGENS + prod.IMAGEM

            : "https://via.placeholder.com/400x400?text=Sem+Imagem";

        //------------------------------------------------
        // ESTOQUE
        //------------------------------------------------

        const estoque = Number(prod.ESTOQUE);

        const estoqueTexto = estoque > 0

            ? `<span style="color:#3ddc84;font-weight:bold;">Em estoque: ${estoque}</span>`

            : `<span style="color:#ff4444;font-weight:bold;">Esgotado</span>`;

        //------------------------------------------------
        // CARD
        //------------------------------------------------

        html += `

        <div class="card">

            <img
                loading="lazy"
                class="produto-img"
                src="${imagem}"
                alt="${prod.DESCRIÇÃO}"
                onerror="this.src='https://via.placeholder.com/400x400?text=Sem+Imagem'">

            <div class="card-body">

                <h2>${prod.DESCRIÇÃO}</h2>

                <p><strong>Categoria:</strong> ${prod.SEÇÃO}</p>

                <p>${estoqueTexto}</p>

                <div class="preco">

                    ${preco}

                </div>

                <button onclick="comprar('${prod.DESCRIÇÃO}')">

                    Comprar pelo WhatsApp

                </button>

            </div>

        </div>

        `;

    });

    container.innerHTML = html;

}

function preencherFiltroSecao() {

    const select = document.getElementById("filtroSecao");

    const secoes = [...new Set(produtos.map(p => p.SEÇÃO))];

    secoes.sort();

    secoes.forEach(secao => {

        const option = document.createElement("option");

        option.value = secao;

        option.textContent = secao;

        select.appendChild(option);

    });

}

//=====================================================
// PESQUISA
//=====================================================

function aplicarFiltros() {

    const texto = document
        .getElementById("pesquisa")
        .value
        .toLowerCase()
        .trim();

    const secao = document
        .getElementById("filtroSecao")
        .value;

    const resultado = produtos.filter(prod => {

        const descricao = String(prod.DESCRIÇÃO).toLowerCase();

        const passouPesquisa =
            descricao.includes(texto);

        const passouSecao =
            secao === "" || prod.SEÇÃO === secao;

        return passouPesquisa && passouSecao;

    });

    mostrar(resultado);

}

document
    .getElementById("pesquisa")
    .addEventListener("input", aplicarFiltros);

document
    .getElementById("filtroSecao")
    .addEventListener("change", aplicarFiltros);

//=====================================================
// WHATSAPP
//=====================================================

function comprar(produto) {

    const mensagem =
`Olá! Tenho interesse no produto:

${produto}

Vi este produto no catálogo da Venda Tupy.`;

    const url =
`https://wa.me/${TELEFONE}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank");

}
