import Ajv from "ajv";

const ajv = new Ajv(); // Create a new Ajv instance

const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    layouts: {
      type: "object",
    },
    widgets: {
      type: "array",
    },
    isLocked: {
      type: "boolean",
    },
  },
  required: ["layouts", "widgets", "isLocked"],
  additionalProperties: false,
};

const validateUpload = ajv.compile(schema); // Compile the schema to a validation function

export default validateUpload;
