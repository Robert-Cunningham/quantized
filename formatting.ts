export const injectReact = (react: string) => `
<script src="https://unpkg.com/react@17/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<div id="root"></div>
<script type="text/babel">
    ${react}

    ReactDOM.render(<App/>, document.getElementById('root'));
</script>
`

export const standardFormat = (HTMLFields: string[], HTMLAnswer: string) => {
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
            input {
                width: 100%;
                padding: 10px;
                border: lightgrey 1px solid;
            }
            body, html {height: 100%; }
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
}

//button onClick='window.top.postMessage({"answer":"correct"}, "*");'

const genericButton = (color: string, text: string, onclickMessage: object | string) =>
    `<button style='background-color:${color}' onclick='window.top.postMessage(${
        typeof onclickMessage === 'object' ? JSON.stringify(onclickMessage) : onclickMessage
    }, "*");'>${text}</button>`

export const genericTextBox = (correctAnswer: string) =>
    `<html><input type='text' placeholder='Type your answer here' autofocus
    oninput='window.top.postMessage({"action": "type", "value": this.value}, "*");'
    onchange='window.top.postMessage({"action": "submit", "value": this.value, "answer": this.value === "${correctAnswer}" ? "correct" : "incorrect"}, "*");
    window.top.postMessage({"action": "flip"}, "*");
    window.correct = this.value === "${correctAnswer}";'
    ></input></html>`

export const genericTextBoxBack = () =>
    `  
<script></script>
${genericButton('#7a7682', 'Next', "{answer: window.correct ? 'incorrect' : 'correct'}")}
`

//console.log(standardFormat(['a', 'b', 'c'], '<button style="background-color:#f14e4e" onclick=">Test Button</button>'))
export const trustAnswerBack = [
    genericButton('#f14e4e', 'Wrong', { answer: 'incorrect' }),
    genericButton('#71f14e', 'Correct', { answer: 'correct' }),
].join('\n')

export const trustAnswerFront = genericButton('#7a7682', 'Show Answer', { action: 'flip' })

export const answerTypeBack = null

export const trustTypeFront = genericButton('#7a7682', 'Show Answer', { action: 'flip' })
//console.log(standardFormat(['a', 'b', 'c'], genericTextBox('right')))
