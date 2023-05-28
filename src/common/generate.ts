export function generateVoucherCode() {
  const codeLength = 12;
  const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * codeChars.length);
    code += codeChars[randomIndex];

    if (i % 4 === 3 && i !== codeLength - 1) {
      code += '-';
    }
  }

  return code;
}
