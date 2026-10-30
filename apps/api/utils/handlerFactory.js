import asyncHandler from './asyncHandler.js';
import AppError from './AppError.js';
import ApiFeatures from './apiFeatures.js';

export const getAll = (Model, { searchFields = [], populate } = {}) =>
  asyncHandler(async (req, res) => {
    const features = new ApiFeatures(Model.find(), req.query, searchFields)
      .filter()
      .search()
      .sort()
      .limitFields()
      .paginate();

    if (populate) features.query = features.query.populate(populate);

    const [data, total] = await Promise.all([
      features.query,
      Model.countDocuments(features.query.getFilter()),
    ]);

    res.status(200).json({
      success: true,
      count: data.length,
      total,
      page: features.pagination.page,
      pages: Math.ceil(total / features.pagination.limit),
      data,
    });
  });

export const getOne = (Model, { populate } = {}) =>
  asyncHandler(async (req, res) => {
    let query = Model.findById(req.params.id);
    if (populate) query = query.populate(populate);
    const doc = await query;

    if (!doc) {
      throw new AppError(`${Model.modelName} not found with id ${req.params.id}`, 404);
    }

    res.status(200).json({ success: true, data: doc });
  });

export const createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ success: true, data: doc });
  });

export const updateOne = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      throw new AppError(`${Model.modelName} not found with id ${req.params.id}`, 404);
    }

    res.status(200).json({ success: true, data: doc });
  });

export const deleteOne = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      throw new AppError(`${Model.modelName} not found with id ${req.params.id}`, 404);
    }

    res.status(200).json({ success: true, data: {} });
  });
