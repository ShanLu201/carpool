import Joi from 'joi';

export const publishPassengerSchema = Joi.object({
  travel_date: Joi.date().iso().required(),
  time_start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  time_end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  origin: Joi.string().min(2).max(255).required(),
  origin_latitude: Joi.number().min(-90).max(90),
  origin_longitude: Joi.number().min(-180).max(180),
  destination: Joi.string().min(2).max(255).required(),
  destination_latitude: Joi.number().min(-90).max(90),
  destination_longitude: Joi.number().min(-180).max(180),
  passenger_count: Joi.number().integer().min(1).max(20).required(),
  price_min: Joi.number().min(0).allow(null),
  price_max: Joi.number().min(0).allow(null),
  remarks: Joi.string().max(500).allow('', null),
});

export const updatePassengerSchema = Joi.object({
  travel_date: Joi.date().iso(),
  time_start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  time_end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  origin: Joi.string().min(2).max(255),
  destination: Joi.string().min(2).max(255),
  passenger_count: Joi.number().integer().min(1).max(20),
  price_min: Joi.number().min(0).allow(null),
  price_max: Joi.number().min(0).allow(null),
  remarks: Joi.string().max(500).allow('', null),
  status: Joi.number().valid(0, 1, 2),
});

export const queryPassengerSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  travel_date: Joi.date().iso(),
  origin: Joi.string(),
  destination: Joi.string(),
  status: Joi.number().valid(0, 1, 2),
});
