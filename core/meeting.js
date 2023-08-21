// Core meeting methods

async function toggleMic() {
    const mic = await this.page.waitForSelector('.HNeRed');
    await mic.click()
    this.isMicEnabled = !this.isMicEnabled;
}

async function toggleVideo() {
    await this.page.keyboard.down('ControlLeft');
    await this.page.keyboard.press('KeyE');
    await this.page.keyboard.up('ControlLeft');
    this.isVideoEnabled = !this.isVideoEnabled;
}

async function toggleChat() {
    const chatBtn = await this.page.waitForSelector('aria/Chat with everyone');
    await chatBtn.click();
}

function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
}

async function enableCaptions() {
    const burger = await this.page.waitForSelector('aria/More options');
    await burger.click();

    await delay(1000);

    const [button] = await this.page.$x("//li[contains(., 'Turn on captions')]");
    await button.click();
}

async function chatEnabled() {
    await this.page.waitForSelector('#bfTqV');
    var disabled = await this.page.evaluate(() => {
        disabled = document.querySelector('#bfTqV');
        if (disabled.disabled === false) {return true;} else if (disabled.disabled === true) {return false;}});
    return disabled;
}

async function sendMessage(message) {
    if (await this.chatEnabled()) {
        var chat = await this.page.waitForSelector('#bfTqV'); await chat.focus();
        await this.page.keyboard.type(message)
        //await this.page.$eval('#bfTqV', (input, message) => {input.value = message; console.log(input); console.log(message)}, message); // replaced `await page.keyboard.type(message)`, because this is a little more instant
        await this.page.keyboard.press('Enter');
    }
}

async function screenshot(path) {
    await this.page.screenshot({ path: path, fullPage: true });
}

module.exports = {
    toggleMic: toggleMic,
    toggleVideo: toggleVideo,
    toggleChat: toggleChat,
    chatEnabled: chatEnabled,
    sendMessage: sendMessage,
    screenshot: screenshot,
    enableCaptions: enableCaptions,
}
