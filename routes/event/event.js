const router = require("express").Router();
const mysqlConnection = require("../../config/dbConnection");
const passport = require("passport");
const { generatePaginationValues } = require("../../utils/utils");

// creates new event
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    try {
      let {
        name,
        description,
        startDate,
        endDate,
        category,
        city,
        location,
        maxparticipants,
        price,
      } = req.body;

      const newEvent = {
        name: name,
        description: description,
        start: startDate,
        end: endDate,
        category: category,
        city: city,
        location: location,
        maxparticipants: maxparticipants,
        price: price,
      };

      mysqlConnection.query(
        `INSERT INTO event SET ?`,
        newEvent,
        (sqlErr, result, fields) => {
          if (sqlErr) {
            return res.status(500).json({
              main: "Something went wrong. Please try again.",
              devError: sqlErr,
              devMsg: "Error occured while adding event into db",
            });
          } else {
            return res
              .status(201)
              .json({ devMsg: "New event created successfully" });
          }
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        main: "Something went wrong. Please try again.",
        devError: error,
        devMsg: "Error occured while creating event",
      });
    }
  }
);

// update challenge
router.post(
  "/edit/:eventId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    try {
      let eventId = req.params.eventId;

      let {
        name,
        description,
        startDate,
        endDate,
        category,
        city,
        location,
        maxparticipants,
        price,
      } = req.body;

      const newEvent = {
        name: name,
        description: description,
        start: startDate,
        end: endDate,
        category: category,
        city: city,
        location: location,
        maxparticipants: maxparticipants,
        price: price,
      };

      //query to find if the challenge exists
      mysqlConnection.query(
        `SELECT * from event where id = ${eventId}`,
        (sqlErr, result, fields) => {
          if (sqlErr) {
            return res.status(500).json({
              main: "Something went wrong. Please try again.",
              devError: sqlErr,
              devMsg: "Error occured while fetching event from db",
            });
          } else if (!result.length) {
            //if no challenge found
            return res.status(200).json({
              main: "No such event exists",
              devMsg: "Event ID is invalid",
            });
          } else {
            /*            // Confirm that user is either super admin or the admin who created this challenge
            if (result[0].user_id != res.req.user.user_id) {
              if (res.req.user.role != roles["super_admin"]) {
                return res.status(200).json({
                  main: "You don't have rights to update",
                  devMsg:
                    "User is niether super admin nor the challenge creator",
                });
              }
            }
*/
            //Storing updated challenge into db
            mysqlConnection.query(
              `UPDATE event SET ? WHERE id = ?`,
              [newEvent, eventId],
              (sqlErr, result, fields) => {
                if (sqlErr) {
                  console.log(sqlErr);
                  return res.status(500).json({
                    main: "Something went wrong. Please try again.",
                    devError: sqlErr,
                    devMsg: "Error occured while updating challenge in db",
                  });
                } else {
                  res
                    .status(200)
                    .json({ main: "Challenge updated Successfully." });
                }
              }
            );
          }
        }
      );
    } catch (error) {
      return res.status(500).json({
        main: "Something went wrong. Please try again.",
        devError: error,
        devMsg: "Error occured while updating challenge",
      });
    }
  }
);

//fetches all the event details
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    mysqlConnection.query("SELECT * from event", (err, rows, fields) => {
      if (!err) {
        res.status(200).send(rows);
      } else {
        console.log(err);
        res.status(400);
      }
    });
  }
);

//fetches all the event if category not passed or request by category if category passed
router.get(
  "/events/:location/:pageNum/:limit",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { location } = req.params;
    const category = req.query.category;

    let { limit, pageNum, offset } = generatePaginationValues(req);

    if (!location || pageNum == null || limit == null)
      return res
        .status(400)
        .json({ main: "Invalid Request", devMsg: "Invalid input parameter" });

    if (category) {
      const query = `SELECT a.id,a.name as eventname,a.description,a.start,a.end,a.city,a.location,a.maxparticipants,a.price,b.name as category FROM event a, event_type b where a.category=b.id and  b.name like ? limit ${limit} offset ${offset};`;
      mysqlConnection.query(query, category, (err, rows, fields) => {
        if (!err) {
          res.status(200).send(rows);
        } else {
          console.log(err);
          res.status(400);
        }
      });
    } else {
      const query = `SELECT a.id,a.name as eventname,a.description,a.start,a.end,a.city,a.location,a.maxparticipants,a.price,b.name as category FROM event a, event_type b where a.category=b.id limit ${limit} offset ${offset};`;
      mysqlConnection.query(query, (err, rows, fields) => {
        if (!err) {
          res.status(200).send(rows);
        } else {
          console.log(err);
          res.status(400);
        }
      });
    }
  }
);

//fetches details of the requested event
router.get(
  "/eventDetail/:eventId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { eventId } = req.params;

    if (!eventId)
      return res
        .status(400)
        .json({ main: "Invalid Request", devMsg: "No event id found" });

    const queryForEvent =
      "SELECT a.id,a.name as eventname,a.description,a.start,a.end,a.city,a.location,a.maxparticipants,a.price,b.name FROM `event` a,  `event_type` b where a.category=b.id  and a.id=? ;";

    const queryForOwner =
      "SELECT a.email,a.name,a.contact,a.address,a.city,b.isAdmin FROM `user` a, `event_owner` b where a.id=b.owner_id and b.event_id=?";

    //query to find if the event exists
    mysqlConnection.query(
      queryForEvent,
      eventId,
      (sqlErr, eventResult, fields) => {
        if (sqlErr) {
          return res.status(500).json({
            main: "Something went wrong. Please try again.",
            devError: sqlErr,
            devMsg: "Error occured while fetching challenge from db",
          });
        } else if (!eventResult.length) {
          //if no challenge found
          return res.status(200).json({
            main: "No such event exists",
            devMsg: "Event Id is invalid",
          });
        } else {
          //Nested query to fetch owners
          mysqlConnection.query(
            queryForOwner,
            eventId,
            (sqlErr, ownerResult, fields) => {
              if (sqlErr) {
                return res.status(500).json({
                  main: "Something went wrong. Please try again.",
                  devError: sqlErr,
                  devMsg: "Error occured while fetching owners from db",
                });
              } else if (!ownerResult.length) {
                //if no challenge found
                return res.status(200).json({
                  main: "No owners exists",
                  devMsg: "Event Id is invalid",
                });
              } else {
                let data = {
                  event_detail: eventResult,
                  owner_count: ownerResult.length,
                  owner_detail: ownerResult,
                };
                res.status(200).json(data);
              }
            }
          );
        }
      }
    );
  }
);

module.exports = router;
