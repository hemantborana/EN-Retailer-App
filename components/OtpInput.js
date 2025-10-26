
import React from 'react';

function OtpInput({ length = 6, onComplete }) {
    const [otp, setOtp] = React.useState(new Array(length).fill(""));
    const inputRefs = React.useRef([]);

    React.useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;

        const newOtp = [...otp];
        newOtp[index] = element.value.slice(-1);
        setOtp(newOtp);

        if (element.value && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }
        
        if (newOtp.every(digit => digit !== "")) {
            onComplete(newOtp.join(""));
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };
    
    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text');
        if (!/^\d+$/.test(paste)) return;
        
        const pasteDigits = paste.slice(0, length).split('');
        const newOtp = [...otp];
        pasteDigits.forEach((digit, index) => {
            newOtp[index] = digit;
        });
        setOtp(newOtp);
        
        const lastFilledIndex = Math.min(pasteDigits.length, length - 1);
        inputRefs.current[lastFilledIndex].focus();
        
        if (paste.length >= length) {
            onComplete(paste.slice(0, length));
        }
    };

    return React.createElement('div', { className: 'flex justify-center gap-2 md:gap-4', onPaste: handlePaste },
        otp.map((data, index) => (
            React.createElement('input', {
                key: index,
                type: 'text',
                inputMode: 'numeric',
                maxLength: 1,
                className: 'w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition',
                value: data,
                onChange: e => handleChange(e.target, index),
                onKeyDown: e => handleKeyDown(e, index),
                onFocus: e => e.target.select(),
                ref: el => (inputRefs.current[index] = el)
            })
        ))
    );
}

export default OtpInput;
