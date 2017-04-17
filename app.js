const express = require("express");
const bodyParser = require("body-parser");
const User = require('./usersModel');
const UserDao = require('./userDao');
const app = express();
const rtAPIv1 = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended": true}));


let userDao = new UserDao();

//REST

rtAPIv1.get("/users/", function(req, res) {
    let userList = userDao.getUserList();
    res.send(userList);
});

rtAPIv1.post("/users/", function(req, res) {
    let user = userDao.createUser(new User(null, req.body.name, req.body.score));
    res.send(user);
});

rtAPIv1.delete("/users/:id", function(req, res) {
    let user = userDao.removeUser(new User(req.params.id, null, null));
    if (user.id == undefined || user.id == 0) {res.status(500).json({ error: 'Something went wrong!' });}
    res.send(user);
});

rtAPIv1.get("/users/:id", function(req, res) {
    let user = userDao.getUser(new User(req.params.id, null, null));
    if (user.id == undefined || user.id == 0) {res.status(500).json({ error: 'Something went wrong!' });}
    res.send(user);
});

rtAPIv1.put("/users/:id", function(req, res) {
    let user = userDao.updateUser(new User(req.params.id, req.query.name, req.query.score));
    if (user.id == undefined || user.id == 0) {res.status(500).json({ error: 'Something went wrong!' });}
    res.send(user);
});


app.use("/api/v1", rtAPIv1);


//RPC
app.post('/rpc', function(req, res) {
    var rpcMethods = new Object();
    var data = req.body; err = null, rpcMethod = new Object();

    rpcMethods.getById = (params, result) => {
        let user = userDao.getUser(new User(params.id, null, null));
        result.onSuccess(user);
    };

    rpcMethods.getList = (params, result) => {
        let user = userDao.getUserList();
        result.onSuccess(user);
    };

    rpcMethods.create = (params, result) => {
        let user = userDao.createUser(new User(null, params.name, params.score));
        result.onSuccess(user);
    };

    rpcMethods.update = (params, result) => {
        let user = userDao.updateUser(new User(params.id, params.name, params.score));
        result.onSuccess(user);
    };

    rpcMethods.delete = (params, result) => {
        let user = userDao.removeUser(new User(params.id, null, null));
        result.onSuccess(user);
    };

    if (!err && data.jsonrpc !== '2.0') {
        onError({
            code: -32600,
            message: 'Bad Request. JSON RPC version is invalid or missing',
            data: null
        }, 400);
        return;
    }

    if (!err && !(rpcMethod = rpcMethods[data.method])) {
        onError({
            code: -32601,
            message: 'Method not found : ' + data.method
        }, 404);
        return;
    }

    try {
        rpcMethod(data.params, {
            onSuccess: function(result) {
                res.send(JSON.stringify({
                    jsonrpc: '2.0',
                    result: result,
                    error : null,
                    id: data.id
                }), 200);
            },
            onFailure: function(error) {
                onError({
                    code: -32603,
                    message: 'Failed',
                    data: error
                }, 500);
            }
        });
    } catch (e) {
        onError({
            code: -32603,
            message: 'Exception at method call',
            data: e.stack
        }, 500);
    }
    return;

    function onError(err, statusCode) {
        res.send(JSON.stringify({
            jsonrpc: '2.0',
            error: err,
            id: data.id
        }), statusCode);
    }
});



app.listen(3000);
