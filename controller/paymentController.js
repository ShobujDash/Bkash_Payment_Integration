const axios = require("axios");
const { getValue, setValue } = require("node-global-storage");
const { v4: uuidv4 } = require("uuid");
const paymentModel = require("../modal/paymentModal");

const bkash_header = async () => {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    authorization: `Bearer ${getValue("id_token")}`,
    "x-App-Key": process.env.bkash_api_key,
  };
};

const payment_create = async (req, res) => {
  const { amount, userId } = req.body;
  setValue("userId", userId, { protected: true });

  try {
    const { data } = await axios.post(
      process.env.bkash_create_payment_url,
      {
        mode: "0011",
        payerReference: " ",
        callbackURL: "http://localhost:5000/api/bkash/payment/callback",
        amount: amount,
        currency: "BDT",
        intent: "sale", // Check if 'intent' should be 'sale' or something else
        merchantInvoiceNumber: "Inv" + uuidv4().substring(0, 5),
      },
      {
        headers: await bkash_header(),
      }
    );

    return res.status(200).json({ bkashURL: data.bkashURL });
  } catch (error) {
    console.error("Payment creation error:", error.message);
    return res.status(500).json({ error: "Payment creation failed" });
  }
};

const call_back = async (req, res) => {
  const { paymentID, status } = req.query;

  if (status === "cancel" || status === "failure") {
    return res.redirect(`http://localhost:5173/error?message=${status}`);
  }

  if (status === "success") {
    try {
      const { data } = await axios.post(
        process.env.bkash_execute_payment_url,
        { paymentID },
        {
          headers: await bkash_header(),
        }
      );
      if (data && data.statusCode === "0000") {
        //const userId = globals.get('userId')
        // await paymentModel.create({
        //   userId: Math.random() * 10 + 1,
        //   paymentID,
        //   trxID: data.trxID,
        //   date: data.paymentExecuteTime,
        //   amount: parseInt(data.amount),
        // });

        return res.redirect(`http://localhost:5173/success`);
      } else {
        return res.redirect(
          `http://localhost:5173/error?message=${data.statusMessage}`
        );
      }
    } catch (error) {
      console.log(error);
      return res.redirect(
        `http://localhost:5173/error?message=${error.message}`
      );
    }
  }
};


const refund = async (req,res) => {
  const { trxID } = req.params;

  try {
    const payment = await paymentModel.findOne({trxID})

    const { data } = await axios.get(
      process.env.bkash_refund_transaction_url,
      {
        paymentID: payment.paymentID,
        amount: payment.amount,
        trxID,
        sku: "payment",
        reason: "cashback",
      },
      {
        headers: await bkash_header()
      }
    );

    if (data && data.statusCode === '0000') {
      return res.status(200).json({message:'refund success'})
    } else {
      return res.status(400).json({ message: "refund failed" });
    }
  } catch (error) {
    return res.status(404).json({ message: "refund failed" });
  }
}

module.exports = { payment_create, call_back };
