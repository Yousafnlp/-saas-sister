import Service, { CASE_INSENSITIVE } from '../models/Service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getOne, createOne, updateOne, deleteOne } from '../utils/handlerFactory.js';
import { DEFAULT_SERVICE_CATALOG } from '../data/defaultServices.js';

// The price list is small (a few hundred rows at most), so it is returned whole rather than paginated.
export const getServices = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.showOnline !== undefined) filter.showOnline = req.query.showOnline === 'true';

  const data = await Service.find(filter).sort('category name').select('-__v');
  res.status(200).json({ success: true, count: data.length, data });
});

export const getService = getOne(Service);
export const createService = createOne(Service);
export const updateService = updateOne(Service);
export const deleteService = deleteOne(Service);

// Adds any default price-list services that are missing. Existing services (and their edited prices) are untouched.
export async function importDefaultServices() {
  const ops = DEFAULT_SERVICE_CATALOG.flatMap(({ category, services }) =>
    services.map(({ name, price, note = '' }) => ({
      updateOne: {
        filter: { category, name },
        update: { $setOnInsert: { category, name, price, note } },
        upsert: true,
        collation: CASE_INSENSITIVE,
      },
    }))
  );

  const result = await Service.bulkWrite(ops);
  return { added: result.upsertedCount, total: ops.length };
}

export const importDefaults = asyncHandler(async (req, res) => {
  const result = await importDefaultServices();
  res.status(200).json({ success: true, data: result });
});
