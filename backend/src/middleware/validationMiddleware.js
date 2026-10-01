exports.validate = (validatorFn) => (req, res, next) => {
  const errors = validatorFn(req.body);
  if (errors && errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};
