import { Navbar } from "./components/Navbar";
import { ParamsReader } from "./components/ParamReader";
import { SentenceEditor } from "./components/SentenceEditor";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <>
      <Toaster />
      <Navbar />
      <ParamsReader />
      <SentenceEditor />
    </>
  );
}

export default App;
