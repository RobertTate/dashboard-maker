import ShortUniqueId from "short-unique-id";

const { randomUUID } = new ShortUniqueId({ length: 10 });

export default randomUUID;
