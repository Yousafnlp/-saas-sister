export function toJSON(schema) {
  schema.set('toJSON', {
    versionKey: false,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.password;
      delete ret.tokenHash;
      return ret;
    },
  });
}

export default toJSON;
