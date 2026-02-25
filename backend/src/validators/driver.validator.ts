import Joi from 'joi';

export const publishDriverSchema = Joi.object({
  travel_date: Joi.date().iso().required(),
  time_start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  time_end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
  origin: Joi.string().min(2).max(255).required(),
  origin_latitude: Joi.number().min(-90).max(90),
  origin_longitude: Joi.number().min(-180).max(180),
  destination: Joi.string().min(2).max(255).required(),
  destination_latitude: Joi.number().min(-90).max(90),
  destination_longitude: Joi.number().min(-180).max(180),
  available_seats: Joi.number().integer().min(1).max(20).required(),
  price: Joi.number().min(0).allow(null),
  car_model: Joi.string().max(100).allow('', null),
  car_plate: Joi.string().max(20).allow('', null),
  remarks: Joi.string().max(500).allow('', null),
});

export const updateDriverSchema = Joi.object({
  travel_date: Joi.date().iso(),
  time_start: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  time_end: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
  origin: Joi.string().min(2).max(255),
  destination: Joi.string().min(2).max(255),
  available_seats: Joi.number().integer().min(1).max(20),
  price: Joi.number().min(0).allow(null),
  car_model: Joi.string().max(100).allow('', null),
  car_plate: Joi.string().max(20).allow('', null),
  remarks: Joi.string().max(500).allow('', null),
  status: Joi.number().valid(0, 1, 2),
});

export const queryDriverSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  travel_date: Joi.date().iso(),
  origin: Joi.string(),
  destination: Joi.string(),
  status: Joi.number().valid(0, 1, 2),
});
