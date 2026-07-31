//=====================================================
// CATÁLOGO V2 - VENDA TUPY
//=====================================================

//-------------------------
// CONFIGURAÇÕES
//-------------------------

const API = "https://script.google.com/macros/s/AKfycbz-dkjLRjj_SZ5IoJa0a5FHhuDUGiWhABw92if24ZK8Zjb0K4xl0Wos38sAYw2sBCHw/exec";

const BASE_IMAGENS =
"https://raw.githubusercontent.com/milaniguilherme27-cpu/acessorios-utensilios/main/img/";

const TELEFONE = "5518996926192";

const LIMITE = 24;

//-------------------------
// ESTADO DA APLICAÇÃO
//-------------------------

let pagina = 1;

let paginas = 1;

let carregando = false;

let produtos = [];

let filtros = {

    busca: "",

    secao: "",

    ordenar: "descricao",

    estoque: "",

    marca: ""

};

//=====================================================
// INICIALIZAÇÃO
//=====================================================

window.addEventListener("DOMContentLoaded", iniciar);

async function iniciar(){

    await carregarSecoes();

    await carregarProdutos(true);

}

//=====================================================
// CARREGAR PRODUTOS
//=====================================================

async function carregarProdutos(reiniciar=false){

    if(carregando) return;

    carregando = true;

    if(reiniciar){

        pagina = 1;

        produtos = [];

        document.getElementById("produtos").innerHTML="";

    }

    const params = new URLSearchParams({

        pagina:pagina,

        limite:LIMITE,

        catalogo:"SIM",

        busca:filtros.busca,

        secao:filtros.secao,

        ordenar:filtros.ordenar,

        estoque:filtros.estoque,

        marca:filtros.marca

    });

    try{

        const resposta = await fetch(API + "?" + params);

        const dados = await resposta.json();

        paginas = dados.paginas;

        produtos = produtos.concat(dados.produtos);

        mostrarProdutos(dados.produtos);

        atualizarBotaoMais();

    }

    catch(erro){

        console.error(erro);

    }

    carregando=false;

}

//=====================================================
// CARREGAR SEÇÕES
//=====================================================


async function carregarSecoes(){

    try{

        const resposta = await fetch(API + "?acao=secoes");

        const secoes = await resposta.json();

        const select = document.getElementById("filtroSecao");

        select.innerHTML =
            '<option value="">📂 Todas as seções</option>';

        secoes.forEach(sec=>{

            const option=document.createElement("option");

            option.value=sec;

            option.textContent=sec;

            select.appendChild(option);

        });

    }

    catch(erro){

        console.error(erro);

    }

}



//=====================================================
// CARREGAR MAIS
//=====================================================

function carregarMais(){

    if(pagina>=paginas) return;

    pagina++;

    carregarProdutos();

}

//=====================================================
// BOTÃO "CARREGAR MAIS"
//=====================================================

function atualizarBotaoMais(){

    let botao=document.getElementById("mais");

    if(!botao){

        botao=document.createElement("button");

        botao.id="mais";

        botao.innerHTML="Carregar mais produtos";

        botao.onclick=carregarMais;

        document.querySelector("main").appendChild(botao);

    }

    botao.style.display=

        pagina>=paginas

        ?"none"

        :"block";

}

//=====================================================
// RENDERIZAÇÃO DOS PRODUTOS
//=====================================================

function mostrarProdutos(lista){

    const container = document.getElementById("produtos");

    let html = "";

    lista.forEach(prod=>{

        //-------------------------------------------------
        // PREÇO
        //-------------------------------------------------

        let preco = "";

        const valor = Number(
            String(prod["PREÇO"])
                .replace(",",".")
        );

        if(!isNaN(valor)){

            preco = valor.toLocaleString("pt-BR",{

                style:"currency",

                currency:"BRL"

            });

        }

        //-------------------------------------------------
        // IMAGEM
        //-------------------------------------------------

        let imagem="";

        if(prod.IMAGEM){

            imagem = BASE_IMAGENS + encodeURIComponent(prod.IMAGEM);

        }else{

            imagem =
            "https://via.placeholder.com/400x400?text=Sem+Imagem";

        }

        //-------------------------------------------------
        // ESTOQUE
        //-------------------------------------------------

        const estoque = Number(prod.ESTOQUE);

        let textoEstoque="";

        let classeEstoque="";

        if(estoque>0){

            textoEstoque="Em estoque";

            classeEstoque="estoque-ok";

        }else{

            textoEstoque="Produto indisponível";

            classeEstoque="estoque-zero";

        }

        //-------------------------------------------------
        // CARD
        //-------------------------------------------------

        html+=`

        <div class="card">

            <img
                class="produto-img"
                loading="lazy"
                src="${imagem}"
                alt="${prod.DESCRIÇÃO}"
            >

            <div class="card-body">

                <h2>${prod.DESCRIÇÃO}</h2>

                <p>

                    <strong>Categoria:</strong>

                    ${prod.SEÇÃO}

                </p>

                <p class="${classeEstoque}">

                    ${textoEstoque}

                </p>

                <div class="preco">

                    ${preco}

                </div>

                <button
                    onclick="comprar('${prod.DESCRIÇÃO}')"
                    ${estoque==0?"disabled":""}
                >

                    Comprar pelo WhatsApp

                </button>

            </div>

        </div>

        `;

    });

    container.insertAdjacentHTML("beforeend",html);

}

//=====================================================
// LIMPAR PRODUTOS
//=====================================================

function limparProdutos(){

    document.getElementById("produtos").innerHTML="";

}

//=====================================================
// RECARREGAR CATÁLOGO
//=====================================================

function atualizarCatalogo(){

    pagina=1;

    produtos=[];

    limparProdutos();

    carregarProdutos(true);

}

//=====================================================
// PESQUISA
//=====================================================

let timerPesquisa = null;

document
    .getElementById("pesquisa")
    .addEventListener("input", function(){

        clearTimeout(timerPesquisa);

        timerPesquisa = setTimeout(() => {

            filtros.busca = this.value.trim();

            atualizarCatalogo();

        },300);

    });

//=====================================================
// FILTRO POR SEÇÃO
//=====================================================

document
    .getElementById("filtroSecao")
    .addEventListener("change", function(){

        filtros.secao = this.value;

        atualizarCatalogo();

    });

//=====================================================
// WHATSAPP
//=====================================================

function comprar(produto){

    const mensagem =
`Olá!

Tenho interesse no produto:

*${produto}*

Vi este produto no catálogo da Venda Tupy.`;

    const url =
`https://wa.me/${TELEFONE}?text=${encodeURIComponent(mensagem)}`;

    window.open(url,"_blank");

}

//=====================================================
// UTILITÁRIOS
//=====================================================

function formatarPreco(valor){

    valor = Number(
        String(valor)
            .replace(",",".")
    );

    if(isNaN(valor))
        return "";

    return valor.toLocaleString("pt-BR",{

        style:"currency",

        currency:"BRL"

    });

}

//=====================================================
// SCROLL INFINITO
//=====================================================

window.addEventListener("scroll",()=>{

    if(carregando)
        return;

    if(pagina>=paginas)
        return;

    const fimPagina =
        window.innerHeight + window.scrollY;

    const alturaDocumento =
        document.body.offsetHeight;

    if(fimPagina >= alturaDocumento-500){

        carregarMais();

    }

});

//=====================================================
// TRATAMENTO DE ERROS
//=====================================================

window.addEventListener("error",function(e){

    console.error("Erro:",e.message);

});

//=====================================================
// LOG
//=====================================================

console.log("Venda Tupy V2 carregado.");
