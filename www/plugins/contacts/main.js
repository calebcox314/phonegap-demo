'use strict';

// Load controls
import Contacts from './controls/contacts';
import EditContact from './controls/edit-contact';

// Load models
import Contact from './models/contact';

import Navigator from 'core/navigator';

const plugin = {
  // Initialize the plugin
  initialize() {
    // Activate the Navigator, which will setup routing and load the initial page
    Navigator.activate('contacts');
  },

  controls: { Contacts, EditContact },
  models: { Contact },
};

export default plugin;
