const Challenge = require('../../models/Challenge');

exports.getActiveChallenges = async () => {
  return Challenge.find({ isActive: true }).select('-__v');
};

exports.getChallengeDetails = async (id) => {
  return Challenge.findById(id).select('-__v');
};
