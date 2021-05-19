import { run as mongo } from "../src";

test("BSON Single Collection ", async () => {
	const configuration = [{ _id: 1 }, { _id: 2 }];
	const query = "db.collection.find()";

	const results = await mongo(configuration, query);
	const [, result] = results;

	expect(results.length).toBe(2);
	expect(result._id).toBe(2);
});

test("BSON Multiple Collections Query", async () => {
	const configuration = {
		orders: [
			{
				_id: 1,
				item: "almonds",
				price: 12,
				quantity: 2,
			},
			{
				_id: 2,
				item: "pecans",
				price: 20,
				quantity: 1,
			},
			{
				_id: 3,
			},
		],
		inventory: [
			{
				_id: 1,
				sku: "almonds",
				description: "product 1",
				instock: 120,
			},
			{
				_id: 2,
				sku: "bread",
				description: "product 2",
				instock: 80,
			},
			{
				_id: 3,
				sku: "cashews",
				description: "product 3",
				instock: 60,
			},
			{
				_id: 4,
				sku: "pecans",
				description: "product 4",
				instock: 70,
			},
			{
				_id: 5,
				sku: null,
				description: "Incomplete",
			},
			{
				_id: 6,
			},
		],
	};
	const query = `
		db.orders.aggregate([
			{
			"$lookup": {
				"from": "inventory",
				"localField": "item",
				"foreignField": "sku",
				"as": "inventory_docs"
			}
			}
		])
	`;

	const results = await mongo(configuration, query);
	const [, result] = results;

	expect(results.length).toBe(3);
	expect(result).toMatchObject({
		_id: 2,
		inventory_docs: [
			{
				_id: 4,
				description: "product 4",
				instock: 70,
				sku: "pecans",
			},
		],
		item: "pecans",
		price: 20,
		quantity: 1,
	});
});

test("mgodatagen", async () => {
	const configuration = [
		{
			collection: "collection",
			count: 10,
			content: {
				key: {
					type: "int",
					minInt: 0,
					maxInt: 10,
				},
			},
		},
	];
	const query = "db.collection.find()";

	const results = await mongo(configuration, query, {
		mode: "mgodatagen",
		raw: true,
	});

	expect(typeof results).toBe("string");
	expect(results.startsWith("[{")).toBe(true);
});

test("raw string configuration", async () => {
	const configuration = `
		db={
			test: [
				{
				  "key": 1
				},
				{
				  "key": 2
				}
			]
		}
	`;

	const query = "db.test.find()";

	const results = await mongo(configuration, query, { raw: true });

	expect(typeof results).toBe("string");
	expect(results.startsWith("[{")).toBe(true);
});
