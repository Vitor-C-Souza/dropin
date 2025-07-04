const express = require("express");
const bodyParser = require("body-parser");
const braintree = require("braintree");
const app = express();

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: "zdv5fs6kk58q5bzx",
  publicKey: "qcwzs4xqxvfxxwv9",
  privateKey: "171cd3d4b3b8bd9d3dec4ebb270bff54",
});

app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/checkout", (req, res) => {
  const nonce = req.body.paymentMethodNonce;

  gateway.transaction.sale(
    {
      amount: "10.00",
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true,
      },
    },
    (err, result) => {
      if (err || !result.success) {
        return res.status(500).send(err || result);
      }
      res.send(result);
    }
  );
});

app.listen(3000, () => {
  console.log("Servidor no ar: porta 3000");
});
