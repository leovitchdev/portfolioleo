export function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const select = form.querySelector('#project-type');
  const requestedType = new URLSearchParams(window.location.search).get('type');
  if (requestedType && select) {
    const option = [...select.options].find(item => item.value.toLowerCase() === requestedType.toLowerCase());
    if (option) select.value = option.value;
  }

  const status = document.querySelector('#contact-status');
  const fallback = document.querySelector('#contact-fallback');

  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.textContent = '';
    fallback.hidden = true;

    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    submit.setAttribute('aria-busy', 'true');
    status.textContent = 'Envoi de votre message…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok && result.ok) {
        status.textContent = result.message;
        form.reset();
      } else {
        status.textContent = result.message || 'Le message n’a pas été envoyé.';
        fallback.hidden = false;
      }
    } catch {
      status.textContent = 'Le message n’a pas pu être envoyé.';
      fallback.hidden = false;
    } finally {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
    }
  });
}
