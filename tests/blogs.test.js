const pageFactory = require("./factories/pageFactory");

let page;

// before each test function to start up browser in chromium
beforeEach(async () => {
  page = await pageFactory();

  // instruct chromium to visit localhost:3000 where our app is locally served
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
});

// cleanup tasks like closing Chromium browser
afterEach(async () => {
  // using pageFactory
  await page.browser.close();
});

describe("when logged in", () => {
  beforeEach(async () => {
    await page.login();
    await page.goto("http://localhost:3000/blogs", {
      waitUntil: "domcontentloaded",
    });
    // click the create new blog anchor tag
    await page.click("a.btn-floating");
  });

  test("Should see blog create form", async () => {
    // store the title label from the form
    const label = await page.getContentsOf("form label");

    expect(label).toEqual("Blog Title");
  });

  describe("And when using valid inputs", () => {
    // add common steps to setup tests in beforeEach
    beforeEach(async () => {
      // type in some valid input into form inputs
      await page.type(".title input", "My Test Title");
      await page.type(".content input", "My Test Content");
      await page.click("form button");
      //
    });

    test("Submitting takes user to review screen", async () => {
      const text = await page.getContentsOf("form h5");

      expect(text).toEqual("Please confirm your entries");
    });

    test("Submitting then saving adds blog to index page", async () => {
      await page.click("button.green");
      await page.waitForSelector(".card", { visible: true });

      const title = await page.getContentsOf(".card-title");
      const content = await page.getContentsOf("p");

      expect(title).toEqual("My Test Title");
      expect(content).toEqual("My Test Content");
    });
  });

  describe("And using invalid inputs", () => {
    // want to submit the form with invalid inputs being empty inputs
    beforeEach(async () => {
      await page.click("form button");
    });

    test("the form shows and error message", async () => {
      const titleError = await page.getContentsOf(".title .red-text");

      const contentError = await page.getContentsOf(".content .red-text");

      expect(titleError).toEqual("You must provide a value");
      expect(contentError).toEqual("You must provide a value");
    });
  });
});

describe("When user is not logged in", () => {
  const actions = [
    {
      method: "get",
      path: "/api/blogs",
    },
    {
      method: "post",
      path: "/api/blogs",
      data: {
        title: "Chromium Title",
        content: "Chromium Content",
      },
    },
  ];

  // test("User cannot create blog posts", async () => {
  //   const result = await page.post("/api/blogs", {
  //     title: "Chromium Title",
  //     content: "Chromium Content",
  //   });

  //   // console.log(result);
  //   expect(result).toEqual({ error: "You must log in!" });
  // });

  // test("User cannot get a list of blog posts", async () => {
  //   const result = await page.get("/api/blogs");

  //   expect(result).toEqual({ error: "You must log in!" });
  // });

  test("Blog related actions are prohibited", async () => {
    // this results will be an array of each or the returned responses an object with error property
    const results = await page.executeRequests(actions);

    for (let result of results) {
      expect(result).toEqual({ error: "You must log in!" });
    }
  });
});
