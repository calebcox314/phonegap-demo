'use strict';

const Controls = {};

export default Controls;

// Add a new control to the list
export function register(Control) {
  const name = Control.fullName;
  console.log(`Registered control ${name}`);
  Controls[name] = Control;
}
