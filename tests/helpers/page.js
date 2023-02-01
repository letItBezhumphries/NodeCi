const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

// class CustomPage {
//   static async build(browser) {
//     const page = await browser.newPage();

//     const customPage = new CustomPage(page);

//     return new Proxy(customPage, {
//       get: function (target, p, receiver) {
//         if (target[p as keyof typeof p]) {
//           return target[p as keyof typeof p];
//         }

//         const value = page[p as keyof Page];
//         if (value instanceof Function) {
//           return function (this, ...args) {
//             return (value as Function).apply(this === receiver ? page : this)
//           }
//         }
//         return target[property] || page[property] || browser[property];
//       },
//     });
//   }
// }

class CustomPage {
  // static build function will create a new puppetteer browser and page instance
  static async build() {
    const browser = await puppeteer.launch({
      headless: false,
    });

    // need to create new page instance
    const page = await browser.newPage();

    // create new instance of CustomPage with page passed to it and then combine them together with Proxy
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function (target, property) {
        return customPage[property] || browser[property] || page[property];
      },
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: "session", value: session });
    await this.page.setCookie({ name: "session.sig", value: sig });
    //refresh the page to send cookies to the server
    await this.page.goto("http://localhost:3000/", {
      waitUntil: "domcontentloaded",
    });

    await this.page.waitForSelector(".nav-wrapper a[href='/auth/logout']", {
      timeout: 2000,
    });
  }
}

module.exports = CustomPage;
