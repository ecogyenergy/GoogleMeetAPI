// Message Listener

async function captionListener(Meet) {

    function updateCaption(speaker, captions) {
        console.log("speaker", speaker)
        console.log("captions", captions)
        for (const caption of captions) {

            console.log("caption ptr?", Meet.fragmentStorage.has(caption.ptr))
            if (Meet.fragmentStorage.has(caption.ptr)) {
                return
            }

            Meet.fragmentStorage.add(caption.ptr);

            Meet.fragments.push({
                speaker: speaker,
                fragment: caption.text,
            })

            console.log("fragments", Meet.fragments)
        }
    }

    async function getRecentCaptions() {
        const message = await Meet.page.evaluate(() => {

            function getPathTo(element) {
                if (element.id !== '')
                    return 'id("' + element.id + '")';
                if (element === document.body)
                    return element.tagName;

                var ix = 0;
                var siblings = element.parentNode.childNodes;
                for (var i = 0; i < siblings.length; i++) {
                    var sibling = siblings[i];
                    if (sibling === element)
                        return getPathTo(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
                    if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
                        ix++;
                }
            }

            const containers = document.querySelectorAll('.iOzk7')

            let retval = []

            for (const container of containers) {


                if (container.children.length > 0) {

                    const caption = container.firstChild
                    const content_elements = caption.lastChild.firstChild

                    let contents = []
                    for (let i = 0; i < content_elements.childNodes.length; i++) {
                        contents.push({
                            text: content_elements.childNodes.item(i).textContent,
                        })
                    }

                    retval.push({
                        ptr: getPathTo(caption),
                        speaker: caption.childNodes.item(1).textContent,
                        fragments: contents,
                    })
                }

            }

            return retval
        })

        //console.log(JSON.stringify(message, null, 2))
    }


    await Meet.page.waitForSelector('.iOzk7');
    await Meet.page.exposeFunction('getRecentCaptions', getRecentCaptions)

    await Meet.page.evaluate(() => {
        const captionObserver = new MutationObserver(() => {
            getRecentCaptions();
        });
        captionObserver.observe(document.querySelector('.iOzk7'), {
            subtree: true,
            childList: true
        });
    });

}

async function messageListener(Meet) {

    async function getRecentMessage() {
        var message = await Meet.page.evaluate(() => {
            chat = document.querySelector('.z38b6').lastChild;
            return {
                author: chat.firstChild.firstChild.innerText,
                time: chat.firstChild.lastChild.innerText,
                content: chat.lastChild.lastChild.innerText
            }; // See div.html
        })

        if (message.time !== "You") {
            await Meet.emit('message', message);
            Meet.recentMessage = message;
            return message;
        }
    }

    await Meet.page.waitForSelector('.GDhqjd', {timeout: 0});
    getRecentMessage();

    await Meet.page.exposeFunction('getRecentMessage', getRecentMessage)

    await Meet.page.evaluate(() => {
        // https://stackoverflow.com/questions/47903954/how-to-inject-mutationobserver-to-puppeteer
        // https://stackoverflow.com/questions/54109078/puppeteer-wait-for-page-dom-updates-respond-to-new-items-that-are-added-after/54110446#54110446
        messageObserver = new MutationObserver(() => {
            getRecentMessage();
        });
        messageObserver.observe(document.querySelector('.z38b6'), {subtree: true, childList: true});
    });

}

module.exports = {
    messageListener: messageListener,
    captionListener: captionListener
}
