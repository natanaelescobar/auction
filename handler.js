const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Nombre de la tabla de DynamoDB
const AUCTIONS_TABLE = process.env.STAGE === 'prod' ? 'Auctions-prod' : 'Auctions-dev';

// Crear una nueva subasta
module.exports.createAuction = async (event) => {
  const { title, description, price } = JSON.parse(event.body);

  const params = {
    TableName: AUCTIONS_TABLE,
    Item: {
      id: generateId(),
      title,
      description,
      price: parseFloat(price),
      createdAt: new Date().toISOString(),
    },
  };

  await dynamoDb.put(params).promise();

  return {
    statusCode: 201,
    body: JSON.stringify(params.Item),
  };
};

// Obtener todas las subastas
module.exports.getAuctions = async () => {
  const params = {
    TableName: AUCTIONS_TABLE,
  };

  const result = await dynamoDb.scan(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
  };
};

// Obtener una subasta por ID
module.exports.getAuctionById = async (event) => {
  const { id } = event.pathParameters;

  const params = {
    TableName: AUCTIONS_TABLE,
    Key: { id },
  };

  const result = await dynamoDb.get(params).promise();

  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Subasta no encontrada' }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
  };
};

// Función auxiliar para generar IDs únicos
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}