import * as readline from "readline";
import * as fs from "fs";
import * as path from "path";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

interface Transacao {
  id: number;
  tipo: "Renda" | "Gasto";
  categoria: string;
  valor: number;
  data: string;
}

interface EstadoApp {
  saldo: number;
  totalRenda: number;
  totalGasto: number;
  transacoes: Transacao[];
  proximoId: number;
}

const ARQUIVO_DADOS = path.join(__dirname, "..", "data.json");

const estado: EstadoApp = {
  saldo: 0,
  totalRenda: 0,
  totalGasto: 0,
  transacoes: [],
  proximoId: 1,
};

function carregarDados() {
  try {
    if (fs.existsSync(ARQUIVO_DADOS)) {
      const conteudo = fs.readFileSync(ARQUIVO_DADOS, "utf-8");
      const dados = JSON.parse(conteudo) as Partial<EstadoApp>;
      if (dados.saldo !== undefined) estado.saldo = dados.saldo;
      if (dados.totalRenda !== undefined) estado.totalRenda = dados.totalRenda;
      if (dados.totalGasto !== undefined) estado.totalGasto = dados.totalGasto;
      if (dados.transacoes) estado.transacoes = dados.transacoes;
      if (dados.proximoId !== undefined) estado.proximoId = dados.proximoId;
      console.log("Dados carregados com sucesso.");
    }
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
  }
}

function salvarDados() {
  try {
    fs.writeFileSync(ARQUIVO_DADOS, JSON.stringify(estado, null, 2), "utf-8");
  } catch (erro) {
    console.error("Erro ao salvar dados:", erro);
  }
}

