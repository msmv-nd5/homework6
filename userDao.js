const fs = require('fs');
const User = require('./usersModel');
class userDao {

    constructor() {
        this.array = this._initArray();
    }

    createUser(data) {
        let newId = 0;
        if (this.array[0] !== undefined){
            newId = this.array[this.array.length - 1].id + 1;} else {
        }
        let user = new User(newId, data.name, data.score);
        this.array.push(user);
        this._save();
        return user;
    }

    updateUser(data) {
        let realIndex = -1;
        this.array.find((elem, index)=>{if(elem.id == data.id) {return true;} else {realIndex++;}});
        if (realIndex === -1) {return new User();}
        this.array[realIndex+1].name = data.name;
        this.array[realIndex+1].score = data.score;
        this._save();
        return this.array[realIndex+1];
    }

    removeUser(data) {
        let realIndex = -1;
        this.array.find((elem, index)=>{if(elem.id == data.id) {return true;} else {realIndex++;}});
        if (realIndex === -1) {return new User();}
        let tmp = this.array[realIndex+1];
        this.array.splice(realIndex+1, 1);
        this._save();
        return tmp;
    }

    getUserList() {
        return this.array;
    }

    getUser(data) {
        let realIndex = -1;
        this.array.find((elem, index)=>{if(elem.id == data.id) {return true;} else {realIndex++;}});
        if (realIndex === -1) {return new User();}
        return this.array[realIndex+1];
    }

    _initArray() {
        try{
            return JSON.parse(fs.readFileSync('users.json'));
        } catch (err) {
            return new Array();
        }
    }

    _save() {
        fs.writeFile('users.json', JSON.stringify(this.array));
    }

}

module.exports = userDao;