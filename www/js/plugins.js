'use strict';

import can from 'can';

import { register as registerControl } from 'core/controls';
import { register as registerModel } from 'core/models';

const Plugins = {};

export default Plugins;

// Add a new plugin to the list
export function register(name, Plugin) {
  console.log(`Registered plugin ${name}`);
  Plugins[name] = Plugin;

  // Add the plugin's controls to the global list
  can.each(Plugin.controls, Control => registerControl(Control));

  // Add the plugin's models to the global list
  can.each(Plugin.models, Model => registerModel(Model));
}
