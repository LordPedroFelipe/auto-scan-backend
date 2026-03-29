export function buildBaseEmailTemplate(params: {
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  body: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  outro?: string;
}) {
  const bodyHtml = params.body.map((item) => `<p style="margin:0 0 16px;color:#16324f;font-size:15px;line-height:1.65;">${item}</p>`).join('');
  const ctaHtml =
    params.ctaLabel && params.ctaUrl
      ? `<div style="margin:28px 0 24px;"><a href="${params.ctaUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:linear-gradient(135deg,#0f766e,#0b4f8a);color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;">${params.ctaLabel}</a></div>`
      : '';
  const outroHtml = params.outro
    ? `<p style="margin:24px 0 0;color:#4e6b86;font-size:13px;line-height:1.6;">${params.outro}</p>`
    : '';

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${params.title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f8fb;font-family:Segoe UI,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${params.preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f8fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 18px 40px rgba(15,35,55,0.12);">
            <tr>
              <td style="padding:32px 32px 24px;background:radial-gradient(circle at top left,#0f766e 0%,#123b69 58%,#091c33 100%);">
                <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.75);font-weight:700;margin-bottom:14px;">${params.eyebrow}</div>
                <h1 style="margin:0;color:#ffffff;font-size:30px;line-height:1.15;font-weight:800;">${params.title}</h1>
                <p style="margin:16px 0 0;color:rgba(255,255,255,0.86);font-size:15px;line-height:1.65;">${params.intro}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${bodyHtml}
                ${ctaHtml}
                ${outroHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildResetPasswordEmailTemplate(params: {
  customerName: string;
  resetUrl: string;
  expiresInText: string;
}) {
  return buildBaseEmailTemplate({
    preheader: 'Use este link para redefinir sua senha com seguranca.',
    eyebrow: 'ScanDrive | Recuperacao de senha',
    title: 'Vamos recuperar seu acesso',
    intro: `Oi, ${params.customerName}. Recebemos um pedido para redefinir sua senha na plataforma ScanDrive.`,
    body: [
      'Se foi voce quem solicitou, basta continuar pelo botao abaixo para criar uma nova senha e voltar para a operacao com seguranca.',
      `Por seguranca, este link expira em ${params.expiresInText}. Se voce nao fez esse pedido, pode ignorar este email sem risco.`,
    ],
    ctaLabel: 'Redefinir senha',
    ctaUrl: params.resetUrl,
    outro: `Se o botao nao abrir, copie e cole este link no navegador: ${params.resetUrl}`,
  });
}

export function buildWelcomeEmailTemplate(params: {
  customerName: string;
  loginUrl: string;
  shopName?: string | null;
}) {
  const context = params.shopName
    ? `Sua conta ja esta pronta para operar a loja ${params.shopName}.`
    : 'Sua conta ja esta pronta para comecar.';

  return buildBaseEmailTemplate({
    preheader: 'Sua conta ScanDrive foi criada com sucesso.',
    eyebrow: 'ScanDrive | Boas-vindas',
    title: 'Sua operacao comecou',
    intro: `Oi, ${params.customerName}. ${context}`,
    body: [
      'A partir de agora voce pode acompanhar estoque, leads, agendamentos e toda a operacao comercial em um unico lugar.',
      'Se este cadastro acabou de ser criado, seu proximo passo natural e entrar na plataforma, revisar a configuracao da loja e compartilhar o acesso com o time certo.',
    ],
    ctaLabel: 'Entrar na plataforma',
    ctaUrl: params.loginUrl,
    outro: 'Este mesmo canal vai ser usado para alertas importantes, recuperacao de senha e comunicacoes futuras da plataforma.',
  });
}
