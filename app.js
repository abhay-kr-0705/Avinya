const eventRoutes = require('./routes/events');
const eventRegistrationRoutes = require('./routes/eventRegistrations');

// Mount routes
app.use('/api/events', eventRoutes);
app.use('/api/events/register', eventRegistrationRoutes); 