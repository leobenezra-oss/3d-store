module.exports = function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // If it's an API/fetch request, return 401 JSON so the frontend can handle it
  if (req.xhr || req.headers['content-type'] === 'application/json' || req.headers.accept?.includes('application/json')) {
    return res.status(401).json({ error: 'not_logged_in' });
  }
  res.redirect('/login?next=cart');
};