const { Pool } = require('pg');

const poolConfigure = async () => {
  const connObject = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  };

  const pool = new Pool(connObject);

  pool.on('error', (err, client) => {
    console.log('pool error: ' + err);
    pool.end();

    setTimeout(() => {
      pool = new Pool(connObject);
    }, 100);
  });

  return pool;
};

const response = async (body = {}, statusCode = 200) => {
  return {
    statusCode,
    body: JSON.stringify(body),
  };
};

exports.handler = async (event, context, callback) => {
  try {
    const pool = await poolConfigure();
    const client = await pool.connect();

    const res = await client.query('select *  from public.admins');
    console.log('res', res);

    // Make sure to release the client before any error handling,
    // just in case the error handling itself throws an error.
    client.release();

    return response({ admins: res.rows });
  } catch (error) {
    console.log('error', error);
    return response({ message: error.message || 'INTERNAL ERROR' }, error.statusCode || 500);
  }
};
