// const puppeteer = require("puppeteer");
// const sessionFactory = require("./factories/sessionFactory");
// const userFactory = require("./factories/userFactory");
const pageFactory = require("./factories/pageFactory");
// const Page = require("./helpers/page");

let page;

// before each test function to start up browser in chromium
beforeEach(async () => {
  // browser = await puppeteer.launch({
  //   headless: false,
  // });

  // page = await browser.newPage();
  // instruct chromium to visit localhost:3000 where our app is locally served
  // await page.goto("http://localhost:3000/");

  // assigning page variable to Page class from helpers/page.js
  // page = await Page.build();
  // console.log("in header.test: page:", page);

  page = await pageFactory();

  // instruct chromium to visit localhost:3000 where our app is locally served
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
});

// cleanup tasks
afterEach(async () => {
  // await browser.close();
  // using the Page class from helpers/page.js
  // await page.close();
  // using pageFactory
  await page.browser.close();
});

// test to launch chromium browser
// will use puppeteer to create browser and use browser to create pages or tabs;
test("The header has the correct text", async () => {
  // grab the brand logo anchor tag
  //const text = await page.$eval("a.brand-logo", (el) => el.innerHTML);
  const text = await page.getContentsOf("a.brand-logo");

  expect(text).toEqual("Blogster");
});

test("Clicking login starts oauth flow", async () => {
  await page.click(".right a");

  // store the current url in the browser
  const url = await page.url();

  // console.log(url);

  expect(url).toMatch(/accounts\.google\.com/);
});

test("When signed in, shows the logout button", async () => {
  // attempt to sign in through test suite
  // create a new user with userFactory
  // const user = await userFactory();

  // console.log(user);

  // pass the user into the sessionFactory
  // const { session, sig } = sessionFactory(user);

  // now all need doing is take sessionString and the cig and set them on an actual cookie on our chromium instance
  // await page.setCookie({ name: "session", value: session });
  // await page.setCookie({ name: "session.sig", value: sig });

  // need to refresh the page to make the app rerender and load with signed-in elements on page
  // await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });

  // use the pageFactory
  await page.login();

  // select the logout anchor tag
  // const text = await page.$eval(
  //   '.nav-wrapper a[href="/auth/logout"]',
  //   (el) => el.innerHTML
  // );
  await page.waitForSelector('.nav-wrapper a[href="/auth/logout"]', {
    visible: true,
  });
  const text = await page.getContentsOf('.nav-wrapper a[href="/auth/logout"]');

  // need to make use of waitFor because all the code in this test is being run as fast as possible
  // and the above lines of code have not finished running before the below line of code is run which means it will fail
  // this is why need to add options object as a 2nd parameter to goto function { waitUntil: "domcontentloaded" }
  expect(text).toEqual("Logout");
});
