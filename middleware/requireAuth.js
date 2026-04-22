module.exports = function requireAuth(req, res, next) {
  if (req.session?.user) return next();
  if (req.xhr || req.headers['content-type'] === 'application/json' || req.headers.accept?.includes('application/json')) {
    return res.status(401).json({ error: 'not_logged_in' });
  }
  res.redirect('/login?next=cart');
};