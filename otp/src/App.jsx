import "./App.css";
import { OtpInput } from "./components/OtpInput";

function App() {
  return (
    <>
      <h1>OTP Login - React JS</h1>
      <OtpInput length={6} allowPaste={true} isMasked={false} />
    </>
  );
}

export default App;
