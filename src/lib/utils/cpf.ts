export function validarCPF(cpf: string): boolean {
  const num = cpf.replace(/\D/g, "");
  if (num.length !== 11 || /^(\d)\1{10}$/.test(num)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(num[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(num[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(num[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(num[10]);
}

export function validarCNPJ(cnpj: string): boolean {
  const num = cnpj.replace(/\D/g, "");
  if (num.length !== 14 || /^(\d)\1{13}$/.test(num)) return false;

  const calcDigito = (n: string, pesos: number[]) => {
    const soma = n.split("").reduce((acc, d, i) => acc + parseInt(d) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  return (
    calcDigito(num.slice(0, 12), pesos1) === parseInt(num[12]) &&
    calcDigito(num.slice(0, 13), pesos2) === parseInt(num[13])
  );
}

export function validarCPFouCNPJ(valor: string): boolean {
  const num = valor.replace(/\D/g, "");
  if (num.length === 11) return validarCPF(num);
  if (num.length === 14) return validarCNPJ(num);
  return false;
}

export function mascararCPF(cpf: string): string {
  return cpf.replace(/\D/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function mascararCNPJ(cnpj: string): string {
  return cnpj
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}
