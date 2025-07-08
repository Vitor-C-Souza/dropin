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

app.post("/checkout", async (req, res) => {
  const nonce = req.body.paymentMethodNonce;
  const amount = parseFloat(req.body.amount).toFixed(2);
  const firstName = req.body.firstName || "Cliente Dropin";
  const email = req.body.email || "cliente@exemplo.com";
  const cpf = req.body.cpf || "";

  console.log("Recebido do frontend:", {
    nonce,
    amount,
    firstName,
    email,
    cpf,
  });

  try {
    // 1. Cria um cliente e salva o método de pagamento
    const customerResult = await gateway.customer.create({
      firstName: firstName,
      email: email,
      paymentMethodNonce: nonce,
      customFields: {
        cpf: cpf,
      },
    });

    if (!customerResult.success) {
      console.error("Erro ao criar cliente:", customerResult.message);
      return res.status(500).send(customerResult);
    }

    const paymentToken = customerResult.customer.paymentMethods[0].token;
    console.log("CPF do cliente:", customerResult.customer.customFields.cpf);

    // 2. Realiza a transação usando o token salvo
    const transactionResult = await gateway.transaction.sale({
      amount: amount,
      paymentMethodToken: paymentToken,
      options: {
        submitForSettlement: true,
      },
    });

    if (!transactionResult.success) {
      console.error("Erro na transação:", transactionResult.message);
      return res.status(500).send(transactionResult);
    }

    res.send({
      success: true,
      transaction: transactionResult.transaction,
      reusableToken: paymentToken,
    });
  } catch (err) {
    console.error("Erro inesperado:", err);
    res.status(500).send({ success: false, error: err });
  }
});

app.listen(3000, () => {
  console.log("Servidor no ar: porta 3000");
});
