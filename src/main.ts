import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let saldo = 0;

let totalRenda = 0;

let totalGasto = 0;

let extrato: string[] = [];

let valorInvestido = 0;

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

function cadastrarRenda(valor: number, categoria: string) {

  categoria = formatarCategoria(categoria);

  saldo += valor;

  totalRenda += valor;

  const data = obterDataAtual();

  extrato.push(`Renda | ${categoria} | +R$${valor} | ${data}`);

  console.log("\nRenda cadastrada!");

  menu();
}

function cadastrarGasto(valor: number, categoria: string) {

  categoria = formatarCategoria(categoria);

  saldo -= valor;

  totalGasto += valor;

  const data = obterDataAtual();

  extrato.push(`Gasto | ${categoria} | -R$${valor} | ${data}`);

  console.log("\nGasto cadastrado!");

  menu();
}

function mostrarSaldo() {

  console.log("\n===== SALDO =====");

  console.log(`Total de renda: R$${totalRenda}`);

  console.log(`Total de gasto: R$${totalGasto}`);

  console.log(`Saldo atual: R$${saldo}`);

  menu();
}

function mostrarExtrato() {

  console.log("\n===== EXTRATO =====");

  for (let i = 0; i < extrato.length; i++) {

    console.log(`${i + 1} - ${extrato[i]}`);
  }

  menu();
}

function pesquisarCategoria(categoria: string) {

  categoria = formatarCategoria(categoria);

  console.log(`\n===== PESQUISA: ${categoria} =====`);

  for (const item of extrato) {

    if (item.includes(categoria)) {
      console.log(item);
    }
  }

  menu();
}

function simularInvestimento(valor: number) {

  if (valor > saldo) {

    console.log("\nSaldo insuficiente!");

    menu();

    return;
  }


  valorInvestido += valor;

  const taxaSelic = 0.014;

  console.log("\n===== SIMULAÇÃO SELIC =====");

  console.log(`Valor investido: R$${valor}`);

  let rendimento = valor;

  for (let mes = 1; mes <= 12; mes++) {

    rendimento += rendimento * taxaSelic;

    console.log(
      `Mês ${mes} -> R$${rendimento.toFixed(2)}`
    );
  }

  menu();
}

function deletarTransacao(indice: number) {

  const transacao = extrato[indice];

  if (!transacao) {

    console.log("\nTransação não encontrada!");

    menu();

    return;
  }

  const valorTexto = transacao.match(/R\$(\d+)/);

  const valor = Number(valorTexto?.[1]);

  if (transacao.includes("Renda")) {

    saldo -= valor;

    totalRenda -= valor;

  } else {

    saldo += valor;

    totalGasto -= valor;
  }

  extrato.splice(indice, 1);

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

          rl.question("Digite a categoria: ", (categoria: string) => {

            cadastrarRenda(Number(valor), categoria);

          });
        });

        break;

      case "2":

        rl.question("Digite o valor do gasto: ", (valor: string) => {

          rl.question("Digite a categoria: ", (categoria: string) => {

            cadastrarGasto(Number(valor), categoria);

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

        for (let i = 0; i < extrato.length; i++) {

          console.log(`${i + 1} - ${extrato[i]}`);
        }

        rl.question("\nDigite o número da transação: ", (numero: string) => {

          deletarTransacao(Number(numero) - 1);

        });

        break;

      case "7":

        rl.question("Digite o valor para investir: ", (valor: string) => {

        simularInvestimento(Number(valor));

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

menu();