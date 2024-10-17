const router = require("express").Router();
const {
  payment_create,
  call_back,
} = require("../controller/paymentController");
const bkash_auth = require("../middleware/middleware");

router.post("/bkash/payment/create", bkash_auth, payment_create);
router.get("/bkash/payment/callback", bkash_auth, call_back);
router.get("/bkash/payment/refund/:trxID", bkash_auth, call_back);
module.exports = router;
