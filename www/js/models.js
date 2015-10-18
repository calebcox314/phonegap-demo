'use strict';

const Models = {};

export default Models;

// Add a new model to the list
export function register(Model) {
  const name = Model.fullName;
  console.log(`Registered model ${name}`);
  Models[name] = Model;
}

// Register core models
import Transaction from './models/transaction';
register(Transaction);
