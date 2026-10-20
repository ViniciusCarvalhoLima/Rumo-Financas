import * as readline from "readline";
import { carregarEstado } from "./services/persistencia";
import {
  cadastrarRenda,
  cadastrarGasto,
  listarTransacoes,
  pesquisarCategoria,
  deletarTransacao,
  calcularSaldo,
  formatarCategoria,
} from "./services/transacoes";
import { simularInvestimento } from "./services/investimento";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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
          const valorNumerico = Number(valor.replace(",", "."));
          if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
            console.log("\nValor inválido! Informe um número maior que zero.");
            menu();
            return;
          }
          rl.question("Digite a categoria: ", (categoria: string) => {
            try {
              cadastrarRenda(valorNumerico, categoria);
              console.log("\nRenda cadastrada!");
            } catch (erro) {
              console.log(`\n${(erro as Error).message}`);
            }
            menu();
          });
        });
        break;

      case "2":
        rl.question("Digite o valor do gasto: ", (valor: string) => {
          const valorNumerico = Number(valor.replace(",", "."));
          if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
            console.log("\nValor inválido! Informe um número maior que zero.");
            menu();
            return;
          }
          rl.question("Digite a categoria: ", (categoria: string) => {
            try {
              cadastrarGasto(valorNumerico, categoria);
              console.log("\nGasto cadastrado!");
            } catch (erro) {
              console.log(`\n${(erro as Error).message}`);
            }
            menu();
          });
        });
        break;

      case "3":
        const saldo = calcularSaldo();
        console.log("\n===== SALDO =====");
        console.log(`Total de renda: R$${saldo.totalRenda.toFixed(2)}`);
        console.log(`Total de gasto: R$${saldo.totalGasto.toFixed(2)}`);
        console.log(`Saldo atual: R$${saldo.saldo.toFixed(2)}`);
        menu();
        break;

      case "4":
        const transacoes = listarTransacoes();
        console.log("\n===== EXTRATO =====");
        if (transacoes.length === 0) {
          console.log("Nenhuma transação encontrada.");
        } else {
          for (const t of transacoes) {
            const sinal = t.tipo === "Renda" ? "+" : "-";
            console.log(
              `${t.id} - ${t.tipo} | ${t.categoria} | ${sinal}R$${t.valor.toFixed(2)} | ${t.data}`
            );
          }
        }
        menu();
        break;

      case "5":
        rl.question("Digite a categoria: ", (categoria: string) => {
          const encontrados = pesquisarCategoria(categoria);
          console.log(`\n===== PESQUISA: ${formatarCategoria(categoria)} =====`);
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
        });
        break;

      case "6":
        const lista = listarTransacoes();
        console.log("\n===== EXTRATO =====");
        for (const t of lista) {
          const sinal = t.tipo === "Renda" ? "+" : "-";
          console.log(
            `${t.id} - ${t.tipo} | ${t.categoria} | ${sinal}R$${t.valor.toFixed(2)} | ${t.data}`
          );
        }
        rl.question(
          "\nDigite o ID da transação: ",
          (numero: string) => {
            try {
              deletarTransacao(Number(numero));
              console.log("\nTransação removida!");
            } catch (erro) {
              console.log(`\n${(erro as Error).message}`);
            }
            menu();
          }
        );
        break;

      case "7":
        rl.question("Digite o valor para investir: ", (valor: string) => {
          const valorNumerico = Number(valor.replace(",", "."));
          if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
            console.log("\nValor inválido! Informe um número maior que zero.");
            menu();
            return;
          }
          rl.question(
            "Digite a quantidade de meses (máx. 120): ",
            (meses: string) => {
              try {
                const resultado = simularInvestimento(
                  valorNumerico,
                  Number(meses)
                );
                console.log("\n===== SIMULAÇÃO SELIC =====");
                console.log(
                  `Valor investido: R$${resultado.valorInvestido.toFixed(2)}`
                );
                console.log(`Quantidade de meses: ${resultado.meses}`);
                for (const m of resultado.rendimentoMensal) {
                  console.log(`Mês ${m.mes} -> R$${m.valor.toFixed(2)}`);
                }
              } catch (erro) {
                console.log(`\n${(erro as Error).message}`);
              }
              menu();
            }
          );
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

carregarEstado();
menu();