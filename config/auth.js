module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Please log in to view that resource of patient panel');
      res.redirect('/patient/login');
    },

    ensureAuthenticated1: function(req, res, next) {
        if (req.isAuthenticated()) {
          return next();
        }
        req.flash('error_msg', 'Please log in to view that resource of doctor panel');
        res.redirect('/doctor/Dlogin');
      }
    
  }