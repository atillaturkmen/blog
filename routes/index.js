const express = require('express');
const{body, validationResult} = require('express-validator');

const router = express.Router();

router.get("/" ,(req, res) => {
    if (req.session.loggedIn) {
        let query = "SELECT * FROM `articles`";
            database.query(query, (err, result) => {
                if (err) {
                    throw (err);
                }
                let lastUpdated;
                result.forEach(element => {
                    lastUpdated = element.last_updated;
                    let now = new Date();
                    let fark = now - lastUpdated;
                    if (fark < 60000) {lastUpdated = `${Math.round(fark/1000)} seconds ago`;}
                    else if (fark < 3600000) {lastUpdated = `${Math.round(fark/60000)} minutes ago`;}
                    else if (fark < 86400000) {lastUpdated = `${Math.round(fark/3600000)} hours ago`;}
                    else {lastUpdated = `${Math.round(fark/86400000)} days ago`;}
                    element.before = lastUpdated;
                });
                res.render("articles", {
                    title: "Articles",
                    data: result,
                    user: req.session.username,
                });
            });
    }
    else {res.render("homepage", {
        title: "Homepage",
    });}
});

router.post("/", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let usernameQuery = "SELECT * FROM `users` WHERE user_name = ? AND password = ?";
    database.query(usernameQuery, [username, password], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.length > 0) {
            let query = "SELECT * FROM `articles`";
            database.query(query, (err, result) => {
                if (err) {
                    throw (err);
                }
                let lastUpdated;
                result.forEach(element => {
                    lastUpdated = element.last_updated;
                    let now = new Date();
                    let fark = now - lastUpdated;
                    if (fark < 60000) {lastUpdated = `${Math.round(fark/1000)} seconds ago`;}
                    else if (fark < 3600000) {lastUpdated = `${Math.round(fark/60000)} minutes ago`;}
                    else if (fark < 86400000) {lastUpdated = `${Math.round(fark/3600000)} hours ago`;}
                    else {lastUpdated = `${Math.round(fark/86400000)} days ago`;}
                    element.before = lastUpdated;
                });
                req.session.loggedIn = 1;
                req.session.username = username;
                res.render("articles", {
                    title: "Articles",
                    data: result,
                    user: req.session.username,
                });
            });
        }
        else {
            res.render("wrongPasswordPage", {
                title: "Homepage"
            });
        }
    });
});

router.get("/registration", (req, res) => {
    res.render("registration", {
        title: "Sign up"
    });
});

router.post("/registration", [
    body("newpassword")
        .isLength({min: 6})
        .withMessage("Your password must be at least 6 characters long."),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            let username = req.body.newusername;
            let password = req.body.newpassword;
            let usernameQuery = "SELECT * FROM `users` WHERE user_name = ?";
            database.query(usernameQuery,[username], (err, result) => {
                if (err) {
                    return res.status(500).send(err);
                }
                if (result.length > 0) {
                    res.render("sameUserName", {
                        title: "Sign up"
                    });
                }
                else {
                    let query = "INSERT INTO `users` (user_name, password) VALUES (?, ?)";
                    database.query(query,[username, password], (err, result) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        res.render("successfullRegistration", {
                            title: "Registration successful!"
                        });
                    });
                }
            });
        }
        else {
            res.render("registration", {
                title: "Sign up",
                errors: errors.array(),
            });
        }
    }
);

router.get("/add", (req, res) => {
    res.render("add", {
        title: "Writing Area",
    });
});

router.post("/add", (req, res) => {
    let content = req.body.content;
    let title = req.body.title;
    let summary = req.body.summary;
    let query = "INSERT INTO `articles` (author, content, summary, title, date_established, last_updated) VALUES (?, ?, ?, ?, NOW(), NOW())";
    if (!req.session.username) {
        req.session.username = "anonymus";
    }
    database.query(query, [req.session.username, content, summary, title], (err) => {
        if (err) {
            throw err;
        }
        res.render("articleAdded", {
            title: "Article added",
        });
    });
});

router.get("/read/:id", (req, res) => {
    let articleId = req.params.id;
    let query = "SELECT * FROM `articles` WHERE id = ?";
    database.query(query,[articleId], (err, result) => {
        if (err) {
            throw err;
        }
        if (result[0].author == req.session.username) {
            res.render("readArticle", {
                title: result[0].title,
                data: result[0],
            });
        }
        else res.render("readOthersArticle", {
            title: result[0].title,
            data: result[0],
        });
    });
});

router.get("/delete/:id", (req, res) => {
    let articleId = req.params.id;
    let query = "DELETE FROM `articles` WHERE id = '" + articleId + "' ";
    database.query(query, (err, result) => {
        if (err) {
            throw err;
        }
        if (result.affectedRows == 0) {
            res.render("articleNotFound", {
                title: "no such article"
            });
        }
        res.redirect("/");
    });
});

router.get("/logout", (req,res) => {
    req.session.loggedIn = 0;
    res.redirect("/");
});

router.get("/edit/:id", (req, res) => {
    let articleId = req.params.id;
    let query = "SELECT * FROM `articles` WHERE id = '" + articleId + "';";
    database.query(query, (err, result) => {
        if (err) {
            throw err;
        }
        if (result.affectedRows == 0) {
            res.render("articleNotFound", {
                title: "no such article"
            });
        }
        res.render("editArticle", {
            title: result[0].title,
            data: result[0],
        });
    });
});

router.post("/edit/:id", (req, res) => {
    let articleId = req.params.id;
    let content = req.body.content;
    let title = req.body.title;
    let summary = req.body.summary;
    let query = "UPDATE `articles` SET author = ?, content = ?, summary = ?, title = ?, last_updated = NOW() WHERE id = '" + articleId + "';";
    if (!req.session.username) {
        req.session.username = "anonymus";
    }
    database.query(query, [req.session.username, content, summary, title], (err) => {
        if (err) {
            throw err;
        }
        res.render("articleEdited", {
            title: "Article edited",
        });
    });
});

module.exports = router;