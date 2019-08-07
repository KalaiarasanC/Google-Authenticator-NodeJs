const Express = require("express");
const Speakeasy = require("speakeasy");
const fs = require("fs");
const filePath = "./user.json";
const users = require(filePath);
const qrCode = require("qrcode");
var app = Express();

app.get("/add/:username", (request, response, next) => {
  var secret = Speakeasy.generateSecret({ length: 25 });
  if (!users[request.params.username]) {
    const a = {
      secretkey: secret.base32
    };
    users[request.params.username] = a;
    fs.writeFileSync(filePath, JSON.stringify(users));
    qrCode.toDataURL(secret.otpauth_url).then(data => {
      return response.write(`<img src="${data}" />`);
    });
  } else {
    response.send("user exists");
  }
});

app.get("/validate/:username/:otp", (request, response, next) => {
    if (users[request.params.username]) {
    const token = request.params.otp
  const isvalid =  Speakeasy.totp.verify({
        secret: users[request.params.username].secretkey,
        encoding: "base32",
        token: request.params.otp
    })
    return isvalid ? response.sendStatus(200) : response.sendStatus(401);
}
});

app.listen(3000, () => {
  console.log("Listening at :3000...");
});
