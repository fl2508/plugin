import { useState } from "react";

// Copy the payload shape interface from our server
// We want to copy (rather than import) since we we won't necessarily deploy our
// front end and back end to the same place
interface SpreadSheet {
  key: string;
  name: string;
  shares: string;
}

function App() {
  // A state value will store the current state of the array of data which can be updated
  // by editing your database in Notion and then pressing the fetch button again
  const [spreadSheets, setSpreadSheets] = useState<SpreadSheet[]>([]);

  return (
    <div>
      <h1>Spreadsheet</h1>
      <button
        type="button"
        onClick={() => {
          fetch("http://localhost:8000/")
            .then((response) => response.json())
            .then((payload) => {
              // Set the React state with the array response
              setSpreadSheets(payload);
            });
        }}
      >
        Fetch List
      </button>

      {/* Map the resulting object array into an ordered HTML list with anchor links */}
      {/* Using index as key is harmless since we will only ever be replacing the full list */}
      <ol>
        {spreadSheets.map((thing, idx) => {
          return (
            <table key={idx}>
                <td>{thing.key}</td>
                <td>{thing.name}</td>
                <td>{thing.shares}</td>
            </table>

            /*
            <li key={idx}>
              <a href={thing.url} target="_blank" rel="noopener noreferrer">
                {thing.label}
              </a>
            </li>
            */


          );
        })}
      </ol>
    </div>
  );
}

export default App;
