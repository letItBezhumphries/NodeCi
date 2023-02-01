const Page = require("puppeteer/lib/Page");
const userFactory = require("../factories/userFactory");
const sessionFactory = require("../factories/sessionFactory");

Page.prototype.login = async function () {
  const user = await userFactory();

  const { session, sig } = sessionFactory(user);

  await this.setCookie({ name: "session", value: session });
  await this.setCookie({ name: "session.sig", value: sig });

  await this.goto("http://localhost:3000/", {
    waitUntil: "domcontentloaded",
  });
};
