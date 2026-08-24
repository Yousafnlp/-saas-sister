import Client from '../models/Client.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../utils/handlerFactory.js';

const searchFields = ['name', 'concern', 'number'];

export const getClients = getAll(Client, { searchFields });
export const getClient = getOne(Client);
export const createClient = createOne(Client);
export const updateClient = updateOne(Client);
export const deleteClient = deleteOne(Client);
