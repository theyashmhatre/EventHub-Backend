const router = require("express").Router();
const mysqlConnection = require("../config/dbConnection");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
    isEmptyObject,
    passwordsValidation,
} = require("../utils/utils");

router.get("/", (req, res) => {
    mysqlConnection.query("SELECT * from user", (err, rows, fields) => {
        if (!err) {
            res.status(200).send(rows);
        } else {
            console.log(err);
            res.status(400);
        }
    });
});

router.post("/register", (req, res) => {
    let {
        email,
        passsword,
        name,
        contact,
        address,
        city
    } = req.body;
    console.log(req.body);
    const { errors, isValid } = validateRegisterParams(req.body); //validating all parameters before registering user

    if (!isValid) return res.status(400).json(errors);

    mysqlConnection.query(
        `SELECT * from user where email="${email}" OR username=${username}`,
        function (error, result, fields) {
            if (error) {
                console.log(error.code, error.sqlMessage);
                res.status(500).json({
                    main: "Something went wrong. Please try again",
                    devError: error,
                    devMsg: "MySql query error",
                });
            }

            if (!isEmptyObject(result)) {
                //check if user email already exists
                if (result[0].email === email)
                    return res.status(400).json({ email: "Email already exists" });

                //check if username already exists
                if (result[0].username === username)
                    return res.status(400).json({ username: "Username already exists" });
            } else {
                //generate passwordHash and create user on database

                bcrypt.genSalt(10, (err, salt) => {
                    //encrypting user's password
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) {
                            console.log("bcrypt error for password", err);
                            res.status(500).json({
                                main: "Something went wrong. Please try again.",
                                devError: err,
                                devMsg: "Error while encrypting password using bcrypt library",
                            });
                        }

                        const user = {
                            name: name,
                            email: email,
                            password: hash,
                            contact: contact,
                            address: address,
                            city: city
                        };

                        console.log(result);

                        //adding user to database
                        mysqlConnection.query(
                            `INSERT INTO user SET ?`,
                            user,
                            (sqlErr, result, fields) => {
                                if (sqlErr) {
                                    console.log(sqlErr);
                                    res.status(500).json({
                                        main: "Something went wrong. Please try again.",
                                        devError: sqlErr,
                                        devMsg: "Error occured while adding user into db",
                                    });
                                } else {
                                    console.log("User Created");
                                    return res
                                        .status(201)
                                        .json({ devMsg: "New user created successfully" });
                                }
                            }
                        );
                    });
                });
            }
        }
    );
});

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    //validating email and password
    const { errors, isValid } = validateLoginParams(req.body);

    //Check validation
    if (!isValid) return res.status(400).json(errors);

    mysqlConnection.query(
        `SELECT * from user where username = ${username}`,
        function (error, row, fields) {
            if (error) {
                console.log(error.code, error.sqlMessage);
                res.status(500).json({
                    main: "Something went wrong. Please try again",
                    devError: error,
                    devMsg: "MySql query error",
                });
            }

            let user = row[0];

            if (!user) {
                return res
                    .status(404)
                    .json({ main: "User does not exist. Please register and continue" });
            }

            //Check password
            bcrypt
                .compare(password, user.password)
                .then((isMatch) => {
                    if (isMatch) {
                        // user password verified, Create JWT Payload
                        const payload = {
                            id: user.id,
                            email: user.email,
                            name: user.employee_name,
                        };

                        //Sign token
                        jwt.sign(
                            payload,
                            process.env.secretOrKey,
                            {
                                expiresIn: 31556926, // 1 year in seconds
                            },
                            (err, token) => {
                                if (err) {
                                    console.log(err);
                                    res.status(500).json({
                                        main: "Something went wrong. Please try again",
                                        devError: err,
                                        devMsg: "Error while signing jwt token",
                                    });
                                }

                                mysqlConnection.query(`INSERT INTO login_history SET username=${username}, status = 1`, (sqlErr, result, fields) => {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).json({
                                            main: "Something went wrong. Please try again",
                                            devError: err,
                                            devMsg: "Error while signing jwt token",
                                        });
                                    }

                                    //returns jwt token to be stored in browser's sessionStorage
                                    res.status(200).json({
                                        success: true,
                                        token: token,
                                    });
                                });
                            }
                        );
                    }
                })
                .catch((error) => {
                    console.log(error);
                    res.status(500).json({
                        devError: error,
                        devMsg: "Error occured while comparing passwords",
                    });
                });
        }
    );
});