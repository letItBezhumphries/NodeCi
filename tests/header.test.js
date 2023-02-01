const pageFactory = require("./factories/pageFactory");

let page;


beforeEach(async () => {


  page = await pageFactory();

 
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
});


afterEach(async () => {

  await page.browser.close();
});


test("The header has the correct text", async () => {

  const text = await page.getContentsOf("a.brand-logo");

  expect(text).toEqual("Blogster");
});

test("Clicking login starts oauth flow", async () => {
  await page.click(".right a");


  const url = await page.url();



  expect(url).toMatch(/accounts\.google\.com/);
});

test("When signed in, shows the logout button", async () => {

  await page.login();


  await page.waitForSelector('.nav-wrapper a[href="/auth/logout"]', {
    visible: true,
  });
  const text = await page.getContentsOf('.nav-wrapper a[href="/auth/logout"]');


  expect(text).toEqual("Logout");
});
