import Joi from 'joi';

export const registerSchema = Joi.object({
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.pattern.base': '请输入正确的手机号',
    'any.required': '手机号不能为空',
  }),
  password: Joi.string().min(6).max(20).required().messages({
    'string.min': '密码长度不能少于6位',
    'string.max': '密码长度不能超过20位',
    'any.required': '密码不能为空',
  }),
});

export const loginSchema = Joi.object({
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),
  password: Joi.string().required(),
});

export const verifySchema = Joi.object({
  real_name: Joi.string().min(2).max(50).required().messages({
    'string.min': '姓名不能少于2个字符',
    'string.max': '姓名不能超过50个字符',
    'any.required': '姓名不能为空',
  }),
  id_card: Joi.string().pattern(/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/).required().messages({
    'string.pattern.base': '请输入正确的身份证号',
    'any.required': '身份证号不能为空',
  }),
});

export const updateProfileSchema = Joi.object({
  real_name: Joi.string().min(2).max(50),
  gender: Joi.number().valid(0, 1, 2),
  avatar_url: Joi.string().uri(),
});

export const changePasswordSchema = Joi.object({
  old_password: Joi.string().required(),
  new_password: Joi.string().min(6).max(20).required(),
});
