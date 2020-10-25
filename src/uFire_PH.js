const uFire_ISE = require( './uFire_ISE.js' )

const PROBE_MV_TO_PH = 59.2
const TEMP_CORRECTION_FACTOR = 0.03

module.exports = class uFire_PH extends uFire_ISE {

    //Should use software bus!
    //See https://www.ufire.co/docs/uFire_ISE/#raspberry-pi
    //and https://github.com/fivdi/i2c-bus/blob/master/doc/raspberry-pi-software-i2c.md
    constructor( address = ISE_PROBE_DEFAULT_ADDRESS, busNumber = 3 ) {
        super( address, busNumber )
        this.pH = 0
        this.pOH = 0
    }

    async measurepH( temp ) {
        await this.measuremV()
        if( this.mV === -1 ) {
            this.pH = -1
            this.pOH = -1
            return -1
        }

        this.pH = Math.abs( 7.0 - ( this.mV / PROBE_MV_TO_PH ) )

        if( typeof temp === 'number' ) {
            let distanceFrom7 = Math.abs( 7 - Math.round( this.pH ) )
            let distanceFrom25 = Math.floor( Math.abs( 25 - Math.round( temp ) ) / 10 )
            let tempCorrection = ( distanceFrom25 * distanceFrom7 ) * TEMP_CORRECTION_FACTOR
            if( this.pH >= 8.0 && temp >= 35 )
                tempCorrection *= -1
            if( this.pH <= 6.0 && temp <= 15 )
                tempCorrection *= -1
            this.pH += tempCorrection
        }

        this.pOH = Math.abs( this.pH - 14 )

        if( this.pH <= 0 || this.pH >= 14.0 || !isFinite( this.pH ) || !isFinite( this.mV ) ) {
            this.pH = -1
            this.pOH = -1
        }
        return this.pH
    }


    async calibrateSingle( solutionpH ) {
        await super.calibrateSingle( this.pHtomV( solutionpH ) )
    }

    async calibrateProbeLow( solutionpH ) {
        await super.calibrateProbeLow( this.pHtomV( solutionpH ) )
    }

    async calibrateProbeHigh( solutionpH ) {
        await super.calibrateProbeHigh( this.pHtomV( solutionpH ) )
    }

    async getCalibrateHighReference() {
        return this.mVtopH( await this.readRegister( ISE_CALIBRATE_REFHIGH_REGISTER ) )
    }

    async getCalibrateLowReference() {
        return this.mVtopH( await this.readRegister( ISE_CALIBRATE_REFLOW_REGISTER ) )
    }

    async getCalibrateHighReading() {
        return this.mVtopH( await this.readRegister( ISE_CALIBRATE_READHIGH_REGISTER ) )
    }

    async getCalibrateLowReading() {
        return this.mVtopH( await this.readRegister( ISE_CALIBRATE_READLOW_REGISTER ) )
    }

    pHtomV( pH ) {
        return ( 7 - pH ) * PROBE_MV_TO_PH
    }

    mVtopH( mV ) {
        return Math.abs( 7.0 - ( mV / PROBE_MV_TO_PH ) )
    }


}