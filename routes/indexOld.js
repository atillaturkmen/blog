module.exports = {

    getHomePage: (req, res) => {
        if (req.session.loggedIn) {
            let query = "SELECT * FROM `articles`";
                database.query(query, (err, result) => {
                    if (err) {
                        throw (err);
                    }
                    res.render("articles", {
                        title: "Articles",
                        data: result,
                    });
                });
        }
        else {res.render("homepage", {
            title: "Homepage",
        });}
    },
    getArticles: (req, res) => {
        let username = req.body.username;
        let password = req.body.password;
        let usernameQuery = "SELECT * FROM `users` WHERE user_name = '" + username + "' AND password = '" + password + "' ";
        database.query(usernameQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (result.length > 0) {
                let query = "SELECT * FROM `articles`";
                database.query(query, (err, result) => {
                    if (err) {
                        throw (err);
                    }
                    req.session.loggedIn = 1;
                    res.render("articles", {
                        title: "Articles",
                        data: result,
                    });
                });
            }
            else {
                res.render("wrongPasswordPage", {
                    title: "Homepage"
                });
            }
        });
    },
    getRegistration: (req, res) => {
        res.render("registration", {
            title: "Sign up"
        });
    },
    submitRegistration: (req, res) => {
        let username = req.body.newusername;
        let password = req.body.newpassword;
        let usernameQuery = "SELECT * FROM `users` WHERE user_name = '" + username + "' ";
        database.query(usernameQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (result.length > 0) {
                res.render("sameUserName", {
                    title: "Sign up"
                });
            }
            else {
                let query = "INSERT INTO `users` (user_name, password) VALUES ('" + username + "', '" + password + "')";
                database.query(query, (err, result) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    res.render("successfullRegistration", {
                        title: "Registration successful!"
                    });
                });
            }
        });
    },
    writingPageRender: (req, res) => {
        res.render("add", {
            title: "Writing Area",
        });
    },
    submitContent: (req, res) => {
        let author = req.body.author;
        let content = req.body.content;
        let title = req.body.title;
        let summary = req.body.summary;
        let query = "INSERT INTO `articles` (author, content, summary,title, date_established) VALUES ('" + author + "', '" + content + "', '" + summary + "', '" + title + "', NOW())";
        database.query(query, (err) => {
            if (err) {
                throw err;
            }
            res.render("articleAdded", {
                title: "Article added",
            });
        });
    },
    readArticle: (req, res) => {
        let articleId = req.params.id;
        let query = "SELECT * FROM `articles` WHERE id = '" + articleId + "' ";
        database.query(query, (err, result) => {
            if (err) {
                throw err;
            }
            res.render("readArticle", {
                title: result[0].title,
                data: result[0],
            });
        });
    },
    deleteArticle: (req, res) => {
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
            else res.redirect("/");
        });
    },
    logout: (req,res) => {
        req.session.loggedIn = 0;
        res.redirect("/");
    },
};
