import Joi from 'joi';

export const sendMessageSchema = Joi.object({
  to_user_id: Joi.number().integer().required(),
  content: Joi.string().required().max(1000),
  message_type: Joi.number().valid(1, 2, 3).default(1),
  order_id: Joi.number().integer(),
});

export const markAsReadSchema = Joi.object({
  message_ids: Joi.array().items(Joi.number().integer()).required(),
});

export const queryMessagesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});
