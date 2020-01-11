express-addons

----

# Introduction

This is a small package for doing some addons on express.js 4.

# Async Routes

Allows you to use async routes instead of callbacks.

Here is an example.

    route.get('/', async (req, res) => {
        
        if (!req.notAuthed) throw new Error('Not authorized.');
        
        await something();
        
    });

It's simple and it's strait forward. Remark that the `next` parameter is not exposed to async routes.

| Non-async routes | Async routes |
|:-----------|:-----|
| `next()` | Exit scope |
| `next(new Error())` | `throw new Error()` |

## Configuration

    const { asyncRoutes } = require('express-addons');
    
    asyncRoutes();

# Catch all

Catch all is a simple route, that you put at the end of your other routes to handle `405 Method Not Allowed`.

Here is an example.

    route.get('/mypath/', ...);
    route.post('/mypath/', ...);
    route.delete('/mypath/', ...);
    route.catchAll('/mypath/');

In the above example the `catchAll` route returns `405 Method Not Found` to the client and sets the `Allow` header.

You can also provide an additional routes for custom response handling.

    route.catchAll('/mypath/', (req, res) => {
        res.json({ error: 'method not allowed');
    });

> Remark the first parameter is a path, which can be omitted and defaults to `/`.

## Configuration

    const { catchAll } = require('express-addons');
    
    catchAll();

You can provide an overall additional route, which will be used on all instances where `route.catchAll()` is used by providing it with the configuration.

    const { catchAll } = require('express-addons');
    
    catchAll((req, res) => {
        res.json({ error: 'method not allowed' });
    });

> If you also configured the async routes addon, you can also use async routes in the custom `catchAll` routes.
