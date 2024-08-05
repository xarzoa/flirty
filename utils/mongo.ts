import { env } from "@/config";
import { MongoClient, ServerApiVersion } from "mongodb";
import type {
  Db,
  Document,
  Filter,
  Collection as MongoCollection,
  OptionalId,
  UpdateFilter,
} from "mongodb";

const client = new MongoClient(env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db: Db | null = null;

async function connectToDB(): Promise<void> {
  if (!db) {
    try {
      await client.connect();
      console.info("Client connected to MongoDB.");
      db = client.db();
    } catch (e) {
      console.error("Error connecting to MongoDB:", e);
      throw e;
    }
  }
}

function getDatabase(): Db {
  if (!db) {
    throw new Error("Database is not connected.");
  }
  return db;
}

await connectToDB();

class Collection {
  private collection: MongoCollection<Document> | undefined;

  constructor(private name: string) { }

  private async getCollection(): Promise<MongoCollection<Document>> {
    if (!this.collection) {
      this.collection = getDatabase().collection(this.name);
    }
    return this.collection;
  }

  async create(data: OptionalId<Document>, uniqueFields: string[] = []) {
    const collection = await this.getCollection();
    try {
      if (uniqueFields.length > 0) {
        await Promise.all(
          uniqueFields.map((field) =>
            collection.createIndex({ [field]: 1 }, { unique: true }),
          ),
        );
      }
      return await collection.insertOne(data);
    } catch (e) {
      console.error(e);
      throw new Error("Failed to create document.");
    }
  }

  async createMany(data: OptionalId<Document>[]) {
    const collection = await this.getCollection();
    try {
      return await collection.insertMany(data);
    } catch (e) {
      console.error(e);
      throw new Error("Failed to create multiple documents.");
    }
  }

  async get(id: Filter<Document>) {
    const collection = await this.getCollection();
    return collection.findOne(id);
  }

  find(query: Filter<Document>) {
    return new QueryBuilder(this.getCollection(), query);
  }

  async update(id: Filter<Document>, data: UpdateFilter<Document>) {
    const collection = await this.getCollection();
    return collection.updateOne(id, data);
  }

  async updateMany(query: Filter<Document>, data: UpdateFilter<Document>) {
    const collection = await this.getCollection();
    return collection.updateMany(query, data);
  }

  async deleteMany(query?: Filter<Document>) {
    const collection = await this.getCollection();
    return collection.deleteMany(query);
  }

  async deleteOne(query?: Filter<Document>) {
    const collection = await this.getCollection();
    return collection.deleteOne(query);
  }
}

class QueryBuilder {
  private limitValue = 0;
  private projectValue = {};
  private sortValue = {};

  constructor(
    private collectionPromise: Promise<MongoCollection<Document>>,
    private query: Filter<Document>,
  ) { }

  limit(value: number): this {
    this.limitValue = value;
    return this;
  }

  project(value: Document): this {
    this.projectValue = value;
    return this;
  }

  sort(value: Document): this {
    this.sortValue = value;
    return this;
  }

  async execute() {
    const collection = await this.collectionPromise;
    return collection
      .find(this.query)
      .limit(this.limitValue)
      .project(this.projectValue)
      .sort(this.sortValue)
      .toArray();
  }
}

export default Collection;
