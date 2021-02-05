import * as fs from "fs";
import { encode } from "html-entities";

const postMessage = (object: object) =>
  `window.top.postMessage(${JSON.stringify(object)}, "*");`;

export const trust = () => {
  const front = `
    <button onClick='${postMessage({
      action: "flip",
    })}'>Special button</button>
    `;

  const back = `
    <button onClick='${(postMessage({
      answer: "correct",
    }))}'>Right</button>
    <button onClick='${postMessage({
      answer: "incorrect",
    })}'>Wrong</button>
    `;

  return { front, back };
};

export const writeCardToDisk = (card: { front: string; back: string }) => {
  const out = `
    <html>
    <script>
        window.addEventListener("message", event => { console.log(event.data); });
    </script>
    <body>
    <iframe srcDoc="${card.front}"></iframe>
    <iframe srcDoc="${card.back}"></iframe>
    </body>
    </html>
    `;

  fs.writeFileSync("./test.html", out);
};

writeCardToDisk(trust());
