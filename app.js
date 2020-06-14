const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const passwords = require(__dirname + "/password.js");


let app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded())
app.use(express.static('public'));

/* // Local Database
mongoose.connect("mongodb://localhost:27017/todolistDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
 */

mongoose.connect(`mongodb+srv://admin-jar:${passwords.getPassword()}@cluster0-mqksi.mongodb.net/todolistDB`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});
const item2 = new Item({
    name: "Hit the + button to add a new item."
});
const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", (req, res) => {

    Item.find({}, (err, foundItems) => {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, err => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved default items to DB.")
                }
            });
            res.redirect("/");
        } else {
            res.render('list', {
                listTitle: "Today",
                newListItems: foundItems
            })
        }
    });
});

app.post('/', (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {

        item.save();
        res.redirect("/");

    } else {
        List.findOne({
            name: listName
        }, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect(`/${listName}`);
        });
    }
});

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, err => {
            if (!err) {
                console.log("Successfully deleted item");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({
            name: listName
        }, {
            $pull: {
                items: {
                    _id: checkedItemId
                }
            }
        }, (err, foundList) => {
            if (!err) {
                res.redirect(`/${listName}`);
            }
        });
    }

});

app.get("/add", (req, res) => {
    res.render("add");
})


app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({
        name: customListName
    }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                // Create a new list

                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                res.redirect(`/${customListName}`);

            } else {
                // Show an existing list

                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
            }
        }
    });



});

app.post("/work", (req, res) => {
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect('/work');
})



app.get("/about", (req, res) => {
    res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, () => {
    console.log("Server has started successfully");
})