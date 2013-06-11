/*
*  Server implementation
*
*/

var Express = require('express')
    , server = Express()
	, RedisStore = require('connect-redis')(Express)
    , store = new RedisStore
    , routes = require('./routes');

var SECRET = 'yofresh commerce site';

/* Server Configuration */
server.configure(function(){
  server.use(Express.logger());
  server.set('views', __dirname + '/views');
  server.set('view engine', 'jade');
  server.use(Express.compress());
  server.use(Express.bodyParser());
  server.use(Express.cookieParser());
  server.use(Express.session({ key: 'sid', secret: SECRET, store: store}));
  server.use(Express.methodOverride());
  server.use(server.router);
  server.use(Express.static(__dirname + '/public'));
  server.use(Express.errorHandler({ showStack: true, dumpExceptions: true }));
});

server.configure('development', function(){
  server.use(Express.errorHandler({ dumpExceptions: true, showStack: true }));
});

server.configure('production', function(){
  server.use(Express.errorHandler());
});

server.get('/', routes.base.index);
server.get('/login/:email', routes.base.login);
server.get('/logout', routes.base.logout);
server.get('/register', routes.base.register);

server.get('/api/v0/products', routes.api.v0.products.list);
server.get('/api/v0/products/:id', routes.api.v0.products.list);
server.post('/api/v0/products', routes.api.v0.products.save);
server.put('/api/v0/products/:id', routes.api.v0.products.update);
server.delete('/api/v0/products/:id', routes.api.v0.products.remove);

server.get('/api/v0/users', routes.api.v0.users.list);
server.get('/api/v0/users/:id', routes.api.v0.users.list);
server.post('/api/v0/users', routes.api.v0.users.save);
server.put('/api/v0/users/:id', routes.api.v0.users.update);
server.delete('/api/v0/users/:id', routes.api.v0.users.remove);

server.get('/api/v0/orders', routes.api.v0.orders.list);
server.get('/api/v0/orders/:id', routes.api.v0.orders.list);
server.post('/api/v0/orders', routes.api.v0.orders.save);
server.put('/api/v0/orders/:id', routes.api.v0.orders.update);
server.delete('/api/v0/orders/:id', routes.api.v0.orders.remove);

server.listen(80); //8002
