// Main initializing function

// Only logs in, however we can skip this by just waiting for the chat button or the leave meeting button. Then signing in can be done manually with headless mode disabled, and the package just automates the other stuff

function delay(time) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time)
  });
}

async function leave() {
  const leave = await this.page.waitForSelector('aria/Leave call');
  await leave.click();
  this.browser.close();
}

async function auth({ meetingLink, email, pw }) {

  if (!meetingLink.startsWith("https://meet.google.com/")) { throw ("Meeting Link isn't valid. Make sure it looks like 'https://meet.google.com/xyz-wxyz-xyz'!"); }
  //if (!email.endsWith("@gmail.com")) {throw("Email isn't a Google Account");}

  this.meetingLink = meetingLink; this.email = email;
  //this.browser = await this.puppeteer.launch({ headless: "new" });
  this.browser = await this.puppeteer.launch({ headless: false });
  this.page = await this.browser.newPage();
  await this.page.setBypassCSP(true)

  this.ctx = await this.browser.defaultBrowserContext(); await this.ctx.overridePermissions('https://meet.google.com', ['microphone', 'camera', 'notifications']);

  await this.page.goto(meetingLink);
  const navigationPromise = this.page.waitForNavigation({ waitUntil: "domcontentloaded" });

  // Authenticating with credentials
  console.log("Logging in...")
  await this.screenshot('logging-in.png'); // Double check that the meet is about to be joined to. Quickest way to make sure that there aren't any prompts (Like Google's "confirm recovery email" prompt), that can leave the browser hanging.
  try {
    var signInButton = await this.page.waitForSelector('.NPEfkd', { visible: true, timeout: 10000 }); await signInButton.focus(); await signInButton.click();
  } catch (e) {
    console.log(e)
    // Sign In button is not visible, so we assume the page has already redirected, and is not accepting anonymous meeting members - Support for anonymous joining may be implemented in the future
  }
  var input = await this.page.waitForSelector('input[type=email]', { visible: true, timeout: 10000 }); await input.focus();

  await navigationPromise;
  await this.page.keyboard.type(email);
  await delay(1000);
  await this.page.keyboard.press('Enter');

  await navigationPromise;
  var input = await this.page.waitForSelector('input[type=password]', { visible: true, timeout: 100000 }); await input.focus();
  await this.page.keyboard.type(pw);
  await delay(1000);
  await this.page.keyboard.press('Enter');
  console.log("Authenticated successfully!");
  await this.screenshot('logged-in.png'); // Double check that the meet is about to be joined to. Quickest way to make sure that there aren't any prompts (Like Google's "confirm recovery email" prompt), that can leave the browser hanging.
  //// Although you can edit the package's code to fit your scenario, the easiest way to fix anything that leaves this program hanging, is to just run the package without headless mode. That way you can continue on any prompts or see issues fast.
  //// Join Google Meet
  await this.page.waitForSelector('div[role=button]');
  await navigationPromise;
  let join = await this.page.waitForSelector('#yDmH0d > c-wiz > div > div > div:nth-child(14) > div.crqnQb > div > div.gAGjv > div.vgJExf > div > div > div.d7iDfe.NONs6c > div.shTJQe > div.jtn8y > div.XCoPyb > div:nth-child(1) > button', { visible: true, timeout: 0 });

  await delay(1000);

  let dismiss = await this.page.$x("//span[contains(text(), 'Dismiss')]");
  if (dismiss.length > 0) {
    await dismiss[0].click();
    await delay(1000);
  }

  await this.toggleMic();
  await delay(1000);

  await navigationPromise;
  await join.click();
  await delay(1000);

  dismiss = await this.page.$x("//span[contains(text(), 'Dismiss')]");
  if (dismiss.length > 0) {
    await dismiss[0].click();
    await delay(1000);
  }

  console.log("clicked join");

  await delay(2000);
  await this.toggleChat();
  //await this.enableCaptions();

  console.log("toggled chat");

  this.message.messageListener(this);
  //this.message.captionListener(this);

  this.isChatEnabled = this.chatEnabled;
  this.Audio = new this.audio(this.page);
  console.log("Meeting joined, and listeners are listening!");
  this.emit('ready');

}


module.exports = {
  auth: auth,
  leave: leave
}
