module.exports = Object.freeze({
    ISE_PROBE_DEFAULT_ADDRESS: 0x3F,
    ISE_MEASURE_MV: 80,
    ISE_MEASURE_TEMP: 40,
    ISE_CALIBRATE_SINGLE: 20,
    ISE_CALIBRATE_LOW: 10,
    ISE_CALIBRATE_HIGH: 8,
    ISE_MEMORY_WRITE: 4,
    ISE_MEMORY_READ: 2,
    ISE_I2C: 1,
    ISE_VERSION_REGISTER: 0,             // hardware version */
    ISE_MV_REGISTER: 1,                  // mV */
    ISE_TEMP_REGISTER: 5,                // temperature in C */
    ISE_CALIBRATE_SINGLE_REGISTER: 9,    // calibration offset */
    ISE_CALIBRATE_REFHIGH_REGISTER: 13,  // reference high calibration */
    ISE_CALIBRATE_REFLOW_REGISTER: 17,   // reference low calibration */
    ISE_CALIBRATE_READHIGH_REGISTER: 21,  // reading high calibration */
    ISE_CALIBRATE_READLOW_REGISTER: 25,  // reading low calibration */
    ISE_SOLUTION_REGISTER: 29,          // reference ISE solution */
    ISE_BUFFER_REGISTER: 33,             // buffer */
    ISE_FW_VERSION_REGISTER: 37,         // firmware version
    ISE_CONFIG_REGISTER: 38,             // config register */
    ISE_TASK_REGISTER: 39,               // task register */
    ISE_TEMP_MEASURE_TIME: 750,
    ISE_MV_MEASURE_TIME: 250,
    ISE_TEMP_COMPENSATION_CONFIG_BIT: 1
})