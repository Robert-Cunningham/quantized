const standardFormat = (HTMLFields: string[], HTMLAnswer: string) => {
    const out = `
<html>
    <head>
        <style type="text/css">
            * {
                margin: 0;
                padding: 0;
                border: 0;
            }
            .parent {
                display:grid;
                justify-items: center;
                align-content: center; 
                grid-gap: 15px;
                height: calc(100% - 50px);
            }
            .item {
                border: lightgrey solid 1px; 
                padding: 10px;
            }
            .answer {
                height: 50px;
                align-self: end;
                justify-self: end;
                display: grid;
                justify-items: center;
                align-content: center; 
                grid-template-rows: 1fr;
                grid-auto-flow: column;
            }
            button {
                width: 100%;
                padding: 10px;
                color: #FFFFFF;
            }
        </style>
    </head>

    <body>
        <div class="parent">
            ${HTMLFields.map((h) => `<div class="item">${h}</div>`).join('\n')}
        </div>
            <div class="answer">
                ${HTMLAnswer}
            </div>
    </body>
</html>
    `

    return out.split(/\s+/g).join(' ')
}

/*
            button {
             display:inline-block;
             padding:0.6em 2.4em;
             margin:0 0.1em 0.1em 0;
             border:0.16em solid rgba(255,255,255,0);
             border-radius:4em;
             box-sizing: border-box;
             text-decoration:none;
             font-family:'Roboto',sans-serif;
             font-weight:300;
             color:#FFFFFF;
             text-shadow: 0 0.04em 0.04em rgba(0,0,0,0.35);
             text-align:center;
             transition: all 0.2s;
            }
            button:hover {
             border-color: rgba(255,255,255,1);
            }
            */

//button onClick='window.top.postMessage({"answer":"correct"}, "*");'

const genericButton = (color: string, text: string, onclickMessage: object) =>
    `<button style='background-color:${color}' onclick='window.top.postMessage(${JSON.stringify(
        onclickMessage
    )}, "*");'>${text}</button>`

//console.log(standardFormat(['a', 'b', 'c'], '<button style="background-color:#f14e4e" onclick=">Test Button</button>'))
const trustAnswer = [
    genericButton('#f14e4e', 'Wrong', { answer: 'incorrect' }),
    genericButton('#71f14e', 'Correct', { answer: 'correct' }),
].join('\n')

console.log(standardFormat(['a', 'b', 'c'], trustAnswer))
