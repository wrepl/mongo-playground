# mongoplayground-api

`mongoplayground-api` is an unofficial API Wrapper for [mongoplayground.net](https://mongoplayground.net/) REPL website

## Installation

`npm i mongoplayground-api`


## Usage and Examples

### Simple Query

```js
import { run as mongo } from "mongoplayground-api"; 

const configuration = [{ _id: 1 }, { _id: 2 }];
const query = "db.collection.find()";

const results = await mongo(configuration, query);
```
```json
[
  {
    "_id": 1
  },
  {
    "_id": 2
  }
]
```

### Multi Collection Query

```js
import { run as mongo } from "mongoplayground-api";

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
```
```json
[
  {
    "_id": 1,
    "inventory_docs": [
      {
        "_id": 1,
        "description": "product 1",
        "instock": 120,
        "sku": "almonds"
      }
    ],
    "item": "almonds",
    "price": 12,
    "quantity": 2
  },
  {
    "_id": 2,
    "inventory_docs": [
      {
        "_id": 4,
        "description": "product 4",
        "instock": 70,
        "sku": "pecans"
      }
    ],
    "item": "pecans",
    "price": 20,
    "quantity": 1
  },
  {
    "_id": 3,
    "inventory_docs": [
      {
        "_id": 5,
        "description": "Incomplete",
        "sku": null
      },
      {
        "_id": 6
      }
    ]
  }
]
```

### Using mgodatagen

```js
import { run as mongo } from "mongoplayground-api";

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
	// since the query result will have ObjectID's and it can't be parsed as JSON, need to set `raw` to true so it will return the results in string instead
	raw: true, 
});
```
```json
[
  {
    "_id": ObjectId("5a934e000102030405000000"),
    "key": 10
  },
  {
    "_id": ObjectId("5a934e000102030405000001"),
    "key": 2
  },
  {
    "_id": ObjectId("5a934e000102030405000002"),
    "key": 7
  },
  {
    "_id": ObjectId("5a934e000102030405000003"),
    "key": 6
  },
  {
    "_id": ObjectId("5a934e000102030405000004"),
    "key": 9
  },
  {
    "_id": ObjectId("5a934e000102030405000005"),
    "key": 10
  },
  {
    "_id": ObjectId("5a934e000102030405000006"),
    "key": 9
  },
  {
    "_id": ObjectId("5a934e000102030405000007"),
    "key": 10
  },
  {
    "_id": ObjectId("5a934e000102030405000008"),
    "key": 2
  },
  {
    "_id": ObjectId("5a934e000102030405000009"),
    "key": 1
  }
]
```

### Raw String as Configuration

```js
import { run as mongo } from "mongoplayground-api";

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

const results = await mongo(configuration, query, { 
	// since the query result will have ObjectID's and it can't be parsed as JSON, need to set `raw` to true so it will return the results in string instead
	raw: true 
});
```
```json
[{"_id":ObjectId("5a934e000102030405000000"),"key":1},{"_id":ObjectId("5a934e000102030405000001"),"key":2}]
```