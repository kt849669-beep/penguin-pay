export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let shouldRedirect = false;

    if (url.protocol === 'http:') {
      url.protocol = 'https:';
      shouldRedirect = true;
    }

    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.replace(/^www\./, '');
      shouldRedirect = true;
    }

    if (shouldRedirect) {
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  }
};
