import { useState, useRef, useEffect } from "react";

export const OtpInput = (props) => {
  const { length: OTP_LENGTH, allowPaste = false, isMasked = false } = props;
  const [otpInputs, setOtpInputs] = useState(new Array(OTP_LENGTH).fill(""));
  const otpInputRefs = useRef([]);

  const focusNextEmpty = (index) => {
    let nextIndex = index + 1;
    if (nextIndex >= OTP_LENGTH) {
      return;
    }
    const nextElement = otpInputRefs.current[nextIndex];
    if (nextElement.value.trim() && nextIndex < OTP_LENGTH) {
      focusNextEmpty(nextIndex);
    } else {
      nextElement?.focus();
      return;
    }
  };

  const handleInputChange = (e, index) => {
    const value = String(e.target.value);
    const newValue = value.trim();
    if (isNaN(newValue)) return;
    if (newValue.length === OTP_LENGTH) {
      setOtpInputs(newValue.split(""));
      return;
    }
    const newOtpInputs = [...otpInputs];
    newOtpInputs[index] = newValue.slice(-1);
    setOtpInputs(newOtpInputs);
    if (newValue) {
      focusNextEmpty(index);
    }
  };

  const setCursorAtTheEnd = (index) => {
    // Set cursor position to the end of the input
    const inputEle = otpInputRefs.current[index];
    if (inputEle) {
      inputEle.focus();
      const length = inputEle.value?.length || 0;
      setTimeout(() => {
        inputEle.setSelectionRange(length, length);
      }, 0);
    }
  };

  const handleKeyDown = (e, index) => {
    const value = e.target.value.trim();
    if (!value && e.key === "Backspace") {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      setCursorAtTheEnd(index - 1);
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      setCursorAtTheEnd(index + 1);
    }
  };

  const handlePaste = async (e) => {
    try {
      // read from the clipboard
      const textValue = await navigator.clipboard.readText();
      if (e.type === "paste" && textValue) {
        const text = textValue.trim();
        if (text.length === OTP_LENGTH && !isNaN(text)) {
          setOtpInputs(text.split(""));
          setTimeout(() => {
            otpInputRefs.current[OTP_LENGTH - 1]?.focus();
            handleSubmit(text);
          }, 0);
        }
      }
    } catch (error) {
      console.error(error.name, error.message);
    }
  };

  const handleSubmit = (otp = otpInputs.join("")) => {
    alert(`Entered OTP:, ${otp}, ${otpInputs}`);
    console.log("Entered OTP:", otp, otpInputs);
  };

  const autoReadOtpFromSMS = async () => {
    // used AbortController with setTimeout so that WebOTP API (Autoread sms) will get disabled after 1min
    const signal = new AbortController();
    setTimeout(() => {
      signal.abort();
    }, 1 * 60 * 1000);

    if ("OTPCredential" in window && navigator.credentials) {
      try {
        const content = await navigator.credentials.get({
          abort: signal,
          otp: { transport: ["sms"] },
        });
        if (content && content.code) {
          setOtpInputs(content.code.split(""));
          handleSubmit(content.code);
        }
      } catch (e) {
        console.log("Error", e);
        return;
      }
    }
  };

  useEffect(() => {
    const firstInput = otpInputRefs.current[0];
    firstInput?.focus();
    if (allowPaste) {
      firstInput?.addEventListener("paste", handlePaste);
    }
    autoReadOtpFromSMS();
    return () => {
      firstInput?.removeEventListener("paste", handlePaste);
    };
  }, [allowPaste]);

  return (
    <>
      <div role="group">
        {otpInputs.map((otp, index) => {
          return (
            <input
              key={index}
              type={isMasked ? "password" : "text"}
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
              value={otp}
              ref={(input) => (otpInputRefs.current[index] = input)}
              onChange={(e) => handleInputChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          );
        })}
      </div>
      <br />
      <button
        disabled={OTP_LENGTH !== otpInputs.join("").trim().length}
        onClick={() => handleSubmit()}
      >
        Submit
      </button>
    </>
  );
};
