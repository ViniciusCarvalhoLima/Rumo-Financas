export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatarData(data: string): string {
  // A API devolve datas em "DD/MM/AAAA"; também aceitamos "AAAA-MM-DD".
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return data;

  const partes = data.split("-");
  if (partes.length !== 3) return data;
  const [ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano}`;
}
