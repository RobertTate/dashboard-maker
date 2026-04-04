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
    columns: {
      type: "number",
    },
    mode: {
      type: "string",
    },
    theme: {
      type: "string",
    },
  },
  required: ["layouts", "widgets", "isLocked"],
  additionalProperties: false,
};

export const validateUpload = ajv.compile(schema); // Compile the schema to a validation function

const folderExportSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    type: {
      type: "string",
      const: "folder-export",
    },
    name: {
      type: "string",
    },
    folderStructure: {
      type: "object",
    },
    dashboards: {
      type: "object",
    },
  },
  required: ["type", "name", "folderStructure", "dashboards"],
  additionalProperties: false,
};

export const validateFolderUpload = ajv.compile(folderExportSchema);
