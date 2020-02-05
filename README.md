express-addons
----

# Introduction

This is a small package for doing some addons on express.js 4.

# Async Routes

Allows you to use async routes instead of callbacks.

Here is an example.

````javascript
    route.get('/', async (req, res) => {
        
        if (!req.notAuthed) throw new Error('Not authorized.');
        
        await something();

        return 'This is my response.';
        
    });
````

It's simple and it's strait forward. Remark that the `next` parameter is not exposed to async routes.

| Non-async routes | Async routes |
|:-----------|:-----|
| `next()` | Exit scope |
| `next(new Error())` | `throw new Error()` |
| `send(data)` | `return data`|

> You can configure which response method should be used when you `return` data from the route to be send - see below.

## Configuration

````javascript
    const { asyncRoutes } = require('express-addons');
    
    asyncRoutes(/* { options } */);
````

### Options

These options are available for the `asyncRoutes` addon.

| Name | Type | Description | Default |
|:----|:-----|:------------|:--------|
| `autosender` | `String` | The method on response to use when returning data from a route - e.g. `send`, `json`. | `send`
| *- or -* | `Function` | A custom function to use (has prototype `(data, req, res)`).

# Catch all

Catch all is a simple route, that you put at the end of your other routes to handle `405 Method Not Allowed`.

Here is an example.

````javascript
    route.get('/mypath/', ...);
    route.post('/mypath/', ...);
    route.delete('/mypath/', ...);
    route.catchAll('/mypath/');
````

In the above example the `catchAll` route returns `405 Method Not Found` to the client and sets the `Allow` header.

You can also provide an additional routes for custom response handling.

````javascript
    route.catchAll('/mypath/', (req, res) => {
        res.json({ error: 'method not allowed');
    });
````

> Remark the first parameter is a path, which can be omitted and defaults to `/`.

## Configuration

````javascript
    const { catchAll } = require('express-addons');
    
    catchAll();
````

You can provide an overall additional route, which will be used on all instances where `route.catchAll()` is used by providing it with the configuration.

````javascript
    const { catchAll } = require('express-addons');
    
    catchAll((req, res) => {
        res.json({ error: 'method not allowed' });
    });
````

> If you also configured the async routes addon, you can also use async routes in the custom `catchAll` routes.

# License

New BSD License. See file LICENSE.
