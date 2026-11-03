// for making unique id
export const Makeid = (numLength) => {
    let id = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < numLength; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
};

// using formik set value
export const formAttr = (runform, key) => {
    return {
        onChange: runform.handleChange,
        onBlur: runform.handleBlur,
        value: runform.values?.[key] || '',
    };
};

// using formik set error
export const errorContainer = (runform, key) => {
    return runform.touched?.[key] && runform.errors?.[key] ? (
        <div className="text-danger">{runform.errors?.[key]}</div>
    ) : null;
};

// for set fractional part of an number
export const FixedDecimal = (num = 0) => {
    let number = parseFloat(num)
    let temp = number?.toFixed(2)?.split('.')[1];
    if (temp > 0) return number?.toFixed(2);
    else return number?.toFixed();
};

// for validate input of percentage
export const validatePercentage = (input) => {
    const inputValue = Number(input.value === '' ? 0 : input.value).toString();
    if (inputValue >= 0 && inputValue <= 100) {
        return inputValue;
    }
}
