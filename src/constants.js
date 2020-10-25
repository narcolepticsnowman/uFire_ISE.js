const ISE_PROBE_DEFAULT_ADDRESS = 0x3F

const ISE_MEASURE_MV = 80
const ISE_MEASURE_TEMP = 40
const ISE_CALIBRATE_SINGLE = 20
const ISE_CALIBRATE_LOW = 10
const ISE_CALIBRATE_HIGH = 8
const ISE_MEMORY_WRITE = 4
const ISE_MEMORY_READ = 2
const ISE_I2C = 1

const ISE_VERSION_REGISTER = 0             // hardware version */
const ISE_MV_REGISTER = 1                  // mV */
const ISE_TEMP_REGISTER = 5                // temperature in C */
const ISE_CALIBRATE_SINGLE_REGISTER = 9    // calibration offset */
const ISE_CALIBRATE_REFHIGH_REGISTER = 13  // reference high calibration */
const ISE_CALIBRATE_REFLOW_REGISTER = 17   // reference low calibration */
const ISE_CALIBRATE_READHIGH_REGISTER = 21  // reading high calibration */
const ISE_CALIBRATE_READLOW_REGISTER = 25  // reading low calibration */
const ISE_SOLUTION_REGISTER = 29          // reference ISE solution */
const ISE_BUFFER_REGISTER = 33             // buffer */
const ISE_FW_VERSION_REGISTER = 37         // firmware version
const ISE_CONFIG_REGISTER = 38             // config register */
const ISE_TASK_REGISTER = 39               // task register */

const ISE_TEMP_MEASURE_TIME = 750
const ISE_MV_MEASURE_TIME = 250

const ISE_TEMP_COMPENSATION_CONFIG_BIT = 1