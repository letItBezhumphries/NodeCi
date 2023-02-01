const puppeteer = require("puppeteer");
const sessionFactory = require("./sessionFactory");
const userFactory = require("./userFactory");

async function pageFactory() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();

  page.browser = browser;
  page.login = login;
  page.getContentsOf = getContentsOf;
  page.get = get;
  page.post = post;
  page.executeRequests = executeRequests;
  return page;
}

async function login() {
  const user = await userFactory();
  const { session, sig } = sessionFactory(user);

  await this.setCookie({ name: "session", value: session });
  await this.setCookie({ name: "session.sig", value: sig });
  await this.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
}

async function getContentsOf(selector) {
  return this.$eval(selector, (el) => el.innerHTML);
}

async function get(path) {
  return this.evaluate((_path) => {
    return fetch(_path, {
      method: "GET",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  }, path);
}

async function post(path, data) {
  return this.evaluate(
    (_path, _data) => {
      return fetch(_path, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_data),
      }).then((res) => res.json());
    },
    path,
    data
  );
}

async function executeRequests(actions) {
  return Promise.all(
    actions.map(({ method, path, data }) => {
      return this[method](path, data);
    })
  );
}

module.exports = pageFactory;
