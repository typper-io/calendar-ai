# Calendar AI

Calendar AI is a Next.js application that leverages artificial intelligence to help you manage your schedule intelligently and efficiently. With Calendar AI, you can create and manage events using natural language, automatically reschedule events, and share your calendar with others.

## 🚀 Features

- **Create Events with Natural Language**: Schedule events simply by typing or speaking in natural language.
- **Complete Assistant with GPT Integration**: Use ChatGPT integration to receive intelligent suggestions and automate meeting and event scheduling.
- **Automatic Rescheduling**: AI-powered features to automatically adjust your calendar events when necessary (coming soon).
- **Calendar Sharing**: Share your calendar with anyone, making it easier to coordinate schedules and commitments (coming soon).

## 📦 Installation

Follow the steps below to set up the project locally.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/typper-io/calendar-ai.git
   cd calendar-ai
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Start the development server:**

   ```bash
   pnpm run dev
   ```

   The server will start at [http://localhost:3000](http://localhost:3000).

## 🛠️ Technologies Used

- **Next.js**: A React framework for building modern, high-performance web applications.
- **React**: A JavaScript library for building user interfaces.
- **OpenAI GPT**: Integration with OpenAI's GPT API for AI-powered assistance.
- **CSS Modules/TailwindCSS**: For styling the interface.

## 🔧 Environment Variables

To run this application, you need to configure several environment variables. You can do this by creating a `.env.local` file in the root directory of the project or by using the provided `.env.example` as a template.

### Required Environment Variables:

- `OPENAI_API_KEY`: Your OpenAI API key, used for integrating GPT features.
- `GOOGLE_CLIENT_ID`: The Client ID for Google OAuth, used for authenticating users.
- `GOOGLE_CLIENT_SECRET`: The Client Secret for Google OAuth.
- `NEXTAUTH_SECRET`: A secret key used by NextAuth.js to encrypt session data.
- `ASSISTANT_ID`: The unique ID of your OpenAI assistant.
- `NEXTAUTH_URL`: The URL of your Next.js application, used by NextAuth.js.

### Steps to Generate and Use Environment Variables:

1. **Create a `.env.local` File:**
   Copy the `.env.example` file to a new file named `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. **Add Your Credentials:**
   Open the `.env.local` file and fill in the values for each variable. You need to obtain these values from the respective service providers (OpenAI, Google, etc.).

3. **Run the Application:**
   After setting up the environment variables, you can start the development server:

   ```bash
   pnpm run dev
   ```

## 🤖 Setting Up the OpenAI Assistant

This project includes an OpenAI Assistant that helps automate and manage your calendar through natural language. Follow the steps below to create and integrate the assistant:

1. **Create an Assistant on the OpenAI Platform:**

   - Visit the [OpenAI Assistants](https://platform.openai.com/assistants) page.
   - Click on "Create Assistant."
   - Fill in the details such as the name, description, and abilities of your assistant.
   - Ensure you enable the ability to run code within the assistant's settings.
   - Save the Assistant and copy the `ASSISTANT_ID`.

2. **Add the Assistant ID to Environment Variables:**

   - Open your `.env.local` file.
   - Add the `ASSISTANT_ID` you just copied.

   ```bash
   ASSISTANT_ID=your-assistant-id
   ```

3. **Configure the Assistant with Functions and Instructions:**

   The JSON files and the instruction file you need to use for configuring the assistant are located in the `assistant/functions/` directory and in the `assistant/instruction.txt` file. Follow these steps to set them up:

   - **Load Functions:**

     - In the assistant configuration panel on OpenAI, find the section where you can add custom functions.
     - Upload the `edit_event.json`, `get_calendar.json`, and `schedule_event.json` files located in the `functions/` directory. These functions will be used by the assistant to edit events, retrieve the calendar, and schedule new events, respectively.

   - **Add Instructions:**

     - In the same panel, there will be an area to add instructions to the assistant.
     - Copy the content of the `instruction.txt` file and paste it into the instruction area. These instructions will guide the assistant's behavior and how it should use the available functions.

4. **Test the Integration:**

   Run the development server and interact with the assistant to ensure everything is set up correctly.

   ```bash
   pnpm run dev
   ```

   You should now be able to schedule events and manage your calendar using natural language.

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

## 🤝 Contributions

Contributions are welcome! Feel free to open issues or pull requests to suggest improvements or fix issues.

## 📧 Contact

For more information or support, contact [contact@typper.io](mailto:contact@typper.io).
