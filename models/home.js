const SQLdb = require("../utils/SQLdatabaseUtil");
module.exports = class Home {
  constructor(
    id,
    houseName,
    price,
    location,
    rating,
    photoUrl,
    description,
    ownerId
  ) {
    this.id = id;
    this.houseName = houseName;
    this.price = price;
    this.location = location;
    this.rating = rating;
    this.photoUrl = photoUrl;
    this.description = description;
    this.ownerId = ownerId;
  }
  save() {
    if (this.id) {
      return SQLdb.query(
        "UPDATE homes SET houseName = ?, price = ?, location = ?, rating = ?, photoUrl = ?, description = ? WHERE id = ? AND ownerId=?",
        [
          this.houseName,
          this.price,
          this.location,
          this.rating,
          this.photoUrl,
          this.description,
          this.id,
          this.ownerId,
        ]
      );
    } else {
      return SQLdb.query(
        "INSERT INTO homes(houseName,price,location,rating,photoUrl,description,ownerId) VALUES (? , ? , ? , ? , ? ,? , ?)",
        [
          this.houseName,
          this.price,
          this.location,
          this.rating,
          this.photoUrl,
          this.description,
          String(this.ownerId),
        ]
      );
    }
  }
  static fetchAll() {
    return SQLdb.query("SELECT * FROM homes");
  }
  static findById(homeId) {
    return SQLdb.query("SELECT * FROM homes WHERE id=?", [homeId]);
  }
  static deleteById(homeId, callback) {
    return SQLdb.query("DELETE FROM homes WHERE id=?", [homeId]);
  }
  static fetchAllByOwner(ownerId) {
    return SQLdb.query("SELECT * FROM homes WHERE ownerId=?", String([ownerId]));
  }
};
