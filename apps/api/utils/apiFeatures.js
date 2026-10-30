const RESERVED_PARAMS = ['page', 'limit', 'sort', 'fields', 'q'];

export class ApiFeatures {
  constructor(query, queryString, searchFields = []) {
    this.query = query;
    this.queryString = queryString;
    this.searchFields = searchFields;
  }

  filter() {
    const filters = { ...this.queryString };
    RESERVED_PARAMS.forEach((param) => delete filters[param]);

    let filterStr = JSON.stringify(filters);
    filterStr = filterStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(filterStr));
    return this;
  }

  search() {
    if (this.queryString.q && this.searchFields.length > 0) {
      const regex = new RegExp(this.queryString.q, 'i');
      this.query = this.query.find({
        $or: this.searchFields.map((field) => ({ [field]: regex })),
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = Math.max(parseInt(this.queryString.page, 10) || 1, 1);
    const limit = Math.min(parseInt(this.queryString.limit, 10) || 25, 100);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit };
    return this;
  }
}

export default ApiFeatures;
