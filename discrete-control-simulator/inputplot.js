var inCanvasElement = document.getElementById('input')
var inCanvas = inCanvasElement.getContext('2d')
var inWidth = inCanvasElement.width
var inHeight = inCanvasElement.height
var inPadProportion = 0.08

//top left corner is origin
inCanvas.font = '12px serif'
inCanvas.textAlign = 'center'
inCanvas.textBaseline = 'middle'

function drawInput() {
    //Background
    inCanvas.fillStyle = backgroundColour
    inCanvas.fillRect(0, 0, inWidth, inHeight)

    //Axes
    inCanvas.lineWidth = 2
    inCanvas.strokeStyle = lightPlotColour
    inCanvas.beginPath()
    inCanvas.moveTo(inWidth * inPadProportion, inHeight * inPadProportion)
    inCanvas.lineTo(inWidth * inPadProportion, inHeight * (1 - inPadProportion))
    inCanvas.moveTo(inWidth * inPadProportion, inHeight * 0.5)
    inCanvas.lineTo(inWidth * (1 - inPadProportion), inHeight * 0.5)
    inCanvas.stroke()

    //Vertical axis arrow
    inCanvas.fillStyle = darkPlotColour
    inCanvas.beginPath()
    inCanvas.moveTo(inWidth * inPadProportion, inHeight * inPadProportion - 5)
    inCanvas.lineTo(inWidth * inPadProportion - 5, inHeight * inPadProportion + 5)
    inCanvas.lineTo(inWidth * inPadProportion + 5, inHeight * inPadProportion + 5)
    inCanvas.fill()
    inCanvas.fillText('m[k]', inWidth * inPadProportion, inHeight * inPadProportion - 12)

    //Horizontal axis arrow
    inCanvas.fillStyle = darkPlotColour
    inCanvas.beginPath()
    inCanvas.moveTo(inWidth * (1 - inPadProportion) + 5, inHeight * 0.5)
    inCanvas.lineTo(inWidth * (1 - inPadProportion) - 5, inHeight * 0.5 - 5)
    inCanvas.lineTo(inWidth * (1 - inPadProportion) - 5, inHeight * 0.5 + 5)
    inCanvas.fill()
    inCanvas.fillText('k', inWidth * (1 - inPadProportion) + 12, inHeight * 0.5)

    //Plot points
    inCanvas.strokeStyle = darkPlotColour
    inCanvas.fillStyle = darkPlotColour
    maxMk = 0
    graphPoints = toNumber(interface.graphPoints)
    decimalPoints = toNumber(interface.decimalPoints)
    for(var i = 0; i < graphPoints; i++) {
        if(ms.length - graphPoints + i >= 0) {
            gmk = ms[ms.length - graphPoints + i]
            maxMk = Math.max(maxMk, Math.abs(gmk))
        }
    }
    if(maxMk == 0) {
        maxMk = 1
    }

    inLineValues = []
    for(var i = 0; i < Math.min(ms.length, graphPoints); i++) {
        n = ms.length - Math.min(ms.length, graphPoints) + i
        gmk = 0
        if(n >= 0 && n < ms.length) {
            gmk = ms[n]
        }
        x = inWidth * inPadProportion + i * inWidth * (1 - 2 * inPadProportion) / graphPoints
        y = inHeight * 0.5 - gmk * inHeight * (0.5 - inPadProportion) / maxMk
        inLineValues.push({
            x: x,
            y: y,
            n: n,
            gmk: gmk
        })
    }

    if(inLineValues.length > 0) {
        if(interface.showLines) {
            inCanvas.strokeStyle = valueLineColour
            inCanvas.beginPath()
            inCanvas.moveTo(inLineValues[0].x, inLineValues[0].y)
            for(var i = 1; i < inLineValues.length; i++) {
                inCanvas.lineTo(inLineValues[i].x, inLineValues[i].y)
            }
            inCanvas.stroke()
        }
    }

    inCanvas.strokeStyle = darkPlotColour
    for(var i = 0; i < inLineValues.length; i++) {
        x = inLineValues[i].x
        y = inLineValues[i].y
        n = inLineValues[i].n
        gmk = inLineValues[i].gmk
        if(interface.showStems) {
            inCanvas.beginPath()
            inCanvas.moveTo(x, inHeight * 0.5)
            inCanvas.lineTo(x, y)
            inCanvas.stroke()
        }
        inCanvas.beginPath()
        inCanvas.arc(x, y, 4, 0, Math.PI * 2, true)
        inCanvas.fill()
        if(i == 0) {
            inCanvas.textAlign = 'right'
            if(interface.showCMValues) {
                inCanvas.fillText(gmk.toFixed(Math.max(0, decimalPoints)), x - 10, y)
            }
            if(interface.showKValues) {
                if(gmk >= 0) {
                    inCanvas.fillText(n, x - 10, inHeight * 0.5 + 12)
                } else {
                    inCanvas.fillText(n, x - 10, inHeight * 0.5 - 12)
                }
            }
            inCanvas.textAlign = 'center'
        } else if(gmk >= 0) {
            if(interface.showCMValues) {
                inCanvas.fillText(gmk.toFixed(Math.max(0, decimalPoints)), x, y - 15)
            }
            if(interface.showKValues) {
                inCanvas.fillText(n, x, inHeight * 0.5 + 12)
            }
        } else {
            if(interface.showCMValues) {
                inCanvas.fillText(gmk.toFixed(Math.max(0, decimalPoints)), x, y + 15)
            }
            if(interface.showKValues) {
                inCanvas.fillText(n, x, inHeight * 0.5 - 12)
            }
        }
    }
    window.requestAnimationFrame(drawInput)
}

drawInput()