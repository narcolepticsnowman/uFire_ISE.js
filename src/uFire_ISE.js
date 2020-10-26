const struct = require( 'python-struct' )
const C = require( './constants' )
const { openSync } = require( 'i2c-bus' )
let i2c = {}

const sleep = ( ms ) => new Promise( res => setTimeout( res, ms ) )

function getBus( busNumber ) {
    if( i2c[ busNumber ] ) {
        return i2c[ busNumber ]
    }
    return i2c[ busNumber ] = openSync( busNumber )
}


module.exports = class uFire_ISE {

    //Should use software bus!
    //See https://www.ufire.co/docs/uFire_ISE/#raspberry-pi
    //and https://github.com/fivdi/i2c-bus/blob/master/doc/raspberry-pi-software-i2c.md
    constructor( address = C.ISE_PROBE_DEFAULT_ADDRESS, busNumber = 3 ) {
        this.address = address
        this.mV = 0
        this.tempC = 0
        this.tempF = 0

        this.i2c = getBus(busNumber)
        console.log('I2c Bus', this.i2c)
    }

    async measuremV() {
        await this.sendCommand( C.ISE_MEASURE_MV )
        await sleep( C.ISE_MV_MEASURE_TIME )
        this.mV = await this.readRegister( C.ISE_MV_REGISTER )
        this.mV = Math.round( this.mV * 100 ) / 100
        if( !isFinite( this.mV ) ) {
            this.mV = -1
        }
        return this.mV
    }

    toF( c ) {
        return ( ( c * 9 ) / 5 ) + 32
    }

    async measureTemp() {
        await this.sendCommand( C.ISE_MEASURE_TEMP )
        await sleep( C.ISE_TEMP_MEASURE_TIME )
        this.tempC = await this.readRegister( C.ISE_TEMP_REGISTER )

        if( this.tempC == -127 ) this.tempF = -127.0
        else this.tempF = this.toF( this.tempC )

        return this.tempC
    }

    async setTemp( tempC ) {
        await this.writeRegister( C.ISE_TEMP_REGISTER, tempC )
        this.tempC = tempC
        this.tempF = this.toF( tempC )
    }

    async calibrateSingle( solutionmV ) {
        await this.calibrate( C.ISE_CALIBRATE_SINGLE, solutionmV )
    }

    async calibrateProbeLow( solutionmV ) {
        await this.calibrate( C.ISE_CALIBRATE_LOW, solutionmV )
    }

    async calibrateProbeHigh( solutionmV ) {
        await this.calibrate( C.ISE_CALIBRATE_HIGH, solutionmV )
    }

    async calibrate( command, solutionmV ) {
        await this.writeRegister( C.ISE_SOLUTION_REGISTER, solutionmV )
        await this.sendCommand( command )
        await sleep( C.ISE_MV_MEASURE_TIME )
    }

    async getVersion() {
        return this.readByte( C.ISE_VERSION_REGISTER )
    }

    async getCalibrateOffset() {
        return await this.readRegister( C.ISE_CALIBRATE_SINGLE_REGISTER )
    }

    async getCalibrateHighReference() {
        return await this.readRegister( C.ISE_CALIBRATE_REFHIGH_REGISTER )
    }

    async getCalibrateLowReference() {
        return await this.readRegister( C.ISE_CALIBRATE_REFLOW_REGISTER )
    }

    async getCalibrateHighReading() {
        return await this.readRegister( C.ISE_CALIBRATE_READHIGH_REGISTER )
    }

    async getCalibrateLowReading() {
        return await this.readRegister( C.ISE_CALIBRATE_READLOW_REGISTER )
    }

    async reset() {
        await this.writeRegister( C.ISE_CALIBRATE_SINGLE_REGISTER, NaN )
        await this.writeRegister( C.ISE_CALIBRATE_REFHIGH_REGISTER, NaN )
        await this.writeRegister( C.ISE_CALIBRATE_REFLOW_REGISTER, NaN )
        await this.writeRegister( C.ISE_CALIBRATE_READHIGH_REGISTER, NaN )
        await this.writeRegister( C.ISE_CALIBRATE_READLOW_REGISTER, NaN )
    }

    async setDualPointCalibration( refLow, refHigh, readLow, readHigh ) {
        await this.writeRegister( C.ISE_CALIBRATE_REFLOW_REGISTER, refLow )
        await this.writeRegister( C.ISE_CALIBRATE_REFHIGH_REGISTER, refHigh )
        await this.writeRegister( C.ISE_CALIBRATE_READLOW_REGISTER, readLow )
        await this.writeRegister( C.ISE_CALIBRATE_READHIGH_REGISTER, readHigh )
    }

    async setI2CAddress( i2cAddress ) {
        if( i2cAddress >= 1 && i2cAddress <= 127 ) {
            await this.writeRegister( C.ISE_SOLUTION_REGISTER, i2cAddress )
            await this.sendCommand( C.ISE_I2C )
            this.address = i2cAddress
        }
    }

    async useTemperatureCompensation( b ) {
        let configBits = this.readByte( C.ISE_CONFIG_REGISTER )
        configBits = this.bitSet( configBits, C.ISE_TEMP_COMPENSATION_CONFIG_BIT, b )
        await this.writeRegister( C.ISE_CONFIG_REGISTER, configBits )
    }

    async readEEPROM( address ) {
        await this.writeRegister( C.ISE_SOLUTION_REGISTER, parseInt( address ) )
        await this.sendCommand( C.ISE_MEMORY_READ )
        return await this.readRegister( C.ISE_BUFFER_REGISTER )
    }

    async writeEEPROM( address, value ) {
        await this.writeRegister( C.ISE_SOLUTION_REGISTER, parseInt( address ) )
        await this.writeRegister( C.ISE_BUFFER_REGISTER, parseFloat( value ) )
        await this.sendCommand( C.ISE_MEMORY_WRITE )
    }

    async getFirmware() {
        return await this.readByte( C.ISE_FW_VERSION_REGISTER )
    }

    bitSet( v, index, x ) {
        let mask = 1 << index
        v &= ~mask
        if( x )
            v |= mask
        return v
    }

    async changeRegister( r ) {
        await this.i2c.sendByteSync( this.address, r )
        await sleep( 10 )
    }


    async sendCommand( command ) {
        await this.i2c.writeByteSync( this.address, C.ISE_TASK_REGISTER, command )
        await sleep( 10 )
    }

    async writeRegister( register, f ) {
        let n = this.roundTotalDigits( f )
        let data = struct.pack( 'f', n )
        console.log('Writing packed struct', data, JSON.stringify(data))
        await this.changeRegister( register )
        await this.i2c.writeI2cBlockSync( this.address, register, data.length, data )
        await sleep( 10 )
    }

    async readRegister( register ) {
        await this.changeRegister( register )
        let data = Array( 4 ).map( () => this.i2c.receiveByteSync( this.address ) )
        console.log('got data', data, JSON.stringify(data, null, ' '))
        let f = struct.unpack( 'f', data )[ 0 ]
        return this.roundTotalDigits( f )
    }

    async writeByte( register, value ) {
        this.i2c.writeByteSync( register, value )
        await sleep( 10 )
    }

    async readByte( register ) {
        await this.changeRegister( register )
        await sleep( 10 )
        return this.i2c.receiveByteSync( this.address )
    }

    magnitude( x ) {
        if( !isFinite( x ) )
            return 0
        return x === 0 ? 0 : Math.trunc( Math.floor( Math.log10( Math.abs( x ) ) ) ) + 1
    }

    roundTotalDigits( x, digits = 7 ) {
        return x.toFixed( digits - this.magnitude( x ) )
    }
}