import bgLogin from "../img/bg_login.png";
import { NavigationSidebar } from "../components/navigation/NavigationSideBar";

const TestPage: React.FC = () => {
  return (      
    <div
      className="absolute inset-0 bg-cover bg-center"
      // style={{ backgroundImage: `url(${bgLogin})` }}
    >
      {/* <div className="flex w-[72px] h-[100%] flex-col overflow-hidden">
        <NavigationSidebar />
      </div> */}
      <div className="object-center">
        Connect
      </div>
    </div>
    );
}

export default TestPage;
// // Create HTML
// document.body.innerHTML = `
//   <div style="font-family: sans-serif; padding: 20px;">
//     <input
//       id="userInput"
//       type="text"
//       placeholder="Type something..."
//       style="padding: 8px; width: 200px;"
//     />
//     <button id="sendBtn" style="padding: 8px 12px; margin-left: 8px;">
//       Send
//     </button>
//   </div>
// `;

// // // Grab elements
// // const input = document.getElementById("userInput") as HTMLInputElement;
// // const button = document.getElementById("sendBtn") as HTMLButtonElement;

// // // Target URL
// // const TARGET_URL = "https://127.0.0.1:8080/socket";

// // // Send input on click
// // button.addEventListener("click", async () => {
// //   const value = input.value;

// //   try {
// //     const response = await fetch(TARGET_URL, {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //       },
// //       body: JSON.stringify({ message: value }),
// //     });

// //     if (!response.ok) {
// //       throw new Error("Request failed");
// //     }

// //     console.log("Sent:", value);
// //   } catch (err) {
// //     console.error("Error:", err);
// //   }
// // });
