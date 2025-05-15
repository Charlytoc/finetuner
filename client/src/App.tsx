import { Navbar } from "./components/Navbar";
import { SentenceEditor } from "./components/SentenceEditor";
import { Toaster } from "react-hot-toast";
import { ContinuePrevious } from "./components/ContinuePrevious";
function App() {
  return (
    <>
      <Toaster />
      <Navbar />
      <ContinuePrevious />
      <SentenceEditor />
    </>
  );
}

export default App;