function formatarCategoria(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obterDataAtual() {
  const data = new Date();
  return data.toLocaleDateString("pt-BR");
}

function gerarId(): number {
  const id = estado.proximoId;
  estado.proximoId += 1;
  return id;
}

function validarValor(valor: number): boolean {
  return Number.isFinite(valor) && valor > 0;
}

function validarCategoria(categoria: string): boolean {
  return categoria.trim().length > 0;
}

function parseValorMoeda(texto: string): number | null {
  const valor = Number(texto.replace(",", "."));
  return Number.isFinite(valor) ? valor : null;
}

function cadastrarRenda(valor: number, categoria: string) {
  if (!validarValor(valor)) {
    console.log("\nValor inválido! Informe um número maior que zero.");
    menu();
    return;
  }
  if (!validarCategoria(categoria)) {
    console.log("\nCategoria inválida! Informe uma categoria.");
    menu();
    return;
  }

  categoria = formatarCategoria(categoria);
  estado.saldo += valor;
  estado.totalRenda += valor;
  const data = obterDataAtual();
  const id = gerarId();
  estado.transacoes.push({
    id,
    tipo: "Renda",
    categoria,
    valor,
    data,
  });
  salvarDados();
  console.log("\nRenda cadastrada!");
  menu();
}

function cadastrarGasto(valor: number, categoria: string) {
  if (!validarValor(valor)) {
    console.log("\nValor inválido! Informe um número maior que zero.");
    menu();
    return;
  }
  if (!validarCategoria(categoria)) {
    console.log("\nCategoria inválida! Informe uma categoria.");
    menu();
    return;
  }

  categoria = formatarCategoria(categoria);
  estado.saldo -= valor;
  estado.totalGasto += valor;
  const data = obterDataAtual();
  const id = gerarId();
  estado.transacoes.push({
    id,
    tipo: "Gasto",
    categoria,
    valor,
    data,
  });
  salvarDados();
  console.log("\nGasto cadastrado!");
  menu();
}

function mostrarSaldo() {
  console.log("\n===== SALDO =====");
  console.log(`Total de renda: R$${estado.totalRenda.toFixed(2)}`);
  console.log(`Total de gasto: R$${estado.totalGasto.toFixed(2)}`);
  console.log(`Saldo atual: R$${estado.saldo.toFixed(2)}`);
  menu();
}

function mostrarExtrato() {
  console.log("\n===== EXTRATO =====");
  if (estado.transacoes.length === 0) {
    console.log("Nenhuma transação encontrada.");
  } else {
    for (const t of estado.transacoes) {
      const sinal = t.tipo === "Renda" ? "+" : "-";
      console.log(
        `${t.id} - ${t.tipo} | ${t.categoria} | ${sinal}R$${t.valor.toFixed(2)} | ${t.data}`
      );
    }
  }
  menu();
}

function pesquisarCategoria(categoria: string) {
  categoria = formatarCategoria(categoria);
  console.log(`\n===== PESQUISA: ${categoria} =====`);
  const encontrados = estado.transacoes.filter((t) =>
    t.categoria.includes(categoria)
  );
  if (encontrados.length === 0) {
    console.log("Nenhuma transação encontrada para essa categoria.");
  } else {
    for (const t of encontrados) {
      const sinal = t.tipo === "Renda" ? "+" : "-";
      console.log(
        `${t.id} - ${t.tipo} | ${t.categoria} | ${sinal}R$${t.valor.toFixed(2)} | ${t.data}`
      );
    }
  }
  menu();
}

function simularInvestimento(valor: number, meses: number) {
  if (!validarValor(valor)) {
    console.log("\nValor inválido! Informe um número maior que zero.");
    menu();
    return;
  }
  if (valor > estado.saldo) {
    console.log("\nSaldo insuficiente!");
    menu();
    return;
  }
  if (!Number.isInteger(meses) || meses < 1 || meses > 120) {
    console.log("\nQuantidade de meses inválida! Informe um número inteiro entre 1 e 120.");
    menu();
    return;
  }

  const taxaSelic = 0.014;
  console.log("\n===== SIMULAÇÃO SELIC =====");
  console.log(`Valor investido: R$${valor.toFixed(2)}`);
  console.log(`Quantidade de meses: ${meses}`);
  let rendimento = valor;
  for (let mes = 1; mes <= meses; mes++) {
    rendimento += rendimento * taxaSelic;
    console.log(`Mês ${mes} -> R$${rendimento.toFixed(2)}`);
  }
  menu();
}

function deletarTransacao(id: number) {
  const indice = estado.transacoes.findIndex((t) => t.id === id);
  if (indice === -1) {
    console.log("\nTransação não encontrada!");
    menu();
    return;
  }

  const transacao = estado.transacoes[indice];
  if (!transacao) {
    console.log("\nTransação não encontrada!");
    menu();
    return;
  }
  if (transacao.tipo === "Renda") {
    estado.saldo -= transacao.valor;
    estado.totalRenda -= transacao.valor;
  } else {
    estado.saldo += transacao.valor;
    estado.totalGasto -= transacao.valor;
  }

  estado.transacoes.splice(indice, 1);
  salvarDados();
  console.log("\nTransação removida!");
  menu();
}

function menu() {
  console.log("\n===== SISTEMA FINANCEIRO =====");
  console.log("1 - Cadastrar renda");
  console.log("2 - Cadastrar gasto");
  console.log("3 - Mostrar saldo");
  console.log("4 - Mostrar extrato");
  console.log("5 - Pesquisar categoria");
  console.log("6 - Deletar transação");
  console.log("7 - Simular investimento");
  console.log("8 - Sair");

  rl.question("\nEscolha uma opção: ", (opcao: string) => {
    switch (opcao) {
      case "1":
        rl.question("Digite o valor da renda: ", (valor: string) => {
          const valorNumerico = parseValorMoeda(valor);
          if (valorNumerico === null) {
            console.log("\nValor inválido! Informe um número maior que zero.");
            menu();
            return;
          }
          rl.question("Digite a categoria: ", (categoria: string) => {
            cadastrarRenda(valorNumerico, categoria);
          });
        });
        break;

      case "2":
        rl.question("Digite o valor do gasto: ", (valor: string) => {
          const valorNumerico = parseValorMoeda(valor);
          if (valorNumerico === null) {
            console.log("\nValor inválido! Informe um número maior que zero.");
            menu();
            return;
          }
          rl.question("Digite a categoria: ", (categoria: string) => {
            cadastrarGasto(valorNumerico, categoria);
          });
        });
        break;

      case "3":
        mostrarSaldo();
        break;

      case "4":
        mostrarExtrato();
        break;

      case "5":
        rl.question("Digite a categoria: ", (categoria: string) => {
          pesquisarCategoria(categoria);
        });
        break;

      case "6":
        console.log("\n===== EXTRATO =====");
        for (const t of estado.transacoes) {
          const sinal = t.tipo === "Renda" ? "+" : "-";
          console.log(
            `${t.id} - ${t.tipo} | ${t.categoria} | ${sinal}R$${t.valor.toFixed(2)} | ${t.data}`
          );
        }
        rl.question(
          "\nDigite o ID da transação: ",
          (numero: string) => {
            deletarTransacao(Number(numero));
          }
        );
        break;

      case "7":
        rl.question("Digite o valor para investir: ", (valor: string) => {
          const valorNumerico = parseValorMoeda(valor);
          if (valorNumerico === null) {
            console.log("\nValor inválido! Informe um número maior que zero.");
            menu();
            return;
          }
          rl.question("Digite a quantidade de meses (máx. 120): ", (meses: string) => {
            const mesesNumerico = Number(meses);
            simularInvestimento(valorNumerico, mesesNumerico);
          });
        });
        break;

      case "8":
        console.log("\nSistema encerrado.");
        rl.close();
        break;

      default:
        console.log("\nOpção inválida!");
        menu();
        break;
    }
  });
}

carregarDados();
menu();