import passport from  "../config/passport";

const validateLogin = passport.authenticate("local", {
  successRedirect: "/dashboard/dashboard",
  failureRedirect: "/auth/log-in",
  failureMessage: true,
});
export default validateLogin;