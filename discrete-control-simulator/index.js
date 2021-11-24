let interface = {
    menu: 0,
    panel: 0,
    expandedA: true,
    expandedB: true,
    showCMValues: true,
    showKValues: true,
    showReference: true,
    showLines: true,
    showStems: true,
    showPerturbations: true,
    graphSpace: 1,
    graphPoints: 30,
    decimalPoints: 2,
    d: 0,
    K: 0,
    tau: 0,
    thetaprime: 0,
    T: 1,
    m: 0,
    p: 0,
    aValues: [
        {value: 0}
    ],
    bValues: [
        {value: 0}
    ],
    kc: 0,
    taui: Infinity,
    taud: 0,
    rk: 0
}

const App = {
    data() {
        return interface
    },
    methods: {
        menuPlant() {
            this.menu = 0
            this.$nextTick(function() {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub])
            })
        },
        menuControl() {
            this.menu = 1
            this.$nextTick(function() {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub])
            })
        },
        modelARX() {
            if(this.panel == 1) {
                thetaprime = toNumber(interface.thetaprime)
                tau = toNumber(interface.tau)
                K = toNumber(interface.K)
                T = toNumber(interface.T)
                if(!(T == 0 || tau == 0)) {
                    this.d = Math.trunc(thetaprime / T)
                    theta = thetaprime - d * T
                    m = 1 - theta / T
                    this.aValues = [{value: Math.exp(-T/tau)}]
                    this.bValues = [
                        {value: 0},
                        {value: K*(1 - Math.exp(-m*T/tau))},
                        {value: K*(Math.exp(-m*T/tau) - Math.exp(-T/tau))}
                    ]
                }
            }
            this.panel = 0
            this.$nextTick(function() {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub])
            })
        },
        modelFO() {
            this.panel = 1
            this.$nextTick(function() {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub])
            })
        },
        expandA() {
            this.expandedA = !this.expandedA
            if(this.expandedA == true) {
                this.$refs.AExpandIcon.className = "fas fa-chevron-up"
            } else {
                this.$refs.AExpandIcon.className = "fas fa-chevron-down"
            }
            this.$nextTick(function() {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub])
            })
        },
        expandB() {
            this.expandedB = !this.expandedB
            if(this.expandedB == true) {
                this.$refs.BExpandIcon.className = "fas fa-chevron-up"
            } else {
                this.$refs.BExpandIcon.className = "fas fa-chevron-down"
            }
            this.$nextTick(function() {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub])
            })
        },
        insertItem(type) {
            if(type == "a") {
                this.aValues.push({value: 0})
            }
            if(type == "b") {
                this.bValues.push({value: 0})
            }
            this.$nextTick(function() {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub])
            })
        },
        deleteItem(type) {
            if(type == "a") {
                this.aValues.splice(-1)
            }
            if(type == "b") {
                this.bValues.splice(-1)
            }
            this.$nextTick(function() {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub])
            })
        },
        update() {
            as = []
            bs = []
            d = 0
            T = toNumber(interface.T)
            if(interface.panel == 0) {
                for(var i = 0; i < interface.aValues.length; i++) {
                    as.push(toNumber(interface.aValues[i].value))
                }
                for(var i = 0; i < interface.bValues.length; i++) {
                    bs.push(toNumber(interface.bValues[i].value))
                }
                d = toNumber(interface.d)
            } else if (interface.panel == 1) {
                thetaprime = toNumber(interface.thetaprime)
                tau = toNumber(interface.tau)
                K = toNumber(interface.K)
                if(T == 0 || tau == 0) {
                    as = [0]
                    bs = [0, 0, 0]
                    d = 0
                } else {
                    d = Math.trunc(thetaprime / T)
                    theta = thetaprime - d * T
                    m = 1 - theta / T
                    as = [Math.exp(-T/tau)]
                    bs = [0, K*(1 - Math.exp(-m*T/tau)), K*(Math.exp(-m*T/tau) - Math.exp(-T/tau))]
                }
            }
            pk = toNumber(interface.p)
            if(!automaticControl) {
                mk = toNumber(interface.m)
            }
        },
        updateTime() {
            T = toNumber(interface.T)
            if(T > 0) {
                waitTime = 1000 * T
            } else {
                waitTime = 1000
            }
        },
        controlOff() {
            automaticControl = false
            mk = toNumber(interface.m)
        },
        controlOn() {
            automaticControl = true
            kc = toNumber(interface.kc)
            taui = toNumber(interface.taui)
            taud = toNumber(interface.taud)
            rk = toNumber(interface.rk)
            T = toNumber(interface.T)
            if(taui == 0) {
                taui = Infinity
            }
            betaZero = kc * (1 + T / taui + taud / T)
            betaOne = kc * (-1 - 2 * taud / T)
            betaTwo = kc * taud / T
        }
    }
}

const app = Vue.createApp(App)

app.mount('#vue-app')

function toNumber(x) {
    x = parseFloat(x)
    if(isNaN(x)) {
        x = 0
    }
    return x
}