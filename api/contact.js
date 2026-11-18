const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 4;
const recentSubmissions = new Map();

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, message: 'Utilisez le formulaire de contact pour envoyer un message.' });
  }

  if (Number(req.headers['content-length'] || 0) > 12_000) {
    return json(res, 413, { ok: false, message: 'Le message est trop long. Raccourcissez-le, puis réessayez.' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  } catch {
    return json(res, 400, { ok: false, message: 'Les données du formulaire n’ont pas pu être lues.' });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json(res, 400, { ok: false, message: 'Les données du formulaire n’ont pas pu être lues.' });
  }
  if (Buffer.byteLength(JSON.stringify(body), 'utf8') > 12_000) {
    return json(res, 413, { ok: false, message: 'Le message est trop long. Raccourcissez-le, puis réessayez.' });
  }
  if (body.website) {
    res.status(204).end();
    return;
  }

  const firstName = String(body.firstName || '').trim().slice(0, 80);
  const lastName = String(body.lastName || '').trim().slice(0, 80);
  const email = String(body.email || '').trim().slice(0, 180);
  const phone = String(body.phone || '').trim().slice(0, 60);
  const projectType = String(body.projectType || '').trim().slice(0, 120);
  const message = String(body.message || '').trim().slice(0, 5000);

  if (!firstName || !lastName || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { ok: false, message: 'Vérifiez les champs obligatoires et l’adresse e-mail, puis réessayez.' });
  }

  const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const bucket = (recentSubmissions.get(ip) || []).filter(time => now - time < WINDOW_MS);
  if (bucket.length >= MAX_REQUESTS) {
    return json(res, 429, { ok: false, message: 'Trop de messages ont été envoyés depuis cette connexion. Réessayez plus tard.' });
  }
  bucket.push(now);
  recentSubmissions.set(ip, bucket);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL || 'tleovitch2@gmail.com';
  if (!apiKey || !from) {
    return json(res, 503, { ok: false, code: 'CONTACT_NOT_CONFIGURED', message: 'Le formulaire de contact n’est pas encore connecté. Écrivez directement à Leo.' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Demande de contact LEO DEV : ${projectType || 'Nouveau projet'}`,
        text: [
          `De : ${firstName} ${lastName}`,
          `Courriel : ${email}`,
          `Téléphone : ${phone || 'Non indiqué'}`,
          `Type de projet : ${projectType || 'Non précisé'}`,
          '',
          message,
        ].join('\n'),
      }),
    });
    if (!response.ok) return json(res, 502, { ok: false, message: 'Le message n’a pas pu être envoyé. Écrivez directement à Leo.' });
    return json(res, 200, { ok: true, message: 'Votre message a été envoyé. Merci de m’avoir écrit.' });
  } catch {
    return json(res, 502, { ok: false, message: 'Le message n’a pas pu être envoyé. Écrivez directement à Leo.' });
  }
}
