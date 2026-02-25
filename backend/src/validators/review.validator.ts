import Joi from 'joi';

export const createReviewSchema = Joi.object({
  target_type: Joi.string().valid('passenger', 'driver').required(),
  target_id: Joi.number().integer().required(),
  to_user_id: Joi.number().integer().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(500).allow('', null),
});

export const queryReviewSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});
