const express = require("express");
const bodyParser = require("body-parser");
const braintree = require("braintree");
const cors = require("cors");
const app = express();

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: "zdv5fs6kk58q5bzx",
  publicKey: "qcwzs4xqxvfxxwv9",
  privateKey: "171cd3d4b3b8bd9d3dec4ebb270bff54",
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/checkout", (req, res) => {
  const nonce = req.body.paymentMethodNonce;
  var amount = parseFloat(req.body.amount).toFixed(2);

  console.log("Recebido do frontend:", { nonce, amount });

  gateway.transaction.sale(
    {
      amount: amount,
      paymentMethodNonce: nonce,
      options: {
        submitForSettlement: true,
      },
    },
    (err, result) => {
      if (err || !result.success) {
        console.error("Erro na transação:", err, result);
        return res.status(500).send(err || result);
      }
      res.send(result);
    }
  );
});

app.listen(3000, () => {
  console.log("Servidor no ar: porta 3000");
});
