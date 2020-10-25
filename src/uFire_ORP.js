const uFire_ISE = require( './uFire_ISE.js' )

const POTENTIAL_REGISTER_ADDRESS = 100

module.exports = class uFire_PH extends uFire_ISE {

    //Should use software bus!
    //See https://www.ufire.co/docs/uFire_ISE/#raspberry-pi
    //and https://github.com/fivdi/i2c-bus/blob/master/doc/raspberry-pi-software-i2c.md
    constructor( address = ISE_PROBE_DEFAULT_ADDRESS, busNumber = 3 ) {
        super( address, busNumber )
        this.ORP = 0
        this.Eh = 0
    }

    async measureORP(){
        await this.measuremV()
        this.ORP = this.mV
        this.eH = this.mV + await this.getProbePotential()

        if(!isFinite(this.ORP) || !isFinite(this.mV)){
            this.ORP = -1
            this.Eh = -1
        }
        return this.mV
    }

    async setProbePotential(potential) {
        await this.writeEEPROM(POTENTIAL_REGISTER_ADDRESS, potential)
    }

    async getProbePotential() {
        return await this.readEEPROM(POTENTIAL_REGISTER_ADDRESS)
    }
}