#!/usr/bin/yarn dev
import express from 'express';
import { promisify } from 'util';
import { createClient } from 'redis';

const listProducts = [
  {
    itemId: 1,
    itemName: 'Suitcase 250',
    price: 50,
    initialAvailableQuantity: 4
  },
  {
    itemId: 2,
    itemName: 'Suitcase 450',
    price: 100,
    initialAvailableQuantity: 10
  },
  {
    itemId: 3,
    itemName: 'Suitcase 650',
    price: 350,
    initialAvailableQuantity: 2
  },
  {
    itemId: 4,
    itemName: 'Suitcase 1050',
    price: 550,
    initialAvailableQuantity: 5
  },
];

const getItemById = (id) => {
  const item = listProducts.find(item => item.itemId === id);

  if (item) {
    return Object.fromEntries(Object.entries(item));
  }
};

const app = express();
const client = createClient();

const reservedStockById = async (itemId, stock) => {
  return promisify(client.SET).bind(client)(`item.${itemId}`, stock);
};

const getCurrentReservedStockById = (itemId) => {
  return promisify(client.GET).bind(client)(`item.${itemId}`);
};

app.get('/list_products', (_, response) => {
  response.json(listProducts);
});

app.get('/list_products/:itemId(\\d+)', (request, response) => {
  const itemId = Number.parseInt(request.params.itemId);
  const product = getItemById(Number.parseInt(itemId));

  if (!product) {
    response.json({status: 'Product not found'});
    return;
  }
  getCurrentReservedStockById(itemId)
    .then((res) => Number.parseInt(res || 0))
    .then((reservedStock) => {
      product.currentQuantity = product.initialAvailableQuantity - reservedStock;
      response.json(product);
    });
});

app.get('/reserve_product/:itemId', (request, response) => {
  const itemId = Number.parseInt(request.params.itemId);
  const product = getItemById(Number.parseInt(itemId));

  if (!product) {
    response.json({status: 'Product not found'});
    return;
  }
  getCurrentReservedStockById(itemId)
    .then((res) => Number.parseInt(res || 0))
    .then((reservedStock) => {
      if (reservedStock >= product.initialAvailableQuantity) {
        response.json({status: 'Not enough stock available', itemId});
        return;
      }
      reservedStockById(itemId, reservedStock + 1)
        .then(() => {
	  response.json({status: 'Reservation confirmed', itemId});
	});
    });
});

const resetProductsStock = () => {
  return Promise.all(listProducts.map(
    item => promisify(client.SET).bind(client)(`item.${item.itemId}`, 0))
  );
};

app.listen(1245, 'localhost', () => {
  resetProductsStock().then(() => {
    console.log('Server running on localhost on port 1245');
  });
});

export default app;
