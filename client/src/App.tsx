import { Navbar } from "./components/Navbar";
import { ParamsReader } from "./components/ParamReader";
import { SentenceEditor } from "./components/SentenceEditor";
function App() {
  return (
    <>
      <Navbar />
      <ParamsReader />
      <SentenceEditor />
    </>
  );
}

export default App;
