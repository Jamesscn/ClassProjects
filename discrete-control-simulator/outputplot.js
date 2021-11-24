var outCanvasElement = document.getElementById('output')
var outCanvas = outCanvasElement.getContext('2d')
var outWidth = outCanvasElement.width
var outHeight = outCanvasElement.height
var outPadProportion = 0.08

var backgroundColour = "rgb(62, 142, 208)"
var lightPlotColour = "rgb(220, 220, 220)"
var darkPlotColour = "rgb(255, 255, 255)"
var disturbanceColour = "rgb(161, 213, 255)"
var valueLineColour = "rgb(255, 123, 61)"
var referenceLineColour = "rgb(151, 255, 94)"

//top left corner is origin
outCanvas.font = '12px serif'
outCanvas.textAlign = 'center'
outCanvas.textBaseline = 'middle'

function drawOutput() {
    //Background
    outCanvas.fillStyle = backgroundColour
    outCanvas.fillRect(0, 0, outWidth, outHeight)

    //Axes
    outCanvas.strokeStyle = lightPlotColour
    outCanvas.lineWidth = 2
    outCanvas.beginPath()
    outCanvas.moveTo(outWidth * outPadProportion, outHeight * outPadProportion)
    outCanvas.lineTo(outWidth * outPadProportion, outHeight * (1 - outPadProportion))
    outCanvas.moveTo(outWidth * outPadProportion, outHeight * 0.5)
    outCanvas.lineTo(outWidth * (1 - outPadProportion), outHeight * 0.5)
    outCanvas.stroke()

    //Vertical axis arrow
    outCanvas.fillStyle = darkPlotColour
    outCanvas.beginPath()
    outCanvas.moveTo(outWidth * outPadProportion, outHeight * outPadProportion - 5)
    outCanvas.lineTo(outWidth * outPadProportion - 5, outHeight * outPadProportion + 5)
    outCanvas.lineTo(outWidth * outPadProportion + 5, outHeight * outPadProportion + 5)
    outCanvas.fill()
    outCanvas.fillText('c[k]', outWidth * outPadProportion, outHeight * outPadProportion - 12)

    //Horizontal axis arrow
    outCanvas.fillStyle = darkPlotColour
    outCanvas.beginPath()
    outCanvas.moveTo(outWidth * (1 - outPadProportion) + 5, outHeight * 0.5)
    outCanvas.lineTo(outWidth * (1 - outPadProportion) - 5, outHeight * 0.5 - 5)
    outCanvas.lineTo(outWidth * (1 - outPadProportion) - 5, outHeight * 0.5 + 5)
    outCanvas.fill()
    outCanvas.fillText('k', outWidth * (1 - outPadProportion) + 12, outHeight * 0.5)

    //Plot points
    outCanvas.strokeStyle = darkPlotColour
    outCanvas.fillStyle = darkPlotColour
    maxCk = 0
    graphPoints = toNumber(interface.graphPoints)
    decimalPoints = toNumber(interface.decimalPoints)
    for(var i = 0; i < graphPoints; i++) {
        if(cs.length - graphPoints + i >= 0) {
            gck = cs[cs.length - graphPoints + i]
            cnp = cnps[cs.length - graphPoints + i]
            grk = rs[cs.length - graphPoints + i]
            maxCk = Math.max(maxCk, Math.abs(gck), Math.abs(cnp), Math.abs(grk))
        }
    }
    if(maxCk == 0) {
        maxCk = 1
    }

    outLineValues = []
    for(var i = 0; i < Math.min(cs.length, graphPoints); i++) {
        n = cs.length - Math.min(cs.length, graphPoints) + i
        gck = 0
        if(n >= 0 && n < cs.length) {
            gck = cs[n]
            cnp = cnps[n]
            grk = rs[n]
        }
        x = outWidth * outPadProportion + i * outWidth * (1 - 2 * outPadProportion) / graphPoints
        y = outHeight * 0.5 - gck * outHeight * (0.5 - outPadProportion) / maxCk
        y1 = outHeight * 0.5 - cnp * outHeight * (0.5 - outPadProportion) / maxCk
        y2 = outHeight * 0.5 - grk * outHeight * (0.5 - outPadProportion) / maxCk
        outLineValues.push({
            x: x,
            y: y,
            y1: y1,
            y2: y2,
            n: n,
            gck: gck,
            cnp: cnp,
        })
    }

    if(outLineValues.length > 0) {
        if(interface.showReference) {
            outCanvas.strokeStyle = referenceLineColour
            outCanvas.beginPath()
            outCanvas.moveTo(outLineValues[0].x, outLineValues[0].y2)
            for(var i = 1; i < outLineValues.length; i++) {
                outCanvas.lineTo(outLineValues[i].x, outLineValues[i].y2)
            }
            outCanvas.stroke()
        }

        if(interface.showLines) {
            outCanvas.strokeStyle = valueLineColour
            outCanvas.beginPath()
            outCanvas.moveTo(outLineValues[0].x, outLineValues[0].y)
            for(var i = 1; i < outLineValues.length; i++) {
                outCanvas.lineTo(outLineValues[i].x, outLineValues[i].y)
            }
            outCanvas.stroke()
        }
    }

    outCanvas.strokeStyle = darkPlotColour
    for(var i = 0; i < outLineValues.length; i++) {
        x = outLineValues[i].x
        y = outLineValues[i].y
        y1 = outLineValues[i].y1
        n = outLineValues[i].n
        gck = outLineValues[i].gck
        cnp = outLineValues[i].cnp
        outCanvas.strokeStyle = darkPlotColour
        outCanvas.fillStyle = darkPlotColour
        if(interface.showStems) {
            outCanvas.beginPath()
            outCanvas.moveTo(x, outHeight * 0.5)
            if(interface.showPerturbations) {
                outCanvas.lineTo(x, y1)
            } else {
                outCanvas.lineTo(x, y)
            }
            outCanvas.stroke()
        }
        if(interface.showPerturbations) {
            if(gck != cnp) {
                outCanvas.strokeStyle = disturbanceColour
                outCanvas.fillStyle = disturbanceColour
                if(interface.showStems) {
                    outCanvas.beginPath()
                    outCanvas.moveTo(x, y1)
                    outCanvas.lineTo(x, y)
                    outCanvas.stroke()
                }
                outCanvas.beginPath()
                outCanvas.arc(x, y, 4, 0, Math.PI * 2, true)
                outCanvas.fill()
            }
        }
        outCanvas.strokeStyle = darkPlotColour
        outCanvas.fillStyle = darkPlotColour
        outCanvas.beginPath()
        if(interface.showPerturbations) {
            outCanvas.arc(x, y1, 4, 0, Math.PI * 2, true)
        } else {
            outCanvas.arc(x, y, 4, 0, Math.PI * 2, true)
        }
        outCanvas.fill()
        if(i == 0) {
            outCanvas.textAlign = 'right'
            if(interface.showCMValues) {
                outCanvas.fillText(gck.toFixed(Math.max(0, decimalPoints)), x - 10, y)
            }
            if(interface.showKValues) {
                if(gck >= 0) {
                    outCanvas.fillText(n, x - 10, outHeight * 0.5 + 15)
                } else {
                    outCanvas.fillText(n, x - 10, outHeight * 0.5 - 15)
                }
            }
            outCanvas.textAlign = 'center'
        } else if(gck >= 0) {
            if(interface.showCMValues) {
                outCanvas.fillText(gck.toFixed(Math.max(0, decimalPoints)), x, Math.min(y, y1) - 15)
            }
            if(interface.showKValues) {
                outCanvas.fillText(n, x, outHeight * 0.5 + 15)
            }
        } else {
            if(interface.showCMValues) {
                outCanvas.fillText(gck.toFixed(Math.max(0, decimalPoints)), x, Math.max(y, y1) + 15)
            }
            if(interface.showKValues) {
                outCanvas.fillText(n, x, outHeight * 0.5 - 15)
            }
        }
    }
    window.requestAnimationFrame(drawOutput)
}

drawOutput()